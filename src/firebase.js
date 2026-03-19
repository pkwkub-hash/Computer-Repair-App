import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Config ของคุณ (Paper)
const firebaseConfig = {
  apiKey: "AIzaSyBpVVUBzhyXoap2z40sdIbuQa7p4897k1w",
  authDomain: "repair-notification-syst-3c7df.firebaseapp.com",
  projectId: "repair-notification-syst-3c7df",
  storageBucket: "repair-notification-syst-3c7df.firebasestorage.app",
  messagingSenderId: "575682018422",
  appId: "1:575682018422:web:a27a1eecd457b529ef7357",
};

// เริ่มต้นการทำงานของ Firebase
const app = initializeApp(firebaseConfig);

// ส่งออก db และ auth ไปให้หน้าเว็บอื่นๆ ใช้งาน
export const db = getFirestore(app);
export const auth = getAuth(app);
