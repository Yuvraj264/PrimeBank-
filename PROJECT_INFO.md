# 🏦 PrimeBank Suite — Digital Banking Platform

## Overview
PrimeBank Suite (also known as iBanking Management System) is a production-grade digital banking platform designed with a premium fintech aesthetic. It features three distinct role-based dashboards (Admin, Employee, and Customer), providing a comprehensive set of banking features with a focus on security, performance, and user experience.

The platform utilizes a modern dark theme with glassmorphism elements, smooth animations, and interactive data visualizations.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Caching & Job Queue**: [Redis](https://redis.io/) ([ioredis](https://github.com/luin/ioredis), [BullMQ](https://docs.bullmq.io/))
- **Message Broker**: [RabbitMQ](https://www.rabbitmq.com/) ([amqplib](https://github.com/amqp-node/amqplib))
- **Authentication**: JWT (JSON Web Tokens) & [WebAuthn](https://webauthn.io/) (Biometrics)
- **Scheduled Tasks**: [node-cron](https://github.com/node-cron/node-cron)

### Microservices (Python)
- **Banking Interest Service**: [FastAPI](https://fastapi.tiangolo.com/) based service for ADB calculation and fraud-aware interest payouts.
- **Language**: [Python](https://www.python.org/) (v3.10+)
- **ORM**: [Beanie](https://beanie-odm.dev/) (MongoDB ODM)
- **Task Scheduling**: [APScheduler](https://apscheduler.readthedocs.io/)

### Infrastructure & DevOps
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Web Server**: [Nginx](https://www.nginx.com/) (Reverse Proxy & Static Hosting)
- **Environment**: [Dotenv](https://github.com/motdotla/dotenv)

---

## ✨ Key Features

### 🔐 Security & Auth
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, Employee, and Customer.
- **Biometric Login**: Secure fingerprint/face authentication using WebAuthn.
- **Session Management**: JWT-based authentication with active session tracking.
- **Fraud Monitoring**: Real-time risk heat indicators and automated transaction flagging.

### 💳 Banking Operations
- **Account Management**: Balance tracking with animated metrics and financial health scores.
- **Fund Transfers**: Support for NEFT, RTGS, and IMPS with OTP verification for high-value transactions.
- **Bill Payments**: Integrated utility and credit card bill payments.
- **Transaction History**: Filterable history with risk scores and fraud detection badges.
- **Automated Interest Payouts**: Fraud-aware quarterly interest calculation based on Average Daily Balance (ADB).

### 👥 User Roles
- **Customer**: Dashboard for personal banking, transfers, and security settings.
- **Employee**: Tools for customer management, KYC verification, and loan processing.
- **Admin**: System-wide analytics, user/employee management, and audit logs.

### 📊 UX & UI
- **Responsive Design**: Optimized for Desktop, Tablet, and Mobile.
- **Animations**: Page transitions, hover effects, and skeleton loaders for a premium feel.
- **Real-time Notifications**: Simulated real-time updates for transactions and alerts.
