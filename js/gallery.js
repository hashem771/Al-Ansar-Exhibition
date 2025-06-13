//gallery.js

import { db } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { incrementLikes, checkIfLiked, incrementViews } from './likes.js';
import { displayUserProfile } from './profiles.js';

const userCache = {};

async function getUserProfile(userId) {
    if (userCache[userId]) {
        return userCache[userId];
    }

    const userRef = ref(db, `users/${userId}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            userCache[userId] = userData;
            return userData;
        } else {
            console.warn(`لم يتم العثور على بيانات للمستخدم بمعرف ${userId}`);
            return null;
        }
    } catch (error) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        return null;
    }
}

export async function loadImages() {
    const dbRef = ref(db, "Images/");
    const imageGallery = document.getElementById("imageGallery");

    if (!imageGallery) {
        console.error("عنصر imageGallery غير موجود في DOM.");
        return;
    }

    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            imageGallery.innerHTML = "";
            const images = snapshot.val();

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        const imgElement = entry.target;
                        const imageId = imgElement.getAttribute("data-image-id");
                        await incrementViews(imageId, imgElement);
                        observer.unobserve(imgElement);
                    }
                });
            }, { threshold: 0.5 });

            for (const imageId in images) {
                const imageData = images[imageId];
                if (imageData && imageData.url) {
                    const userProfile = await getUserProfile(imageData.userId);

                    const imgElement = document.createElement("div");
                    imgElement.classList.add("image-card");

                    imgElement.innerHTML = `
                        <div class="user-info">
                            <img src="${userProfile ? userProfile.profileImage : 'default-avatar.png'}" alt="Profile Image" class="profile-image" style="cursor: pointer;">
                            <div class="user-details">
                                <p class="user-name" style="cursor: pointer;">${userProfile ? userProfile.userName : 'مستخدم مجهول'}</p>
                                <p class="user-id">
                                    ${userProfile ? userProfile.userId : 'unknown'}
                                    ${userProfile && userProfile.Premium && userProfile.verificationIcon ? `<img src="${userProfile.verificationIcon}" alt="موثق" style="width: 20px; height: 20px; margin-left: 5px;">` : ''}
                                </p>
                            </div>
                        </div>
                        <h3>${imageData.title}</h3>
                        <img src="${imageData.url}" alt="${imageData.title}" class="image-view" data-image-id="${imageId}">
                        <div class="image-stats">
                            <p class="likes">الإعجابات: ${imageData.likes || 0}</p>
                            <p class="views">المشاهدات: ${imageData.views || 0}</p>
                        </div>
                        <img src="icons/Like.png" alt="Like" class="like-icon" data-image-id="${imageId}" style="cursor: pointer;">
                    `;

                    imgElement.querySelector(".profile-image").addEventListener("click", () => {
                        window.location.href = `profile.html?userId=${imageData.userId}`;
                    });
                    imgElement.querySelector(".user-name").addEventListener("click", () => {
                        window.location.href = `profile.html?userId=${imageData.userId}`;
                    });

                    const likeIcon = imgElement.querySelector('.like-icon');

                    await checkIfLiked(imageId).then((isLiked) => {
                        if (isLiked) {
                            likeIcon.src = "icons/Like1.png";
                        }
                    });

                    likeIcon.addEventListener('click', async () => {
                        if (likeIcon.src.includes("Like.png")) {
                            await incrementLikes(imageId, imgElement);
                            likeIcon.src = "icons/Like1.png";
                        } else {
                            await incrementLikes(imageId, imgElement);
                            likeIcon.src = "icons/Like.png";
                        }
                    });

                    imgElement.querySelector(".image-view").onclick = async () => {
                        await incrementViews(imageId, imgElement);
                        window.location.href = `post.html?imageId=${imageId}`;
                    };

                    imageGallery.appendChild(imgElement);

                    observer.observe(imgElement.querySelector('.image-view'));
                }
            }
        } else {
            console.warn("لا توجد صور في قاعدة البيانات.");
        }
    } catch (error) {
        console.error("خطأ في جلب الصور:", error);
    }
}

window.onload = () => {
    loadImages();
};