// ===================================
//          MODULE IMPORTS
// ===================================
// Import the core Three.js library and all necessary add-ons
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// Note: CapsuleGeometry is not available in this version, using CylinderGeometry instead


// ===================================
//      SCENE, CAMERA, RENDERER
// ===================================
// The scene is the container for all 3D objects
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010A10);

// The camera determines our viewpoint
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// The renderer draws the scene onto the HTML canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);


// ===================================
//          CAMERA CONTROLS
// ===================================
// Allows moving the camera with the mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Increased Camera Sensitivity
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 2.0;
controls.panSpeed = 2.0;


// ===================================
//         MATERIALS & COLORS
// ===================================
// Define reusable materials for a consistent look
const neonColor = 0x03e9f4;
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.2, roughness: 0.6 });
const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.7 });
const emissiveMaterial = new THREE.MeshBasicMaterial({ color: neonColor });


// ===================================
//           ROOM GEOMETRY
// ===================================
// A function to create walls with decorative panels
const roomSize = { width: 22, height: 12, depth: 22 };
function createWall(width, height, material) {
    const wall = new THREE.Group();
    const baseWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.2), material);
    wall.add(baseWall);
    for (let i = 0; i < 5; i++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.15, height, 0.25), panelMaterial);
        panel.position.x = -width / 2 + (i * width * 0.25) + (width * 0.125);
        wall.add(panel);
    }
    return wall;
}

const floor = new THREE.Mesh(new THREE.BoxGeometry(roomSize.width, 0.2, roomSize.depth), floorMaterial);
floor.position.y = -roomSize.height / 2;
scene.add(floor);

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomSize.width, 0.2, roomSize.depth), wallMaterial);
ceiling.position.y = roomSize.height / 2;
scene.add(ceiling);

const backWall = createWall(roomSize.width, roomSize.height, wallMaterial);
backWall.position.z = -roomSize.depth / 2;
scene.add(backWall);

const leftWall = createWall(roomSize.depth, roomSize.height, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -roomSize.width / 2;
scene.add(leftWall);

const rightWall = createWall(roomSize.depth, roomSize.height, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = roomSize.width / 2;
scene.add(rightWall);


// ===================================
//            WORKSTATION
// ===================================
// A group to hold the desk, monitors, and chair together
const workstation = new THREE.Group();

// --- Desk ---
const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.22, 3), new THREE.MeshStandardMaterial({ color: 0x222328, roughness: 0.33 }));
desk.position.set(0, -2.5, -7);
workstation.add(desk);

// --- Realistic Keyboard and Mouse ---
const keyboard = new THREE.Group();
const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.4 });
const keyboardBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.6), keyboardMaterial);
keyboard.add(keyboardBody);
const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.1 * 0.9, 0.05, 0.1 * 0.9), keyMaterial);
        key.position.set(-0.8 + col * (0.1 * 1.1), 0.05, -0.2 + row * (0.1 * 1.2));
        keyboard.add(key);
    }
}
const keyboardLight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.02, 0.02), emissiveMaterial);
keyboardLight.position.z = 0.3;
keyboard.add(keyboardLight);
keyboard.position.set(0, -2.38, -6.5);
keyboard.rotation.x = 0.1;
workstation.add(keyboard);

const mouse = new THREE.Group();
const mouseBody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), keyboardMaterial);
mouseBody.scale.set(1, 0.5, 1.5);
mouse.add(mouseBody);
mouse.position.set(1.3, -2.4, -6.5);
workstation.add(mouse);


// --- Main Monitor with Animated Matrix Rain ---
const matrixCanvas = document.createElement('canvas');
matrixCanvas.width = 512;
matrixCanvas.height = 256;
const mtxCtx = matrixCanvas.getContext('2d');
const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const mColumns = Math.floor(matrixCanvas.width / 14);
const mDrops = [];
for (let i = 0; i < mColumns; i++) {
    mDrops[i] = { y: Math.floor(Math.random() * matrixCanvas.height), speed: Math.random() * 3 + 1.5 };
}
const matrixTexture = new THREE.CanvasTexture(matrixCanvas);
matrixTexture.minFilter = THREE.LinearFilter;
const matrixMaterial = new THREE.MeshBasicMaterial({ map: matrixTexture, toneMapped: false });
const mainMonitor = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2), matrixMaterial);
mainMonitor.position.set(0, -0.5, -8.4);
workstation.add(mainMonitor);

function animateMatrixRain() {
    mtxCtx.fillStyle = 'rgba(3, 15, 8, 0.18)';
    mtxCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mtxCtx.font = 'bold 16px monospace';
    for (let i = 0; i < mDrops.length; i++) {
        const drop = mDrops[i];
        const mainChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        mtxCtx.fillStyle = '#c2fff6';
        mtxCtx.fillText(mainChar, i * 14, drop.y);
        mtxCtx.fillStyle = '#39ff14';
        mtxCtx.fillText(mainChar, i * 14, drop.y - 17);
        drop.y += drop.speed;
        if (drop.y > matrixCanvas.height + 80 && Math.random() > 0.96) drop.y = 0;
    }
    matrixTexture.needsUpdate = true;
    requestAnimationFrame(animateMatrixRain);
}
animateMatrixRain();


// --- Side Monitor with Scrolling Code Output ---
const sideCanvas = document.createElement('canvas');
sideCanvas.width = 256;
sideCanvas.height = 190;
const sideCtx = sideCanvas.getContext('2d');
const codeTexture = new THREE.CanvasTexture(sideCanvas);
codeTexture.minFilter = THREE.LinearFilter;
const codeMaterial = new THREE.MeshBasicMaterial({ map: codeTexture, toneMapped: false });
const sideMonitor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), codeMaterial);
sideMonitor.position.set(2.5, -0.75, -8.3);
workstation.add(sideMonitor);

const codeLines = ["def fib(n):", "    a, b = 0, 1", "    while a < n:", "        print(a)", "        a, b = b, a+b", "", "fib(10)", "", "[OK] Script finished."];
let codeScroll = 0;
function animateCodeOutput() {
    sideCtx.fillStyle = "#021410";
    sideCtx.fillRect(0, 0, sideCanvas.width, sideCanvas.height);
    sideCtx.font = "16px monospace";
    sideCtx.fillStyle = "#4cf19a";
    for (let i = 0; i < 9; i++) {
        let idx = (codeScroll + i) % codeLines.length;
        sideCtx.fillText(codeLines[idx], 14, 24 + i * 19);
    }
    setTimeout(() => {
        codeScroll = (codeScroll + 1) % codeLines.length;
        codeTexture.needsUpdate = true;
        animateCodeOutput();
    }, 800);
}
animateCodeOutput();


// --- High-Detail, Realistic Office Chair with More Detailed Person ---
const officeChair = new THREE.Group();
const chairBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.6 });
const chairBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.5, metalness: 0.5 });
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.4 });
const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.2, metalness: 0.8 });
const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.3, 32), chairBaseMaterial);
baseCenter.position.y = -0.5;
officeChair.add(baseCenter);
for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), chairBaseMaterial);
    leg.position.set(Math.cos(angle) * 0.4, -0.5, Math.sin(angle) * 0.4);
    leg.rotation.y = -angle;
    officeChair.add(leg);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 16, 32), wheelMaterial);
    wheel.position.set(Math.cos(angle) * 0.8, -0.55, Math.sin(angle) * 0.8);
    officeChair.add(wheel);
}
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 32), stemMaterial);
stem.position.y = -0.2;
officeChair.add(stem);
const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), chairBodyMaterial);
seatCushion.position.y = 0.1;
officeChair.add(seatCushion);
const backrest = new THREE.Group();
const mainBack = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.15), chairBodyMaterial);
mainBack.position.y = 1;
mainBack.rotation.x = 0.1;
backrest.add(mainBack);
const leftBolster = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.2), chairBodyMaterial);
leftBolster.position.set(-0.6, 1, 0.1);
leftBolster.rotation.y = -0.2;
backrest.add(leftBolster);
const rightBolster = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.2), chairBodyMaterial);
rightBolster.position.set(0.6, 1, 0.1);
rightBolster.rotation.y = 0.2;
backrest.add(rightBolster);
backrest.position.z = -0.6;
officeChair.add(backrest);
for (let side of [-1, 1]) {
    const armrest = new THREE.Group();
    const armVertical = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), chairBaseMaterial);
    armVertical.position.set(side * 0.7, 0.35, 0);
    armrest.add(armVertical);
    const armHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.6), chairBodyMaterial);
    armHorizontal.position.set(side * 0.7, 0.6, -0.2);
    armrest.add(armHorizontal);
    officeChair.add(armrest);
}
const person = new THREE.Group();
const clothingMaterial = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.8 });
const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2a24, roughness: 0.7 });
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), clothingMaterial);
torso.position.y = 0.6;
torso.rotation.x = 0.2;
person.add(torso);
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), skinMaterial);
neck.position.y = 1.1;
person.add(neck);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 16), skinMaterial);
head.position.y = 1.3;
head.name = "person_head";
person.add(head);
const hood = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), clothingMaterial);
hood.position.y = 1.2;
hood.position.z = -0.1;
hood.rotation.x = -Math.PI / 2;
person.add(hood);
for (let side of [-1, 1]) {
    const leg = new THREE.Group();
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16), clothingMaterial);
    upperLeg.position.y = -0.25;
    leg.add(upperLeg);
    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 16), clothingMaterial);
    lowerLeg.position.y = -0.7;
    lowerLeg.position.z = 0.4;
    leg.add(lowerLeg);
    leg.position.set(side * 0.2, 0.2, 0);
    leg.rotation.x = -Math.PI / 2;
    person.add(leg);
    const arm = new THREE.Group();
    arm.name = side === -1 ? "left_arm" : "right_arm";
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16), clothingMaterial);
    upperArm.position.y = -0.2;
    arm.add(upperArm);
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), clothingMaterial);
    lowerArm.position.y = -0.6;
    lowerArm.position.z = 0.3;
    lowerArm.rotation.x = 0.5;
    arm.add(lowerArm);
    arm.position.set(side * 0.4, 0.8, 0.2);
    arm.rotation.z = side * -0.5;
    arm.rotation.x = 0.8;
    person.add(arm);
}
person.position.set(0, 0.2, 0.1);
officeChair.add(person);

// Final scale and placement for the chair
officeChair.scale.set(1.7, 1.7, 1.7);
officeChair.position.set(-0.7, -5.4, -5.6);
officeChair.rotation.y = Math.PI;
workstation.add(officeChair);

// Center the workstation
workstation.position.x = 0;
scene.add(workstation);


// ===================================
//         DOORWAY & WINDOW
// ===================================
const doorFrame = new THREE.Group();
const doorLightTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 0.1), emissiveMaterial);
const doorLightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6, 0.1), emissiveMaterial);
const doorLightRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6, 0.1), emissiveMaterial);
doorLightTop.position.y = 3;
doorLightLeft.position.x = -1.5;
doorLightRight.position.x = 1.5;
doorFrame.add(doorLightTop, doorLightLeft, doorLightRight);
doorFrame.position.set(-8, -2, 2);
scene.add(doorFrame);

const shape = new THREE.Shape();
const r = 2;
shape.moveTo(r, 0);
for (let i = 1; i <= 8; i++) {
    const theta = (i / 8) * Math.PI * 2;
    shape.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
}
const windowHole = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0x000000 }));
windowHole.position.set(-5, 1, -roomSize.depth / 2 + 0.2);
scene.add(windowHole);
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 500; i++) {
    const x = -5 + (Math.random() - 0.5) * 8;
    const y = 1 + (Math.random() - 0.5) * 8;
    const z = -roomSize.depth / 2 - 2;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.03 }));
scene.add(stars);


// ===================================
//        DECORATIVE LIGHTING
// ===================================
const ringLight = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1, 16, 100), emissiveMaterial);
ringLight.rotation.x = Math.PI / 2;
ringLight.position.set(0, roomSize.height / 2 - 0.3, -3);
scene.add(ringLight);
const floorLight1 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.05, 0.05), emissiveMaterial);
floorLight1.position.set(2, -roomSize.height / 2 + 0.1, 2);
scene.add(floorLight1);


// ===================================
//             SCENE LIGHTING
// ===================================
scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const monitorLight = new THREE.PointLight(neonColor, 100, 15);
monitorLight.position.set(0, -0.5, -7);
scene.add(monitorLight);


// ===================================
//         POST-PROCESSING (BLOOM)
// ===================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.05;
bloomPass.strength = 1.3;
bloomPass.radius = 0.6;
composer.addPass(bloomPass);


// ===================================
//        CAMERA & ANIMATION LOOP
// ===================================
camera.position.set(0, -1, 10);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const time = Date.now() * 0.002;
    const head = scene.getObjectByName("person_head");
    const leftArm = scene.getObjectByName("left_arm");
    const rightArm = scene.getObjectByName("right_arm");
    if (head) {
        head.rotation.y = Math.sin(time * 0.7) * 0.15;
        head.rotation.x = Math.sin(time * 1.1) * 0.08;
    }
    if (leftArm && rightArm) {
        leftArm.rotation.x = Math.sin(time * 10) * 0.05 + 0.8;
        rightArm.rotation.x = Math.cos(time * 10) * 0.05 + 0.8;
    }
    composer.render();
}
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
