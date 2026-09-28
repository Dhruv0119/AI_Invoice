# 🧾 AIInvoice — AI-Powered Invoice Management System

AIInvoice is a full-stack AI-powered invoice management platform designed to simplify the process of creating, managing, tracking, and processing digital invoices.

The application provides a centralized interface for managing invoices and integrates AI capabilities to assist with invoice-related tasks such as invoice generation, parsing, data extraction, and automated calculations.

---

## 🚀 Features

### 🔐 Authentication & User Management

* Secure user authentication using **Clerk**
* User session management through Clerk
* Protected application routes
* User-specific invoice access
* Authenticated communication between frontend and backend

### 🧾 Invoice Management

* Create digital invoices
* View existing invoices
* Update invoice information
* Delete invoices
* Track invoice activity
* Manage invoice details from a centralized dashboard

### 🤖 AI-Powered Invoice Processing

* AI-assisted invoice generation
* Intelligent invoice parsing
* Invoice data extraction
* Automated invoice calculations
* AI-assisted processing of invoice information

### 📄 Invoice Upload

* Upload invoice documents
* Support for invoice images/PDF documents
* Backend file handling using **Multer**
* Process uploaded invoice information through the application workflow

### 📊 Dashboard

* Centralized invoice dashboard
* Invoice statistics
* Revenue overview
* Recent invoice information
* Quick access to invoice management functionality

---

# 🛠️ Tech Stack

## Frontend

* **React.js** — Component-based UI development
* **Vite** — Frontend development and build tool
* **Tailwind CSS** — UI styling
* **Axios** — HTTP communication with backend APIs
* **React Router** — Client-side routing

## Backend

* **Node.js** — Server-side JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — NoSQL database
* **Mongoose** — MongoDB ODM
* **Multer** — File upload handling

## Authentication

* **Clerk** — Authentication and session management

## AI

* **AI API integration** for invoice-related processing, generation, parsing, and data extraction

## Development Tools

* Git
* GitHub
* Postman
* VS Code

---

# 🏗️ System Architecture
<p align="center">
  <img
    src="https://github.com/user-attachments/assets/d4b5d70d-8ed8-4dc8-9e68-04dab9b05dcd"
    alt="AI Invoice System Architecture"
    width="1000"
  />
</p>

# 🔄 Application Flow

The general application flow is:

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/d502265b-3643-43b2-a798-400af708dc1c"
    alt="AI Invoice Application Flow"
    width="1000"
  />
</p>

For AI-assisted invoice processing:

```text
Invoice Input / Document
          ↓
    React Frontend
          ↓
       REST API
          ↓
    Express Backend
          ↓
     AI Processing
          ↓
 Extracted / Generated Data
          ↓
    Invoice Workflow
          ↓
       MongoDB
```

---

# 🔐 Authentication

AIInvoice uses **Clerk** for authentication and session management.

Clerk handles the authentication lifecycle, while the application uses the authenticated user's identity to protect user-specific resources.

## Authentication Flow

```text
User
  ↓
Clerk Sign Up / Sign In
  ↓
Authenticated Session
  ↓
React Application
  ↓
Authenticated API Request
  ↓
Backend
  ↓
User Identity Verification
  ↓
Protected Resource
```

### Why Clerk?

Using Clerk allows the application to delegate authentication and session-management responsibilities to a dedicated authentication service instead of implementing the complete authentication lifecycle from scratch.

The application can therefore focus on invoice management and business logic while Clerk handles user authentication.

---

# 🛡️ Protected Resources

Invoice-related operations should be associated with the authenticated user.

The backend should use the authenticated Clerk identity when determining which invoice resources a user can access.

Conceptually:

```text
Authenticated User
       ↓
   Clerk User ID
       ↓
Backend Request
       ↓
Check Resource Ownership
       ↓
Access User's Invoice Data
```

This prevents the frontend from being the sole source of authorization decisions.

---

# 🧾 Invoice Management

AIInvoice provides CRUD functionality for managing invoices.

CRUD stands for:

* **Create**
* **Read**
* **Update**
* **Delete**

## Create Invoice

```text
User
 ↓
Invoice Form
 ↓
React
 ↓
POST API Request
 ↓
Express Backend
 ↓
Invoice Processing
 ↓
MongoDB
```

## Read Invoice

```text
React
 ↓
GET API Request
 ↓
Express
 ↓
MongoDB
 ↓
Invoice Data
 ↓
React UI
```

## Update Invoice

```text
User
 ↓
Edit Invoice
 ↓
PUT API Request
 ↓
Backend
 ↓
MongoDB Update
 ↓
Updated Invoice
```

## Delete Invoice

```text
User
 ↓
Delete Invoice
 ↓
DELETE API Request
 ↓
Backend
 ↓
MongoDB
 ↓
Invoice Removed
```

---

# 🌐 REST API

The frontend and backend communicate through REST APIs.

The API follows standard HTTP methods for invoice operations.

```text
POST    → Create
GET     → Read
PUT     → Update
DELETE  → Delete
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

> **Note:** These authentication endpoints should be removed if your current Clerk implementation no longer uses custom register/login APIs.

### Invoice APIs

```text
GET    /api/invoices
POST   /api/invoices
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

> Update the endpoint names above if your current source code uses different routes.

---

# 🗄️ Database

AIInvoice uses **MongoDB** for persistent data storage.

The application communicates with MongoDB through **Mongoose**.

```text
Express.js
    ↓
Mongoose
    ↓
MongoDB
```

## Why MongoDB?

MongoDB's document-oriented structure is suitable for invoice data, where an invoice can contain multiple related pieces of information such as:

```text
Invoice
 ├── Customer Information
 ├── Invoice Information
 ├── Invoice Items
 ├── Amounts
 ├── Status
 └── Metadata
```

Mongoose provides a structured interface for defining models and interacting with MongoDB from the Node.js backend.

---

# 🤖 AI Integration

AIInvoice integrates AI capabilities into the invoice-management workflow.

The AI layer is designed to reduce manual work involved in handling invoice information.

### AI capabilities include:

* AI-assisted invoice generation
* Invoice parsing
* Intelligent data extraction
* Automated calculations
* Processing of invoice-related information

General workflow:

```text
Invoice Input
      ↓
Backend
      ↓
AI Service
      ↓
AI Processing
      ↓
Structured Information
      ↓
Invoice Management System
```

The AI service is accessed through the backend so that sensitive credentials can remain server-side.

---

# 📄 File Uploads

AIInvoice supports invoice document uploads.

The backend uses **Multer** for handling file-upload requests.

```text
User
 ↓
Select Invoice File
 ↓
React Frontend
 ↓
Multipart/Form-Data Request
 ↓
Express Backend
 ↓
Multer
 ↓
File Processing
 ↓
AI / Invoice Workflow
```

Multer is useful for handling `multipart/form-data` requests, which are commonly used when sending files through HTTP.

---

# 📊 Dashboard

The dashboard provides a centralized overview of invoice-related information.

It can provide information such as:

* Total invoice statistics
* Revenue overview
* Recent invoices
* Invoice activity

Conceptually:

```text
MongoDB
   ↓
Invoice Records
   ↓
Backend Processing
   ↓
Dashboard APIs
   ↓
React Dashboard
   ↓
Statistics & Insights
```

---

# 🎨 Frontend Architecture

The frontend is built using React.

The application is divided into reusable UI components and pages.

Conceptually:

```text
React Application
│
├── Authentication
│
├── Dashboard
│
├── Invoice Management
│   ├── Create Invoice
│   ├── View Invoice
│   ├── Edit Invoice
│   └── Delete Invoice
│
├── AI Processing
│
└── Shared UI Components
```

React manages the user interface while Axios handles communication with the backend REST APIs.

---

# 🔗 Frontend–Backend Communication

The frontend communicates with the backend using HTTP requests.

Example flow:

```text
React Component
      ↓
Axios
      ↓
HTTP Request
      ↓
Express Route
      ↓
Controller / Business Logic
      ↓
Database / AI Service
      ↓
HTTP Response
      ↓
Axios
      ↓
React State / UI
```

This separation allows the frontend and backend to remain independently maintainable.

---

# 🔒 Security Considerations

The application uses several security practices:

### Authentication

Clerk manages user authentication and sessions.

### Protected Resources

User-specific resources should be accessed using the authenticated user's identity.

### Server-Side Secrets

Sensitive credentials such as database connection strings and AI API keys should be stored in environment variables rather than committed to the repository.

### Backend Authorization

Authorization decisions should be performed on the backend rather than relying only on frontend checks.

---

# 📁 Project Structure

```text
AI_Invoice/
│
├── backend/
│   │
│   ├── config/
│   │
│   ├── controllers/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── uploads/
│   │
│   └── server.js
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │
│   └── ...
│
├── .gitignore
│
└── README.md
```

### Backend

| Directory      | Purpose                                  |
| -------------- | ---------------------------------------- |
| `config/`      | Configuration and database-related setup |
| `controllers/` | Application/business logic               |
| `models/`      | MongoDB/Mongoose models                  |
| `routes/`      | API endpoint definitions                 |
| `uploads/`     | Uploaded invoice files                   |
| `server.js`    | Backend/server entry point               |

### Frontend

The frontend contains the React application, reusable components, pages, assets, and client-side configuration.

---

# ⚙️ Environment Variables

Create the required `.env` files for local development.

Example backend configuration:

```env
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
AI_API_KEY=your_ai_api_key
PORT=5000
```

Example frontend configuration:

```env
VITE_API_URL=your_backend_url
```

> Use the exact environment-variable names defined in your current source code. Never commit real API keys, database credentials, or authentication secrets to GitHub.

---

# 💻 Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/Dhruv0119/AI_Invoice.git
```

```bash
cd AI_Invoice
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and configure:

```env
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
AI_API_KEY=your_ai_api_key
PORT=5000
```

Start the backend:

```bash
npm start
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment:

```env
VITE_API_URL=your_backend_url
```

Start the development server:

```bash
npm run dev
```

---

# 🚀 Deployment

The application can be deployed using separate frontend and backend services.

### Frontend

**Vercel**

### Backend

**Render**

### Database

**MongoDB Atlas**

Deployment architecture:

```text
                         Users
                           │
                           ▼
                    ┌──────────────┐
                    │    Vercel    │
                    │ React/Vite   │
                    └──────┬───────┘
                           │
                       REST API
                           │
                           ▼
                    ┌──────────────┐
                    │    Render    │
                    │ Node/Express │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
              MongoDB Atlas    AI Service
```

---

# 🧪 API Testing

API endpoints can be tested during development using tools such as:

* Postman
* Browser developer tools
* Frontend application

Testing should cover:

* Authentication
* Invoice creation
* Invoice retrieval
* Invoice updates
* Invoice deletion
* Invalid requests
* Unauthorized requests
* File uploads
* AI processing failures

---

# 🔮 Future Improvements

Possible future improvements include:

* Advanced invoice search and filtering
* Invoice PDF generation
* Email-based invoice delivery
* Payment status tracking
* Advanced analytics
* Role-based access control
* Better AI output validation
* AI processing queues for large workloads
* API rate limiting
* Caching
* Centralized logging and monitoring
* Automated unit and integration testing
* CI/CD pipeline
* Improved production scalability

---

# 👨‍💻 Author

**Dhruv Sagar**

B.Tech — Data Science and Engineering
Dr. B. R. Ambedkar National Institute of Technology, Jalandhar

GitHub: **Dhruv0119**

---

# 📄 License

This project was developed as a personal/academic full-stack development project.
