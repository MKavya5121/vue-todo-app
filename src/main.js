import { createApp } from 'vue'
import App from './App.vue'
import './main.css'

// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXg_I3bm8oxWTKRv6K4H_y1sEEQ8YB3wg",
  authDomain: "vue-todo-app-e87e0.firebaseapp.com",
  projectId: "vue-todo-app-e87e0",
  storageBucket: "vue-todo-app-e87e0.appspot.com",
  messagingSenderId: "1022003987710",
  appId: "1:1022003987710:web:c9f69d93a0334144e951af",
  measurementId: "G-4KW66L77QT"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get Firestore instance
const firestore = getFirestore(firebaseApp);


createApp(App)
  .provide('firestore', firestore) // Provide Firestore instance to the Vue app
  .mount('#app');
