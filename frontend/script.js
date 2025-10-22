// Signup
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validation
  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters long", "error");
    return;
  }

  try {
    const res = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "complaint.html";
      }, 1500);
    } else {
      showNotification(data.message || "Signup failed", "error");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
  }
}

// Login
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Validation
  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification("Login successful! Redirecting...", "success");
      localStorage.setItem("userEmail", email);
      setTimeout(() => {
        window.location.href = "complaint.html";
      }, 1500);
    } else {
      showNotification(data.message || "Login failed", "error");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
  }
}

// Submit Complaint with PDF
document.getElementById("complaintForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const pdfFile = document.getElementById("pdf").files[0];

  // Validation
  if (!email || !category || !description) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  if (pdfFile && pdfFile.type !== "application/pdf") {
    showNotification("Please upload only PDF files", "error");
    return;
  }

  if (pdfFile && pdfFile.size > 5 * 1024 * 1024) { // 5MB limit
    showNotification("PDF file size must be less than 5MB", "error");
    return;
  }

  try {
    const formData = new FormData(document.getElementById("complaintForm"));
    
    // Show loading state
    const submitBtn = document.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Submitting...";
    submitBtn.disabled = true;

    const res = await fetch("/complaints/submit", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    if (res.ok) {
      document.getElementById("result").innerHTML =
        `<div class="success-message">
           <p>✅ Complaint Submitted Successfully!</p>
           <p><strong>Complaint ID: ${data.complaint.id}</strong></p>
           <p>PDF File: ${data.complaint.pdfFile ? data.complaint.pdfFile : "No file uploaded"}</p>
           <p>Redirecting to Admin Dashboard...</p>
         </div>`;
      
      showNotification("Complaint submitted successfully! Redirecting to Admin Dashboard...", "success");
      
      // Store complaint ID for easy access
      localStorage.setItem("lastComplaintId", data.complaint.id);
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 2000);
      
    } else {
      document.getElementById("result").innerHTML =
        `<div class="error-message">
           <p>❌ Error: ${data.message}</p>
         </div>`;
      showNotification(data.message || "Failed to submit complaint", "error");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
    // Reset button on error
    const submitBtn = document.querySelector("button[type='submit']");
    submitBtn.textContent = "Submit";
    submitBtn.disabled = false;
  }
});

// Check Complaint Status
async function checkStatus() {
  const complaintId = document.getElementById("complaintId").value.trim();

  if (!complaintId) {
    showNotification("Please enter a complaint ID", "error");
    return;
  }

  try {
    // Show loading state
    const statusResult = document.getElementById("statusResult");
    statusResult.innerHTML = '<div class="loading">Loading complaint status...</div>';
    statusResult.style.display = 'block';

    const res = await fetch(`/complaints/status/${complaintId}`);
    const data = await res.json();

    if (res.ok) {
      displayComplaintStatus(data, complaintId);
      showNotification("Complaint status loaded successfully", "success");
    } else {
      statusResult.innerHTML = `
        <div class="error-message">
          <p>❌ ${data.message}</p>
          <button onclick="document.getElementById('statusResult').style.display='none'" class="close-btn">
            Close
          </button>
        </div>`;
      showNotification(data.message || "Complaint not found", "error");
    }
  } catch (error) {
    document.getElementById("statusResult").innerHTML = `
      <div class="error-message">
        <p>❌ Network error. Please try again.</p>
        <button onclick="document.getElementById('statusResult').style.display='none'" class="close-btn">
          Close
        </button>
      </div>`;
    showNotification("Network error. Please try again.", "error");
  }
}

// Display complaint status with timeline
function displayComplaintStatus(complaint, complaintId) {
  const statusResult = document.getElementById("statusResult");
  
  // Map status to display format
  const statusMap = {
    'pending': { text: 'Pending', class: 'pending' },
    'under-review': { text: 'Under Review', class: 'under-review' },
    'resolved': { text: 'Resolved', class: 'completed' },
    'closed': { text: 'Closed', class: 'completed' }
  };

  const currentStatus = statusMap[complaint.status] || { text: complaint.status, class: 'pending' };
  
  // Get current date for timeline
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let pdfLink = "";
  if (complaint.pdfFile) {
    pdfLink = `<br><a href="/uploads/${complaint.pdfFile}" target="_blank" style="color: #3b82f6; text-decoration: none;">📄 Download Attached PDF</a>`;
  }

  statusResult.innerHTML = `
    <div class="complaint-details">
      <div class="complaint-id-section">
        <h3>Complaint ID: #${complaintId}</h3>
      </div>
      
      <div class="status-card">
        <div class="current-status">
          <span class="status-label">Status</span>
          <span class="status-value ${currentStatus.class}">${currentStatus.text}</span>
        </div>
      </div>

      <div class="timeline-container">
        <div class="timeline-item completed">
          <div class="timeline-icon">📋</div>
          <div class="timeline-content">
            <h4>Complaint Submitted</h4>
            <p class="timeline-date">${currentDate}</p>
          </div>
        </div>
        
        <div class="timeline-item ${complaint.status === 'under-review' || complaint.status === 'resolved' ? 'active' : ''}">
          <div class="timeline-icon">🔍</div>
          <div class="timeline-content">
            <h4>Under Review</h4>
            <p class="timeline-date">${complaint.status === 'under-review' || complaint.status === 'resolved' ? currentDate : ''}</p>
          </div>
        </div>
        
        <div class="timeline-item ${complaint.status === 'resolved' ? 'completed' : ''}">
          <div class="timeline-icon">✅</div>
          <div class="timeline-content">
            <h4>Resolved</h4>
            <p class="timeline-date">${complaint.status === 'resolved' ? currentDate : ''}</p>
          </div>
        </div>
      </div>

      <div class="updates-section">
        <h3>Updates</h3>
        
        <div class="update-card">
          <h4>Current Status: ${currentStatus.text}</h4>
          <p>Email: ${complaint.email}</p>
          <p>Category: ${complaint.category || 'General'}</p>
          <p>Description: ${complaint.description || 'No description provided'}</p>
          ${pdfLink}
          <span class="update-date">${currentDate}</span>
        </div>
        
        <div class="update-card">
          <h4>Complaint Submitted</h4>
          <p>Your complaint has been successfully submitted and is being processed. You will receive updates as the status changes.</p>
          <span class="update-date">${currentDate}</span>
        </div>
      </div>
    </div>
  `;
  
  statusResult.style.display = 'block';
}

// Helper Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="notification-close">×</button>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function resetForm() {
  document.getElementById("complaintForm").reset();
  document.getElementById("result").innerHTML = '';
}

// Pre-fill email if user is logged in
function prefillUserData() {
  const userEmail = localStorage.getItem("userEmail");
  const emailField = document.getElementById("email");
  if (userEmail && emailField) {
    emailField.value = userEmail;
  }
}

// Auto-fill last complaint ID in status page
function prefillComplaintId() {
  const lastComplaintId = localStorage.getItem("lastComplaintId");
  const complaintIdField = document.getElementById("complaintId");
  if (lastComplaintId && complaintIdField) {
    complaintIdField.value = lastComplaintId;
  }
}

// Initialize page-specific features
document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill user data on complaint form
  if (window.location.pathname.includes('complaint.html')) {
    prefillUserData();
  }
  
  // Pre-fill complaint ID on status page
  if (window.location.pathname.includes('status.html')) {
    prefillComplaintId();
  }
});

// Hide sample status display when real data is loaded
function hideSampleStatus() {
  const sampleStatus = document.querySelector('.complaint-details');
  if (sampleStatus && !sampleStatus.classList.contains('real-data')) {
    sampleStatus.style.display = 'none';
  }
}
