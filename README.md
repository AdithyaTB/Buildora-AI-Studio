# 🚀 Buildora AI

<div align="center">

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-purple?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)]()

**The Next-Gen AI Website Builder for Everyone.**  
Turn your ideas into production-ready code in seconds.

[View Demo](https://buildora.ai) · [Report Bug](https://github.com/yourusername/buildora/issues) · [Request Feature](https://github.com/yourusername/buildora/issues)

</div>

---

## 🔥 Project Introduction

**Buildora AI** is a state-of-the-art **AI Website Builder SaaS** that empowers users to generate fully responsive, modern, and production-ready websites using simple text prompts. Built on the robust **MERN Stack (MongoDB, Express, React, Node.js)** and powered by **Google's Gemini API**, Buildora bridges the gap between idea and implementation.

Whether you're a developer prototyping ideas or a founder building a landing page, Buildora generates clean **HTML + Tailwind CSS + JavaScript** code in a single file, ready for download and deployment.

---

## 🌟 Features

### 🤖 AI-Powered Generation
*   **Prompt-to-Website**: Advanced Natural Language Processing converts text descriptions into full website code.
*   **Gemini 1.5 Flash Integration**: Ultra-fast generation speeds with high-quality output.
*   **Context-Aware**: Understands requests for specific sections (Hero, Pricing, Contact) and styles (Modern, Minimal, Dark).

### 🛠️ Advanced Builder Interface
*   **Split-Screen View**: Real-time Chat/Prompt interface alongside a Live Preview.
*   **Monaco Code Editor**: Professional-grade code editing with syntax highlighting.
*   **Live Preview**: Instant visual rendering of generated code in a secure sandbox.
*   **Download & Export**: One-click export to `index.html`.

### 🔐 Secure & Scalable
*   **JWT Authentication**: Secure Signup, Login, and Session management.
*   **Rate Limiting & Protection**: Backend safeguards against abuse.
*   **Credit System**: Usage-based model (Free tier + Paid top-ups).

### 💳 Payments & Subscriptions
*   **Razorpay Integration**: Seamless payment processing for credit purchases.
*   **Flexible Plans**: Support for Monthly, Yearly, and Pay-as-you-go models.
*   **Transaction History**: Complete logs of user payments and credit usage.

### 🌍 Community & Sharing
*   **Public Showcase**: Share your best generations with the community.
*   **Project History**: Auto-save workflow with private/public toggles.
*   **Profile Management**: Track your usage, projects, and subscription status.

---

## 🧠 How It Works

1.  **Describe**: Enter a detailed prompt (e.g., "A futuristic portfolio for a crypto startup...").
2.  **Generate**: The backend validates credits and sends a structured "God Prompt" to Gemini AI.
3.  **Preview**: The AI returns a single HTML file containing CSS (Tailwind CDN) and JS.
4.  **Refine**: Edit the code directly or regenerate with a new prompt.
5.  **Ship**: Save your project or download the code instantly.

---

## 🏛️ System Architecture

Buildora follows a **Hybrid Architecture**:
- **Frontend**: Handles UI, State, and **Direct AI Generation** (for speed and reduced server load).
- **Backend**: Handles Auth, Database, and Payments.

```ascii
+------------------+       +------------------+       +------------------+
|   Client (SPA)   | <---> |   Server (API)   | <---> |   Database (DB)  |
|  React + Vite    | REST  |  Node + Express  | Mongoose|    MongoDB       |
+------------------+       +------------------+       +------------------+
        |                                                      ^
        | Direct AI Call                                       |
        v                                                      |
+------------------+                                           |
|  Google Gemini   |                                           |
+------------------+                                           |
```

---

## 🗂️ Folder Structure

```graphql
Buildora-AI/
├── client/                     # Frontend (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios API config
│   │   ├── assets/             # Images and global styles
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Editor.jsx      # Monaco Code Editor wrapper
│   │   │   ├── Navbar.jsx      # Responsive Navigation
│   │   │   ├── PreviewFrame.jsx # Iframe sandbox for previews
│   │   │   └── ProtectedRoute.jsx # Auth Guard
│   │   ├── context/            # Global State Management
│   │   │   └── AuthContext.jsx # User Authentication Context
│   │   ├── pages/              # Application Routes
│   │   │   ├── Auth/           # Authentication Pages
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Builder.jsx     # AI Website Builder Interface
│   │   │   ├── Community.jsx   # Public Project Showcase
│   │   │   ├── Home.jsx        # Landing Page
│   │   │   ├── Pricing.jsx     # Subscription Plans
│   │   │   ├── Profile.jsx     # User Dashboard
│   │   │   └── ProjectView.jsx # Project Details & Preview
│   │   ├── App.jsx             # Main Application Component
│   │   └── main.jsx            # Entry Point
│   ├── .env                    # Environment Variables (API Keys)
│   ├── index.html              # HTML Entry Point
│   ├── package.json            # Frontend Dependencies
│   ├── postcss.config.js       # CSS Processing Config
│   ├── tailwind.config.js      # Tailwind CSS Config
│   └── vite.config.js          # Vite Bundler Config
│
├── server/                     # Backend (Node + Express)
│   ├── config/                 # Configuration
│   │   └── db.js               # MongoDB Connection
│   ├── controllers/            # Logic for API Routes
│   │   ├── authController.js   # User Auth & Credits
│   │   ├── projectController.js # Project CRUD Operations
│   │   └── paymentController.js # Razorpay Integration
│   ├── middleware/             # Express Middleware
│   │   └── authMiddleware.js   # JWT Verification
│   ├── models/                 # Mongoose Database Schemas
│   │   ├── User.js             # User Schema
│   │   ├── Project.js          # Project Schema
│   │   └── Payment.js          # Payment Transaction Schema
│   ├── routes/                 # API Routes Definitions
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── projectRoutes.js    # /api/projects
│   │   └── paymentRoutes.js    # /api/payments
│   ├── utils/                  # Utility Functions
│   │   └── generateCode.js     # AI Code Generation Helper
│   ├── .env                    # Backend Secrets (DB URI, Keys)
│   ├── server.js               # Server Entry Point
│   └── package.json            # Backend Dependencies
│
└── README.md                   # Project Documentation
```

---

## ⚙️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | UI + **Gemini SDK Integration** |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Backend** | Node.js + Express | Auth & Data Persistence |
| **Database** | MongoDB + Mongoose | User & Project Storage |
| **AI** | Google Gemini API | Client-side generation (gemini-1.5-flash) |
| **Auth** | JWT + Bcrypt | Secure authentication |
| **Payments** | Razorpay | Subscription management |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login user & return JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| **Projects** | | | |
| `POST` | `/api/projects` | Save a project (Title, Code, Prompt) | ✅ |

| `GET` | `/api/projects/my-projects` | Get user's project history | ✅ |
| `GET` | `/api/projects/community` | Get public projects | ❌ |
| `DELETE` | `/api/projects/:id` | Delete a project | ✅ |
| **Payments** | | | |
| `POST` | `/api/payments/create-order` | Create Razorpay order | ✅ |
| `POST` | `/api/payments/verify` | Verify payment & add credits | ✅ |

---

## 🧩 Database Schema

### 1. User
*   `_id`: ObjectId
*   `name`: String
*   `email`: String (Unique)
*   `password`: String (Hashed)
*   `credits`: Number (Default: 50)
*   `plan`: String ('free', 'pro', 'yearly')

### 2. Project
*   `_id`: ObjectId
*   `userId`: Ref -> User
*   `title`: String
*   `prompt`: String
*   `generatedCode`: String
*   `isPublic`: Boolean
*   `createdAt`: Date

### 3. Credit
*   `_id`: ObjectId
*   `userId`: Ref -> User
*   `amount`: Number
*   `action`: String ('generate', 'purchase')
*   `description`: String

---

## 🧠 Gemini AI Integration

Our AI flow uses a specialized **"God Prompt"** engineered to force the LLM into a strict "Coder Mode".

1.  **Input**: User prompt + System Context ("You are an elite web developer...").
2.  **Processing**: Gemini 1.5 Flash processes the context.
3.  **Strict Output**: The model is instructed to return **ONLY** the HTML code, with no markdown, no explanations, and ensuring all CSS/JS is embedded or CDN-linked.
4.  **Fallback**: The backend cleans any markdown artifacts (`` ```html ``) before sending to client.

---

## 🔐 Security Best Practices

*   **Environment Variables**: APIs keys (`GEMINI_API_KEY`, `RAZORPAY_SECRET`) are never exposed to the client.
*   **JWT Storage**: Tokens securely managed in HttpOnly cookies or local storage (depending on config).
*   **Prompt Injection Defense**: System prompts are hidden and structure is enforced.
*   **Error Handling**: Graceful error messages without leaking stack traces.

---

## 🚀 Deployment

### Prerequisites
*   Node.js v18+
*   MongoDB Atlas URI
*   Google Gemini API Key
*   Razorpay API Keys

### Steps

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/yourusername/buildora.git
    cd buildora
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    # Setup .env file
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    # Setup .env file
    npm run dev
    ```

---

## 👨‍💻 Author

**Buildora Team**  
*Building the future of web creation.*

---

<div align="center">
  Made with ❤️ using the MERN Stack and Gemini AI
</div>
