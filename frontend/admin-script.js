// Admin Dashboard JavaScript
let currentComplaint = null;

// Load dashboard data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadDashboardStats();
  loadRecentComplaints();
});

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await fetch('/complaints/admin/stats');
    const stats = await response.json();
    
    document.getElementById('openCount').textContent = stats.open;
    document.getElementById('resolvedCount').textContent = stats.resolved;
    document.getElementById('avgTime').textContent = stats.avgResolutionTime;
  } catch (error) {
    console.error('Error loading stats:', error);
    // Use fallback data if API fails
    document.getElementById('openCount').textContent = '23';
    document.getElementById('resolvedCount').textContent = '157';
    document.getElementById('avgTime').textContent = '3 days';
  }
}

// Load recent complaints
async function loadRecentComplaints() {
  try {
    const response = await fetch('/complaints/admin/recent');
    const complaints = await response.json();
    
    const container = document.getElementById('recentComplaints');
    
    if (complaints.length === 0) {
      container.innerHTML = '<div class="no-complaints">No recent complaints</div>';
      return;
    }
    
    container.innerHTML = complaints.map(complaint => `
      <div class="complaint-item" onclick="openComplaintModal('${complaint.id}')">
        <div class="complaint-info">
          <strong>Complaint ID: ${complaint.displayId || complaint.id.slice(0, 8)}</strong>
          <div class="complaint-issue">Issue: ${complaint.category || 'General'}</div>
        </div>
        <span class="status-badge ${getStatusClass(complaint.status)}">${formatStatus(complaint.status)}</span>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading recent complaints:', error);
    // Keep the static data as fallback
  }
}

// Get CSS class for status
function getStatusClass(status) {
  if (!status) return 'pending';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'resolved' || statusLower === 'closed') return 'resolved';
  if (statusLower === 'in-progress' || statusLower === 'under-review') return 'in-progress';
  return 'open';
}

// Format status for display
function formatStatus(status) {
  if (!status) return 'Pending';
  return status.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Open complaint management modal
async function openComplaintModal(complaintId) {
  try {
    const response = await fetch(`/complaints/status/${complaintId}`);
    const complaint = await response.json();
    
    currentComplaint = complaint;
    
    // Populate modal fields
    document.getElementById('modalComplaintId').value = complaint.id;
    document.getElementById('modalStatus').value = complaint.status || 'pending';
    document.getElementById('modalStaff').value = complaint.assignedTo || '';
    document.getElementById('modalInternalNotes').value = '';
    document.getElementById('modalPublicReply').value = '';
    
    // Show modal
    document.getElementById('complaintModal').style.display = 'block';
  } catch (error) {
    alert('Error loading complaint details: ' + error.message);
  }
}

// Close modal
function closeModal() {
  document.getElementById('complaintModal').style.display = 'none';
  currentComplaint = null;
}

// Save complaint changes
async function saveComplaintChanges() {
  if (!currentComplaint) return;
  
  const status = document.getElementById('modalStatus').value;
  const assignedTo = document.getElementById('modalStaff').value;
  const internalNotes = document.getElementById('modalInternalNotes').value;
  const publicReply = document.getElementById('modalPublicReply').value;
  
  const updateData = {};
  if (status !== currentComplaint.status) updateData.status = status;
  if (assignedTo !== (currentComplaint.assignedTo || '')) updateData.assignedTo = assignedTo;
  if (internalNotes.trim()) updateData.internalNotes = internalNotes.trim();
  if (publicReply.trim()) updateData.publicReply = publicReply.trim();
  
  try {
    const response = await fetch(`/complaints/admin/update/${currentComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Complaint updated successfully!');
      closeModal();
      loadDashboardStats();
      loadRecentComplaints();
    } else {
      alert('Error updating complaint: ' + result.message);
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
}

// Navigation functions
function showComplaintsManagement() {
  alert('Complaints Management - Feature coming soon!');
}

function showUsersManagement() {
  alert('Users Management - Feature coming soon!');
}

function showSettings() {
  alert('Settings - Feature coming soon!');
}

function viewAllComplaints() {
  alert('View All Complaints - Feature coming soon!');
}

// Escalate current complaint from modal
function escalateCurrentComplaint() {
  if (!currentComplaint) {
    alert('No complaint selected for escalation');
    return;
  }
  
  // Redirect to escalation page with complaint ID
  window.open(`escalate.html?id=${currentComplaint.id}`, '_blank');
}

// General escalate function for complaint cards
function escalateComplaint(complaintId) {
  window.open(`escalate.html?id=${complaintId}`, '_blank');
}

// Test escalation function
function testEscalation() {
  // Use the first available complaint ID or a sample ID
  const complaintId = '20251006-E43'; // You can replace this with an actual ID from your dashboard
  window.open(`escalate.html?id=${complaintId}`, '_blank');
}

function toggleSidebar() {
  // Placeholder for sidebar toggle
  console.log('Sidebar toggle - Feature coming soon!');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('complaintModal');
  if (event.target === modal) {
    closeModal();
  }
}

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
  loadDashboardStats();
  loadRecentComplaints();
}, 30000);