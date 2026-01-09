import * as THREE from 'three';

export class Scene3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true, // Transparent background
            antialias: true
        });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000); // Aspects updated on resize

        // Lighting
        const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1.5);
        this.scene.add(light);

        // Glasses Container
        this.glasses = new THREE.Group();
        this.createGlassesGeo();
        this.scene.add(this.glasses);

        // Glasses are hidden by default until face found
        this.glasses.visible = false;
    }

    createGlassesGeo() {
        // 1. Define Materials

        // Acetate Frame Material (Dark Green, Polished)
        const frameMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x013220,     // Deep Green
            emissive: 0x001000,
            roughness: 0.1,      // Very smooth
            metalness: 0.1,      // Plastic-like
            clearcoat: 1.0,      // High polish
            clearcoatRoughness: 0.1,
            reflectivity: 1.0
        });

        // Lens Material (Physical Glass)
        const lensMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x202020,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.5,  // Glass-like transparency
            thickness: 0.5,     // Refraction
            opacity: 0.8,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Gold Accents (Hinges/Bridge details)
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 1.0,
            roughness: 0.2
        });

        // 2. Define Shape (Wayfarer-ish / Rounded Square)
        const lensShape = new THREE.Shape();
        const w = 6;  // Lens width
        const h = 4.5;  // Lens height
        const r = 2;  // Corner radius

        // Draw rounded rectangle manually for control
        lensShape.moveTo(-w / 2 + r, h / 2);
        lensShape.lineTo(w / 2 - r, h / 2);
        lensShape.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
        lensShape.lineTo(w / 2, -h / 2 + r);
        lensShape.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2);
        lensShape.lineTo(-w / 2 + r, -h / 2);
        lensShape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r);
        lensShape.lineTo(-w / 2, h / 2 - r);
        lensShape.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);

        // Frame Shape (Offset of lens shape)
        // Three.js doesn't have native "offset" for shapes effortlessly without holes.
        // We will create a larger shape for the frame and drill the lens shape as a hole.
        const frameOuterShape = new THREE.Shape();
        const thick = 0.8; // Frame thickness
        const fw = w + thick * 2;
        const fh = h + thick * 2;
        // Similar rounded rect but bigger
        // Simplified scaling for brevity
        frameOuterShape.moveTo(-fw / 2 + r, fh / 2);
        frameOuterShape.lineTo(fw / 2 - r, fh / 2);
        frameOuterShape.quadraticCurveTo(fw / 2, fh / 2, fw / 2, fh / 2 - r);
        frameOuterShape.lineTo(fw / 2, -fh / 2 + r);
        frameOuterShape.quadraticCurveTo(fw / 2, -fh / 2, fw / 2 - r, -fh / 2);
        frameOuterShape.lineTo(-fw / 2 + r, -fh / 2);
        frameOuterShape.quadraticCurveTo(-fw / 2, -fh / 2, -fw / 2, -fh / 2 + r);
        frameOuterShape.lineTo(-fw / 2, fh / 2 - r);
        frameOuterShape.quadraticCurveTo(-fw / 2, fh / 2, -fw / 2 + r, fh / 2);

        // Add hole
        frameOuterShape.holes.push(lensShape);

        // Extrude Settings
        const extrudeSettings = {
            steps: 1,
            depth: 0.5,
            bevelEnabled: true,
            bevelThickness: 0.3,
            bevelSize: 0.2,
            bevelSegments: 4
        };

        // 3. Build Meshes

        // Left Frame
        const leftFrameGeo = new THREE.ExtrudeGeometry(frameOuterShape, extrudeSettings);
        const leftFrame = new THREE.Mesh(leftFrameGeo, frameMaterial);
        leftFrame.position.set(-w / 2 - 1.5, 0, 0); // Offset Left

        // Left Lens
        const lensGeo = new THREE.ShapeGeometry(lensShape);
        const leftLens = new THREE.Mesh(lensGeo, lensMaterial);
        leftLens.position.set(-w / 2 - 1.5, 0, 0.2); // Centered in frame, slightly front z

        // Right Frame
        const rightFrame = leftFrame.clone();
        rightFrame.position.set(w / 2 + 1.5, 0, 0); // Offset Right (symmetric)
        // Need to mirror? For this shape, it's symmetric roughly, but technically "outer" side is different.
        // Our shape is symmetric so clone is fine.

        // Right Lens
        const rightLens = leftLens.clone();
        rightLens.position.set(w / 2 + 1.5, 0, 0.2);

        // Bridge
        const bridgeGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.5, 0); // A bit high up

        // Temples (Little gold hints at edges)
        const hingeGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
        const leftHinge = new THREE.Mesh(hingeGeo, goldMaterial);
        leftHinge.position.set(-w - 2.5, 1, -0.5);

        const rightHinge = new THREE.Mesh(hingeGeo, goldMaterial);
        rightHinge.position.set(w + 2.5, 1, -0.5);

        // Add all to group
        this.glasses.add(leftFrame, rightFrame, leftLens, rightLens, bridge, leftHinge, rightHinge);

        // Initial Scale
        this.glasses.scale.set(0.1, 0.1, 0.1);
    }

    resize(width, height) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    update(landmarks) {
        if (landmarks && landmarks.length > 0) {
            if (!this.glasses.visible) this.glasses.visible = true;

            // MediaPipe Landmarks (478 points)
            // Nose tip: 1
            // Left Eye Outer: 33
            // Right Eye Outer: 263

            const nose = landmarks[0][1]; // Tip of nose
            const leftEye = landmarks[0][33];
            const rightEye = landmarks[0][263];

            // Calculate 3D position in Three.js world
            // Helper to map Normalized Coords (0-1) to World Coords
            const vector = new THREE.Vector3(
                (nose.x * 2 - 1) * -1, // Flip X ? Video is mirrored via CSS, but check standard
                (nose.y * 2 - 1) * -1,
                -nose.z // Z needs depth info
            );

            // Projection Unproject is complex without depth calibration.
            // Simple 2D Overlay approach with estimated Z:
            // We will place object at fixed Z=-50 and map x/y using camera FOV

            // Better approach for VTO:
            // Use the distance between eyes to scale only.
            // Use the nose position to translate.
            // Use eye angle to rotate.

            const width = this.canvas.width;
            const height = this.canvas.height;

            // 1. Position (Nose Bridge - roughly between eyes)
            // Point 6 is between eyes. Point 168 is also distinct.
            // Let's use 168 (midpoint between eyes) for position center.
            const anchor = landmarks[0][6];

            // Map normalized (0..1) to camera view space
            // For a perspective camera looking at Z=0? No.
            // Standard Hack:
            // Move object in front of camera at fixed distance dist.
            // x = (normX - 0.5) * width_at_dist

            const dist = 50; // Arbitrary distance from camera
            const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
            const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
            const visibleWidth = visibleHeight * this.camera.aspect;

            const x = (anchor.x - 0.5) * visibleWidth; // Inverted logic for Mirrored Canvas
            const y = (0.5 - anchor.y) * visibleHeight;
            const z = -dist;

            this.glasses.position.set(x, y, z);

            // 2. Scale (Inter-pupillary distance)
            const dx = (rightEye.x - leftEye.x);
            const dy = (rightEye.y - leftEye.y);
            const d = Math.sqrt(dx * dx + dy * dy);

            // Scale factor tuning
            const baseScale = visibleWidth * d;
            // Reduced multiplier from 0.15 to 0.13 to fit strictly within face width
            const glassScale = baseScale * 0.13;

            this.glasses.scale.set(glassScale, glassScale, glassScale);

            // 3. Rotation (Roll)
            const angle = Math.atan2(dy, dx);
            this.glasses.rotation.z = -angle; // Negate angle for mirrored rotation 

            // Yaw/Pitch: Using landmarks 4 (nose tip) and 6 (mid eyes)? 
            // For simple "2.5D" Try On, Z rotation is plenty.

        } else {
            this.glasses.visible = false;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
