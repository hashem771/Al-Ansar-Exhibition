import { db, storage } from './firebaseConfig.js';
import { ref as dbRef, get, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

const usersContainer = document.getElementById('usersContainer');
const uploadEmojiModal = document.getElementById('uploadEmojiModal');
const closeEmojiModalBtn = document.getElementById('closeEmojiModalBtn');
const uploadEmojiBtn = document.getElementById('uploadEmojiBtn');

let selectedUserId;

// عرض جميع المستخدمين
function displayUsers() {
    const usersRef = dbRef(db, 'users');
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            usersContainer.innerHTML = ''; // تأكد من تفريغ الحاوية قبل العرض
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                createUserCard(userId, user);
            });
            // تعيين الأحداث بعد عرض المستخدمين
            assignEmojiUploadEvents();
        } else {
            usersContainer.innerHTML = '<p>لا يوجد مستخدمون.</p>';
        }
    }).catch((error) => {
        console.error("خطأ في جلب بيانات المستخدمين:", error);
        usersContainer.innerHTML = '<p>حدث خطأ أثناء جلب المستخدمين.</p>';
    });
}

// إنشاء بطاقة مستخدم
function createUserCard(userId, user) {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    
    userCard.innerHTML = `
        <div>
            <strong>${user.userName}</strong> (${user.userId}) ${user.premium ? '<span class="premium">مميز</span>' : ''}
        </div>
        <div>
            <button onclick="togglePremium('${userId}')">${user.premium ? 'إلغاء تمييز' : 'تمييز مميز'}</button>
            <button class="uploadEmojiBtn" data-user-id="${userId}">رفع إيموجي توثيق</button>
        </div>
    `;

    usersContainer.appendChild(userCard);
}

// تعيين أحداث رفع الإيموجي
function assignEmojiUploadEvents() {
    const uploadButtons = document.querySelectorAll('.uploadEmojiBtn');
    uploadButtons.forEach(button => {
        button.onclick = () => {
            const userId = button.getAttribute('data-user-id');
            openUploadEmojiModal(userId);
        };
    });

    if (uploadEmojiBtn) {
        uploadEmojiBtn.onclick = () => {
            const fileInput = document.getElementById('emojiUpload');
            const file = fileInput.files[0];

            if (file) {
                const emojiRef = storageRef(storage, `verificationEmojis/${selectedUserId}`);
                uploadBytes(emojiRef, file).then((snapshot) => {
                    getDownloadURL(snapshot.ref).then((downloadURL) => {
                        const userRef = dbRef(db, `users/${selectedUserId}`);
                        update(userRef, { verificationEmoji: downloadURL }).then(() => {
                            alert("تم رفع إيموجي التوثيق بنجاح!");
                            uploadEmojiModal.style.display = 'none'; // TODO: Review if this inline style can be moved to a CSS class.
                            usersContainer.innerHTML = '';
                            displayUsers();
                        }).catch((error) => {
                            console.error("خطأ في تحديث إيموجي التوثيق:", error);
                        });
                    });
                }).catch((error) => {
                    console.error("خطأ في رفع الإيموجي:", error);
                });
            }
        };
    }

    if (closeEmojiModalBtn) {
        closeEmojiModalBtn.onclick = () => {
            uploadEmojiModal.style.display = 'none'; // TODO: Review if this inline style can be moved to a CSS class.
        };
    }
}

// التبديل بين تمييز المميز
function togglePremium(userId) {
    const userRef = dbRef(db, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("البيانات الحالية للمستخدم:", userData); // طباعة البيانات الحالية
            const updatedPremiumStatus = !userData.premium; // عكس الحالة الحالية
            console.log("حالة التميز الجديدة:", updatedPremiumStatus); // طباعة الحالة الجديدة
            
            // تحديث حالة التميز في قاعدة البيانات
            update(userRef, { premium: updatedPremiumStatus })
                .then(() => {
                    console.log(`تم تحديث حالة التميز للمستخدم ${userId} إلى: ${updatedPremiumStatus}`); // سجل التحديث
                    alert(`تم ${updatedPremiumStatus ? 'تمييز' : 'إلغاء تمييز'} المستخدم بنجاح!`);
                    usersContainer.innerHTML = ''; // إعادة تحميل المستخدمين
                    displayUsers(); // إعادة عرض المستخدمين
                })
                .catch((error) => {
                    console.error("خطأ في تحديث حالة التميز:", error);
                    alert("حدث خطأ أثناء تحديث حالة التميز. يرجى المحاولة مرة أخرى.");
                });
        } else {
            alert("المستخدم غير موجود.");
        }
    }).catch((error) => {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        alert("حدث خطأ أثناء جلب بيانات المستخدم. يرجى المحاولة مرة أخرى.");
    });
}

// فتح نافذة رفع إيموجي
function openUploadEmojiModal(userId) {
    selectedUserId = userId;
    uploadEmojiModal.style.display = 'block'; // TODO: Review if this inline style can be moved to a CSS class.
}

// عرض المستخدمين عند تحميل الصفحة
window.onload = displayUsers;