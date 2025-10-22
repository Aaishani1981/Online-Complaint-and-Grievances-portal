// Escalation JavaScript
let currentComplaintId = null;

// Load complaint details when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Get complaint ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentComplaintId = urlParams.get('id');
  
  if (currentComplaintId) {
    loadComplaintDetails(currentComplaintId);
  } else {
    // If no ID provided, try to get from localStorage (last complaint)
    currentComplaintId = localStorage.getItem('lastComplaintId');
    if (currentComplaintId) {
      loadComplaintDetails(currentComplaintId);
    } else {
      showError('No complaint ID provided');
    }
  }
});

// Load complaint details
async function loadComplaintDetails(complaintId) {
  try {
    const response = await fetch(`/complaints/status/${complaintId}`);
    const complaint = await response.json();
    
    if (response.ok) {
      // Update UI with complaint details
      document.getElementById('complaintTitle').textContent = 
        complaint.category || 'General Complaint';
      document.getElementById('complaintId').textContent = 
        formatComplaintId(complaintId);
    } else {
      showError('Failed to load complaint details: ' + complaint.message);
    }
  } catch (error) {
    showError('Network error loading complaint details');
  }
}

// Format complaint ID for display
function formatComplaintId(id) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}-${id.slice(0, 3).toUpperCase()}`;
}

// Escalate complaint
async function escalateComplaint() {
  if (!currentComplaintId) {
    showError('No complaint selected for escalation');
    return;
  }

  const higherAuthority = document.getElementById('higherAuthority').value;
  const escalationReason = document.getElementById('escalationReason').value;
  const notifyParties = document.getElementById('notifyParties').checked;

  // Validation
  if (!higherAuthority) {
    showError('Please select a higher authority');
    return;
  }

  if (!escalationReason.trim()) {
    showError('Please provide a reason for escalation');
    return;
  }

  // Show loading state
  const escalateBtn = document.getElementById('escalateBtn');
  const originalText = escalateBtn.textContent;
  escalateBtn.textContent = 'Escalating...';
  escalateBtn.disabled = true;

  try {
    const response = await fetch(`/complaints/admin/escalate/${currentComplaintId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        escalateTo: higherAuthority,
        reason: escalationReason.trim(),
        notifyParties: notifyParties
      })
    });

    const result = await response.json();

    // Reset button
    escalateBtn.textContent = originalText;
    escalateBtn.disabled = false;

    if (response.ok) {
      showSuccess(
        `Complaint successfully escalated to ${higherAuthority}. ` +
        `Escalation ID: ${result.escalation.escalationId.slice(0, 8)}`
      );
      
      // Clear form
      document.getElementById('escalationReason').value = '';
      document.getElementById('higherAuthority').value = '';
      
      // Redirect to admin dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 3000);
      
    } else {
      showError('Failed to escalate complaint: ' + result.message);
    }
  } catch (error) {
    // Reset button on error
    escalateBtn.textContent = originalText;
    escalateBtn.disabled = false;
    showError('Network error during escalation');
  }
}

// Show success message
function showSuccess(message) {
  const resultDiv = document.getElementById('escalationResult');
  resultDiv.innerHTML = `
    <div class="success-message">
      <p>✅ ${message}</p>
      <p>Redirecting to Admin Dashboard...</p>
    </div>
  `;
  resultDiv.style.display = 'block';
}

// Show error message
function showError(message) {
  const resultDiv = document.getElementById('escalationResult');
  resultDiv.innerHTML = `
    <div class="error-message">
      <p>❌ ${message}</p>
    </div>
  `;
  resultDiv.style.display = 'block';
}

// Auto-check for escalations (can be called from admin dashboard)
async function checkAutoEscalations() {
  try {
    const response = await fetch('/complaints/admin/check-escalations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok && result.escalatedCount > 0) {
      alert(`Auto-escalation completed: ${result.escalatedCount} complaints escalated to higher authorities.`);
    }
  } catch (error) {
    console.error('Error checking auto-escalations:', error);
  }
}