// ===================================
//          MODULE IMPORTS
// ===================================
import * as THREE from 'three';
import { OrbitControls } = 'three/addons/controls/OrbitControls.js';

// ===================================
//      SCENE, CAMERA, RENDERER
// ===================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Deep space black

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000); // Increased far clipping plane for larger solar system
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement);

// ===================================
//          CAMERA CONTROLS
// ===================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // Prevents panning into the scene
controls.maxDistance = 2000; // Limit how far out the user can zoom
controls.minDistance = 15; // Limit how close the user can zoom (to avoid clipping through sun)

// Set initial camera position
camera.position.set(0, 200, 400); // Adjusted initial camera position for wider view
controls.update(); // Update controls after setting camera position

// ===================================
//             LIGHTING
// ===================================
// Ambient light to ensure all objects are slightly visible
const ambientLight = new THREE.AmbientLight(0x333333, 0.2); // Reduced intensity further
scene.add(ambientLight);

// Point light for the Sun
const sunLight = new THREE.PointLight(0xffffff, 2, 0); // White light, intensity 2, no decay
sunLight.position.set(0, 0, 0); // Position at the center
sunLight.castShadow = true; // Enable shadow casting from the sun
sunLight.shadow.mapSize.width = 4096; // Very high resolution for shadows
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.1; // Adjust shadow camera frustum
sunLight.shadow.camera.far = 1500; // Increased far for shadows
scene.add(sunLight);

// ===================================
//             TEXTURES
// ===================================
const textureLoader = new THREE.TextureLoader();

// Function to load textures with a fallback for missing ones
const loadTexture = (url, fallbackColor = 0x888888) => {
    return textureLoader.load(url,
        (texture) => { /* On load */ },
        (xhr) => { /* On progress */ },
        (error) => {
            console.warn(`Failed to load texture from ${url}. Using fallback color.`, error);
            // Create a 1x1 pixel texture with the fallback color
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = `#${new THREE.Color(fallbackColor).getHexString()}`;
            ctx.fillRect(0, 0, 1, 1);
            return new THREE.CanvasTexture(canvas);
        }
    );
};

// Sun Texture (emissive, as sun is a light source)
const sunTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_sun.jpg');

// Earth Textures
const earthDayTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_daymap.jpg');
const earthCloudsTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_clouds.jpg');
const earthNormalMap = loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_normal_map.jpg');
const earthSpecularMap = loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_specular_map.jpg');
const earthNightTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_earth_nightmap.jpg');

// Moon Texture
const moonTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_moon.jpg');
const moonNormalMap = loadTexture('https://www.solarsystemscope.com/textures/download/8k_moon_normal_map.jpg');

// Planet Textures (using 8k where available, otherwise 4k or placeholders)
const mercuryTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_mercury.jpg');
const venusDayTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_venus_surface.jpg');
const venusCloudsTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_venus_atmosphere.jpg');
const marsTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_mars.jpg');
const jupiterTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_jupiter.jpg');
const saturnTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_saturn.jpg');
const saturnRingTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_saturn_ring_alpha.png');
const uranusTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_uranus.jpg');
const neptuneTexture = loadTexture('https://www.solarsystemscope.com/textures/download/8k_neptune.jpg');


// ===================================
//             CELESTIAL BODIES DATA
// ===================================
// Define properties for each planet (scaled for visual representation)
const planetsData = [
    {
        name: "Mercury",
        size: 3, // Scaled size
        distance: 50, // Scaled distance from Sun
        orbitalPeriod: 0.24, // Earth years
        rotationPeriod: 58.6, // Earth days
        axialTilt: 0.03, // degrees
        texture: mercuryTexture,
        color: 0xAAAAAA // Fallback color
    },
    {
        name: "Venus",
        size: 4.8,
        distance: 80,
        orbitalPeriod: 0.62,
        rotationPeriod: -243, // Retrograde rotation
        axialTilt: 177.3,
        texture: venusDayTexture,
        cloudsTexture: venusCloudsTexture,
        color: 0xFFAAAA
    },
    {
        name: "Earth",
        size: 5,
        distance: 120,
        orbitalPeriod: 1,
        rotationPeriod: 1,
        axialTilt: 23.5,
        texture: earthDayTexture,
        cloudsTexture: earthCloudsTexture,
        normalMap: earthNormalMap,
        specularMap: earthSpecularMap,
        nightTexture: earthNightTexture,
        color: 0x0000FF
    },
    {
        name: "Mars",
        size: 3.5,
        distance: 180,
        orbitalPeriod: 1.88,
        rotationPeriod: 1.03,
        axialTilt: 25.2,
        texture: marsTexture,
        color: 0xFF0000
    },
    {
        name: "Jupiter",
        size: 25, // Much larger
        distance: 300,
        orbitalPeriod: 11.86,
        rotationPeriod: 0.41,
        axialTilt: 3.1,
        texture: jupiterTexture,
        color: 0xFFA500
    },
    {
        name: "Saturn",
        size: 20,
        distance: 450,
        orbitalPeriod: 29.46,
        rotationPeriod: 0.44,
        axialTilt: 26.7,
        texture: saturnTexture,
        ringTexture: saturnRingTexture,
        ringInnerRadius: 25,
        ringOuterRadius: 40,
        color: 0xFFD700
    },
    {
        name: "Uranus",
        size: 18,
        distance: 600,
        orbitalPeriod: 84.01,
        rotationPeriod: -0.72, // Retrograde rotation
        axialTilt: 97.8,
        texture: uranusTexture,
        color: 0xADD8E6
    },
    {
        name: "Neptune",
        size: 17,
        distance: 750,
        orbitalPeriod: 164.79,
        rotationPeriod: 0.67,
        axialTilt: 28.3,
        texture: neptuneTexture,
        color: 0x00008B
    }
];

const planets = []; // Array to store all planet objects for animation

// ===================================
//             CELESTIAL BODIES CREATION
// ===================================

// --- Sun ---
const sunGeometry = new THREE.SphereGeometry(20, 64, 64); // Larger sun
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); // Use texture for basic material
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add a light source directly to the sun to make it appear glowing
const sunGlowLight = new THREE.PointLight(0xffaa00, 3, 0); // Orange-yellow glow, higher intensity
sun.add(sunGlowLight);

// Sun Corona/Flare Effect (using a SpriteMaterial for a soft glow)
const coronaMaterial = new THREE.SpriteMaterial({
    map: loadTexture('https://placehold.co/128x128/FFD700/000000?text=Corona'), // A simple yellow circle for corona
    color: 0xFFD700, // Gold color
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.5,
});
const corona = new THREE.Sprite(coronaMaterial);
corona.scale.set(50, 50, 1); // Scale larger than the sun
sun.add(corona);

// --- Planets ---
planetsData.forEach(data => {
    const planetOrbit = new THREE.Group();
    scene.add(planetOrbit);

    const planetGeometry = new THREE.SphereGeometry(data.size, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: data.texture,
        normalMap: data.normalMap || null, // Use normal map if available
        specularMap: data.specularMap || null, // Use specular map if available
        roughness: 0.7,
        metalness: 0.1,
        normalScale: new THREE.Vector2(1, 1) // Default normal map intensity
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.x = data.distance;
    planet.receiveShadow = true;
    planet.castShadow = true;
    planetOrbit.add(planet);

    // Add clouds if specified
    if (data.cloudsTexture) {
        const cloudsGeometry = new THREE.SphereGeometry(data.size * 1.02, 64, 64); // Slightly larger than planet
        const cloudsMaterial = new THREE.MeshStandardMaterial({
            map: data.cloudsTexture,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            roughness: 1,
            metalness: 0
        });
        const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        planet.add(clouds);
        data.cloudsMesh = clouds; // Store reference for animation
    }

    // Add night lights for Earth
    if (data.nightTexture) {
        const nightLightsGeometry = new THREE.SphereGeometry(data.size * 1.01, 64, 64); // Slightly larger than planet surface
        const nightLightsMaterial = new THREE.MeshBasicMaterial({
            map: data.nightTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.9
        });
        const nightLights = new THREE.Mesh(nightLightsGeometry, nightLightsMaterial);
        planet.add(nightLights);
        data.nightLightsMesh = nightLights; // Store reference for animation
    }

    // Add rings for Saturn
    if (data.name === "Saturn" && data.ringTexture) {
        const ringGeometry = new THREE.RingGeometry(data.ringInnerRadius, data.ringOuterRadius, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: data.ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2; // Tilt rings to align with axial tilt
        planet.add(rings);
    }

    // Add Moon for Earth
    if (data.name === "Earth") {
        const moonOrbit = new THREE.Group();
        planet.add(moonOrbit);

        const moonGeometry = new THREE.SphereGeometry(1.5, 32, 32); // Larger Moon
        const moonMaterial = new THREE.MeshStandardMaterial({
            map: moonTexture,
            normalMap: moonNormalMap, // Add normal map
            roughness: 0.9,
            metalness: 0,
            normalScale: new THREE.Vector2(0.5, 0.5) // Adjust normal map intensity
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.x = 15; // Further distance from Earth
        moon.receiveShadow = true;
        moon.castShadow = true;
        moonOrbit.add(moon);
        data.moon = { mesh: moon, orbitGroup: moonOrbit }; // Store moon reference
    }

    planets.push({
        mesh: planet,
        orbitGroup: planetOrbit,
        data: data
    });
});


// ===================================
//             ORBITAL PATHS
// ===================================
// Function to create an orbital path
const createOrbitPath = (radius, color = 0x444444) => {
    const points = [];
    for (let i = 0; i <= 128; i++) { // More segments for smoother path
        const angle = (i / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 }); // Fainter paths
    return new THREE.LineLoop(geometry, material);
};

planetsData.forEach(data => {
    const orbitPath = createOrbitPath(data.distance, data.color);
    scene.add(orbitPath);

    // Add moon path if it's Earth
    if (data.name === "Earth") {
        const moonPath = createOrbitPath(15, 0xcccccc); // Moon's orbit radius relative to Earth
        planets.find(p => p.data.name === "Earth").mesh.add(moonPath);
    }
});


// ===================================
//             STARFIELD (Skybox)
// ===================================
// Using procedural stars for a more dynamic look
const starsCount = 50000;
const starsVertices = [];
for (let i = 0; i < starsCount; i++) {
    const x = (Math.random() - 0.5) * 4000;
    const y = (Math.random() - 0.5) * 4000;
    const z = (Math.random() - 0.5) * 4000;
    starsVertices.push(x, y, z);
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.7 });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);


// ===================================
//          ANIMATION LOOP
// ===================================
const animate = () => {
    requestAnimationFrame(animate);

    // Update controls for smooth damping
    controls.update();

    // Sun rotation (self-rotation)
    sun.rotation.y += 0.0005; // Slower sun rotation

    // Animate each planet
    planets.forEach(p => {
        const { mesh, orbitGroup, data } = p;

        // Apply axial tilt
        mesh.rotation.x = data.axialTilt * Math.PI / 180;
        if (data.cloudsMesh) data.cloudsMesh.rotation.x = data.axialTilt * Math.PI / 180;
        if (data.nightLightsMesh) data.nightLightsMesh.rotation.x = data.axialTilt * Math.PI / 180;

        // Planet's orbit around the Sun
        orbitGroup.rotation.y += (0.005 / data.orbitalPeriod); // Speed relative to orbital period

        // Planet's self-rotation
        mesh.rotation.y += (0.05 / data.rotationPeriod); // Speed relative to rotation period

        // Clouds rotation (slightly faster than planet's surface)
        if (data.cloudsMesh) data.cloudsMesh.rotation.y += (0.05 / data.rotationPeriod) * 0.9;

        // Animate Moon for Earth
        if (data.name === "Earth" && data.moon) {
            // Moon's orbit around the Earth (approx. 27.3 days)
            data.moon.orbitGroup.rotation.y += 0.02; // Fixed speed for moon orbit

            // Moon's self-rotation (tidally locked)
            data.moon.mesh.rotation.y += 0.005; // Fixed speed for moon self-rotation
        }
    });

    // Render the scene
    renderer.render(scene, camera);
};

// ===================================
//          EVENT LISTENERS
// ===================================
// Handle window resizing to keep the aspect ratio correct
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop when the window loads
window.onload = function() {
    animate();
};
