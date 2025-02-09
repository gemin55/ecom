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
            // Start immersive AR session
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local', 'hit-test']
            });

            session.addEventListener('end', onARSessionEnd);

            // Set up AR environment (camera feed + Three.js)
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
    document.getElementById("ar-content").style.display = 'none';
}

// Three.js setup for AR camera feed and rendering
function setupARScene(session) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("ar-content").appendChild(renderer.domElement);

    // Load a product image as a texture (just an example)
    const texture = new THREE.TextureLoader().load('assets/jew.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Create a plane geometry for displaying the product
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Position the camera to start with
    camera.position.z = 5;

    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Add hit-test feature for surface detection
    setupHitTest(session, mesh);
}

function setupHitTest(session, mesh) {
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    session.requestReferenceSpace('local').then((referenceSpace) => {
        // Setup hit-test source for surface detection
        session.addEventListener('select', (event) => {
            if (hitTestSource) {
                const hitResults = hitTestSource.getHitTestResults(event.inputSource);
                if (hitResults.length > 0) {
                    const hitMatrix = hitResults[0];
                    mesh.position.set(hitMatrix.position.x, hitMatrix.position.y, hitMatrix.position.z);
                }
            }
        });
    });

    // Request hit-test source
    session.requestHitTestSource({ source: session.inputSources[0] }).then((source) => {
        hitTestSource = source;
        hitTestSourceRequested = true;
    });
}
