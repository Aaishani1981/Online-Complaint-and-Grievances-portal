const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const router = express.Router();
const complaintsFile = path.join(__dirname, "../data/complaints.json");

// Setup Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  }
});

// Submit complaint with optional PDF
router.post("/submit", upload.single("pdf"), (req, res) => {
  const { email, category, description } = req.body;

  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const complaint = {
    id: uuidv4(),
    email,
    category,
    description,
    pdfFile: req.file ? req.file.filename : null,
    status: "Submitted"
  };

  complaints.push(complaint);
  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));

  res.json({ message: "Complaint submitted successfully", complaint });
});

router.get("/status/:id", (req, res) => {
  const { id } = req.params;

  if (!fs.existsSync(complaintsFile)) {
    return res.status(404).json({ message: "No complaints found" });
  }

  const complaints = JSON.parse(fs.readFileSync(complaintsFile));
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  res.json(complaint);
});

router.put("/resolve/:id", (req, res) => {
  const { id } = req.params;

  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  complaints[index].status = "Resolved";
  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));

  res.json({ message: "Complaint resolved", complaint: complaints[index] });
});

// Admin endpoints
router.get("/admin/stats", (req, res) => {
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }
  
  const open = complaints.filter(c => 
    c.status && !['resolved', 'closed'].includes(c.status.toLowerCase())
  ).length;
  
  const resolved = complaints.filter(c => 
    c.status && ['resolved', 'closed'].includes(c.status.toLowerCase())
  ).length;
  
  const avgResolutionTime = "3 days"; // Placeholder
  
  res.json({ open, resolved, avgResolutionTime });
});

router.get("/admin/recent", (req, res) => {
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }
  
  // Get last 5 complaints and add formatted IDs
  const recent = complaints.slice(-5).reverse().map(complaint => ({
    ...complaint,
    displayId: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${complaint.id.slice(0, 3).toUpperCase()}`
  }));
  
  res.json(recent);
});

router.get("/admin/all", (req, res) => {
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }
  
  res.json(complaints);
});

router.put("/admin/update/:id", (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, internalNotes, publicReply } = req.body;

  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  // Update complaint
  if (status) complaints[index].status = status;
  if (assignedTo) complaints[index].assignedTo = assignedTo;
  if (internalNotes) {
    complaints[index].internalNotes = complaints[index].internalNotes || [];
    complaints[index].internalNotes.push({
      note: internalNotes,
      timestamp: new Date().toISOString(),
      addedBy: "admin" // In real app, this would be the logged-in admin
    });
  }
  if (publicReply) {
    complaints[index].publicReplies = complaints[index].publicReplies || [];
    complaints[index].publicReplies.push({
      reply: publicReply,
      timestamp: new Date().toISOString(),
      addedBy: "admin"
    });
  }

  complaints[index].lastUpdated = new Date().toISOString();
  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));

  res.json({ message: "Complaint updated successfully", complaint: complaints[index] });
});

// Escalation endpoints
router.post("/admin/escalate/:id", (req, res) => {
  const { id } = req.params;
  const { escalateTo, reason, notifyParties } = req.body;

  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  // Initialize escalation data if not exists
  if (!complaints[index].escalations) {
    complaints[index].escalations = [];
  }

  // Add escalation record
  const escalation = {
    escalationId: uuidv4(),
    escalatedTo: escalateTo,
    reason: reason,
    escalatedBy: "admin", // In real app, this would be the logged-in admin
    escalatedAt: new Date().toISOString(),
    notifyParties: notifyParties || false,
    status: "escalated"
  };

  complaints[index].escalations.push(escalation);
  complaints[index].status = "escalated";
  complaints[index].escalatedTo = escalateTo;
  complaints[index].lastUpdated = new Date().toISOString();

  // Add public reply about escalation
  if (!complaints[index].publicReplies) {
    complaints[index].publicReplies = [];
  }
  
  complaints[index].publicReplies.push({
    reply: `Your complaint has been escalated to ${escalateTo} for further review and resolution.`,
    timestamp: new Date().toISOString(),
    addedBy: "system"
  });

  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));

  res.json({ 
    message: "Complaint escalated successfully", 
    complaint: complaints[index],
    escalation: escalation
  });
});

// Get escalated complaints
router.get("/admin/escalated", (req, res) => {
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const escalatedComplaints = complaints.filter(c => 
    c.status === "escalated" || (c.escalations && c.escalations.length > 0)
  );

  res.json(escalatedComplaints);
});

// Auto-escalation check (should be called periodically)
router.post("/admin/check-escalations", (req, res) => {
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }

  const escalationThresholdDays = 7; // Escalate after 7 days
  const now = new Date();
  let escalatedCount = 0;

  complaints.forEach((complaint, index) => {
    // Skip if already escalated or resolved
    if (complaint.status === "resolved" || complaint.status === "closed" || complaint.status === "escalated") {
      return;
    }

    // Calculate days since submission
    const submissionDate = new Date(complaint.lastUpdated || new Date().toISOString());
    const daysDiff = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24));

    if (daysDiff >= escalationThresholdDays) {
      // Auto-escalate
      if (!complaints[index].escalations) {
        complaints[index].escalations = [];
      }

      const autoEscalation = {
        escalationId: uuidv4(),
        escalatedTo: "Senior Management",
        reason: `Auto-escalated: Unresolved for ${daysDiff} days`,
        escalatedBy: "system",
        escalatedAt: new Date().toISOString(),
        notifyParties: true,
        status: "auto-escalated"
      };

      complaints[index].escalations.push(autoEscalation);
      complaints[index].status = "escalated";
      complaints[index].escalatedTo = "Senior Management";
      complaints[index].lastUpdated = new Date().toISOString();

      // Add public reply
      if (!complaints[index].publicReplies) {
        complaints[index].publicReplies = [];
      }
      
      complaints[index].publicReplies.push({
        reply: `Your complaint has been automatically escalated to Senior Management due to extended resolution time (${daysDiff} days). We apologize for the delay and will prioritize your case.`,
        timestamp: new Date().toISOString(),
        addedBy: "system"
      });

      escalatedCount++;
    }
  });

  if (escalatedCount > 0) {
    fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));
  }

  res.json({ 
    message: `Auto-escalation check completed. ${escalatedCount} complaints escalated.`,
    escalatedCount: escalatedCount
  });
});

module.exports = router;
