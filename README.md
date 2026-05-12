# 🌱 FoodBridge — Smart Surplus Food Dispatcher

A full-stack web application built to reduce food waste by connecting restaurants, event organizers, NGOs, and volunteers.

The platform allows food donors to post surplus food, NGOs to claim donations, and volunteers to help with pickup and delivery tracking.

---

## Live Demo
https://smart-surplus-food-dispatcher.vercel.app/

## Overview

FoodBridge is designed to solve the "last-mile" problem of food donation. It uses a modern event-driven architecture to ensure that surplus food is rescued and delivered while it's still fresh.

### Current Status
This project is currently in active development.

The core workflow is working:

- User authentication
- Donation posting
- NGO claiming system
- Volunteer flow
- Real-time updates using Socket.IO
- Food category checking
- Live donation tracking UI

Some advanced features are partially implemented or still under improvement.

---

## Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Framer Motion
- React Query
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

---

## Project Structure

```
├── backend/   
|    ├── config/
|   ├── controllers/          
│   ├── models/ 
|   ├── routes/           
│   ├── services/ 
|    ├── middlewares/         
│   ├── rtc/               
│   └── workers/ 
├── public/          
├── src/                   
│   ├── store/             
│   ├── components/  
|    ├── context/
|    ├── services/
|    ├── hooks/
|    ├── utils      
│   └── pages/             
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

### Current Limitations

- Automatic food expiry handling
- Automatic removal of expired donations
- Accurate freshness detection
- Advanced AI validation logic

