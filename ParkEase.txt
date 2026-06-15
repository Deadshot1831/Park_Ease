# 🅿️ ParkEase — Smart Parking Finder & Booking Platform

## Executive Summary

**ParkEase** is a web application that helps people find, compare, and book parking spaces nearby — covering commercial lots, street parking, and private spaces. Parking owners list their spaces, users browse on an interactive map, and book & pay in advance for a guaranteed spot.

---

## 1. Problem Statement

- Drivers waste **15–20 minutes on average** searching for parking in urban areas.
- No single platform aggregates commercial lots, street spots, and private driveways.
- Parking lot owners lack modern tools to manage availability and attract customers.
- Users have no way to guarantee a spot before arriving.

## 2. Solution

A web platform with **two portals**:
1. **User Portal** — Find nearby parking on a map, check real-time availability, read reviews, book & pay, get directions.
2. **Owner Portal** — Register parking spaces, manage availability, set pricing, view bookings & revenue analytics.

---

## 3. Target Users

| User Type | Description |
|---|---|
| **Drivers (Primary)** | General public looking for safe, affordable parking |
| **Parking Owners (Secondary)** | Lot operators, garage managers, private homeowners renting driveways |
| **Admin** | Platform administrators managing the system |

---

## 4. Tech Stack — MERN Stack (Recommended over MEAN)

> [!NOTE]
> **Why MERN over MEAN?** React has a larger ecosystem, better component libraries for maps/payments, and stronger community support for the kind of interactive UI this app needs. Angular (MEAN) is better suited for enterprise dashboards.

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast builds, rich ecosystem, component-based UI |
| **Styling** | Tailwind CSS v3 | Rapid UI development, responsive design out of the box |
| **Maps** | Google Maps API / Mapbox GL JS | Interactive maps, geocoding, directions, place search |
| **State Management** | Zustand | Lightweight, simpler than Redux for this scale |
| **Backend** | Node.js + Express.js | JavaScript across the stack, fast API development |
| **Database** | MongoDB + Mongoose | Flexible schema for varied parking types, geospatial queries |
| **Authentication** | JWT + Passport.js (Google OAuth) | Secure auth with social login support |
| **Payments** | Razorpay SDK (India) / Stripe (Global) | Booking payments, owner payouts |
| **Real-time** | Socket.IO | Live availability updates |
| **File Storage** | Cloudinary / AWS S3 | Parking spot images |
| **Deployment** | Vercel (Frontend) + Render/Railway (Backend) + MongoDB Atlas | Free tier friendly for MVP |

---

## 5. Core Features (MVP)

### 5.1 User Portal

#### 🗺️ F1: Interactive Map with Nearby Parking
- Show parking spots on a map centered on user's current location
- Cluster markers when zoomed out, expand on zoom
- Color-coded pins: 🟢 Available, 🟡 Few spots left, 🔴 Full
- Click a pin to see quick details (name, price, distance, rating)

#### 🔍 F2: Search by Location / Address
- Search bar with autocomplete (Google Places API)
- Filter by: price range, parking type, distance, rating, amenities
- Sort by: distance, price, rating

#### 👤 F3: User Registration & Login
- Email + password signup
- Google OAuth login
- Profile management (name, phone, vehicle details)
- Saved/favorite parking spots

#### 📊 F4: Real-Time Availability
- Live status updates via WebSocket (Socket.IO)
- Total spots vs. available spots display
- Availability trends (e.g., "Usually busy at 9 AM")

#### 📍 F5: Navigation / Directions
- "Get Directions" button → opens Google Maps / integrated directions
- Estimated travel time and distance
- Turn-by-turn navigation link

#### ⭐ F6: Ratings & Reviews
- Rate parking spots (1–5 stars)
- Write text reviews
- Photo reviews
- Helpful/not-helpful voting on reviews
- Average rating calculation and display

#### 📋 F7: Parking Spot Details Page
- Name, address, photos gallery
- Pricing (hourly/daily/monthly rates)
- Parking type (covered, open, underground)
- Amenities (CCTV, EV charging, wheelchair accessible, 24/7, security guard)
- Operating hours
- Available spots count (real-time)
- Reviews section
- Book Now CTA

#### 💳 F8: Booking & Payment
- Select date, time, duration
- See total cost breakdown
- Apply promo codes / discounts
- Pay via Razorpay (UPI, cards, wallets, net banking)
- Booking confirmation with QR code
- Booking history in profile
- Cancel / modify bookings

### 5.2 Owner Portal (Dashboard)

#### 🏢 F9: Parking Space Management
- Add new parking location (address, photos, amenities, pricing)
- Set total number of spots
- Update availability manually or via integration
- Edit/delete listings
- Set operating hours & special pricing (weekends, events)

#### 📈 F10: Booking & Revenue Management
- View incoming bookings (pending, confirmed, completed, cancelled)
- Approve / reject bookings
- Revenue dashboard (daily/weekly/monthly earnings)
- Payout history and settings

### 5.3 Admin Panel (Phase 2)
- User & owner management
- Listing approval / moderation
- Platform analytics
- Dispute resolution
- Revenue & commission tracking

---

## 6. Database Schema (MongoDB)

### Collections Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Users      │────▶│   Bookings   │◀────│  Parking     │
│              │     │              │     │  Spots       │
└─────────────┘     └──────────────┘     └──────────────┘
       │                   │                     │
       │                   ▼                     │
       │            ┌──────────────┐             │
       └───────────▶│   Reviews    │◀────────────┘
                    └──────────────┘
                    ┌──────────────┐
                    │  Payments    │
                    └──────────────┘
```

### Key Schemas

```javascript
// User
{
  name, email, password, phone,
  role: "user" | "owner" | "admin",
  vehicles: [{ number, type, model }],
  favorites: [parkingSpotId],
  googleId, avatar,
  createdAt, updatedAt
}

// ParkingSpot
{
  owner: userId,
  name, description,
  address: { street, city, state, zip, country },
  location: { type: "Point", coordinates: [lng, lat] },  // GeoJSON for geo queries
  type: "commercial" | "street" | "private",
  parkingType: "covered" | "open" | "underground" | "multilevel",
  totalSpots, availableSpots,
  pricing: { hourly, daily, monthly },
  amenities: ["cctv", "ev_charging", "wheelchair", "24x7", "security"],
  operatingHours: { open, close, days },
  images: [url],
  averageRating, totalReviews,
  isApproved, isActive,
  createdAt, updatedAt
}

// Booking
{
  user: userId,
  parkingSpot: spotId,
  vehicle: { number, type },
  startTime, endTime, duration,
  amount, status: "pending" | "confirmed" | "active" | "completed" | "cancelled",
  qrCode,
  payment: paymentId,
  createdAt
}

// Review
{
  user: userId,
  parkingSpot: spotId,
  rating: 1-5,
  comment, photos: [url],
  helpfulCount,
  createdAt
}

// Payment
{
  booking: bookingId,
  user: userId,
  amount, currency,
  razorpayOrderId, razorpayPaymentId,
  status: "created" | "paid" | "failed" | "refunded",
  createdAt
}
```

---

## 7. API Endpoints (REST)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Send password reset email |
| GET | `/api/auth/me` | Get current user profile |

### Parking Spots
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/spots/nearby?lat=&lng=&radius=` | Find nearby spots (geo query) |
| GET | `/api/spots/search?q=&filters=` | Search with filters |
| GET | `/api/spots/:id` | Get spot details |
| POST | `/api/spots` | Create spot (owner only) |
| PUT | `/api/spots/:id` | Update spot (owner only) |
| DELETE | `/api/spots/:id` | Delete spot (owner only) |
| PUT | `/api/spots/:id/availability` | Update availability |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | Get user's bookings |
| GET | `/api/bookings/incoming` | Get owner's incoming bookings |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking |
| PUT | `/api/bookings/:id/status` | Update booking status |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/spots/:id/reviews` | Add a review |
| GET | `/api/spots/:id/reviews` | Get reviews for a spot |
| PUT | `/api/reviews/:id/helpful` | Mark review as helpful |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| GET | `/api/payments/history` | Get payment history |

---

## 8. Project Structure

```
Parking_assist/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, icons
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Button, Input, Modal, Card
│   │   │   ├── map/           # MapView, MarkerCluster, SpotPin
│   │   │   ├── spots/         # SpotCard, SpotList, SpotDetails
│   │   │   ├── booking/       # BookingForm, BookingCard, QRCode
│   │   │   ├── reviews/       # ReviewCard, ReviewForm, StarRating
│   │   │   └── layout/        # Navbar, Footer, Sidebar
│   │   ├── pages/             # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── SpotDetails.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── owner/         # Owner dashboard pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand stores
│   │   ├── services/          # API call functions (axios)
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── config/                # DB, auth, payment config
│   │   ├── db.js
│   │   ├── passport.js
│   │   └── razorpay.js
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── spotController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── paymentController.js
│   ├── middleware/             # Auth, error handling, validation
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── ParkingSpot.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Payment.js
│   ├── routes/                # Express routes
│   │   ├── auth.js
│   │   ├── spots.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── payments.js
│   ├── services/              # Business logic
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   └── socketService.js
│   ├── utils/                 # Helpers
│   ├── server.js              # Entry point
│   └── package.json
│
├── .env.example               # Environment variables template
├── .gitignore
├── README.md
└── plan.md                    # This file
```

---

## 9. Phased Execution Plan

### 🔵 Phase 1: Foundation (Week 1–2)

> Set up the project, authentication, and basic UI shell.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 1.1 | Initialize project structure (Vite + React, Express + Node) | 2 hrs | 🔴 High |
| 1.2 | Set up MongoDB Atlas & Mongoose connection | 1 hr | 🔴 High |
| 1.3 | Create User model & auth routes (register, login, JWT) | 4 hrs | 🔴 High |
| 1.4 | Implement Google OAuth with Passport.js | 3 hrs | 🔴 High |
| 1.5 | Build frontend auth pages (Login, Register) | 4 hrs | 🔴 High |
| 1.6 | Set up protected routes & auth context (Zustand) | 3 hrs | 🔴 High |
| 1.7 | Build app layout shell (Navbar, Footer, routing) | 3 hrs | 🔴 High |
| 1.8 | Set up Tailwind CSS with design tokens & theme | 2 hrs | 🟡 Medium |
| 1.9 | Deploy skeleton to Vercel + Render (CI/CD) | 2 hrs | 🟡 Medium |

**Deliverable:** Users can register, login (email + Google), see the app shell.

---

### 🟢 Phase 2: Core — Map & Parking Spots (Week 3–4)

> The heart of the app — finding and viewing parking spots.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 2.1 | Create ParkingSpot model with GeoJSON index | 2 hrs | 🔴 High |
| 2.2 | Build CRUD API for parking spots | 4 hrs | 🔴 High |
| 2.3 | Implement geo-query endpoint (`$near`, `$geoWithin`) | 3 hrs | 🔴 High |
| 2.4 | Integrate Google Maps / Mapbox on frontend | 4 hrs | 🔴 High |
| 2.5 | Build Home page with interactive map | 6 hrs | 🔴 High |
| 2.6 | Implement marker clustering & color-coded pins | 3 hrs | 🔴 High |
| 2.7 | Build Search bar with Google Places autocomplete | 3 hrs | 🔴 High |
| 2.8 | Build filter panel (price, type, distance, amenities) | 4 hrs | 🟡 Medium |
| 2.9 | Build Spot Details page (photos, info, amenities, map) | 5 hrs | 🔴 High |
| 2.10 | Implement "Get Directions" (Google Maps deep link) | 1 hr | 🟡 Medium |
| 2.11 | Seed database with sample parking spots (20–30) | 2 hrs | 🟡 Medium |

**Deliverable:** Users can view a map, search for parking, browse spots, see details, get directions.

---

### 🟡 Phase 3: Booking & Payments (Week 5–6)

> Enable the core transaction: book a spot and pay.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 3.1 | Create Booking & Payment models | 2 hrs | 🔴 High |
| 3.2 | Build booking API (create, cancel, status update) | 5 hrs | 🔴 High |
| 3.3 | Integrate Razorpay SDK (backend order creation) | 4 hrs | 🔴 High |
| 3.4 | Implement payment verification & webhook handling | 4 hrs | 🔴 High |
| 3.5 | Build Booking Flow UI (select time → pay → confirm) | 6 hrs | 🔴 High |
| 3.6 | Generate QR code for booking confirmation | 2 hrs | 🟡 Medium |
| 3.7 | Build "My Bookings" page (upcoming, past, cancelled) | 4 hrs | 🔴 High |
| 3.8 | Implement booking cancellation & refund flow | 3 hrs | 🟡 Medium |
| 3.9 | Send booking confirmation email (Nodemailer / Resend) | 3 hrs | 🟡 Medium |
| 3.10 | Auto-update spot availability on booking | 2 hrs | 🔴 High |

**Deliverable:** Users can book a spot, pay via Razorpay, get a QR code, view booking history.

---

### 🟠 Phase 4: Owner Dashboard (Week 7–8)

> Parking owners can manage their listings and bookings.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 4.1 | Build Owner Registration & role-based access | 3 hrs | 🔴 High |
| 4.2 | Build "Add Parking Spot" form (multi-step) | 5 hrs | 🔴 High |
| 4.3 | Implement image upload (Cloudinary integration) | 3 hrs | 🔴 High |
| 4.4 | Build Owner Dashboard — overview (stats cards) | 4 hrs | 🔴 High |
| 4.5 | Build "My Listings" page (edit, delete, toggle active) | 4 hrs | 🔴 High |
| 4.6 | Build "Incoming Bookings" page (approve/reject) | 4 hrs | 🔴 High |
| 4.7 | Build Revenue Analytics (charts — daily/weekly/monthly) | 5 hrs | 🟡 Medium |
| 4.8 | Implement payout settings & history | 3 hrs | 🟡 Medium |

**Deliverable:** Owners can list spots, manage bookings, and track revenue.

---

### 🔴 Phase 5: Reviews & Real-Time (Week 9–10)

> Social proof and live data.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 5.1 | Create Review model & API | 3 hrs | 🔴 High |
| 5.2 | Build Review form & display component | 3 hrs | 🔴 High |
| 5.3 | Implement star rating system & average calculation | 2 hrs | 🔴 High |
| 5.4 | Add photo upload to reviews | 2 hrs | 🟡 Medium |
| 5.5 | Implement helpful/not-helpful voting | 2 hrs | 🟢 Low |
| 5.6 | Set up Socket.IO for real-time availability | 4 hrs | 🔴 High |
| 5.7 | Live-update map pins when availability changes | 3 hrs | 🔴 High |
| 5.8 | Add "availability trends" indicator | 3 hrs | 🟢 Low |
| 5.9 | Implement notifications (booking updates) | 3 hrs | 🟡 Medium |

**Deliverable:** Reviews system live, real-time availability updates on map.

---

### 🟣 Phase 6: Polish & Launch Prep (Week 11–12)

> Make it production-ready.

| # | Task | Est. Time | Priority |
|---|---|---|---|
| 6.1 | User Profile page (edit info, vehicle management) | 3 hrs | 🔴 High |
| 6.2 | Favorite/save parking spots feature | 2 hrs | 🟡 Medium |
| 6.3 | Responsive design audit & mobile optimization | 4 hrs | 🔴 High |
| 6.4 | SEO optimization (meta tags, sitemap, SSR prep) | 3 hrs | 🟡 Medium |
| 6.5 | Error handling & loading states across the app | 3 hrs | 🔴 High |
| 6.6 | Input validation (frontend + backend) | 3 hrs | 🔴 High |
| 6.7 | Rate limiting & security hardening (helmet, cors) | 2 hrs | 🔴 High |
| 6.8 | Testing — unit tests (Jest) + API tests (Supertest) | 6 hrs | 🔴 High |
| 6.9 | Performance optimization (lazy loading, code splitting) | 3 hrs | 🟡 Medium |
| 6.10 | Final deployment & DNS setup | 2 hrs | 🔴 High |
| 6.11 | Create demo video & landing page | 3 hrs | 🟢 Low |

**Deliverable:** Production-ready web app launched and accessible.

---

## 10. Third-Party Services & API Keys Needed

| Service | Purpose | Cost |
|---|---|---|
| **MongoDB Atlas** | Database hosting | Free tier (512 MB) |
| **Google Maps Platform** | Maps, geocoding, places, directions | $200/month free credit |
| **Razorpay** | Payment processing | 2% per transaction |
| **Cloudinary** | Image hosting | Free tier (25 credits/month) |
| **Google OAuth** | Social login | Free |
| **Resend / Nodemailer** | Transactional emails | Free tier available |
| **Vercel** | Frontend hosting | Free tier |
| **Render / Railway** | Backend hosting | Free tier |

---

## 11. Future Enhancements (Post-MVP)

| Feature | Description |
|---|---|
| 📱 **Mobile App** | React Native / Expo — share backend API |
| 🤖 **AI Parking Prediction** | ML model predicting availability based on time, day, events |
| 🏷️ **Dynamic Pricing** | Surge pricing during peak hours/events |
| 🚗 **EV Charging Integration** | Filter by EV charging stations |
| 📊 **Admin Panel** | Full platform management dashboard |
| 💬 **In-app Chat** | User ↔ Owner communication |
| 🎫 **Monthly Passes** | Subscription-based parking plans |
| 🅿️ **IoT Sensor Integration** | Auto-update availability via sensors |
| 🧾 **Invoice Generation** | Auto-generate parking receipts / invoices |
| 🌐 **Multi-language Support** | i18n for regional expansion |

---

## 12. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Google Maps API costs | Implement request caching, use Mapbox as fallback |
| Low initial parking data | Seed with real data, incentivize early owners |
| Real-time scalability | Start with polling fallback, scale to WebSocket |
| Payment failures | Implement retry logic, webhook verification |
| Fake reviews | Add verified booking requirement for reviews |

---

## 13. Estimated Timeline Summary

```
Week  1–2:   🔵 Phase 1 — Foundation & Auth
Week  3–4:   🟢 Phase 2 — Map & Parking Spots
Week  5–6:   🟡 Phase 3 — Booking & Payments
Week  7–8:   🟠 Phase 4 — Owner Dashboard
Week  9–10:  🔴 Phase 5 — Reviews & Real-Time
Week 11–12:  🟣 Phase 6 — Polish & Launch
──────────────────────────────────────────
Total:        ~12 weeks (3 months) for MVP
```

---

> [!IMPORTANT]
> This plan assumes **one developer** working part-time (~20 hrs/week). With full-time effort or a team, timelines can be compressed significantly.

> [!TIP]
> **Recommended starting point:** Begin with Phase 1 (setup + auth) immediately. Get the skeleton deployed so you always have a live URL to test against.
