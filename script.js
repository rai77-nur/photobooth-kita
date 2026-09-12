// @ts-nocheck

/* =====================================================
   RAI PHOTOBOOTH - ENGINE PRESISI FRAME CUSTOM PNG
===================================================== */

const landingPage = document.getElementById("landingPage");
const setupPage = document.getElementById("setupPage");
const cameraPage = document.getElementById("cameraPage");
const resultPage = document.getElementById("resultPage");

const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");
const setupBackButton = document.getElementById("setupBackButton");
const cameraBackButton = document.getElementById("cameraBackButton");
const captureButton = document.getElementById("captureButton");
const flipButton = document.getElementById("flipButton");
const flashButton = document.getElementById("flashButton");

const cameraVideo = document.getElementById("cameraVideo");
const countdownElement = document.getElementById("countdown");
const flashElement = document.getElementById("flash");

const currentPhotoNumber = document.getElementById("currentPhotoNumber");
const totalPhotoNumber = document.getElementById("totalPhotoNumber");
const cameraMessage = document.getElementById("cameraMessage");
const resultCanvas = document.getElementById("resultCanvas");
const downloadButton = document.getElementById("downloadButton");
const retakeButton = document.getElementById("retakeButton");
const homeButton = document.getElementById("homeButton");
const errorModal = document.getElementById("errorModal");
const errorMessage = document.getElementById("errorMessage");
const closeErrorButton = document.getElementById("closeErrorButton");
const shutterSound = document.getElementById("shutterSound");

let photoCount = 3;
let countdownTime = 3; 
let selectedTemplate = "classic";
let capturedPhotos = [];
let cameraStream = null;
let currentFacingMode = "user"; 
let isMirrored = true;
let isCapturing = false;
let flashEnabled = false;
let torchSupported = false;
let selectedFilter = "none";

/* =====================================================
   KONFIGURASI LUBANG FOTO SANGAT PRESISI UNTUK FRAME PNG
===================================================== */
const CUSTOM_TEMPLATES = {
    "custom-barcode-moments": {
        slots: [
            { x: 0.307, y: 0.262, w: 0.393, h: 0.155, shape: "ellipse" },
            { x: 0.311, y: 0.438, w: 0.390, h: 0.153, shape: "ellipse" },
            { x: 0.317, y: 0.614, w: 0.385, h: 0.151, shape: "ellipse" }
        ]
    },
    "custom-batik": {
        slots: [
            { x: 0.405, y: 0.240, w: 0.530, h: 0.198, shape: "rect" },
            { x: 0.405, y: 0.448, w: 0.530, h: 0.198, shape: "rect" },
            { x: 0.405, y: 0.655, w: 0.530, h: 0.198, shape: "rect" }
        ]
    },
    "custom-blok": {
        slots: [
            { x: 0.221, y: 0.102, w: 0.490, h: 0.193, angle: 8.95, shape: "rect" },
            { x: 0.285, y: 0.407, w: 0.479, h: 0.187, angle: -2.88, shape: "rect" },
            { x: 0.256, y: 0.704, w: 0.495, h: 0.194, angle: -13.47, shape: "rect" }
        ]
    },
    "custom-cowgirl": {
        slots: [
            { x: 0.345, y: 0.320, w: 0.485, h: 0.182, shape: "rect" },
            { x: 0.355, y: 0.520, w: 0.485, h: 0.182, shape: "rect" },
            { x: 0.345, y: 0.725, w: 0.485, h: 0.182, shape: "rect" }
        ]
    },
    "custom-gantungan": {
        slots: [
            { x: 0.170, y: 0.238, w: 0.345, h: 0.192, shape: "rect" },
            { x: 0.170, y: 0.442, w: 0.345, h: 0.192, shape: "rect" },
            { x: 0.170, y: 0.647, w: 0.345, h: 0.192, shape: "rect" }
        ]
    },
    "custom-koran": {
        slots: [
            { x: 0.230, y: 0.015, w: 0.520, h: 0.220, shape: "rect" },
            { x: 0.230, y: 0.248, w: 0.520, h: 0.220, shape: "rect" },
            { x: 0.230, y: 0.485, w: 0.520, h: 0.220, shape: "rect" },
            { x: 0.225, y: 0.730, w: 0.520, h: 0.220, shape: "rect" }
        ]
    },
    "custom-simple": {
        slots: [
            { x: 0.375, y: 0.048, w: 0.290, h: 0.163, shape: "rect" },
            { x: 0.375, y: 0.220, w: 0.290, h: 0.163, shape: "rect" },
            { x: 0.375, y: 0.393, w: 0.290, h: 0.163, shape: "rect" },
            { x: 0.375, y: 0.566, w: 0.290, h: 0.163, shape: "rect" }
        ]
    }
};

const templateHoles = {
  "custom-barcode-moments": 3,
  "custom-batik": 3,
  "custom-blok": 3,
  "custom-cowgirl": 3,
  "custom-gantungan": 3,
  "custom-koran": 4,
  "custom-simple": 4
};

/* =====================================================
   NAVIGASI & PENYETELAN OPSI
===================================================== */
function showPage(page) {
    document.querySelectorAll(".page").forEach(item => item.classList.remove("active"));
    page.classList.add("active");
    window.scrollTo(0, 0);
}

startButton.addEventListener("click", () => showPage(setupPage));

const timerCountButtons = document.querySelectorAll(".timer-count");
timerCountButtons.forEach(button => {
    button.addEventListener("click", () => {
        timerCountButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        countdownTime = Number(button.dataset.time);
    });
});

const photoCountButtons = document.querySelectorAll(".photo-count");
photoCountButtons.forEach(button => {
    button.addEventListener("click", () => {
        photoCountButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        photoCount = Number(button.dataset.count);
    });
});

const filterButtons = document.querySelectorAll(".filter-option");
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        selectedFilter = button.dataset.filter;
        applyVideoFilter();
    });
});

function applyVideoFilter() {
    cameraVideo.style.filter = (selectedFilter === "glow")
        ? "brightness(1.06) contrast(1.04) saturate(1.15) blur(0.4px)"
        : "none";
}

document.querySelectorAll(".template-button").forEach(button => {
    button.addEventListener("click", async function() {
        const templateName = this.dataset.template;
        selectedTemplate = templateName;

        if (templateHoles[templateName]) {
            const targetCount = templateHoles[templateName];
            const countBtn = document.querySelector(`.photo-count[data-count="${targetCount}"]`);
            if (countBtn) countBtn.click();
        }

        document.querySelectorAll(".template-button").forEach(item => item.classList.remove("selected"));
        document.querySelectorAll(`.template-button[data-template="${templateName}"]`).forEach(item => item.classList.add("selected"));

        if (resultPage.classList.contains("active") && capturedPhotos.length > 0) {
            await createFinalCanvas();
        }
    });
});

continueButton.addEventListener("click", async () => {
    capturedPhotos = [];
    currentFacingMode = "user"; 
    totalPhotoNumber.textContent = photoCount.toString();
    currentPhotoNumber.textContent = "1";
    showPage(cameraPage);
    await startCamera();
});

/* =====================================================
   KAMERA & KONTROL
===================================================== */
async function startCamera() {
    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { ideal: currentFacingMode }, 
                width: { ideal: 1280 }, 
                height: { ideal: 720 } 
            },
            audio: false
        });
        cameraVideo.srcObject = cameraStream;
        applyVideoFilter();
        
        if (currentFacingMode === "user") {
            isMirrored = true;
            cameraVideo.classList.add("mirrored");
        } else {
            isMirrored = false;
            cameraVideo.classList.remove("mirrored");
        }

        torchSupported = await applyTorch(flashEnabled);
        cameraMessage.textContent = "Pastikan wajah berada di dalam frame.";
    } catch (error) {
        handleCameraError(error);
    }
}

async function applyTorch(state) {
    if (!cameraStream) return false;
    const track = cameraStream.getVideoTracks()[0];
    if (!track || !track.getCapabilities) return false;

    const capabilities = track.getCapabilities();
    if (!capabilities.torch) return false;

    try {
        await track.applyConstraints({ advanced: [{ torch: state }] });
        return true;
    } catch (error) {
        return false;
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function handleCameraError(error) {
    let message = "Kamera tidak dapat digunakan. Pastikan browser memiliki izin kamera.";
    if (error.name === "NotAllowedError") message = "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.";
    else if (error.name === "NotFoundError") message = "Kamera tidak ditemukan pada perangkat ini.";
    else if (error.name === "NotReadableError") message = "Kamera sedang digunakan aplikasi lain.";
    errorMessage.textContent = message;
    errorModal.classList.remove("hidden");
}

closeErrorButton.addEventListener("click", () => {
    errorModal.classList.add("hidden");
    showPage(setupPage);
});

flipButton.addEventListener("click", async () => {
    if (isCapturing) return;
    currentFacingMode = (currentFacingMode === "user") ? "environment" : "user";
    await startCamera();
});

flashButton.addEventListener("click", async () => {
    flashEnabled = !flashEnabled;
    flashButton.classList.toggle("active", flashEnabled);
    torchSupported = await applyTorch(flashEnabled);
});

/* =====================================================
   PEMOTRETAN
===================================================== */
captureButton.addEventListener("click", async () => {
    if (isCapturing) return;
    if (!cameraStream) {
        cameraMessage.textContent = "Kamera belum aktif.";
        return;
    }
    isCapturing = true;
    captureButton.disabled = true;
    await captureAllPhotos();
});

async function captureAllPhotos() {
    capturedPhotos = [];
    for (let i = 0; i < photoCount; i++) {
        currentPhotoNumber.textContent = (i + 1).toString();
        await countdown(countdownTime);

        if (flashEnabled && !torchSupported) {
            flashElement.style.transition = "none";
            flashElement.style.opacity = "1";
            await wait(150);
        }

        const photo = captureFrame();
        capturedPhotos.push(photo);
        playShutterSound();

        if (flashEnabled && !torchSupported) {
            flashElement.style.transition = "opacity 0.2s ease";
            flashElement.style.opacity = "0";
        } else {
            flashEffect();
        }

        if (i < photoCount - 1) await wait(1500);
    }
    isCapturing = false;
    captureButton.disabled = false;
    
    await createFinalCanvas();
    stopCamera();
    showPage(resultPage);
}

function countdown(seconds) {
    return new Promise(resolve => {
        let number = seconds;
        countdownElement.classList.remove("hidden");
        countdownElement.textContent = number.toString();

        function tick() {
            number--;
            if (number <= 0) {
                countdownElement.textContent = "📸";
                setTimeout(() => {
                    countdownElement.classList.add("hidden");
                    resolve();
                }, 400);
                return;
            }
            countdownElement.textContent = number.toString();
            countdownElement.style.animation = "none";
            void countdownElement.offsetWidth;
            countdownElement.style.animation = "countdownPop 0.8s ease";
            setTimeout(tick, 1000);
        }
        setTimeout(tick, 1000);
    });
}

function captureFrame() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    if (selectedFilter === "glow") {
        context.filter = "brightness(1.06) contrast(1.04) saturate(1.15) blur(0.4px)";
    }

    if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 1.0);
}

function flashEffect() {
    flashElement.classList.remove("active");
    void flashElement.offsetWidth;
    flashElement.classList.add("active");
}

function playShutterSound() {
    try {
        shutterSound.currentTime = 0;
        shutterSound.play();
    } catch (e) {}
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/* =====================================================
   RENDER CANVAS 4K & OVERLAY DENGAN FILTER TRANSPARANSI
===================================================== */
async function createFinalCanvas() {
    const canvas = resultCanvas;
    const context = canvas.getContext("2d");
    const HD = 4;
    const isCustom = selectedTemplate.startsWith("custom-");

    if (isCustom) {
        const fileName = selectedTemplate.replace("custom-", "") + ".png";
        const customConfig = CUSTOM_TEMPLATES[selectedTemplate];

        const frameImg = await loadImage(fileName);

        const canvasWidth = frameImg.naturalWidth ? frameImg.naturalWidth * (HD / 2) : 2400;
        const canvasHeight = frameImg.naturalHeight ? frameImg.naturalHeight * (HD / 2) : 4266;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // 1. Gambar Foto-Foto pada Posisi & Bentuk Slot Presisi
        await drawCustomPhotosAsync(context, canvasWidth, canvasHeight, customConfig);

        // 2. Olah Frame PNG (Menghapus Area Putih Dalam Slot Agar Jadi Transparan)
        const transparentFrame = getTransparentFrameCanvas(frameImg, customConfig, canvasWidth, canvasHeight);

        // 3. Timpa Frame & Ornamen di Atas Foto
        context.drawImage(transparentFrame, 0, 0, canvasWidth, canvasHeight);
    } else {
        const canvasWidth = 600 * HD; 
        let canvasHeight;
        if (photoCount === 3) canvasHeight = 1800 * HD;
        else if (photoCount === 4) canvasHeight = 2200 * HD;
        else canvasHeight = 2800 * HD; 

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        drawBackground(context, canvasWidth, canvasHeight);
        await drawStandardPhotosAsync(context, canvasWidth, canvasHeight, HD);
        drawText(context, canvasWidth, canvasHeight, HD);
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Gagal memuat: " + src));
        img.src = src;
    });
}

function drawCustomPhotosAsync(context, width, height, customConfig) {
    return new Promise(resolve => {
        if (!capturedPhotos.length) return resolve();
        let loaded = 0;
        capturedPhotos.forEach((photoData, index) => {
            const slot = customConfig.slots[index];
            if (!slot) return;

            const img = new Image();
            img.onload = () => {
                const slotX = slot.x * width;
                const slotY = slot.y * height;
                const slotW = slot.w * width;
                const slotH = slot.h * height;

                context.save();
                if (slot.shape === "ellipse") {
                    context.beginPath();
                    context.ellipse(slotX + slotW / 2, slotY + slotH / 2, slotW / 2, slotH / 2, 0, 0, Math.PI * 2);
                    context.clip();
                    drawImageCover(context, img, slotX, slotY, slotW, slotH);
                } else if (slot.angle) {
                    const centerX = slotX + slotW / 2;
                    const centerY = slotY + slotH / 2;
                    context.translate(centerX, centerY);
                    context.rotate((slot.angle * Math.PI) / 180);
                    drawImageCover(context, img, -slotW / 2, -slotH / 2, slotW, slotH);
                } else {
                    context.beginPath();
                    context.rect(slotX, slotY, slotW, slotH);
                    context.clip();
                    drawImageCover(context, img, slotX, slotY, slotW, slotH);
                }
                context.restore();

                loaded++;
                if (loaded === Math.min(capturedPhotos.length, customConfig.slots.length)) resolve();
            };
            img.src = photoData;
        });
    });
}

function getTransparentFrameCanvas(frameImg, customConfig, canvasWidth, canvasHeight) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext("2d");

    offCtx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
    const imgData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imgData.data;

    customConfig.slots.forEach(slot => {
        const minX = Math.floor(slot.x * canvasWidth);
        const minY = Math.floor(slot.y * canvasHeight);
        const maxX = Math.ceil((slot.x + slot.w) * canvasWidth);
        const maxY = Math.ceil((slot.y + slot.h) * canvasHeight);

        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                const idx = (y * canvasWidth + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                if (r > 230 && g > 230 && b > 230) {
                    data[idx + 3] = 0;
                }
            }
        }
    });

    offCtx.putImageData(imgData, 0, 0);
    return offCanvas;
}

function drawBackground(context, width, height) {
    context.fillStyle = "#ffffff";
    if (selectedTemplate === "minimal") context.fillStyle = "#f4f4f4";
    else if (selectedTemplate === "retro") context.fillStyle = "#d9c2a2";
    else if (selectedTemplate === "polaroid") context.fillStyle = "#eee9e2";
    else if (selectedTemplate === "dark") context.fillStyle = "#1a1a1a";
    else if (selectedTemplate === "blush") context.fillStyle = "#fcd5ce";
    else if (selectedTemplate === "sky") context.fillStyle = "#cce3de";
    else if (selectedTemplate === "sage") context.fillStyle = "#a3b18a";
    context.fillRect(0, 0, width, height);
}

function drawStandardPhotosAsync(context, width, height, HD) {
    return new Promise(resolve => {
        const margin = 50 * HD; 
        const gap = 35 * HD; 
        const photoWidth = width - (margin * 2);
        const topSpace = 160 * HD;
        const bottomSpace = 200 * HD;

        const availableHeight = height - topSpace - bottomSpace - (gap * (photoCount - 1));
        const photoHeight = availableHeight / photoCount;

        let frameColor = "#ffffff";
        if (selectedTemplate === "classic") frameColor = "#d5c2ad"; 
        else if (selectedTemplate === "retro") frameColor = "#efe4d1"; 
        else if (selectedTemplate === "minimal") frameColor = "#dddddd"; 
        else if (selectedTemplate === "dark") frameColor = "#333333"; 
        else if (selectedTemplate === "sage") frameColor = "#e9ecef"; 

        if (capturedPhotos.length === 0) return resolve();

        let loadedImages = 0;
        capturedPhotos.forEach((photoData, index) => {
            const image = new Image();
            image.onload = () => {
                const y = topSpace + index * (photoHeight + gap);
                drawImageCover(context, image, margin, y, photoWidth, photoHeight);

                context.strokeStyle = frameColor;
                context.lineWidth = 14 * HD; 
                context.strokeRect(margin, y, photoWidth, photoHeight);

                context.strokeStyle = "rgba(0,0,0,0.15)";
                context.lineWidth = 2 * HD;
                context.strokeRect(margin - (7 * HD), y - (7 * HD), photoWidth + (14 * HD), photoHeight + (14 * HD));
                
                loadedImages++;
                if (loadedImages === capturedPhotos.length) resolve();
            };
            image.src = photoData;
        });
    });
}

function drawImageCover(context, image, x, y, width, height) {
    const imageRatio = image.width / image.height;
    const boxRatio = width / height;
    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (imageRatio > boxRatio) {
        sourceHeight = image.height;
        sourceWidth = image.height * boxRatio;
        sourceX = (image.width - sourceWidth) / 2;
        sourceY = 0;
    } else {
        sourceWidth = image.width;
        sourceHeight = image.width / boxRatio;
        sourceX = 0;
        sourceY = (image.height - sourceHeight) / 2;
    }

    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawText(context, width, height, HD) {
    context.textAlign = "center";
    let textColor = "#191919";
    if (selectedTemplate === "retro") textColor = "#4b3828";
    else if (selectedTemplate === "dark" || selectedTemplate === "sage") textColor = "#ffffff";
    
    context.fillStyle = textColor;
    context.font = `bold ${32 * HD}px Arial`;
    context.fillText("RAI PHOTOBOOTH", width / 2, 85 * HD);

    context.font = `${16 * HD}px Arial`;
    context.fillText("CAPTURE YOUR MOMENT", width / 2, 115 * HD);

    const today = new Date();
    const dateText = today.toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric"
    });
    
    context.font = `bold ${20 * HD}px Arial`;
    context.fillText(dateText.toUpperCase(), width / 2, height - (70 * HD));
}

/* =====================================================
   AKSI AKHIR
===================================================== */
downloadButton.addEventListener("click", () => {
    resultCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rai-photobooth-4K-HD.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, "image/png");
});

retakeButton.addEventListener("click", async () => {
    capturedPhotos = [];
    currentPhotoNumber.textContent = "1";
    showPage(cameraPage);
    await startCamera();
});

homeButton.addEventListener("click", () => {
    stopCamera();
    capturedPhotos = [];
    showPage(landingPage);
});

setupBackButton.addEventListener("click", () => showPage(landingPage));
cameraBackButton.addEventListener("click", () => {
    if (isCapturing) return;
    stopCamera();
    showPage(setupPage);
});

window.addEventListener("beforeunload", stopCamera);
