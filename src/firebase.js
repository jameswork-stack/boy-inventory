// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGIbyojfhKiPkh1P1vh-CYxUwbfVMlGQQ",
  authDomain: "boy-paint.firebaseapp.com",
  projectId: "boy-paint",
  storageBucket: "boy-paint.firebasestorage.app",
  messagingSenderId: "265230516976",
  appId: "1:265230516976:web:b83b34ba3e969b0303b835",
  measurementId: "G-0NK15YF89Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
