import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FaceTracker {
    constructor() {
        this.faceLandmarker = null;
        this.lastVideoTime = -1;
        this.results = undefined;
    }

    async init() {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        });
        console.log("FaceLandmarker initialized");
    }

    detect(video) {
        if (!this.faceLandmarker) return;

        let startTimeMs = performance.now();
        if (video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = video.currentTime;
            this.results = this.faceLandmarker.detectForVideo(video, startTimeMs);
        }
        return this.results;
    }
}
