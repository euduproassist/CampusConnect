// Import the functions you need from the SDKs you need via CDN URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNTq3n-NX7qg1lvmhu9pWbjLMqZVX_OJE",
  authDomain: "qualify-sa.firebaseapp.com",
  projectId: "qualify-sa",
  storageBucket: "qualify-sa.firebasestorage.app",
  messagingSenderId: "1056702711871",
  appId: "1:1056702711871:web:b3284aaa05a53c696e908a",
  measurementId: "G-KE8E5ZY403"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

