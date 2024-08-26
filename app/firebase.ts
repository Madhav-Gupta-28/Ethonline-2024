import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
// import dotenv from 'dotenv';
// dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyD2MZ6D7tmt1aROyNahpNHAGRMk4SWMjRA",
  authDomain: "memebattle-7d663.firebaseapp.com",
  projectId: "memebattle-7d663",
  storageBucket: "memebattle-7d663.appspot.com",
  messagingSenderId: "868251072577",
  appId: "1:868251072577:web:81b5e75aa95af175f4eec0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);