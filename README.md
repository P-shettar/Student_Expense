# AI-Powered Student Expense Analysis and Forecasting System 🚀

A production-ready, full-stack AI-powered fintech application designed specifically for students to track expenses, simulate UPI payments, and receive AI-driven financial insights. Built for hackathons, major projects, and production deployments.

## 🌟 Features

- **Premium UI/UX**: Dark mode, glassmorphism, and smooth Framer Motion animations.
- **Fake UPI Payment Engine**: Simulate real-time QR payments with wallet balance and daily limits.
- **AI Forecasting (Random Forest)**: Predicts next month's expenses based on historical data.
- **Outlier Detection (Isolation Forest)**: Detects unusual spending spikes or fraudulent-like behavior.
- **Pattern Mining (Apriori Algorithm)**: Discovers frequent spending combinations (e.g., Food + Transport).
- **Interactive Dashboards**: Built using Recharts for beautiful data visualization.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, Framer Motion, Recharts
- **Core Backend**: Node.js, Express.js, JWT Auth, Mongoose
- **AI Service**: Python, FastAPI, Scikit-learn, MLxtend, Pandas
- **Database**: MongoDB Atlas

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas URI

### 2. Setup the Core Backend (Node.js)
```bash
cd backend
npm install
# Create a .env file with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Setup the AI Service (Python)
```bash
cd ai-service
python -m venv venv
# Activate venv: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
pip install -r requirements.txt
# Create a .env file with MONGO_URI
uvicorn main:app --reload --port 8000
```

### 4. Setup the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 5. Seed the Database
To generate thousands of fake realistic transactions for testing the AI models:
```bash
cd backend
node seed.js
```
*Note: This will create a test user: `student@test.com` with password `password123`.*

## ☁️ Deployment Guide

1. **Database (MongoDB Atlas)**: Ensure IP access is set to `0.0.0.0/0` and obtain the connection string.
2. **Backend (Render/Railway)**: Deploy the `backend` folder as a Node.js web service. Set `MONGO_URI`, `JWT_SECRET`, and `AI_SERVICE_URL`.
3. **AI Service (Render/Railway)**: Deploy the `ai-service` folder as a Python web service. Set `MONGO_URI`.
4. **Frontend (Vercel)**: Deploy the `frontend` folder. Ensure API endpoints in axios point to your deployed backend URL.

## 📝 License
MIT License
