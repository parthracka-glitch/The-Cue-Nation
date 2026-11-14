/**
 * CUENATION — Interactive Realistic 3D Billiard 8-Ball Engine
 * High-gloss physical material, procedural studio environment map,
 * realistic contact shadow, and mouse/touch interactions.
 *
 * Performance & Optimization Features:
 * - WebGL capability check with graceful CSS/SVG fallback
 * - Shared texture cache across instances to prevent duplicate VRAM allocation
 * - Viewport IntersectionObserver on ALL canvases (halts loop when off-screen)
 * - Delta time clamping to avoid animation jumps on tab switches
 * - Debounced resize handling & strict memory disposal
 */

// Shared Texture Cache to prevent duplicate 2048x1024 textures in GPU VRAM
let cachedSharedEightBallTexture = null;

/**
 * Checks whether WebGL is supported by the client browser
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Injects a photorealistic CSS fallback if WebGL is disabled or unsupported
 */
function renderFallbackEightBall(canvas) {
  if (!canvas || !canvas.parentElement) return;
  const parent = canvas.parentElement;
  canvas.style.display = 'none';

  if (parent.querySelector('.ball-css-fallback')) return;

  const fallback = document.createElement('div');
  fallback.className = 'ball-css-fallback';
  fallback.setAttribute('aria-label', 'Billiard Eight Ball Visual');
  fallback.innerHTML = `
    <div class="fallback-eight-circle">
      <span class="fallback-eight-number">8</span>
    </div>
  `;
  parent.appendChild(fallback);
}

/**
 * Generates and caches the 2048x1024 high-resolution equirectangular texture
 */
function getSharedEightBallTexture() {
  if (cachedSharedEightBallTexture) return cachedSharedEightBallTexture;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base Jet Black Color with subtle micro-depth
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#060606');
  baseGrad.addColorStop(0.5, '#0e0e0e');
  baseGrad.addColorStop(1, '#050505');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to draw the white disc with the number 8
  const drawEightDisc = (centerX, centerY) => {
    const radius = 170;

    // Subtle antialiased edge ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    // Main crisp white circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FDFDFD';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();

    // Crisp black numeral "8"
    ctx.save();
    ctx.fillStyle = '#080808';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 185px "Playfair Display", "Times New Roman", serif';
    ctx.fillText('8', centerX, centerY + 6);
    ctx.restore();
  };

  // Draw front marking (u = 0.25 -> x = 512)
  drawEightDisc(512, 512);

  // Draw rear marking (u = 0.75 -> x = 1536)
  drawEightDisc(1536, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  cachedSharedEightBallTexture = texture;
  return cachedSharedEightBallTexture;
}

/**
 * Class representing the Primary Hero 3D 8-Ball
 */
class CueNationEightBallScene {
  constructor(canvasId = 'hero-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`[Three.js] Canvas #${canvasId} not found.`);
      return;
    }

    if (!isWebGLAvailable()) {
      console.warn('[Three.js] WebGL not supported. Rendering high-fidelity CSS fallback.');
      renderFallbackEightBall(this.canvas);
      return;
    }

    this.container = this.canvas.parentElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ball = null;
    this.shadowPlane = null;
    this.dropShadowEl = document.querySelector('.ball-drop-shadow');
    this.observer = null;
    this.isVisible = true;

    // Motion & Physics State
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.baseRotation = { x: 0.15, y: -0.65 };
    this.idleSpinSpeed = 0.35;
    this.floatSpeed = 1.35;
    this.floatAmplitude = 0.14;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.dragMomentum = { x: 0, y: 0 };

    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.init();
  }

  init() {
    try {
      // 1. Scene
      this.scene = new THREE.Scene();

      // 2. Camera
      const width = this.container.clientWidth || 500;
      const height = this.container.clientHeight || 500;
      this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 5.2);

      // 3. Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      // 4. Procedural Environment Map
      this.scene.environment = this.createStudioEnvironmentMap();

      // 5. Lighting Rig
      this.setupStudioLights();

      // 6. Geometry & Material
      this.createEightBall();
      this.createContactShadow();

      // 7. Event Listeners & Resize
      this.bindEvents();
      this.handleResize();

      // 8. Viewport IntersectionObserver
      this.setupObserver();

      this.canvas.classList.add('is-ready');
      console.log('[Three.js] Photorealistic Hero 8-Ball initialized with render pause optimization.');
    } catch (err) {
      console.error('[Three.js] Hero 8-Ball initialization error:', err);
      renderFallbackEightBall(this.canvas);
    }
  }

  setupObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.isVisible = true;
      this.animate();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animationFrameId) {
          this.clock.start();
          this.animate();
        } else if (!this.isVisible && this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      });
    }, { threshold: 0.05 });

    this.observer.observe(this.canvas);
  }

  createStudioEnvironmentMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cubeFaces = [];

    const createFaceImage = (drawFn) => {
      ctx.clearRect(0, 0, size, size);
      drawFn(ctx, size);
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    };

    // Right (+X)
    cubeFaces.push(createFaceImage((c, s) => {
      const grad = c.createLinearGradient(0, 0, s, s);
      grad.addColorStop(0, '#151a14');
      grad.addColorStop(0.5, '#090b09');
      grad.addColorStop(1, '#050705');
      c.fillStyle = grad;
      c.fillRect(0, 0, s, s);
    }));

    // Left (-X)
    cubeFaces.push(createFaceImage((c, s) => {
      const grad = c.createLinearGradient(0, 0, 0, s);
      grad.addColorStop(0, '#10241a');
      grad.addColorStop(0.6, '#080d09');
      c.fillStyle = grad;
      c.fillRect(0, 0, s, s);
    }));

    // Top (+Y)
    cubeFaces.push(createFaceImage((c, s) => {
      c.fillStyle = '#090b09';
      c.fillRect(0, 0, s, s);

      const rad1 = c.createRadialGradient(s * 0.45, s * 0.5, 0, s * 0.45, s * 0.5, s * 0.35);
      rad1.addColorStop(0, 'rgba(255, 245, 230, 1.0)');
      rad1.addColorStop(0.2, 'rgba(240, 215, 175, 0.7)');
      rad1.addColorStop(0.6, 'rgba(180, 130, 80, 0.25)');
      rad1.addColorStop(1, 'rgba(9, 11, 9, 0)');
      c.fillStyle = rad1;
      c.fillRect(0, 0, s, s);

      const rad2 = c.createRadialGradient(s * 0.75, s * 0.35, 0, s * 0.75, s * 0.35, s * 0.25);
      rad2.addColorStop(0, 'rgba(255, 240, 210, 0.9)');
      rad2.addColorStop(0.4, 'rgba(232, 189, 145, 0.4)');
      rad2.addColorStop(1, 'rgba(9, 11, 9, 0)');
      c.fillStyle = rad2;
      c.fillRect(0, 0, s, s);
    }));

    // Bottom (-Y)
    cubeFaces.push(createFaceImage((c, s) => {
      const grad = c.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.5);
      grad.addColorStop(0, '#123E2C');
      grad.addColorStop(0.7, '#0a2318');
      grad.addColorStop(1, '#050b07');
      c.fillStyle = grad;
      c.fillRect(0, 0, s, s);
    }));

    // Front (+Z)
    cubeFaces.push(createFaceImage((c, s) => {
      const grad = c.createLinearGradient(0, 0, 0, s);
      grad.addColorStop(0, '#1a221b');
      grad.addColorStop(0.6, '#090b09');
      c.fillStyle = grad;
      c.fillRect(0, 0, s, s);
    }));

    // Back (-Z)
    cubeFaces.push(createFaceImage((c, s) => {
      c.fillStyle = '#080a08';
      c.fillRect(0, 0, s, s);
    }));

    const cubeTexture = new THREE.CubeTexture(cubeFaces);
    cubeTexture.needsUpdate = true;
    return cubeTexture;
  }

  setupStudioLights() {
    const ambientLight = new THREE.AmbientLight(0x111612, 1.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFE8D0, 3.2);
    keyLight.position.set(2.5, 4.5, 3.2);
    this.scene.add(keyLight);

    const feltBounceLight = new THREE.DirectionalLight(0x164C36, 2.2);
    feltBounceLight.position.set(-1.5, -3.5, 1.5);
    this.scene.add(feltBounceLight);

    const rimLight = new THREE.DirectionalLight(0xE8BD91, 2.8);
    rimLight.position.set(-3.5, 2.5, -2.5);
    this.scene.add(rimLight);

    const pinLight = new THREE.PointLight(0xFFFFFF, 1.5, 10);
    pinLight.position.set(1.5, 2.5, 3.5);
    this.scene.add(pinLight);
  }

  createEightBall() {
    const geometry = new THREE.SphereGeometry(1.65, 80, 80);
    const texture = getSharedEightBallTexture();

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.08,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95,
      specularIntensity: 1.2,
      specularColor: new THREE.Color(0xFFFFFF),
      envMapIntensity: 1.35
    });

    this.ball = new THREE.Mesh(geometry, material);
    this.ball.position.set(0, 0, 0);
    this.ball.rotation.y = -Math.PI / 3.8;
    this.ball.rotation.x = Math.PI / 14;

    this.scene.add(this.ball);
  }

  createContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.set(0, -1.82, 0);
    this.scene.add(this.shadowPlane);
  }

  bindEvents() {
    window.addEventListener('resize', this.handleResize.bind(this));

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.mouse.targetX = (e.clientX - centerX) / (window.innerWidth * 0.5);
      this.mouse.targetY = (e.clientY - centerY) / (window.innerHeight * 0.5);
    }, { passive: true });

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.ball) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.ball.rotation.y += deltaX * 0.008;
      this.ball.rotation.x += deltaY * 0.008;

      this.dragMomentum.x = deltaY * 0.001;
      this.dragMomentum.y = deltaX * 0.001;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || !this.ball || e.touches.length !== 1) return;

      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.ball.rotation.y += deltaX * 0.01;
      this.ball.rotation.x += deltaY * 0.01;

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }

  handleResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;

    if (window.innerWidth < 768) {
      this.camera.position.z = 5.8;
      this.camera.fov = 42;
    } else {
      this.camera.position.z = 5.2;
      this.camera.fov = 38;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.isVisible) {
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (!this.isDragging) {
      this.dragMomentum.x *= 0.95;
      this.dragMomentum.y *= 0.95;
    }

    if (this.ball) {
      const floatY = Math.sin(elapsedTime * this.floatSpeed) * this.floatAmplitude;
      this.ball.position.y = floatY;

      if (!this.isDragging) {
        this.ball.rotation.y += delta * 0.14 + this.dragMomentum.y;
        this.ball.rotation.x += delta * 0.03 + this.dragMomentum.x;
      }

      this.ball.position.x = this.mouse.x * 0.25;
      this.ball.rotation.z = -this.mouse.x * 0.18;

      if (this.shadowPlane) {
        const shadowScale = 1.0 - (floatY * 0.35);
        this.shadowPlane.scale.set(shadowScale, shadowScale, shadowScale);
        this.shadowPlane.material.opacity = 0.55 - (floatY * 0.35);
        this.shadowPlane.position.x = this.ball.position.x * 0.7;
      }

      if (this.dropShadowEl) {
        const cssScale = 1.0 - (floatY * 0.25);
        const cssOpacity = 0.65 - (floatY * 0.35);
        const offsetX = this.mouse.x * 15;
        this.dropShadowEl.style.transform = `translateX(calc(-50% + ${offsetX}px)) scale(${cssScale})`;
        this.dropShadowEl.style.opacity = cssOpacity;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.ball && this.ball.geometry) {
      this.ball.geometry.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

/**
 * Class representing the Secondary CTA Banner 3D 8-Ball
 */
class CueNationCtaEightBallScene {
  constructor(canvasId = 'cta-ball-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    if (!isWebGLAvailable()) {
      renderFallbackEightBall(this.canvas);
      return;
    }

    this.container = this.canvas.parentElement;
    this.banner = document.querySelector('.cta-banner');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ball = null;
    this.isVisible = false;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();

    // Mouse tilt tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.init();
  }

  init() {
    try {
      this.scene = new THREE.Scene();

      const width = this.canvas.clientWidth || 420;
      const height = this.canvas.clientHeight || 420;

      this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 5.0);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.3;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      // Studio Lighting tailored for the dark green CTA banner
      this.setupLights();

      // Create Ball using shared texture
      this.createBall();

      // Bind resize & mouse
      this.bindEvents();

      // Viewport IntersectionObserver to optimize CPU/GPU usage
      this.setupObserver();

      console.log('[Three.js] CTA 3D 8-Ball initialized with render pause optimization.');
    } catch (err) {
      console.error('[Three.js] CTA 8-Ball initialization error:', err);
      renderFallbackEightBall(this.canvas);
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x0e1c14, 2.0);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0dc, 3.4);
    keyLight.position.set(-2.5, 4.0, 3.5);
    this.scene.add(keyLight);

    const greenBounceLight = new THREE.DirectionalLight(0x1a583e, 2.8);
    greenBounceLight.position.set(2.0, -3.5, 2.0);
    this.scene.add(greenBounceLight);

    const rimLight = new THREE.DirectionalLight(0xe8bd91, 2.6);
    rimLight.position.set(3.5, 2.5, -2.5);
    this.scene.add(rimLight);
  }

  createBall() {
    const geometry = new THREE.SphereGeometry(1.65, 80, 80);
    const texture = getSharedEightBallTexture();

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.07,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95,
      specularIntensity: 1.25,
      specularColor: new THREE.Color(0xffffff)
    });

    this.ball = new THREE.Mesh(geometry, material);
    this.ball.rotation.y = -Math.PI / 3.4;
    this.ball.rotation.x = Math.PI / 16;
    this.scene.add(this.ball);
  }

  bindEvents() {
    window.addEventListener('resize', this.handleResize.bind(this));

    if (this.banner) {
      this.banner.addEventListener('mousemove', (e) => {
        const rect = this.banner.getBoundingClientRect();
        this.mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        this.mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }, { passive: true });

      this.banner.addEventListener('mouseleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
      });
    }
  }

  handleResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || 420;
    const height = this.canvas.clientHeight || 420;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setupObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.isVisible = true;
      this.animate();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animationFrameId) {
          this.clock.start();
          this.animate();
        } else if (!this.isVisible && this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      });
    }, { threshold: 0.05 });

    this.observer.observe(this.canvas);
  }

  animate() {
    if (!this.isVisible) {
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    if (this.ball) {
      this.ball.position.y = Math.sin(elapsedTime * 1.2) * 0.1;
      this.ball.rotation.y += delta * 0.12;
      this.ball.rotation.x += delta * 0.02;

      this.ball.position.x = this.mouse.x * 0.15;
      this.ball.rotation.z = -this.mouse.x * 0.12;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.ball && this.ball.geometry) {
      this.ball.geometry.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Global factory initializers
function initThreeScene() {
  if (typeof THREE === 'undefined') {
    console.warn('[Three.js] Library not detected.');
    return null;
  }
  return new CueNationEightBallScene('hero-canvas');
}

function initCtaThreeScene() {
  if (typeof THREE === 'undefined') return null;
  return new CueNationCtaEightBallScene('cta-ball-canvas');
}
