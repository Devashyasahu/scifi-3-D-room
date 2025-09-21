 // ===================================
//          MODULE IMPORTS
// ===================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===================================
//      SCENE, CAMERA, RENDERER
// ===================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000); // Far for full solar system view
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ===================================
//          CAMERA CONTROLS
// ===================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxDistance = 2000;
controls.minDistance = 15;
camera.position.set(0, 200, 400);
controls.update();

// ===================================
//             LIGHTING
// ===================================
const ambientLight = new THREE.AmbientLight(0x333333, 0.2);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 0);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
scene.add(sunLight);

// ===================================
//             TEXTURES
// ===================================
const textureLoader = new THREE.TextureLoader();
function loadTexture(url, fallbackColor = 0x888888) {
    return textureLoader.load(
        url,
        undefined,
        undefined,
        () => {
            // fallback: 1x1 color canvas
            const cvs = document.createElement('canvas');
            cvs.width = cvs.height = 1;
            const ctx = cvs.getContext('2d');
            ctx.fillStyle = '#' + new THREE.Color(fallbackColor).getHexString();
            ctx.fillRect(0, 0, 1, 1);
            return new THREE.CanvasTexture(cvs);
        }
    );
}

// ===================================
//      PLANET DATA AND SUN
// ===================================
const planetParams = [
    {
        name: "Mercury",
        size: 2,
        distance: 40,
        color: 0xaaaaaa,
        orbitSpeed: 0.008,
        rotationSpeed: 0.018,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_mercury.jpg')
    },
    {
        name: "Venus",
        size: 3,
        distance: 65,
        color: 0xffcccc,
        orbitSpeed: 0.007,
        rotationSpeed: 0.008,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_venus_surface.jpg')
    },
    {
        name: "Earth",
        size: 3.5,
        distance: 100,
        color: 0x3399ff,
        orbitSpeed: 0.006,
        rotationSpeed: 0.016,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_daymap.jpg')
    },
    {
        name: "Mars",
        size: 3,
        distance: 125,
        color: 0xff5500,
        orbitSpeed: 0.005,
        rotationSpeed: 0.014,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_mars.jpg')
    },
    {
        name: "Jupiter",
        size: 10,
        distance: 170,
        color: 0xe3b679,
        orbitSpeed: 0.0025,
        rotationSpeed: 0.03,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_jupiter.jpg')
    },
    {
        name: "Saturn",
        size: 8,
        distance: 210,
        color: 0xf6e289,
        orbitSpeed: 0.0018,
        rotationSpeed: 0.025,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_saturn.jpg'),
        // We'll add rings below
    },
    {
        name: "Uranus",
        size: 6,
        distance: 255,
        color: 0x00eaff,
        orbitSpeed: 0.0009,
        rotationSpeed: 0.019,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_uranus.jpg')
    },
    {
        name: "Neptune",
        size: 6,
        distance: 295,
        color: 0x1a06aa,
        orbitSpeed: 0.0007,
        rotationSpeed: 0.017,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_neptune.jpg')
    },
    {
        name: "Pluto",
        size: 1,
        distance: 335,
        color: 0xc8d1ff,
        orbitSpeed: 0.0005,
        rotationSpeed: 0.012,
        texture: loadTexture('https://www.solarsystemscope.com/textures/download/8k_pluto.jpg')
    }
];
const planetGroups = [];

// ===================================
//         SUN CREATION
// ===================================
const sunGeometry = new THREE.SphereGeometry(18, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: loadTexture('https://www.solarsystemscope.com/textures/download/8k_sun.jpg')
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunGlowLight = new THREE.PointLight(0xffaa00, 3, 0);
sun.add(sunGlowLight);

// ===================================
//          PLANET CREATION
// ===================================
planetParams.forEach((p, idx) => {
    // Orbit group allows us to rotate the entire orbit
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Orbit circle (visual)
    const orbitPath = (() => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(p.distance * Math.cos(angle), 0, p.distance * Math.sin(angle)));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: p.color, opacity: 0.2, transparent: true });
        return new THREE.LineLoop(geom, mat);
    })();
    scene.add(orbitPath);

    // Sphere
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 64, 64),
        new THREE.MeshStandardMaterial({ map: p.texture, color: p.color, roughness: 0.7, metalness: 0.1 })
    );
    planet.position.x = p.distance;
    planet.castShadow = planet.receiveShadow = true;

    // Saturn's rings
    if (p.name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(p.size + 2, p.size + 7, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: loadTexture('https://www.solarsystemscope.com/textures/download/8k_saturn_ring_alpha.png'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 0;
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    orbitGroup.add(planet);

    planetGroups.push({
        mesh: planet,
        orbitGroup: orbitGroup,
        params: p,
        angle: idx * Math.PI / 4 // stagger planet start locations
    });
});

// ===================================
//        STARFIELD (PROCEDURAL)
// ===================================
const starsCount = 30000;
const starsVertices = [];
for (let i = 0; i < starsCount; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = (Math.random() - 0.5) * 3000;
    const z = (Math.random() - 0.5) * 3000;
    starsVertices.push(x, y, z);
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.7 });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// ===================================
//            ANIMATION LOOP
// ===================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Sun rotation
    sun.rotation.y += 0.0004;

    // Animate all planets
    planetGroups.forEach(pg => {
        pg.angle += pg.params.orbitSpeed;
        pg.orbitGroup.rotation.y = pg.angle;
        pg.mesh.rotation.y += pg.params.rotationSpeed * 0.03;
    });

    renderer.render(scene, camera);
}

// ===================================
//            EVENT LISTENER
// ===================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
