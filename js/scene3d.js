// ============================================
// Cena 3D decorativa (Three.js)
// Não interfere na lógica de conexão BLE.
// Apenas observa os botões para dar feedback visual.
// ============================================

(function () {
    const canvas = document.getElementById('scene3d');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    // --- núcleo: icosaedro wireframe (representa o chip/placa) ---
    const coreGeo = new THREE.IcosahedronGeometry(2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x2ee6d6,
        wireframe: true,
        transparent: true,
        opacity: 0.55
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // --- segunda camada, levemente maior, para efeito de profundidade ---
    const shellGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const shellMat = new THREE.MeshBasicMaterial({
        color: 0x7b61ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    // --- "LED" central: esfera que reage aos comandos Ligar/Desligar ---
    const ledGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x3a4550 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    scene.add(led);

    // luz de destaque em volta do LED (glow simulado com sprite)
    const glowTexture = (() => {
        const size = 128;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    })();
    const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x3a4550,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(1.8, 1.8, 1);
    scene.add(glow);

    // partículas de fundo (poeira de circuito)
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 20;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x2ee6d6, size: 0.03, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // estado visual do LED (independente da lógica BLE real)
    let ledState = false; // false = apagado, true = aceso

    function setLedVisual(ligado) {
        ledState = ligado;
        const cor = ligado ? 0x2ee6d6 : 0x3a4550;
        led.material.color.setHex(cor);
        glow.material.color.setHex(cor);
        glow.material.opacity = ligado ? 1 : 0.4;
    }

    // observa os botões existentes só para dar feedback visual — não toca na lógica BLE
    window.addEventListener('DOMContentLoaded', () => {
        const onBtn = document.getElementById('onBtn');
        const offBtn = document.getElementById('offBtn');
        if (onBtn) onBtn.addEventListener('click', () => setLedVisual(true));
        if (offBtn) offBtn.addEventListener('click', () => setLedVisual(false));
    });

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        core.rotation.y = t * 0.18;
        core.rotation.x = t * 0.09;
        shell.rotation.y = -t * 0.1;
        shell.rotation.x = t * 0.05;

        // pulso suave do LED
        const pulse = 1 + Math.sin(t * (ledState ? 4 : 1.2)) * (ledState ? 0.15 : 0.05);
        led.scale.setScalar(pulse);
        glow.scale.setScalar(1.8 * pulse);

        particles.rotation.y = t * 0.02;

        renderer.render(scene, camera);
    }
    animate();
})();
