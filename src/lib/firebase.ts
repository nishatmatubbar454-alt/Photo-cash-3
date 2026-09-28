import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, update, remove } from 'firebase/database';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// 1. User & Wallet Database Configuration (photo-cash-30b8c)
// Stores: User Accounts, Balance, Earnings, Withdrawals, Referral tracking
export const userFirebaseConfig = {
  apiKey: "AIzaSyCldRzhTjtrb8hawkpfZxgZUmdfOiDLS4Y",
  authDomain: "photo-cash-30b8c.firebaseapp.com",
  databaseURL: "https://photo-cash-30b8c-default-rtdb.firebaseio.com",
  projectId: "photo-cash-30b8c",
  storageBucket: "photo-cash-30b8c.firebasestorage.app",
  messagingSenderId: "765815950948",
  appId: "1:765815950948:web:ebdacf74a250a744081971",
  measurementId: "G-JXWM0365JS"
};

// 2. Media & Public Feed Database Configuration (photo-cash-2)
// Stores: Public Posts, Images, Captions, Stories for multi-device feed sync
export const mediaFirebaseConfig = {
  apiKey: "AIzaSyDZ0aB5bZ3M-YwrESf934Ai3yEZQDsUzU4",
  authDomain: "photo-cash-2.firebaseapp.com",
  databaseURL: "https://photo-cash-2-default-rtdb.firebaseio.com",
  projectId: "photo-cash-2",
  storageBucket: "photo-cash-2.firebasestorage.app",
  messagingSenderId: "85268729419",
  appId: "1:85268729419:web:daa0ff56708ddcce8c47ce",
  measurementId: "G-KXCHR3D10N"
};

// Initialize or retrieve named Firebase apps
export const userApp = getApps().find(app => app.name === 'userApp') 
  || initializeApp(userFirebaseConfig, 'userApp');

export const mediaApp = getApps().find(app => app.name === 'mediaApp') 
  || initializeApp(mediaFirebaseConfig, 'mediaApp');

// Database references for User App
export const userDb = getDatabase(userApp);
export const userFirestore = getFirestore(userApp);

// Database references for Media & Public Feed App
export const mediaDb = getDatabase(mediaApp);
export const mediaFirestore = getFirestore(mediaApp);
