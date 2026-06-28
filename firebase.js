// ===============================
// FIREBASE CONFIG
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    Timestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmwzezKIIKLlKVaR_mNfc9pCdiPCJkxX4",
    authDomain: "warung-nusantara-1a9f9.firebaseapp.com",
    projectId: "warung-nusantara-1a9f9",
    storageBucket: "warung-nusantara-1a9f9.firebasestorage.app",
    messagingSenderId: "477699189110",
    appId: "1:477699189110:web:639431b1c859069888b257"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    Timestamp,
    doc,
    updateDoc
};