import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBqxLgkrzih830j_gZaYvNOE3EkihQ-Fos",
  authDomain: "gym-notebook-9b163.firebaseapp.com",
  projectId: "gym-notebook-9b163",
  storageBucket: "gym-notebook-9b163.appspot.com",
  messagingSenderId: "411471978950",
  appId: "1:411471978950:web:41f7042f2e015a6fa312c7",
  measurementId: "G-J2VHFMQ7J1"
};

// Ensure you're using the correct version
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };