# AI-Powered Student Expense Analysis and Forecasting System

This project is a comprehensive, production-ready, AI-powered web application for student expense tracking, forecasting, and analysis. It integrates a modern React frontend, a Node.js core backend, and a dedicated Python AI service.

## User Review Required

> [!IMPORTANT]
> **Architecture Decision**: The requested tech stack includes both Node.js (for the backend) and Python (for AI/ML models using scikit-learn, XGBoost, etc.). To achieve this reliably, I propose a **Microservices Architecture**:
> 1. **Core Backend (Node.js/Express)**: Handles authentication, database interactions (MongoDB), standard APIs, and the fake UPI simulation.
> 2. **AI Service (Python/FastAPI or Flask)**: A separate lightweight service that houses the ML models, handles the fake data generation script, and exposes endpoints for the Node.js backend to request predictions and clustering.
> 
> *Please confirm if you are okay with running two separate backend services locally during development.*

> [!NOTE]
> **MongoDB Atlas**: You will need to provide a MongoDB Atlas connection string (`MONGO_URI`) to connect the application to the database. We will use a local `.env` file for this.

## Open Questions

> [!WARNING]
> 1. **Google OAuth**: Do you already have Google OAuth Client ID and Secret for the authentication, or should I mock this out / provide placeholders for now?
> 2. **Fake Data Generation**: Should the system automatically generate the 1000s of fake transactions on the first startup, or should I provide a separate script (e.g., `npm run seed` or a python script) that you run manually to populate the database?

## Proposed Architecture & Tech Stack

### Frontend (`/frontend`)
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS + Framer Motion (for premium, smooth animations and glassmorphism)
- **Charts**: Recharts (for dashboards, heatmaps, and trends)
- **State Management**: Context API / Zustand (lightweight)

### Core Backend (`/backend`)
- **Framework**: Node.js + Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT + bcrypt
- **Key Routes**: Auth, Transactions, UPI Simulation, Dashboard stats

### AI & ML Service (`/ai-service`)
- **Framework**: Python + FastAPI (or Flask)
- **Libraries**: Pandas, NumPy, Scikit-learn, XGBoost, Mlxtend (for Apriori)
- **Functions**: Forecasting (RF/XGBoost), Clustering (K-Means), Pattern Mining (Apriori), Outlier Detection (Isolation Forest)

## Implementation Phases

### Phase 1: Project Setup & Schemas
- Initialize the monorepo structure in `p:\Student_Expense`.
- Set up Node.js backend and define MongoDB schemas (`User`, `Transaction`, `Budget`, `Notification`).
- Set up Python environment for AI.
- Create initial Vite + React frontend structure with Tailwind config.

### Phase 2: Core Backend & Fake UPI System
- Implement JWT User Authentication (Login, Register).
- Build the Fake UPI payment APIs (with balance limits, simulated transactions).
- Create the manual seed script to generate thousands of realistic student transactions.

### Phase 3: AI Service & ML Models
- Implement Python scripts to train and expose models based on the seeded data.
- **Forecasting**: Predict next month's expenses.
- **Clustering**: Categorize users into spending behavior groups.
- **Outliers**: Detect unusual transaction spikes.
- Integrate Node.js to communicate with the Python AI service.

### Phase 4: Premium Frontend Development
- Build the **Glassmorphism UI** with a dark theme emphasis.
- Develop the **Student Dashboard**: Render Recharts components for expenses and budgets.
- Develop the **AI Analytics Dashboard**: Show predictions, warnings, and clustering info.
- Develop the **Fake UPI UI**: QR scan simulation and transaction animations.

### Phase 5: Polish, Notifications & Deployment Prep
- Add smart alerts (e.g., "Overspending warning").
- Finalize styling and animations (Framer Motion).
- Add README, deployment scripts, and architectural documentation.

## Verification Plan

### Automated/Unit Verification
- Test API endpoints using HTTP requests to ensure JSON responses are correctly formed.
- Run the Data Generator script and verify that MongoDB is populated with the correct schema format.
- Verify communication between Node.js and the Python AI service.

### Manual Verification
- Start all three servers (Frontend, Core Backend, AI Service).
- Register a new user, view the dashboard (empty state).
- Run the seed script for that user.
- View the populated dashboard, AI insights, and test the UPI payment UI.
