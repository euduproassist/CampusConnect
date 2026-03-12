import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSqFUdUshBjfZzlYpQfzjVkfDySJKvcvI",
  authDomain: "campusconnect-4bec5.firebaseapp.com",
  projectId: "campusconnect-4bec5",
  storageBucket: "campusconnect-4bec5.firebasestorage.app",
  messagingSenderId: "164114642929",
  appId: "1:164114642929:web:28ca6ef8fc1b99539af650",
  measurementId: "G-M2GYWJ8M0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services to be exported
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

