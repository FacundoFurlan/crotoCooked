// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyBGyRawT5dcy1Ba7Hy7BVTS8xpn-aCTz7o",

  authDomain: "pollo-bifes-y-achicoria.firebaseapp.com",

  projectId: "pollo-bifes-y-achicoria",

  storageBucket: "pollo-bifes-y-achicoria.firebasestorage.app",

  messagingSenderId: "92404805993",

  appId: "1:92404805993:web:b2557e5ece62215041cdf8",

  measurementId: "G-RBRQEX11EM"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;