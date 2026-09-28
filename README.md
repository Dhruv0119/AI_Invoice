# 🤖 AI Invoice

### AI-Powered Invoice Management & Intelligent Document Processing Platform

AI Invoice is a full-stack web application designed to simplify **invoice creation, management, and intelligent processing**.

The application follows a **component-based architecture** with a React frontend, Node.js/Express backend, MongoDB database, REST APIs, authentication, file handling, and AI-assisted invoice processing.

---

## 🚀 Live Application

**Live Demo:** https://ai-invoice-coral.vercel.app/

**GitHub:** https://github.com/Dhruv0119/AI_Invoice

---

## ✨ Features

* 🔐 Secure user authentication
* 👤 Business profile management
* 🧾 Create, view, update and delete invoices
* 🤖 AI-assisted invoice processing
* 📄 Invoice document upload
* 📊 Dashboard and invoice analytics
* 🔄 REST API-based frontend-backend communication
* 🗄️ MongoDB database integration
* 🔑 JWT-based authentication
* 🔒 Password hashing using bcrypt
* 📁 File handling using Multer
* 📱 Responsive React-based interface

---

# 🏗️ System Architecture

The application follows a **component-based client-server architecture**.

The frontend is responsible for the user interface and API communication, while the backend handles authentication, business logic, database operations, file processing and AI-related services.
<p align="center">
  <img
    src="https://github.com/user-attachments/assets/d4b5d70d-8ed8-4dc8-9e68-04dab9b05dcd"
    alt="AI Invoice System Architecture"
    width="1000"
  />
</p>



### Architecture Components

| Component             | Responsibility                             |
| --------------------- | ------------------------------------------ |
| **React + Vite**      | Frontend UI and client-side application    |
| **Axios / REST APIs** | Communication between frontend and backend |
| **Node.js + Express** | Backend server and API layer               |
| **JWT**               | User authentication                        |
| **bcrypt**            | Password hashing                           |
| **Multer**            | File upload handling                       |
| **MongoDB**           | Persistent application data                |
| **Mongoose**          | MongoDB object modeling                    |
| **AI Services**       | AI-assisted invoice processing             |

---

# 🔄 Application Flow

A typical request flows through the following stages:
<p align="center">
  <img
    src="https://github.com/user-attachments/assets/d502265b-3643-43b2-a798-400af708dc1c"
    alt="AI Invoice Application Flow"
    width="1000"
  />
</p>


### Workflow

```text
User
  ↓
React Frontend
  ↓
REST API Request
  ↓
Node.js + Express Backend
  ↓
Authentication / Business Logic
  ↓
MongoDB / AI Services
  ↓
JSON Response
  ↓
React Dashboard
```

### Example

When a user creates an invoice:

1. The user enters invoice information through the React interface.
2. The frontend sends the data to the backend through a REST API.
3. Express receives and validates the request.
4. Authentication middleware verifies the user.
5. The backend processes the invoice data.
6. MongoDB stores the invoice information.
7. If AI processing is required, the backend communicates with the AI service.
8. The backend returns a JSON response.
9. The React frontend updates the dashboard.

---

# 🧩 Component-Based Architecture

The frontend and backend are divided into independent modules, with each component responsible for a specific functionality.

### Frontend Components

```text
Frontend
│
├── Authentication
│
├── Dashboard
│
├── Invoice Management
│
├── Business Profile
│
├── Invoice Forms
│
└── API Services
```

### Backend Components

```text
Backend
│
├── Routes
│
├── Controllers
│
├── Models
│
├── Authentication
│
├── File Handling
│
├── AI Services
│
└── Database
```

This separation improves **maintainability, scalability, testing and code reusability**.

---

# 📡 REST API Architecture

The frontend communicates with the backend using REST APIs over HTTP.

### HTTP Methods

| Method   | Purpose               |
| -------- | --------------------- |
| `GET`    | Retrieve data         |
| `POST`   | Create new data       |
| `PUT`    | Update existing data  |
| `PATCH`  | Partially update data |
| `DELETE` | Delete data           |

### Example

```http
GET /api/invoices
```

The frontend sends the request:

```text
React Frontend
      ↓
GET /api/invoices
      ↓
Express Backend
      ↓
MongoDB
      ↓
JSON Response
      ↓
React UI
```

---

# 🔐 Authentication

The application uses token-based authentication.

### Authentication Flow

```text
User Login
    ↓
Frontend
    ↓
POST /login
    ↓
Express Backend
    ↓
Validate Credentials
    ↓
JWT Generated
    ↓
Frontend Stores Token
    ↓
Authenticated API Requests
```

Passwords are securely hashed using **bcrypt**, while JWT tokens are used to authenticate protected API requests.

---

# 🛠️ Tech Stack

## Frontend

* **React.js**
* **Vite**
* **Axios**
* **React Router**
* **CSS**

## Backend

* **Node.js**
* **Express.js**
* **Mongoose**
* **JWT**
* **bcrypt**
* **Multer**

## Database

* **MongoDB**

## AI

* **OpenAI API / AI Services**

## Deployment

* **Vercel** for frontend deployment
* Backend can be deployed on a Node.js-compatible hosting platform

---

# 📁 Project Structure

```text
AI_Invoice/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── docs/
│   └── images/
│       ├── system-architecture.png
│       └── application-flow.png
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/Dhruv0119/AI_Invoice.git

cd AI_Invoice
```

---

## 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

---

# 🔑 Environment Variables

The application requires environment variables for sensitive configuration.

```env
MONGO_URI=
JWT_SECRET=
OPENAI_API_KEY=
PORT=
```

> ⚠️ Never commit `.env` files or API keys to the repository.

---

# 📊 Core Functionalities

### Invoice Management

Users can manage their invoices through CRUD operations:

```text
Create
  ↓
Read
  ↓
Update
  ↓
Delete
```

### Business Profile

Users can maintain their business-related information, which can be used while managing invoices.

### File Processing

Invoice documents can be uploaded through the application and processed by the backend.

### AI Processing

AI services can assist in extracting and processing relevant information from invoice documents.

### Dashboard

The dashboard provides a centralized view of invoice-related information and statistics.

---

# 🔒 Security

Security considerations implemented in the application include:

* JWT-based authentication
* Password hashing with bcrypt
* Protected API endpoints
* Environment variables for secrets
* Authenticated backend requests
* Secure database connection
* Separation of frontend and backend responsibilities

---

# 🧠 What I Learned

This project provided practical experience in:

* Full-stack development
* MERN architecture
* REST API development
* Component-based architecture
* Authentication and authorization
* CRUD operations
* MongoDB and Mongoose
* Frontend-backend integration
* File upload handling
* AI API integration
* API error handling
* Environment configuration
* Deployment

---

# 🚀 Future Improvements

Potential future enhancements include:

* 📧 Automated email delivery of invoices
* 📄 Advanced OCR-based invoice extraction
* 📊 Advanced financial analytics
* 📥 Excel/CSV export
* 🧾 Automated PDF invoice generation
* 🤖 AI-based expense categorization
* 🌙 Dark mode
* 🌐 Multi-language support
* 💳 Payment integration
* 👨‍💼 Admin dashboard

---

# 👨‍💻 Author

## Dhruv Sagar

**B.Tech — Data Science & Engineering**
Dr. B. R. Ambedkar National Institute of Technology, Jalandhar

GitHub: https://github.com/Dhruv0119

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐.
