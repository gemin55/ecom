// Ensure WebXR is available and AR is supported
if ('xr' in navigator) {
    console.log('WebXR is available.');
} else {
    alert('WebXR is not supported in this browser.');
}

document.getElementById('start-ar-btn').addEventListener('click', startAR);

async function startAR() {
    if (navigator.xr) {
        try {
             // Hide content when AR session starts
             document.getElementById('content').style.display = 'none';

             // Check if immersive-ar session is supported
             const supportedFeatures = await navigator.xr.isSessionSupported('immersive-ar');
             if (!supportedFeatures) {
                 alert('AR is not supported on your device.');
                 return;
             }

            // Request AR session
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local']
            });

            session.addEventListener('end', onARSessionEnd);

            // Set up AR environment (Three.js)
            setupARScene(session);
        } catch (e) {
            console.error('Error starting AR session: ', e);
            alert('Could not start AR session.');
        }
    } else {
        alert('AR is not supported on your device/browser.');
    }
}

function onARSessionEnd() {
    // Show content again when AR session ends
    document.getElementById('content').style.display = 'block';
}

// Three.js setup for AR
function setupARScene(session) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load your product image as a 3D texture or object
    const texture = new THREE.TextureLoader().load('assets/jew.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Create a plane geometry to display the image in AR
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Set the camera position
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}
