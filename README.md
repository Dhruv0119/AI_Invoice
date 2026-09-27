# 🤖 AI_INVOICE

An AI-powered invoice management system built using the **MERN Stack** that automates invoice creation, storage, management, and intelligent document processing. The application provides a modern dashboard for managing invoices with secure authentication and AI-assisted features.

---

## 📌 Features

### 👤 Authentication
- Secure User Registration
- Login using JWT Authentication
- Protected Routes
- Password Encryption using bcrypt

### 📄 Invoice Management
- Create New Invoices
- Edit Existing Invoices
- Delete Invoices
- View Invoice Details
- Invoice History

### 🤖 AI Features
- AI-assisted invoice generation
- Smart invoice parsing
- Intelligent invoice data extraction
- Automated calculations

### 📂 File Upload
- Upload invoice PDFs
- Upload invoice images
- Secure file storage

### 📊 Dashboard
- Professional analytics dashboard
- Invoice statistics
- Revenue overview
- Recent invoices

### 🔒 Security
- JWT Authentication
- Password Hashing
- Environment Variables
- Protected API Routes
- MongoDB Secure Connection

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Axios
- React Router
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

## Database

- MongoDB Atlas

---

# 📁 Project Structure

```
AI_INVOICE
│
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   ├── dist
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/AI_INVOICE.git

cd AI_INVOICE
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_api_key
```

Run Backend

```bash
npm start
```

or

```bash
npm run dev
```

---

## Frontend Setup

Open a new terminal.

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

Run Frontend

```bash
npm run dev
```

---

# 🚀 Deployment

## Backend

Deploy on **Render**

Environment Variables

```
MONGO_URI

JWT_SECRET

OPENAI_API_KEY

PORT
```

---

## Frontend

Deploy on **Vercel**

Environment Variable

```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

# 📡 API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login
```

## Invoice

```
GET /api/invoices

POST /api/invoices

PUT /api/invoices/:id

DELETE /api/invoices/:id
```

---

# 🔐 Environment Variables

Backend

```env
PORT=

MONGO_URI=

JWT_SECRET=

OPENAI_API_KEY=
```

Frontend

```env
VITE_API_URL=
```

---

# 📸 Screenshots

Add screenshots here after deployment.

Example:

```
Home Page

Dashboard

Invoice Generator

Analytics
```

---

# 🧪 Future Enhancements

- Email Invoice Delivery
- OCR-based Invoice Reading
- PDF Invoice Generation
- GST Calculation
- Multi-language Support
- Dark Mode
- AI Expense Categorization
- Export to Excel
- Payment Gateway Integration
- Admin Dashboard

---

# 🤝 Contributing

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Dhruv Sagar**

B.Tech Data Science  
Dr. B.R. Ambedkar National Institute of Technology, Jalandhar

---

## ⭐ If you found this project useful, don't forget to star the repository!