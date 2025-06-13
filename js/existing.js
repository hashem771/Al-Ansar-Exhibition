// existing.js

// عناصر القائمة الجانبية وأزرار التحكم
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeBtn = document.getElementById('closeBtn');
const profileImage = document.getElementById('profileImage');
const profileSideImage = document.getElementById('profileSideImage');
const userNameElement = document.getElementById('userName');
const userIdElement = document.getElementById('userId');

// فتح القائمة الجانبية عند النقر على زر القائمة
menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block'; // TODO: Review if this inline style can be moved to a CSS class.
});

// إغلاق القائمة الجانبية عند النقر على زر الإغلاق
closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none'; // TODO: Review if this inline style can be moved to a CSS class.
});

// نسخ معلومات المستخدم إلى القائمة الجانبية مع التأكد من وجود العناصر
if (profileImage && profileSideImage) {
    profileSideImage.src = profileImage.src;
}

if (userNameElement && document.getElementById('sideUserName')) {
    document.getElementById('sideUserName').textContent = userNameElement.textContent;
}

if (userIdElement && document.getElementById('sideUserId')) {
    document.getElementById('sideUserId').textContent = userIdElement.textContent;
}

// زر تسجيل الخروج
const logoutBtn = document.getElementById('sideLogoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // إضافة وظيفة تسجيل الخروج هنا
        console.log("تم تسجيل الخروج");
    });
}

// زر متابعة الأشخاص
const followBtn = document.getElementById('followBtn');
if (followBtn) {
    followBtn.addEventListener('click', () => {
        // إضافة وظيفة متابعة الأشخاص هنا
        console.log("تم فتح قائمة متابعة الأشخاص");
    });
}