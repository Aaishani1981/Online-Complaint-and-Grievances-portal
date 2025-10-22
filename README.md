# 🎯 Complaint Portal System

A modern, full-featured complaint management system built with Node.js, Express, and vanilla JavaScript. This application provides a complete workflow for complaint submission, admin management, and escalation handling.

## ✨ Features

### 🔹 **User Features**
- **Modern UI/UX** with blue and white theme
- **Complaint Submission** with PDF file upload support
- **Real-time Status Tracking** with visual timeline
- **Responsive Design** for all device types
- **Form Validation** and user-friendly notifications

### 🔹 **Admin Features**
- **Admin Dashboard** with comprehensive statistics
- **Complaint Management** with status updates
- **Staff Assignment** and internal notes
- **Modal-based Interface** for efficient workflow
- **Real-time Data Updates** every 30 seconds

### 🔹 **Escalation System**
- **Manual Escalation** to higher authorities
- **Auto-escalation** for complaints older than 7 days
- **Authority Selection** (Senior Management, Department Head, etc.)
- **Notification System** for all parties
- **Escalation History** tracking

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/complaint-portal.git
   cd complaint-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Access the application**
   - **User Portal**: http://localhost:5000
   - **Admin Dashboard**: http://localhost:5000/admin.html
   - **Escalation Portal**: http://localhost:5000/escalate.html?id=COMPLAINT_ID

## 📁 Project Structure

```
complaint-portal/
├── public/                 # Frontend files
│   ├── index.html         # Main user interface
│   ├── complaint.html     # Complaint submission form
│   ├── status.html        # Status tracking page
│   ├── admin.html         # Admin dashboard
│   ├── escalate.html      # Escalation interface
│   ├── style.css          # Main stylesheet
│   ├── script.js          # User interface logic
│   ├── admin-script.js    # Admin dashboard logic
│   └── escalation-script.js # Escalation functionality
├── routes/                # Backend API routes
│   ├── auth.js           # Authentication routes
│   └── complaints.js     # Complaint management APIs
├── data/                 # Data storage
│   ├── complaints.json   # Complaint records
│   └── users.json        # User data
├── uploads/              # PDF file uploads
├── server.js             # Main server file
└── package.json          # Project dependencies
```

## 🔧 API Endpoints

### User Endpoints
- `POST /complaints/submit` - Submit new complaint
- `GET /complaints/status/:id` - Get complaint status
- `GET /complaints/:id` - Get complaint details

### Admin Endpoints
- `GET /complaints/admin/stats` - Dashboard statistics
- `GET /complaints/admin/recent` - Recent complaints
- `PUT /complaints/admin/update/:id` - Update complaint
- `POST /complaints/admin/escalate/:id` - Manual escalation
- `GET /complaints/admin/check-escalations` - Auto-escalation check

## 🎨 Color Scheme

The application uses a professional blue and white color scheme:
- **Primary Blue**: #1e3a8a, #3b82f6
- **Secondary Blue**: #60a5fa, #93c5fd
- **Background**: #f8fafc, #ffffff
- **Text**: #1f2937, #374151
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #dc2626

## 🔄 Workflow

### User Workflow
1. **Submit Complaint** → Get complaint ID
2. **Track Status** → View progress timeline
3. **Receive Updates** → Get notifications

### Admin Workflow
1. **View Dashboard** → See statistics and recent complaints
2. **Manage Complaints** → Update status and assign staff
3. **Handle Escalations** → Process escalated complaints

### Escalation Workflow
1. **Auto-check** → System checks for overdue complaints (7+ days)
2. **Manual Escalation** → Admin escalates specific complaints
3. **Authority Selection** → Choose appropriate higher authority
4. **Notification** → All parties notified of escalation

## 🛠️ Configuration

### Server Configuration
- **Port**: 5000 (configurable in server.js)
- **File Upload**: PDF files up to 10MB
- **Data Storage**: JSON files in `/data` directory

### Auto-escalation Settings
- **Threshold**: 7 days for unresolved complaints
- **Default Authority**: Senior Management
- **Check Frequency**: On-demand via API call

## 📱 Screenshots

### User Interface
- Clean, modern design with intuitive navigation
- Responsive forms with real-time validation
- Visual status timeline for complaint tracking

### Admin Dashboard
- Comprehensive statistics overview
- Recent complaints with quick actions
- Modal-based complaint management

### Escalation System
- Professional escalation interface
- Authority selection with reason input
- Notification options for all parties

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the Issues** on GitHub
2. **Create a New Issue** with detailed description
3. **Contact Support** via the admin dashboard

## 🔮 Future Enhancements

- **Email Notifications** for status updates
- **Database Integration** (MySQL/PostgreSQL)
- **User Authentication** with JWT tokens
- **Advanced Reporting** and analytics
- **Mobile App** development
- **Multi-language Support**

---

**Made with ❤️ for better complaint management**