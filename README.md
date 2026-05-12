# 🔍 FounIT JO — Lost & Found Platform

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Lost%20%26%20Found-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**A modern full-stack platform for reporting, tracking, and recovering lost & found items**

🌐 [Live Deployment](#) | 📽️ [Demo Video](#)

</div>

---

# 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Production Checklist](#-production-checklist)
- [Future Improvements](#-future-improvements)
- [Team](#-team)
- [Troubleshooting](#-troubleshooting)

---

# 🌟 Overview

FounIT JO is a full-stack Lost & Found platform designed to help users report lost items, publish found items, communicate securely, and locate posts using an interactive map system.

The platform provides a modern and responsive user experience with authentication, real-time messaging, notifications, post management, profile system, and map-based filtering.

Users can:
- Report lost items
- Publish found items
- Search nearby locations
- Chat with other users
- Receive notifications
- Manage personal profiles and posts

The system is built using the MERN stack with scalable deployment support using Vercel and Render.

---

# ✨ Features

## 👤 Authentication System
- User registration and login
- JWT authentication
- Persistent login sessions
- Protected routes
- Google OAuth support

## 📝 Posts System
- Create lost/found posts
- Upload item details and location
- Browse public feed
- View single post details
- User-owned posts management

## 🗺️ Interactive Map
- Map integration using Leaflet + OpenStreetMap
- Location-based filtering
- Visual markers for lost/found items
- Dynamic search area support

## 💬 Messaging System
- Real-time chat using Socket.IO
- User conversations
- Live message updates

## 🔔 Notifications
- Real-time notifications
- Read/unread system
- Notification management page

## 👤 Profile System
- User profile management
- Saved posts
- Account customization

## 🛡️ Admin Features
- Reports monitoring
- Fraud detection modules
- Admin dashboard support

## 🎨 UI / UX
- Responsive modern design
- Mobile-friendly layout
- Arabic-first interface
- Clean and interactive user experience

---

# 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, CSS Modules |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Google OAuth |
| Maps | Leaflet, OpenStreetMap |
| Realtime | Socket.IO |
| Deployment | Vercel, Render |

---

# 🏗️ Architecture

- Frontend communicates with backend using REST APIs.
- Authentication handled using JWT access tokens and refresh tokens.
- Socket.IO powers realtime messaging and notifications.
- MongoDB stores users, posts, messages, reports, and notifications.
- Leaflet + OpenStreetMap provide interactive location visualization.
- Environment variables manage production configuration securely.

---

# 📁 Project Structure

```text
founIT/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── styles/
│       └── hooks/
│
└── README.md
