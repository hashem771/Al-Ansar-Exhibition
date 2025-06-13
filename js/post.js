// استيراد Firebase
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js"; // No longer needed directly
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"; // Keep if other specific DB ops are used, else db from config is enough for ref()
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"; // Keep for onAuthStateChanged, else auth from config is enough
import { db, auth } from './firebaseConfig.js'; // Added import

// Firebase config is now imported
// Removed inline firebaseConfig
// Removed initializeApp, using imported db/auth
// Using imported db
// Using imported auth

// Global variable for imageId, to be set in initPostPage
let imageId;

// This block of code that runs on script load to fetch post data will be moved into initPostPage
/*
// استرجاع البيانات من Firebase
const dbRef = ref(db, 'Images/' + imageId); // imageId here would be undefined initially
get(dbRef).then((snapshot) => {
    const data = snapshot.val();
    if (data) {
        // عرض الصورة والمعلومات
        document.getElementById('imageTitle').textContent = data.title;
        document.getElementById('image').src = data.url;
        document.getElementById('likes').textContent = data.likes;
        document.getElementById('views').textContent = data.views;

        // تحميل معلومات المستخدم (اسم المستخدم وصورة الملف الشخصي)
        loadUserProfile(data.userId);
        loadComments(); // تحميل التعليقات عند استرجاع البيانات
    } else {
        console.log('الصورة غير موجودة');
    }
}).catch((error) => {
    console.error('حدث خطأ أثناء جلب البيانات:', error);
});
*/

// تحميل معلومات المستخدم
function loadUserProfile(userId) {
    const userRef = ref(db, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            // عرض صورة الملف الشخصي واسم المستخدم
            const userInfoContainer = document.getElementById('userInfoContainer');
            userInfoContainer.innerHTML = ''; // تنظيف الحاوية

            // إنشاء صورة الملف الشخصي
            const profileImageElement = document.createElement('img');
            profileImageElement.src = userData.profileImage || '../images/default-avatar.png';
            profileImageElement.alt = "صورة الملف الشخصي";
            profileImageElement.style.width = "50px"; // TODO: Review if this inline style can be moved to a CSS class. // ضبط العرض
            profileImageElement.style.height = "50px"; // TODO: Review if this inline style can be moved to a CSS class. // ضبط الطول
            profileImageElement.style.borderRadius = "50%"; // TODO: Review if this inline style can be moved to a CSS class. // جعل الصورة دائرية
            profileImageElement.style.marginLeft = "10px"; // TODO: Review if this inline style can be moved to a CSS class. // هامش إلى اليسار
            profileImageElement.style.cursor = "pointer"; // TODO: Review if this inline style can be moved to a CSS class. // تغيير مؤشر الفأرة لإظهار إمكانية النقر

            // عند النقر على صورة الملف الشخصي، توجه إلى صفحة الملف الشخصي
            profileImageElement.onclick = () => {
                window.location.href = `profile.html?userId=${userId}`;
            };

            // إنشاء اسم المستخدم كنص قابل للنقر
            const userNameElement = document.createElement("span");
            userNameElement.textContent = userData.userName || 'مستخدم مجهول';
            userNameElement.style.cursor = "pointer"; // TODO: Review if this inline style can be moved to a CSS class. // تغيير مؤشر الفأرة لإظهار إمكانية النقر
            userNameElement.onclick = () => {
                window.location.href = `profile.html?userId=${userId}`;
            };

            // إضافة صورة الملف الشخصي واسم المستخدم إلى الحاوية
            userInfoContainer.appendChild(profileImageElement); // إضافة الصورة
            userInfoContainer.appendChild(userNameElement); // إضافة اسم المستخدم
        } else {
            console.warn("بيانات المستخدم غير موجودة.");
        }
    }).catch((error) => {
        console.error("خطأ في جلب بيانات المستخدم:", error);
    });
}
// تحميل تفاصيل الصورة
async function loadPost(imageId) {
    const cachedPost = localStorage.getItem(`post_${imageId}`);
    
    if (cachedPost) {
        displayPost(JSON.parse(cachedPost));
    } else {
        const postRef = ref(db, `Images/${imageId}`);
        
        try {
            const snapshot = await get(postRef);
            if (snapshot.exists()) {
                const postData = snapshot.val();
                localStorage.setItem(`post_${imageId}`, JSON.stringify(postData));
                displayPost(postData);
            } else {
                console.error("لا توجد بيانات للمنشور.");
                document.getElementById('postContainer').innerHTML = "<p>لا توجد بيانات للمنشور.</p>";
            }
        } catch (error) {
            console.error("خطأ في جلب البيانات:", error);
            document.getElementById('postContainer').innerHTML = "<p>حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقًا.</p>";
        }
    }
}

// عرض تفاصيل الصورة
function displayPost(postData) {
    // إعداد زر تحميل الصورة
    setupDownloadButton(postData.url);

    // عرض العنوان والإعجابات والمشاهدات فقط بدون تعيين `src` للصورة
    document.getElementById('imageTitle').textContent = postData.title;
    document.getElementById('likes').textContent = postData.likes;
    document.getElementById('views').textContent = postData.views;

    // تحديث التعليقات
    loadComments();
    setupCommentButton();
}

function setupDownloadButton(imageUrl) {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', () => {
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = 'صورة.jpg'; // اسم الملف عند التنزيل
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href); // تنظيف رابط التنزيل
            })
            .catch(error => {
                console.error('حدث خطأ أثناء تنزيل الصورة:', error);
            });
    });
}

// تحميل التعليقات
function loadComments() {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = "<p>جاري تحميل التعليقات...</p>";

    const commentsRef = ref(db, `Images/${imageId}/comments`);
    
    get(commentsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const comments = snapshot.val();
            commentsContainer.innerHTML = ""; // تنظيف الحاوية قبل إضافة التعليقات
            
            // عرض التعليقات
            for (const key in comments) {
                displayComment(comments[key]);
            }
        } else {
            commentsContainer.innerHTML = "<p>لا توجد تعليقات بعد.</p>";
        }
    }).catch((error) => {
        console.error("حدث خطأ أثناء جلب التعليقات:", error);
    });
}

// دالة لعرض تعليق
function displayComment(commentData) {
    const commentsContainer = document.getElementById('commentsContainer');
    
    // إنشاء عنصر للتعليق
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    
    // إنشاء صورة الملف الشخصي
    const profileImageElement = document.createElement('img');
    profileImageElement.src = commentData.profileImage || '../images/default-avatar.png';
    profileImageElement.alt = "صورة الملف الشخصي";
    profileImageElement.style.width = "30px"; // TODO: Review if this inline style can be moved to a CSS class. // ضبط العرض
    profileImageElement.style.height = "30px"; // TODO: Review if this inline style can be moved to a CSS class. // ضبط الطول
    profileImageElement.style.borderRadius = "50%"; // TODO: Review if this inline style can be moved to a CSS class. // جعل الصورة دائرية
    profileImageElement.style.marginRight = "10px"; // TODO: Review if this inline style can be moved to a CSS class. // هامش إلى اليمين
    profileImageElement.style.cursor = "pointer"; // TODO: Review if this inline style can be moved to a CSS class. // تغيير المؤشر إلى يد عند المرور فوق الصورة
    
    // إضافة حدث النقر على صورة الملف الشخصي
    profileImageElement.onclick = () => {
        window.location.href = `profile.html?userId=${commentData.userId}`;
    };

    // إنشاء عنصر لاسم المستخدم
    const userNameElement = document.createElement("span");
    userNameElement.textContent = commentData.userName || 'مستخدم مجهول';
    userNameElement.style.cursor = "pointer"; // TODO: Review if this inline style can be moved to a CSS class. // تغيير المؤشر إلى يد عند المرور فوق الاسم

    // إضافة حدث النقر على اسم المستخدم
    userNameElement.onclick = () => {
        window.location.href = `profile.html?userId=${commentData.userId}`;
    };

    // إنشاء عنصر للتعليق نفسه
    const textElement = document.createElement("p");
    textElement.textContent = commentData.text;
    
    // تجميع العناصر
    commentElement.appendChild(profileImageElement);
    commentElement.appendChild(userNameElement);
    commentElement.appendChild(textElement);
    
    // إضافة التعليق إلى الحاوية
    commentsContainer.appendChild(commentElement);
}

// إعداد زر إضافة تعليق
function setupCommentButton() {
    const addCommentBtn = document.getElementById('addCommentBtn');
    const commentInput = document.getElementById('commentInput');
    
    // التحقق من حالة تسجيل الدخول
    onAuthStateChanged(auth, (user) => {
        if (user) {
            addCommentBtn.disabled = false; // تفعيل زر إضافة تعليق إذا كان المستخدم مسجلاً دخوله
        } else {
            addCommentBtn.disabled = true; // تعطيل زر إضافة تعليق إذا لم يكن المستخدم مسجلاً دخوله
            alert("يرجى تسجيل الدخول لإضافة تعليق.");
        }
    });

    addCommentBtn.addEventListener('click', async () => {
        const newCommentText = sanitizeInput(commentInput.value.trim());
        if (newCommentText) {
            // تعطيل الزر أثناء إضافة التعليق
            addCommentBtn.disabled = true;
            addCommentBtn.textContent = "جاري الإضافة...";
            
            const commentsRef = ref(db, `Images/${imageId}/comments`);
            const newCommentRef = push(commentsRef); // استخدام push لإضافة تعليق جديد
            
            // استرجاع معلومات المستخدم
            const user = auth.currentUser;
            const userRef = ref(db, `users/${user.uid}`);
            const userData = await get(userRef);

            // إعداد البيانات الجديدة
            const newCommentData = {
                text: newCommentText,
                userId: user.uid, // إضافة userId
                profileImage: userData.val().profileImage || '../images/default-avatar.png', // صورة الملف الشخصي
                userName: userData.val().userName || 'مستخدم مجهول' // اسم المستخدم
            };

            // إضافة التعليق إلى قاعدة البيانات
            try {
                await set(newCommentRef, newCommentData);
                commentInput.value = ''; // تفريغ حقل الإدخال
                loadComments(); // إعادة تحميل التعليقات بعد الإضافة
            } catch (error) {
                console.error("خطأ أثناء إضافة التعليق:", error);
            } finally {
                // إعادة تفعيل الزر
                addCommentBtn.disabled = false;
                addCommentBtn.textContent = "أضف تعليق";
            }
        } else {
            alert("يرجى كتابة تعليق قبل الإضافة.");
        }
    });
}

// دالة لتعقيم المدخلات
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML; // إرجاع المدخلات المعقمة
}

async function initPostPage() {
    const urlParams = new URLSearchParams(window.location.search);
    imageId = urlParams.get('imageId'); // Assign to global imageId

    if (imageId) {
        // The initial data loading logic, now safely using the global imageId
        const dbRef = ref(db, 'Images/' + imageId);
        try {
            const snapshot = await get(dbRef);
            const data = snapshot.val();
            if (data) {
                document.getElementById('imageTitle').textContent = data.title;
                document.getElementById('image').src = data.url;
                document.getElementById('likes').textContent = data.likes || 0; // Default to 0 if undefined
                document.getElementById('views').textContent = data.views || 0; // Default to 0 if undefined

                loadUserProfile(data.userId);
                // Ensure loadComments and setupCommentButton are called after imageId is set.
                // displayPost (called by loadPost) already calls these.
                await loadPost(imageId); // loadPost also calls displayPost, which calls loadComments & setupCommentButton
            } else {
                console.log('الصورة غير موجودة');
                document.getElementById('postContainer').innerHTML = "<p>الصورة غير موجودة.</p>";
            }
        } catch (error) {
            console.error('حدث خطأ أثناء جلب البيانات:', error);
            document.getElementById('postContainer').innerHTML = "<p>حدث خطأ أثناء جلب البيانات.</p>";
        }
    } else {
        console.error("Image ID not found in URL for post page.");
        // Ensure postContainer exists before trying to set its innerHTML
        const postContainer = document.getElementById('postContainer');
        if (postContainer) {
            postContainer.innerHTML = "<p>Error: Image ID missing.</p>";
        }
    }
}

// بدء التطبيق
initPostPage();
// Wrapped initial load in initPostPage