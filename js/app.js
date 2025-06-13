// app.js

// استيراد Firebase Config
import { db } from './firebaseConfig.js';
import { ref as dbRef, get, update } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js';

// معرف الإيموجي الافتراضي للتوثيق
const verificationEmojiId = '-OAX_jDRjt8RvH9l1Id3';

// إضافة واجهة المستخدم
document.body.innerHTML = `
    <div id="userList"></div>
`;

// دالة لتحميل المستخدمين من قاعدة بيانات Firebase
const loadUsers = async () => {
    const userListDiv = document.getElementById('userList');
    userListDiv.innerHTML = ''; // مسح المحتوى السابق

    const usersRef = dbRef(db, 'users'); // استخدام ref للوصول إلى المسار الصحيح
    try {
        const snapshot = await get(usersRef); // الحصول على البيانات
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const userId = childSnapshot.key;
                const userData = childSnapshot.val();
                const userElement = document.createElement('div');
                userElement.className = 'user-item';
                userElement.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${userData.profileImage}" alt="${userData.userName}" class="profile-image" style="width: 50px; height: 50px; border-radius: 50%; margin-left: 10px;">
                        ${userData.verificationIcon ? `<img src="${userData.verificationIcon}" alt="Verified" style="width: 20px; height: 20px; margin-left: 5px;">` : ''}
                    </div>
                    <p>اسم المستخدم: ${userData.userName}</p>
                    <p>معرف المستخدم: ${userData.userId}</p>
                    <p>حالة الاشتراك: ${userData.Premium ? 'موثق' : 'غير موثق'}</p>
                    <button class="toggle-btn" data-user-id="${userId}" data-premium="${userData.Premium}">
                        ${userData.Premium ? 'إلغاء التوثيق' : 'توثيق'}
                    </button>
                `;
                userListDiv.appendChild(userElement);
            });

            // إضافة حدث للزر
            const toggleButtons = document.querySelectorAll('.toggle-btn');
            toggleButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const userId = event.target.getAttribute('data-user-id');
                    const isPremium = event.target.getAttribute('data-premium') === 'true';
                    togglePremiumStatus(userId, isPremium);
                });
            });
        } else {
            userListDiv.innerHTML = '<p>لا يوجد مستخدمون.</p>';
        }
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
};

// دالة لتحديث حالة التوثيق للمستخدم وإضافة الإيموجي
const togglePremiumStatus = async (userId, isPremium) => {
    const userRef = dbRef(db, 'users/' + userId);

    try {
        // في حالة التوثيق، الحصول على رابط الإيموجي
        let emojiUrl = null;
        if (!isPremium) {
            const emojiRef = dbRef(db, `emojis/${verificationEmojiId}`);
            const emojiSnapshot = await get(emojiRef);

            if (emojiSnapshot.exists()) {
                emojiUrl = emojiSnapshot.val().imageUrl;
            }
        }

        // تحديث حالة التوثيق وإضافة الإيموجي إذا كان موثقا
        await update(userRef, {
            Premium: !isPremium,
            verificationIcon: !isPremium ? emojiUrl : null // إرفاق رابط الإيموجي عند التوثيق، وإزالته عند إلغاء التوثيق
        });

        loadUsers(); // إعادة تحميل المستخدمين بعد التحديث
    } catch (error) {
        console.error('خطأ في تحديث حالة التوثيق:', error);
    }
};

// تحميل المستخدمين عند فتح الصفحة
window.onload = loadUsers;