// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence (Required for React Native)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
