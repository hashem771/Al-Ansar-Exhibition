// upload.js

import { storage, db } from './firebaseConfig.js';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"; // استيراد دالة set

// عناصر رفع الصور
const imageUpload = document.getElementById("imageUpload");
const imageTitle = document.getElementById("imageTitle");
const uploadBtn = document.getElementById("uploadBtn");
const uploadProgress = document.getElementById("uploadProgress");
const uploadModal = document.getElementById("uploadModal");
const addImageBtn = document.getElementById("addImageBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

addImageBtn.addEventListener("click", () => {
    uploadModal.style.display = "block"; // TODO: Review if this inline style can be moved to a CSS class.
});

closeModalBtn.addEventListener("click", () => {
    uploadModal.style.display = "none"; // TODO: Review if this inline style can be moved to a CSS class.
});

// تحميل الصورة إلى Firebase مع شريط تقدم
uploadBtn.addEventListener("click", async () => {
    const file = imageUpload.files[0];
    const title = imageTitle.value;
    const userId = localStorage.getItem('loggedInUser');
    const userEmail = localStorage.getItem('userEmail');

    if (file && title && userId && userEmail) {
        const storageReference = storageRef(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, file);

        uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgress.value = progress;
        }, (error) => {
            alert(error.message);
        }, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // تخزين بيانات الصورة مع معرف المستخدم
            await set(ref(db, `Images/${userId}_${Date.now()}`), {
                title: title,
                url: downloadURL,
                userId: userId,
                userEmail: userEmail,
                likes: 0,
                comments: [],
                views: 0
            });

            alert("تم رفع الصورة بنجاح!");
            // استدعاء دالة تحميل الصور بعد الرفع
            loadImages();
            uploadModal.style.display = "none"; // TODO: Review if this inline style can be moved to a CSS class.
        });
    } else {
        alert("يرجى اختيار صورة وإدخال عنوان.");
    }
});