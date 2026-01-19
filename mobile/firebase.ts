// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyARZ0-epkz78hpLrWJ1LTFZ1HF_ArGNy_c",
  authDomain: "scene2seen-dev.firebaseapp.com",
  projectId: "scene2seen-dev",
  storageBucket: "scene2seen-dev.firebasestorage.app",
  messagingSenderId: "635950413977",
  appId: "1:635950413977:web:dd3d3ff87952fa57342008"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
