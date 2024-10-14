
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqxLgkrzih830j_gZaYvNOE3EkihQ-Fos",
  authDomain: "gym-notebook-9b163.firebaseapp.com",
  projectId: "gym-notebook-9b163",
  storageBucket: "gym-notebook-9b163.appspot.com",
  messagingSenderId: "411471978950",
  appId: "1:411471978950:web:41f7042f2e015a6fa312c7",
  measurementId: "G-J2VHFMQ7J1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
