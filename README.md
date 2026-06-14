# 🚀 SignFlow – Document Signature App

A full-stack MERN-based digital document signature platform inspired by DocuSign and Adobe Sign.

SignFlow allows users to upload PDF documents, add digital signatures, generate signed PDFs, share secure signing links, send email invitations, track document activity through audit logs, and manage document workflows with Pending, Signed, and Rejected statuses.

---

## 📌 Features

### 🔐 Authentication & Security

* User Registration & Login
* JWT Authentication
* Protected Routes
* Secure Document Ownership

### 📄 Document Management

* Upload PDF Documents
* View Documents
* Download Original PDF
* Download Signed PDF
* Delete Documents

### ✍️ Digital Signature System

* Add Digital Signature
* Drag & Position Signature
* Generate Signed PDF
* Signature Status Tracking

### 🌐 Public Signing

* Token-Based Public Signing Links
* Share Documents Securely
* External Signer Access

### 📧 Email Invitations

* Send Signature Requests via Email
* Secure Signing URL Generation
* Real Gmail Integration using Nodemailer

### 📊 Workflow Management

* Pending Documents
* Signed Documents
* Rejected Documents
* Reject with Reason

### 📜 Audit Trail

* Track User Actions
* Upload Logs
* View Logs
* Download Logs
* Delete Logs
* Signature Activity Logs
* Document-wise Audit Timeline
* IP Address Tracking

### 🎨 Modern Dashboard

* Premium Dashboard UI
* Document Analytics
* Search Documents
* Filter by Status
* Responsive Design

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* Axios
* Lucide React

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* bcryptjs

### File Handling

* Multer
* PDF-Lib

### Email Service

* Nodemailer
* Gmail SMTP

---

## 📂 Project Structure

```bash
signflow-document-signature-app/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/vaibhav378-vi/signflow-document-signature-app.git
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
```

---

## 📈 Workflow

```text
Upload PDF
      ↓
Share Link / Email Invite
      ↓
Signer Opens Document
      ↓
Sign / Reject
      ↓
Generate Signed PDF
      ↓
Audit Log Created
      ↓
Status Updated
```

---

## 🎯 Learning Outcomes

This project demonstrates:

* MERN Stack Development
* Authentication & Authorization
* PDF Processing
* Secure File Uploads
* Email Automation
* Audit Logging
* Document Workflow Management
* Enterprise SaaS Architecture

---

## 👨‍💻 Author

**Vaibhav Bansal**

GitHub:
https://github.com/vaibhav378-vi

---

## ⭐ Future Enhancements

* Multi Signer Workflow
* QR Verification
* Signature Certificate
* Role-Based Access Control
* Cloud Storage Integration (AWS S3)
* Link Expiry Controls

---

### ⭐ If you like this project, don't forget to star the repository.
