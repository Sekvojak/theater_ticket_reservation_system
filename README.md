# 🎭 Klára – Theatre Ticket System

Web application for browsing theatre performances, creating reservations and managing shows.

👉 Live version: https://www.klara-divadlo.site

---

## 🧠 About the project

This project was developed as part of a university team assignment.

This repository contains the **deployed version with my contributions**, mainly focused on:
- backend development
- API improvements
- bug fixing across backend and frontend
- integration of payment and reservation flow

---

## 🚀 Key Features

### 🎟 Reservations
- Create reservations for selected performances
- Seat selection with availability control
- Reservation status handling (active, paid, canceled)

### 👤 Users
- User registration and login
- Reservation history

### 🛠 Admin
- Manage performances, shows and halls
- View and manage reservations
- Basic statistics

### 💳 Payments
- Stripe integration (test mode)
- Reservation → payment flow

---

## 🔧 My Contributions

### Backend
- Designed and extended REST API endpoints
- Fixed data validation and error handling
- Added proper HTTP responses (404, 409, etc.)
- Improved reservation logic (seat conflicts, statuses)
- Configured CORS and security behavior
- Fixed timezone-related bugs in performance scheduling

### Frontend
- Fixed data inconsistencies between frontend and backend
- Adjusted reservation states (PAID vs CANCELED issue)
- Improved admin reservation view (seat labels, data mapping)
- Added mobile navigation fixes

---

## 🛠 Tech Stack

### Backend
- Java + Spring Boot
- Spring Data JPA
- PostgreSQL / H2

### Frontend
- React
- TypeScript
- Vite

### Other
- Stripe (payments)
- Railway (deployment)

---

## 🧱 Architecture
React frontend --> Spring Boot REST API --> Database (PostgreSQL)


---

## ⚠️ Notes

- This is a **team project**, not a solo project
- This version includes **my own fixes and improvements**
- Some parts of the frontend were implemented by other team members

---

## 📌 Possible Improvements

- JWT-based authentication
- Better payment flow (direct redirect instead of email step)
- Improved mobile UX
- Stronger validation and security

---

## 👨‍💻 Author

**Dominik Kontrik**

- GitHub: https://github.com/SEKVOJAK

---
