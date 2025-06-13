//profiles.js

import { db } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

export function displayUserProfile(userId) {
    const profileImageElement = document.getElementById('profileImage');
    const userNameElement = document.getElementById('userName');
    const userIdElement = document.getElementById('userId');
    
    // التحقق من وجود العناصر قبل محاولة تعيين الخصائص
    if (!profileImageElement || !userNameElement || !userIdElement) {
        console.error("العناصر المطلوبة غير موجودة في المستند.");
        return;
    }

    const userRef = ref(db, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            profileImageElement.src = userData.profileImage || 'default-avatar.png';
            userNameElement.textContent = userData.userName || 'مستخدم مجهول';
            userIdElement.textContent = userData.userId || 'unknown';

            profileImageElement.style.cursor = "pointer";
            profileImageElement.onclick = () => {
                window.location.href = `profile.html?userId=${userId}`;
            };

            // تحقق من حالة التوثيق وإضافة الأيقونة بجانب معرف المستخدم فقط إذا كان المستخدم موثقًا
            if (userData.Premium && userData.verificationIcon) { // تحقق من وجود الأيقونة في بيانات المستخدم
                const userIdVerificationIcon = document.createElement('img');
                userIdVerificationIcon.src = userData.verificationIcon; // استخدام رابط الأيقونة من بيانات المستخدم
                userIdVerificationIcon.alt = 'موثق';
                userIdVerificationIcon.style.width = '20px';
                userIdVerificationIcon.style.height = '20px';
                userIdVerificationIcon.style.marginLeft = '5px';
                userIdElement.appendChild(userIdVerificationIcon); // إضافة الأيقونة بجانب معرف المستخدم فقط
            }
        } else {
            console.warn("بيانات المستخدم غير موجودة.");
        }
    }).catch((error) => {
        console.error("خطأ في جلب بيانات المستخدم:", error);
    });
}