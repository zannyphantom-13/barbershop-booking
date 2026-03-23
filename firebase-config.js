import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDnKXal34hBwcOP2WGh2z1CC2_q1lnVSX0",
    authDomain: "barbershop-booking-9937c.firebaseapp.com",
    databaseURL: "https://barbershop-booking-9937c-default-rtdb.firebaseio.com",
    projectId: "barbershop-booking-9937c",
    storageBucket: "barbershop-booking-9937c.firebasestorage.app",
    messagingSenderId: "760947042341",
    appId: "1:760947042341:web:2cd8473757fb82b4c877cc",
    measurementId: "G-G46D2LEWM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { db, ref, set, get, onValue };
