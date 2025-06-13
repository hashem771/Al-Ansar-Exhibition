// profile.js
import { db } from './firebaseConfig.js'; // استيراد db من firebaseConfig.js
import { auth } from './firebaseConfig.js'; // استيراد auth من firebaseConfig.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { get, set, remove, onValue, ref } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// ذاكرة مؤقتة لحفظ بيانات المستخدمين
const userCache = {};

// Helper function to create a post preview element for the profile page
// TODO: Implement this function properly
function createPostPreviewElement(post, postId) {
    const postElement = document.createElement('div');
    postElement.className = 'post'; // Assuming 'post' is the class for styling post previews
    // Minimized HTML string for structure - ideally build with DOM methods
    postElement.innerHTML = `
        <h3>${post.title || "عنوان غير متوفر"}</h3>
        <img src="${post.url || 'default-image.png'}" alt="${post.title || 'صورة غير متوفرة'}" class="post-image profile-post-image">
        <p>الإعجابات: ${post.likes || 0}</p>
        <p>المشاهدات: ${post.views || 0}</p>
    `;
    // Add click listener to the image to navigate to the post details page
    postElement.querySelector('.profile-post-image').onclick = () => {
        window.location.href = `post.html?imageId=${postId}`;
    };
    return postElement;
}

// تأكد من أن DOM جاهز قبل تشغيل أي كود
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userIdFromUrl = getUserIdFromUrl();
            if (userIdFromUrl) {
                displayUserProfile(userIdFromUrl);
                loadUserPosts(userIdFromUrl);
                checkFollowStatus(user.uid, userIdFromUrl);
                setupFollowButton(user.uid, userIdFromUrl);
                loadFollowerCount(userIdFromUrl);
            } else {
                console.error('معرف المستخدم غير موجود في الرابط');
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});

// قراءة userId من الرابط
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

// عرض بيانات الملف الشخصي مع استخدام ذاكرة مؤقتة
function displayUserProfile(userId) {
    const profileNameElement = document.getElementById('profileName');
    const profileImageElement = document.getElementById('profileImage');

    if (!profileNameElement || !profileImageElement) {
        console.error("عناصر DOM المطلوبة غير موجودة.");
        return;
    }

    // التحقق مما إذا كانت البيانات موجودة في الذاكرة المؤقتة
    if (userCache[userId]) {
        const userData = userCache[userId];
        profileNameElement.textContent = userData.userName || "اسم المستخدم غير متوفر";
        profileImageElement.src = userData.profileImage || 'default-avatar.png';
    } else {
        const userRef = ref(db, `users/${userId}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                userCache[userId] = userData;
                profileNameElement.textContent = userData.userName || "اسم المستخدم غير متوفر";
                profileImageElement.src = userData.profileImage || 'default-avatar.png';
            } else {
                console.error("المستخدم غير موجود.");
            }
        }).catch((error) => {
            console.error("خطأ في جلب بيانات المستخدم:", error);
        });
    }
}

// جلب عدد المتابعين
function loadFollowerCount(userId) {
    const followersCountElement = document.getElementById('followersCount');
    const followersRef = ref(db, `followers/${userId}`);

    if (!followersCountElement) {
        console.error("عنصر DOM followersCount غير موجود.");
        return;
    }

    onValue(followersRef, (snapshot) => {
        if (snapshot.exists()) {
            const followers = snapshot.val();
            const count = Object.keys(followers).length;
            followersCountElement.textContent = `عدد المتابعين: ${count}`;
        } else {
            followersCountElement.textContent = 'عدد المتابعين: 0';
        }
    });
}

// جلب منشورات المستخدم
function loadUserPosts(userId) {
    const postsContainer = document.getElementById('postsContainer');
    const postsRef = ref(db, 'Images');

    if (!postsContainer) {
        console.error("عنصر DOM postsContainer غير موجود.");
        return;
    }

    get(postsRef).then((snapshot) => {
        if (snapshot.exists()) {
            postsContainer.innerHTML = ''; // مسح المحتوى السابق
            const posts = snapshot.val();
            let hasPosts = false;

            Object.keys(posts).forEach((postId) => {
                const post = posts[postId];
                if (post.userId === userId) {
                    hasPosts = true;
                    const postElement = document.createElement('div');
                    postElement.className = 'post';

                    // إنشاء محتوى المنشور
                    postElement.innerHTML = `
                        <h3>${post.title || "عنوان غير متوفر"}</h3>
                        <img src="${post.url || 'default-image.png'}" alt="${post.title || 'صورة غير متوفرة'}" class="post-image">
                        <p>الإعجابات: ${post.likes || 0}</p>
                        <p>المشاهدات: ${post.views || 0}</p>
                    `;

                    postElement.querySelector('.post-image').onclick = () => {
                        window.location.href = `post.html?imageId=${postId}`;
                    };

                    postsContainer.appendChild(postElement);
                    // TODO: Refactor loop to use:
                    // const postPreview = createPostPreviewElement(post, postId);
                    // postsContainer.appendChild(postPreview);
                }
            });

            if (!hasPosts) {
                postsContainer.innerHTML = '<p>لا توجد منشورات لهذا المستخدم.</p>';
            }
        } else {
            postsContainer.innerHTML = '<p>لا توجد منشورات.</p>';
        }
    }).catch((error) => {
        console.error("خطأ في جلب المنشورات:", error);
        postsContainer.innerHTML = '<p>حدث خطأ في تحميل المنشورات.</p>';
    });
}

// التحقق من حالة المتابعة
function checkFollowStatus(currentUserId, targetUserId) {
    const followButton = document.getElementById('followBtn');
    const followRef = ref(db, `follows/${currentUserId}/${targetUserId}`);

    if (!followButton) {
        console.error("عنصر DOM followButton غير موجود.");
        return;
    }

    // تحقق إذا كان المستخدم الحالي هو نفس المستخدم المعروض
    if (currentUserId === targetUserId) {
        followButton.style.display = 'none'; // TODO: Review if this inline style can be moved to a CSS class. // إخفاء زر المتابعة
    } else {
        onValue(followRef, (snapshot) => {
            followButton.textContent = snapshot.exists() ? 'إلغاء المتابعة' : 'متابعة';
        });
    }
}

// إعداد زر المتابعة
function setupFollowButton(currentUserId, targetUserId) {
    const followButton = document.getElementById('followBtn');

    if (!followButton) {
        console.error("عنصر DOM followButton غير موجود.");
        return;
    }

    followButton.addEventListener('click', () => {
        const followRef = ref(db, `follows/${currentUserId}/${targetUserId}`);
        const followersRef = ref(db, `followers/${targetUserId}/${currentUserId}`);

        get(followRef).then((snapshot) => {
            if (snapshot.exists()) {
                // إلغاء المتابعة
                remove(followRef).then(() => {
                    remove(followersRef).then(() => {
                        console.log('تم إلغاء المتابعة بنجاح');
                    });
                }).catch((error) => {
                    console.error('حدث خطأ أثناء إلغاء المتابعة:', error);
                });
            } else {
                // المتابعة
                set(followRef, true).then(() => {
                    set(followersRef, true).then(() => {
                        console.log('تمت المتابعة بنجاح');
                    });
                }).catch((error) => {
                    console.error('حدث خطأ أثناء المتابعة:', error);
                });
            }
        }).catch((error) => {
            console.error('حدث خطأ أثناء التحقق من حالة المتابعة:', error);
        });
    });
}