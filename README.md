# 🅿️ ParkEase — Smart Parking Finder & Booking Platform

A full-stack MERN application to **find, compare, and book parking spaces** nearby — covering commercial lots, street parking, and private spaces. Drivers browse spots on an interactive map and book & pay in advance; owners list spaces and manage availability, bookings, and revenue.

> Full product plan: [ParkEase.txt](ParkEase.txt) / [Plan.md](Plan.md)

---

## ✨ Features

**User portal**
- 🗺️ Interactive map with colour-coded availability pins (green / amber / red)
- 🔍 Search by area + filters (price, type, rating, amenities) and sorting
- 👤 Email/password + Google OAuth auth, profile & vehicle management, favorites
- 📋 Spot details — photos, amenities, hours, reviews, directions deep link
- 💳 Booking flow with Razorpay payment + QR-code confirmation
- 📊 Live availability updates via Socket.IO
- ⭐ Verified-booking ratings & reviews with helpful voting
- 🧾 Booking history with cancel/refund

**Owner portal**
- 🏢 Multi-step "Add Spot" form with image upload (Cloudinary)
- 📈 Dashboard with revenue & booking stats
- 📋 Listing management (edit availability, toggle active, delete)
- 📥 Incoming bookings with check-in / complete workflow

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite, Tailwind CSS v3, Zustand, React Router, react-hot-toast |
| Maps | Google Maps JS API (`@react-google-maps/api`) with list-view fallback |
| Backend | Node.js + Express, Mongoose (MongoDB), Passport (JWT + Google OAuth) |
| Payments | Razorpay (with a built-in mock mode for local dev) |
| Real-time | Socket.IO |
| Media / Email | Cloudinary, Nodemailer |

---

## 📁 Structure

```
Parking_assist/
├── client/   # React + Vite frontend (Tailwind, Zustand, services, pages)
└── server/   # Express API (models, controllers, routes, middleware, services)
```

See [ParkEase.txt](ParkEase.txt) §8 for the detailed tree.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)

### 1. Backend

```bash
cd server
npm install
cp ../.env.example .env      # then fill in MONGODB_URI + JWT_SECRET (others optional)
npm run seed                 # optional: seed ~25 demo spots + demo accounts
npm run dev                  # starts API on http://localhost:5000
```

**Required env:** `MONGODB_URI`, `JWT_SECRET`.
**Optional** (features degrade gracefully if absent): Google OAuth, Razorpay, Cloudinary, SMTP.

> Without Razorpay keys the payment flow runs in **mock mode** so bookings can be
> completed end-to-end locally. Without a Cloudinary config, uploads fall back to
> inline data URLs. Without SMTP, emails are logged instead of sent.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env         # set VITE_GOOGLE_MAPS_API_KEY to enable the map (optional)
npm run dev                  # starts client on http://localhost:5173
```

### Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Driver | `user@parkease.dev` | `password123` |
| Owner | `owner@parkease.dev` | `password123` |

---

## 🔌 API Overview

`POST /api/auth/{register,login}` · `GET /api/auth/me` · Google OAuth at `/api/auth/google`
`GET /api/spots/{nearby,search,:id}` · `POST/PUT/DELETE /api/spots` (owner)
`POST /api/bookings` · `GET /api/bookings/{my,incoming}` · `PUT /api/bookings/:id/{cancel,status}`
`POST /api/payments/{create-order,verify}` · `GET /api/payments/history`
`POST /api/spots/:id/reviews` · `PUT /api/reviews/:id/helpful`

Full table in [ParkEase.txt](ParkEase.txt) §7.

---

## 📜 Scripts

| Location | Command | Description |
|---|---|---|
| server | `npm run dev` | Start API with nodemon |
| server | `npm run seed` | Seed demo data |
| client | `npm run dev` | Start Vite dev server |
| client | `npm run build` | Production build |
| client | `npm run lint` | ESLint |

---

## 🔐 Security

Helmet, CORS, JWT auth, role-based authorization, express-validator input validation,
in-memory rate limiting on `/api`, and verified-booking requirement for reviews.
