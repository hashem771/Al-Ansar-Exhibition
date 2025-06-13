//likes.js

import { db } from './firebaseConfig.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

export async function incrementLikes(imageId, imgElement) {
    const userId = localStorage.getItem('loggedInUser');
    if (!userId) {
        console.error("المستخدم غير مسجل الدخول.");
        return;
    }

    const imageRef = ref(db, `Images/${imageId}`);
    
    try {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
            const imageData = snapshot.val();
            const isLiked = imageData.likedBy && imageData.likedBy[userId] === true;

            let newLikesCount = imageData.likes || 0;

            if (isLiked) {
                newLikesCount = Math.max(newLikesCount - 1, 0);
                await update(imageRef, {
                    [`likedBy/${userId}`]: null,
                    likes: newLikesCount
                });
            } else {
                newLikesCount += 1;
                await update(imageRef, {
                    [`likedBy/${userId}`]: true,
                    likes: newLikesCount
                });
            }

            imgElement.querySelector('.likes').textContent = `الإعجابات: ${newLikesCount}`;
        }
    } catch (error) {
        console.error("خطأ في تحديث الإعجابات:", error);
    }
}

export async function checkIfLiked(imageId) {
    const userId = localStorage.getItem('loggedInUser');
    if (!userId) {
        console.error("المستخدم غير مسجل الدخول.");
        return false;
    }

    const likeRef = ref(db, `Images/${imageId}/likedBy/${userId}`);
    
    try {
        const snapshot = await get(likeRef);
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error("خطأ في التحقق من حالة الإعجاب:", error);
        return false;
    }
}

export async function incrementViews(imageId, imgElement) {
    const imageRef = ref(db, `Images/${imageId}`);
    
    try {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
            const imageData = snapshot.val();
            const newViewsCount = (imageData.views || 0) + 1;

            await update(imageRef, {
                views: newViewsCount
            });
            imgElement.querySelector('.views').textContent = `المشاهدات: ${newViewsCount}`;
        }
    } catch (error) {
        console.error("خطأ في تحديث عدد المشاهدات:", error);
    }
}