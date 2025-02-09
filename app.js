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
            // Request AR session with camera and surface detection
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local', 'hit-test']
            });

            session.addEventListener('end', onARSessionEnd);

            // Set up the AR environment (camera feed + Three.js)
            setupARScene(session);
        } catch (e) {
            console.error('Error starting AR session: ', e);
            alert('Could not start AR session.');
        }
    } else {
        alert('WebXR is not supported on this device/browser.');
    }
}

function onARSessionEnd() {
    alert('AR session ended.');
    // Optionally, reset the view or display content again
    document.getElementById('content').style.display = 'block';
}

// Three.js setup for AR with camera feed
function setupARScene(session) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load product image as texture
    const texture = new THREE.TextureLoader().load('assets/jew.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Create plane geometry for the product
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Position the product in the AR space
    mesh.position.set(0, 0, -2); // Initially place it 2 units away from the camera

    // Create a hit-test source (for detecting surfaces)
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    // Setup camera feed
    session.requestReferenceSpace('local').then((referenceSpace) => {
        // Perform surface detection and place object on surfaces
        session.addEventListener('select', (event) => {
            if (hitTestSource) {
                // Update position of the product based on hit-test result
                const hitResults = hitTestSource.getHitTestResults(event.inputSource);
                if (hitResults.length > 0) {
                    const hitMatrix = hitResults[0];
                    mesh.position.set(hitMatrix.position.x, hitMatrix.position.y, hitMatrix.position.z);
                }
            }
        });
    });

    // Handle session start and animation
    session.requestHitTestSource({ source: session.inputSources[0] }).then((source) => {
        hitTestSource = source;
        hitTestSourceRequested = true;
    });

    // Handle rendering and animation of AR content
    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}

