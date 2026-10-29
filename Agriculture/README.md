# AgriLink – Smart Market Linkage & Price Discovery Platform

A platform designed for the **Smart India Hackathon (SIH)** to bridge the gap between farmers, Farmer Producer Organizations (FPOs), and verified buyers.

---

## 🌾 Problem Statement

Many farmers face severe challenges due to:
- Limited visibility into current market prices
- Lack of real-time buyer demand insights
- Unclear quality standards and grading specifications
- Inefficient logistics and limited storage options
- Difficulty connecting directly with verified, reliable buyers

**AgriLink** aims to empower farmers and FPOs to discover better selling opportunities, realize fair market value, and connect securely with verified buyers.

---

## 📁 Project Structure

```text
Agriculture/
├── frontend/                 # Client application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── App.jsx           # Initial placeholder component
│   │   ├── index.css         # Tailwind CSS imports
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Server application (Node.js + Express)
│   ├── src/
│   │   └── server.js         # Basic Express server & health route
│   ├── .env                  # Environment configuration
│   ├── .env.example          # Template for environment variables
│   └── package.json
├── .gitignore                # Global ignore file for dependencies and environments
└── README.md                 # Project documentation
```

---

## 🛠️ Technologies Used

### Frontend
- **React** (v19)
- **Vite** (v8)
- **Tailwind CSS** (v4)
- **JavaScript** (ES Modules)

### Backend
- **Node.js** (v24)
- **Express.js** (v4)
- **dotenv** (environment variables management)
- **cors** (Cross-Origin Resource Sharing)
- **nodemon** (auto-reloading in development)

---

## 🚀 Getting Started

### 1. Backend Setup & Run

Navigate to the `backend` directory:
```bash
cd backend
npm install
npm run dev
```

The backend server will start on port `5000` (or `PORT` defined in `.env`):
- Health check URL: `http://localhost:5000/`
- Expected JSON response:
  ```json
  {
    "message": "AgriLink backend is running"
  }
  ```

### 2. Frontend Setup & Run

In a separate terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at:
- `http://localhost:5173/`

---

## 📌 Current Status

- [x] **Step 1: Project Setup & Initialization** (Complete)
  - React + Vite + Tailwind CSS frontend initialized and verified.
  - Node.js + Express backend configured with health check route and verified.
  - Clean directory structure and `.gitignore` setup.
- [ ] **Step 2**: Awaiting instructions
