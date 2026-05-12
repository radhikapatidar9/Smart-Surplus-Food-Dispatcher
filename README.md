# 🌱 FoodBridge — Smart Surplus Food Dispatcher

A **full-stack, production-grade** real-time logistics platform connecting restaurants and event halls with NGOs, shelters, and volunteers to reduce food waste.

---

## Live Demo
https://smart-surplus-food-dispatcher.vercel.app/

## Overview

FoodBridge is designed to solve the "last-mile" problem of food donation. It uses a modern event-driven architecture to ensure that surplus food is rescued and delivered while it's still fresh.

### Key Architecture
- **Event-Driven**: Real-time state synchronization via Socket.IO.
- **Logistics Engine**: Intelligent mission tracking with a high-fidelity visual pipeline.
- **Background Jobs**: Resilience via BullMQ and Redis for mission expiration and escalation.
- **Geospatial Intelligence**: Location-based matching for volunteers and NGOs.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **State Management** | Zustand (Persistent), React Query |
| **Backend** | Node.js, Express, MongoDB (Geospatial) |
| **Real-time** | Socket.IO |
| **Background Tasks** | Redis, BullMQ |
| **Security** | JWT (HttpOnly Cookies), Helmet, rate-limiting |

---

## Project Structure

```
├── backend/                # Express server + Business logic
│   ├── models/            # Mongoose schemas (Donation, User, Session)
│   ├── services/          # Modular business logic (Logistics, Auth, Notification)
│   ├── rtc/               # Socket.IO event handlers
│   └── workers/           # BullMQ background job processors
├── src/                   # React Frontend
│   ├── store/             # Zustand stores (auth, donation, notifications)
│   ├── components/        # High-fidelity UI components
│   └── pages/             # Role-based dashboards & Live Tracking
└── README.md
```

---

## Features

### Partner Dashboards
- **Restaurants**: Post donations with quantity, category (Critical/Standard), and live tracking.
- **NGOs**: Browse the marketplace, claim donations, and monitor rescue missions.
- **Volunteers**: Accept flash requests, manage pick-ups, and update delivery stages.

### High-Fidelity Tracking
- **Mission Pulse**: A vertical, real-time logistics timeline with interactive checkboxes.
- **Auto-Sync**: Status updates propagate across all stakeholders instantly.
- **Time-Aware**: Precise timestamps for every stage (Accepted, Picked Up, Transit, etc.).

### Production Safety
- **Rate Limiting**: Protection against brute-force and DDoS.
- **Graceful Degradation**: System remains functional even if background services (like Redis) are temporarily unavailable.
- **Secure Auth**: Role-based access control (RBAC) with secure token management.

---

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Redis (Optional for dev, required for background jobs)

### Installation

```bash
# 1. Clone & Install
git clone https://github.com/radhikapatidar9/Smart-Surplus-Food-Dispatcher
npm install
cd backend && npm install

# 2. Configure environment
# Create .env in both root and /backend
```

### Running Locally
```bash
# Start backend
cd backend && npm run dev

# Start frontend
npm start
```

---


