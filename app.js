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
                requiredFeatures: ['local', 'hit-test']
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

    // Initial position of the product (start a bit off the center)
    mesh.position.set(0, 0, -2); 

    // Add hit-test listener
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    session.requestReferenceSpace('local').then((referenceSpace) => {
        // Handle hit test
        session.addEventListener('select', (event) => {
            if (hitTestSource) {
                // Update position of the product based on hit-test result
                const hitMatrix = hitTestSource.getHitTestResults(event.inputSource);
                if (hitMatrix) {
                    mesh.position.set(hitMatrix[0].position.x, hitMatrix[0].position.y, hitMatrix[0].position.z);
                }
            }
        });
    });

    // Function to handle animation and rendering
    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // Handling hit-test in the AR world
    session.requestHitTestSource({ source: session.inputSources[0] }).then((source) => {
        hitTestSource = source;
        hitTestSourceRequested = true;
    });

    // Handle the end of the session
    session.addEventListener('end', () => {
        // Optionally reset position or handle cleanup here
        hitTestSource = null;
    });
}