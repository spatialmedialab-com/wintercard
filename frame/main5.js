import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 0; // Set camera position

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = false; // Do not allow panning
controls.minDistance = 1; // Minimum zoom distance
controls.maxDistance = 10; // Maximum zoom distance

// Create the geometry for all tori
const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 48);

// Create an array to hold tori and their materials
const tori = [];
const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff];
const initialZ = camera.position.z - .25; // Start at the camera position
const totalDistance = 5.5; // Total distance for the loop
const speed = 0.15; // units per second
const numTori = colors.length;
const interval = (totalDistance / numTori) / speed * 1000; // Interval in milliseconds
const loopDuration = totalDistance / speed; // Total duration for one loop
const dissolveDuration = 15; // Duration of the dissolve effect in seconds

// Variable for velocity
const velocity = .5; // Adjust as needed

// Function to create and add a torus to the scene
function createTorus(color, delay) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 0, initialZ); // Set initial position along z-axis
    torus.scale.set(1, 1, 1); // Initial scale
    tori.push({ torus, delay });
}

// Create tori with different colors and equal delays
colors.forEach((color, index) => {
    createTorus(color, index * interval);
});

// Add tori to the scene at the correct time
function addToriToScene(currentTime) {
    tori.forEach(({ torus, delay }) => {
        if (currentTime >= delay && !torus.added) {
            scene.add(torus);
            torus.added = true;
            torus.startTime = delay;
        }
    });
}

// Animation function
function animate(currentTime) {
    // Calculate delta time
    const delta = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Add tori to the scene
    addToriToScene(currentTime);

    // Animate all tori
    tori.forEach(({ torus, delay }) => {
        if (torus.added) {
            const elapsed = (currentTime - delay) / 1000; // Convert to seconds
            const cycleTime = elapsed % loopDuration; // Time elapsed in one loop cycle

            // Calculate z position based on time and velocity
            const z = initialZ - (cycleTime / loopDuration) * totalDistance * velocity;
            torus.position.z = z;

            // Calculate opacity based on position in the loop
            if (cycleTime >= loopDuration - dissolveDuration) {
                torus.material.opacity = 1 - (cycleTime - (loopDuration - dissolveDuration)) / dissolveDuration;
            } else {
                torus.material.opacity = 1;
            }

            // Calculate scale based on position in the loop
            const scale = 1 - (cycleTime / loopDuration / 2.5);
            torus.scale.set(scale, scale, scale);

            // Reset scale when repositioning
            if (z <= initialZ - totalDistance) {
                torus.scale.set(1, 1, 1);
            }
        }
    });

    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

// Initialize lastTime
let lastTime = performance.now();

// Start the animation loop
animate(lastTime);
