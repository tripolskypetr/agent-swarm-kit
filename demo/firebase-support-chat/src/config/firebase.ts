import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQuOjXoedrd_bCWche-fF8pPEX92JCIQ8",
  authDomain: "chat-app-53e2b.firebaseapp.com",
  databaseURL:
    "https://chat-app-53e2b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app-53e2b",
  storageBucket: "chat-app-53e2b.firebasestorage.app",
  messagingSenderId: "47315394163",
  appId: "1:47315394163:web:736b7804f93c5a58321406",
  measurementId: "G-JNNR3Q0G7Z",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
