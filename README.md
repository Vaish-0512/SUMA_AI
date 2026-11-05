# 🚗 RideConnect - Cloud-Based Ride Sharing Platform

A modern, responsive, and intuitive cloud-powered ride-sharing web application built with **HTML5, CSS3, JavaScript, and Firebase (Authentication & Firestore)**.

---

## ✨ Features

1. **Authentication with Firebase:**
   - User Registration with name, email, phone number, and password.
   - User Login and session persistence.
   - Dynamic navigation bar showing authenticated user badges and logout action.

2. **Offer / Post a Ride:**
   - Drivers can easily list upcoming journeys with origin, destination, travel date, departure time, available seats, pricing per seat, and custom car/journey notes.
   - Saved directly to Firebase Firestore `rides` collection.

3. **Explore & Search Rides:**
   - Dynamic search filters by origin city, destination, and travel date.
   - Modern ride cards showing route timeline stops, seat availability tags, price badges, and driver details.

4. **Instant Seat Booking:**
   - Interactive booking modal with automatic cost calculation.
   - Real-time seat decrement in Firestore using atomic transactions so seats never overbook.
   - Bookings recorded under the user's booking history.

5. **User Dashboard & Profile:**
   - View your posted rides with live capacity counters.
   - View booked journeys with driver details and status.
   - Update personal profile details (Name, Phone number).

6. **Modern Blue & White Visual Design:**
   - Clean, elevated card layouts, route progress bars, responsive typography using Google Fonts (Outfit), and FontAwesome icons.

---

## 📁 Project Structure

```
Suma_AI/
├── css/
│   └── styles.css          # Modern blue/white design system, cards, forms & responsive rules
├── js/
│   ├── firebase-config.js  # Firebase SDK configuration & credentials placeholder
│   └── app.js              # Firestore & Auth business logic, data transactions & UI toasts
├── index.html              # Main homepage with ride search, cards, booking & post modals
├── login.html              # Clean user login page
├── register.html           # User registration page
├── profile.html            # User dashboard: posted rides, booked seats & profile manager
└── README.md               # Setup & configuration guide
```

---

## 🚀 Getting Started

### 1. View the Website Immediately
You can open [index.html](file:///c:/Users/VAISHNAVI/Suma_AI/index.html) in your browser. 
Even before adding your Firebase keys, RideConnect includes a built-in state manager and mock data so you can test all features (search, posting rides, booking seats, and profile management) right away!

### 2. Connect Your Firebase Project (Production Cloud Mode)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (e.g., `rideconnect-app`).
3. Under **Build > Authentication**, enable **Email/Password** sign-in method.
4. Under **Build > Firestore Database**, click **Create Database** (start in *test mode* for development).
5. In **Project Settings**, find your Web App configuration and copy the keys.
6. Open [`js/firebase-config.js`](file:///c:/Users/VAISHNAVI/Suma_AI/js/firebase-config.js) and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "rideconnect-app.firebaseapp.com",
  projectId: "rideconnect-app",
  storageBucket: "rideconnect-app.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 📱 Responsive Testing
The design is built with mobile-first CSS grids and flexbox, ensuring smooth responsiveness across phones, tablets, and desktop displays.
