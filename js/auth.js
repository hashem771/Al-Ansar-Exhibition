// auth.js

import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { displayUserProfile } from './profiles.js';

// التحقق من حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('loggedInUser', user.uid);
        localStorage.setItem('userEmail', user.email);
        displayUserProfile(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

// زر تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
});