// RideConnect State & Data Manager with Firestore + Seamless Fallback Demo Store
// This ensures the site is 100% functional out-of-the-box even before API keys are pasted!

const STORAGE_KEYS = {
  USERS: 'rideconnect_users',
  RIDES: 'rideconnect_rides',
  BOOKINGS: 'rideconnect_bookings',
  CURRENT_USER: 'rideconnect_current_user'
};

// Seed demo rides so the homepage looks lively immediately
const SEED_RIDES = [
  {
    id: "ride_1",
    driverId: "seed_driver_1",
    driverName: "Alex Rivera",
    fromCity: "San Francisco, CA",
    toCity: "San Jose, CA",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: "09:00 AM",
    seatsTotal: 3,
    seatsAvailable: 3,
    price: 18,
    notes: "Comfortable SUV, trunk space for 2 bags. Air-conditioned.",
    createdAt: new Date().toISOString()
  },
  {
    id: "ride_2",
    driverId: "seed_driver_2",
    driverName: "Sarah Chen",
    fromCity: "Los Angeles, CA",
    toCity: "San Diego, CA",
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: "02:30 PM",
    seatsTotal: 4,
    seatsAvailable: 2,
    price: 25,
    notes: "Quiet ride, electric vehicle, phone chargers available.",
    createdAt: new Date().toISOString()
  },
  {
    id: "ride_3",
    driverId: "seed_driver_3",
    driverName: "Michael Patel",
    fromCity: "Austin, TX",
    toCity: "Houston, TX",
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    time: "08:15 AM",
    seatsTotal: 3,
    seatsAvailable: 1,
    price: 22,
    notes: "Commuting for work, good playlist and coffee stop.",
    createdAt: new Date().toISOString()
  }
];

// Initialize local demo storage
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.RIDES)) {
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(SEED_RIDES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
}
initLocalStorage();

// Unified App Services
window.RideConnect = {
  // Check if live Firebase is active
  isFirebaseLive() {
    return window.isFirebaseConfigured && window.isFirebaseConfigured() && window.auth && window.db;
  },

  // Auth: Get Current Logged In User
  async getCurrentUser() {
    if (this.isFirebaseLive()) {
      return new Promise((resolve) => {
        const unsubscribe = window.auth.onAuthStateChanged(async (user) => {
          unsubscribe();
          if (user) {
            try {
              const doc = await window.db.collection('users').doc(user.uid).get();
              resolve(doc.exists ? { uid: user.uid, ...doc.data() } : { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] });
            } catch (e) {
              resolve({ uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] });
            }
          } else {
            resolve(null);
          }
        });
      });
    } else {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    }
  },

  // Auth: Register User
  async register(name, email, password, phone = '') {
    if (this.isFirebaseLive()) {
      const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: name });
      const userData = {
        name,
        email,
        phone,
        createdAt: new Date().toISOString()
      };
      await window.db.collection('users').doc(user.uid).set(userData);
      return { uid: user.uid, ...userData };
    } else {
      // Demo / Local Mode
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
      }
      const newUser = {
        uid: 'user_' + Date.now(),
        name,
        email,
        phone,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      return newUser;
    }
  },

  // Auth: Login User
  async login(email, password) {
    if (this.isFirebaseLive()) {
      const cred = await window.auth.signInWithEmailAndPassword(email, password);
      const doc = await window.db.collection('users').doc(cred.user.uid).get();
      return doc.exists ? { uid: cred.user.uid, ...doc.data() } : { uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName };
    } else {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Auto-create for friendly testing if not exists
        user = {
          uid: 'user_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          phone: '',
          createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
  },

  // Auth: Logout
  async logout() {
    if (this.isFirebaseLive()) {
      await window.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Profile: Update
  async updateProfile(uid, data) {
    if (this.isFirebaseLive()) {
      await window.db.collection('users').doc(uid).set(data, { merge: true });
      if (data.name && window.auth.currentUser) {
        await window.auth.currentUser.updateProfile({ displayName: data.name });
      }
      return { uid, ...data };
    } else {
      let current = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
      current = { ...current, ...data };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(current));

      let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      users = users.map(u => u.uid === uid ? { ...u, ...data } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return current;
    }
  },

  // Rides: Post a Ride
  async postRide(rideData) {
    const ride = {
      ...rideData,
      seatsAvailable: parseInt(rideData.seatsTotal, 10),
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseLive()) {
      const docRef = await window.db.collection('rides').add(ride);
      return { id: docRef.id, ...ride };
    } else {
      const rides = JSON.parse(localStorage.getItem(STORAGE_KEYS.RIDES) || '[]');
      const newRide = { id: 'ride_' + Date.now(), ...ride };
      rides.unshift(newRide);
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
      return newRide;
    }
  },

  // Rides: Get All or Filter Rides
  async getRides(filters = {}) {
    let rides = [];
    if (this.isFirebaseLive()) {
      const snapshot = await window.db.collection('rides').get();
      rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      rides = JSON.parse(localStorage.getItem(STORAGE_KEYS.RIDES) || '[]');
    }

    // Apply client filters if provided
    return rides.filter(ride => {
      let match = true;
      if (filters.from && !ride.fromCity.toLowerCase().includes(filters.from.toLowerCase().trim())) {
        match = false;
      }
      if (filters.to && !ride.toCity.toLowerCase().includes(filters.to.toLowerCase().trim())) {
        match = false;
      }
      if (filters.date && ride.date !== filters.date) {
        match = false;
      }
      return match;
    });
  },

  // Rides: Get Rides posted by a specific user
  async getUserPostedRides(userId) {
    if (this.isFirebaseLive()) {
      const snapshot = await window.db.collection('rides').where('driverId', '==', userId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const rides = JSON.parse(localStorage.getItem(STORAGE_KEYS.RIDES) || '[]');
      return rides.filter(r => r.driverId === userId);
    }
  },

  // Bookings: Book a Seat
  async bookRide(rideId, user, seatsToBook = 1) {
    seatsToBook = parseInt(seatsToBook, 10);

    if (this.isFirebaseLive()) {
      const rideRef = window.db.collection('rides').doc(rideId);
      return await window.db.runTransaction(async (transaction) => {
        const rideDoc = await transaction.get(rideRef);
        if (!rideDoc.exists) throw new Error("Ride does not exist!");
        const rideData = rideDoc.data();
        if (rideData.seatsAvailable < seatsToBook) {
          throw new Error("Sorry, not enough seats available.");
        }

        const newSeats = rideData.seatsAvailable - seatsToBook;
        transaction.update(rideRef, { seatsAvailable: newSeats });

        const bookingRef = window.db.collection('bookings').doc();
        const bookingData = {
          rideId,
          passengerId: user.uid,
          passengerName: user.name || user.email,
          passengerEmail: user.email,
          passengerPhone: user.phone || '',
          passengerGender: user.gender || '',
          seatsBooked: seatsToBook,
          totalPrice: (rideData.price || 0) * seatsToBook,
          rideDetails: {
            fromCity: rideData.fromCity,
            toCity: rideData.toCity,
            date: rideData.date,
            time: rideData.time,
            driverName: rideData.driverName
          },
          status: 'Confirmed',
          bookedAt: new Date().toISOString()
        };
        transaction.set(bookingRef, bookingData);
        return { id: bookingRef.id, ...bookingData };
      });
    } else {
      const rides = JSON.parse(localStorage.getItem(STORAGE_KEYS.RIDES) || '[]');
      const rideIndex = rides.findIndex(r => r.id === rideId);
      if (rideIndex === -1) throw new Error("Ride not found.");
      if (rides[rideIndex].seatsAvailable < seatsToBook) {
        throw new Error("Not enough available seats.");
      }

      rides[rideIndex].seatsAvailable -= seatsToBook;
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

      const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const newBooking = {
        id: 'book_' + Date.now(),
        rideId,
        passengerId: user.uid,
        passengerName: user.name || user.email,
        passengerEmail: user.email,
        passengerPhone: user.phone || '',
        passengerGender: user.gender || '',
        seatsBooked: seatsToBook,
        totalPrice: (rides[rideIndex].price || 0) * seatsToBook,
        rideDetails: {
          fromCity: rides[rideIndex].fromCity,
          toCity: rides[rideIndex].toCity,
          date: rides[rideIndex].date,
          time: rides[rideIndex].time,
          driverName: rides[rideIndex].driverName
        },
        status: 'Confirmed',
        bookedAt: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return newBooking;
    }
  },

  // Bookings: Get bookings for a passenger
  async getUserBookings(userId) {
    if (this.isFirebaseLive()) {
      const snapshot = await window.db.collection('bookings').where('passengerId', '==', userId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      return bookings.filter(b => b.passengerId === userId);
    }
  }
};

// UI Toast Helper
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}" style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1d4ed8'}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Update Navbar according to logged in user
window.updateNavAuth = async function() {
  const navAuthContainer = document.getElementById('nav-auth-container');
  if (!navAuthContainer) return;

  const currentUser = await window.RideConnect.getCurrentUser();
  if (currentUser) {
    navAuthContainer.innerHTML = `
      <div class="user-menu">
        <a href="profile.html" class="user-badge" title="Go to Profile">
          <div class="avatar-circle">${(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}</div>
          <span>${currentUser.name || currentUser.email.split('@')[0]}</span>
        </a>
        <button id="logout-btn" class="btn btn-outline btn-sm" title="Log Out">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      await window.RideConnect.logout();
      window.showToast("Logged out successfully.", "info");
      setTimeout(() => window.location.reload(), 600);
    });
  } else {
    navAuthContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
};
