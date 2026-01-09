import { FaceTracker } from './faceTracker.js';
import { Scene3D } from './scene.js';

const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('vto-canvas');
const startBtn = document.getElementById('vto-start-btn');
const accessOverlay = document.getElementById('vto-access');
const loadingOverlay = document.getElementById('vto-loading');

let sectionInitialized = false;

// Only init if elements exist
if (videoElement && canvasElement && startBtn) {

    const faceTracker = new FaceTracker();
    const scene3D = new Scene3D(canvasElement);

    startBtn.addEventListener('click', async () => {
        // Show Loading
        accessOverlay.style.opacity = '0';
        accessOverlay.style.pointerEvents = 'none';
        loadingOverlay.style.opacity = '1';

        try {
            // 1. Init AI
            await faceTracker.init();

            // 2. Get Camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            });

            videoElement.srcObject = stream;

            // 3. Wait for video to load
            videoElement.addEventListener('loadeddata', () => {
                loadingOverlay.style.opacity = '0';
                videoElement.style.opacity = '1';

                // Resize canvas to match video
                resize();
                window.addEventListener('resize', resize);

                // Start Loop
                renderLoop();
            });

        } catch (err) {
            console.error(err);
            alert("Error accessing camera or initializing AI. Please check permissions.");
            loadingOverlay.style.opacity = '0';
            accessOverlay.style.opacity = '1';
            accessOverlay.style.pointerEvents = 'auto';
        }
    });

    function resize() {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        if (videoWidth && videoHeight) {
            // Logic to fit video in container "cover" style or "contain"
            // Our CSS is usually responsive width:100% height:auto
            const rect = videoElement.getBoundingClientRect();

            canvasElement.width = rect.width;
            canvasElement.height = rect.height;
            scene3D.resize(rect.width, rect.height);
        }
    }

    function renderLoop() {
        // Predict
        const results = faceTracker.detect(videoElement);

        // Render 3D
        if (results && results.faceLandmarks) {
            scene3D.update(results.faceLandmarks);
        } else {
            scene3D.update(null);
        }

        requestAnimationFrame(renderLoop);
    }
}
