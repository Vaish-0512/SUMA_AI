// Firebase Configuration
// Replace with your Firebase Project Configuration from Firebase Console (https://console.firebase.google.com/)
const firebaseConfig = {
  apiKey: "AIzaSyD9DlaOer_Q5-Hj2STgrKVrHRSknz2Wqxo",
  authDomain: "suma-fb228.firebaseapp.com",
  projectId: "suma-fb228",
  storageBucket: "suma-fb228.firebasestorage.app",
  messagingSenderId: "365534585835",
  appId: "1:365534585835:web:6a90eef1fc2687f11e6fae"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
  window.db = firebase.firestore();
} else {
  console.error("Firebase SDK script not loaded properly.");
}

// Global Demo Mode Helper: if API key is not yet configured, provide helpful fallbacks or notice
window.isFirebaseConfigured = function() {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";
};
