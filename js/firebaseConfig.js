// firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCNlNpZZn-tkIRpOZXeOJqgnagNk9hRyqI",
    authDomain: "bing-8e48f.firebaseapp.com",
    databaseURL: "https://bing-8e48f-default-rtdb.firebaseio.com",
    projectId: "bing-8e48f",
    storageBucket: "bing-8e48f.appspot.com",
    messagingSenderId: "463368456917",
    appId: "1:463368456917:android:41612df40b1a4aa6e1f05c"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth();

export { app, db, storage, auth };