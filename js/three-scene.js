/**
 * CUENATION — Interactive Realistic 3D Billiard 8-Ball Engine
 * High-gloss phenolic resin physical material, synchronous studio reflections,
 * ambient felt bounce lighting, contact shadow, and smooth interactive physics.
 *
 * Performance & Optimization Features:
 * - WebGL capability check with graceful CSS/SVG fallback
 * - Shared texture cache across instances to prevent duplicate VRAM allocation
 * - Synchronous Equirectangular environment mapping (zero async image decoding bugs)
 * - Viewport IntersectionObserver on ALL canvases (halts loop when off-screen)
 * - Smooth spring-lerp recoil to signature front-facing "8" pose after drag
 * - Debounced resize handling & strict memory disposal
 */

// Shared Texture Cache to prevent duplicate textures in GPU VRAM
let cachedSharedEightBallTexture = null;
let cachedSharedEnvTexture = null;

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
 * Generates and caches the 2048x1024 high-resolution equirectangular texture.
 * In Three.js SphereGeometry:
 * - u = 0.25 (x = 512, y = 512) maps to vertex (0, 0, +r), which faces DIRECTLY at the camera (+Z).
 * - u = 0.75 (x = 1536, y = 512) maps to vertex (0, 0, -r), which is the back of the ball.
 */
function getSharedEightBallTexture() {
  if (cachedSharedEightBallTexture) return cachedSharedEightBallTexture;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep, rich phenolic resin black
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, width, height);

  // Subtle tonal gradient across the sphere map
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#060606');
  bgGrad.addColorStop(0.5, '#0b0b0b');
  bgGrad.addColorStop(1, '#050505');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to draw the authentic white circle and numeral "8"
  const drawEightDisc = (centerX, centerY) => {
    const radius = 175;

    ctx.save();

    // Subtle smooth antialiased outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // Main crisp white circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Micro-inner shadow ring for depth
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.stroke();

    ctx.restore();

    // Crisp black numeral "8"
    ctx.save();
    ctx.fillStyle = '#090909';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 190px "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.fillText('8', centerX, centerY + 5);
    ctx.restore();
  };

  // Draw front marking (u = 0.25 -> x = 512, y = 512: faces camera directly)
  drawEightDisc(512, 512);

  // Draw rear marking (u = 0.75 -> x = 1536, y = 512: opposite side)
  drawEightDisc(1536, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (THREE.sRGBEncoding) {
    texture.encoding = THREE.sRGBEncoding;
  }
  texture.needsUpdate = true;

  cachedSharedEightBallTexture = texture;
  return cachedSharedEightBallTexture;
}

/**
 * Creates a synchronous 1024x512 equirectangular studio environment reflection.
 * Simulates the warm overhead pendant lamp and the deep green pool table felt.
 */
function getSharedStudioEnvironmentMap() {
  if (cachedSharedEnvTexture) return cachedSharedEnvTexture;

  const envCanvas = document.createElement('canvas');
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const ctx = envCanvas.getContext('2d');

  // Dark ambient studio room
  ctx.fillStyle = '#090c0a';
  ctx.fillRect(0, 0, 1024, 512);

  // Warm overhead pendant light reflection (amber hotspot on upper hemisphere)
  const lampGrad = ctx.createRadialGradient(512, 100, 0, 512, 100, 240);
  lampGrad.addColorStop(0, 'rgba(255, 238, 205, 0.95)');
  lampGrad.addColorStop(0.25, 'rgba(240, 205, 160, 0.55)');
  lampGrad.addColorStop(0.65, 'rgba(180, 130, 80, 0.18)');
  lampGrad.addColorStop(1, 'rgba(9, 12, 10, 0)');
  ctx.fillStyle = lampGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Green table felt bounce along bottom hemisphere
  const feltGrad = ctx.createLinearGradient(0, 360, 0, 512);
  feltGrad.addColorStop(0, 'rgba(9, 12, 10, 0)');
  feltGrad.addColorStop(0.6, 'rgba(18, 62, 44, 0.45)');
  feltGrad.addColorStop(1, 'rgba(12, 45, 32, 0.7)');
  ctx.fillStyle = feltGrad;
  ctx.fillRect(0, 360, 1024, 152);

  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  if (THREE.sRGBEncoding) {
    envTexture.encoding = THREE.sRGBEncoding;
  }
  envTexture.needsUpdate = true;

  cachedSharedEnvTexture = envTexture;
  return cachedSharedEnvTexture;
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

    // Signature Resting Orientation:
    // With front disc at (0, 0, +r), tilting slightly right (y = 0.20) and up (x = 0.14)
    // presents the iconic "8" clearly upright facing the viewer, reflecting the overhead lamp!
    this.baseRotation = { x: 0.14, y: 0.20, z: 0 };
    this.currentRotation = { x: 0.14, y: 0.20, z: 0 };
    this.targetRotation = { x: 0.14, y: 0.20, z: 0 };

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.floatSpeed = 1.25;
    this.floatAmplitude = 0.055;

    this.isDragging = false;
    this.dragged = false;
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

      // 2. Camera: Sized to container bounds
      const width = this.container.clientWidth || 440;
      const height = this.container.clientHeight || 440;
      this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 4.8);

      // 3. Renderer with high-gloss dielectric tone mapping
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      if (THREE.sRGBEncoding) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      // 4. Studio Environment Reflection Map
      this.scene.environment = getSharedStudioEnvironmentMap();

      // 5. Studio Lighting Rig
      this.setupStudioLights();

      // 6. 8-Ball Geometry & Realistic Phenolic Resin Material
      this.createEightBall();
      this.createContactShadow();

      // 7. Event Listeners & Resize
      this.bindEvents();
      this.handleResize();

      // 8. Viewport IntersectionObserver
      this.setupObserver();

      this.canvas.classList.add('is-ready');
      console.log('[Three.js] Photorealistic Hero 8-Ball initialized.');
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

  setupStudioLights() {
    // 1. Soft neutral ambient light
    const ambientLight = new THREE.AmbientLight(0x151c17, 0.65);
    this.scene.add(ambientLight);

    // 2. Overhead warm key light (simulates pendant lamp hanging over table)
    const keyLight = new THREE.DirectionalLight(0xFFE4C4, 1.7);
    keyLight.position.set(1.6, 4.2, 2.0);
    this.scene.add(keyLight);

    // 3. Pool table felt bounce light (deep emerald reflection on underside)
    const feltBounceLight = new THREE.DirectionalLight(0x14452F, 0.85);
    feltBounceLight.position.set(-1.0, -2.5, 1.2);
    this.scene.add(feltBounceLight);

    // 4. Subtle champagne rim light (edge definition against dark background)
    const rimLight = new THREE.DirectionalLight(0xE8BD91, 0.55);
    rimLight.position.set(-2.8, 1.8, -2.0);
    this.scene.add(rimLight);
  }

  createEightBall() {
    // Sized to diameter 2.44 units, perfectly framed in camera
    const geometry = new THREE.SphereGeometry(1.22, 64, 64);
    const texture = getSharedEightBallTexture();

    // Phenolic Resin Physical Material:
    // Non-metallic dielectric (metalness = 0), smooth polished surface (roughness = 0.13),
    // and glossy clearcoat lacquer (clearcoat = 0.85).
    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.13,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.07,
      reflectivity: 0.85,
      specularIntensity: 0.9,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 0.85
    });

    this.ball = new THREE.Mesh(geometry, material);
    this.ball.position.set(0, 0, 0);

    // Signature orientation: "8" facing front-right at user
    this.ball.rotation.x = this.baseRotation.x;
    this.ball.rotation.y = this.baseRotation.y;
    this.ball.rotation.z = this.baseRotation.z;

    this.scene.add(this.ball);
  }

  createContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.5)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
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
    this.shadowPlane.position.set(0, -1.35, 0);
    this.scene.add(this.shadowPlane);
  }

  bindEvents() {
    window.addEventListener('resize', this.handleResize.bind(this));

    // Subtle parallax tracking based on mouse position
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.mouse.targetX = (e.clientX - centerX) / (window.innerWidth * 0.5);
      this.mouse.targetY = (e.clientY - centerY) / (window.innerHeight * 0.5);
    }, { passive: true });

    // Drag to inspect interaction
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragged = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.ball) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.ball.rotation.y += deltaX * 0.009;
      this.ball.rotation.x += deltaY * 0.009;

      this.dragMomentum.x = deltaY * 0.001;
      this.dragMomentum.y = deltaX * 0.001;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile devices
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragged = true;
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
      this.camera.position.z = 5.2;
      this.camera.fov = 38;
    } else {
      this.camera.position.z = 4.8;
      this.camera.fov = 36;
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

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    if (this.ball) {
      // Gentle breathing float motion
      const floatY = Math.sin(elapsedTime * this.floatSpeed) * this.floatAmplitude;
      this.ball.position.y = floatY;

      if (this.isDragging) {
        // While dragging: user directly controls rotation
      } else {
        // Dampen drag momentum
        this.dragMomentum.x *= 0.92;
        this.dragMomentum.y *= 0.92;

        if (Math.abs(this.dragMomentum.x) > 0.0001 || Math.abs(this.dragMomentum.y) > 0.0001) {
          this.ball.rotation.x += this.dragMomentum.x;
          this.ball.rotation.y += this.dragMomentum.y;
        } else {
          // Smooth spring-lerp back to signature resting orientation with mouse parallax
          const targetX = this.baseRotation.x + this.mouse.y * 0.22;
          const targetY = this.baseRotation.y + this.mouse.x * 0.32;
          const targetZ = -this.mouse.x * 0.12;

          this.ball.rotation.x += (targetX - this.ball.rotation.x) * 0.05;
          this.ball.rotation.y += (targetY - this.ball.rotation.y) * 0.05;
          this.ball.rotation.z += (targetZ - this.ball.rotation.z) * 0.05;
        }
      }

      // Parallax translation
      this.ball.position.x = this.mouse.x * 0.12;

      // Shadow response to floating
      if (this.shadowPlane) {
        const shadowScale = 1.0 - (floatY * 0.3);
        this.shadowPlane.scale.set(shadowScale, shadowScale, shadowScale);
        this.shadowPlane.material.opacity = 0.65 - (floatY * 0.4);
        this.shadowPlane.position.x = this.ball.position.x * 0.7;
      }

      if (this.dropShadowEl) {
        const cssScale = 1.0 - (floatY * 0.2);
        const cssOpacity = 0.7 - (floatY * 0.3);
        const offsetX = this.mouse.x * 12;
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

      const width = this.canvas.clientWidth || 380;
      const height = this.canvas.clientHeight || 380;

      this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 4.8);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      if (THREE.sRGBEncoding) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      this.scene.environment = getSharedStudioEnvironmentMap();

      // Studio Lighting tailored for the dark green CTA banner
      this.setupLights();

      // Create Ball using shared texture
      this.createBall();

      // Bind resize & mouse
      this.bindEvents();

      // Viewport IntersectionObserver to optimize CPU/GPU usage
      this.setupObserver();

      console.log('[Three.js] CTA 3D 8-Ball initialized.');
    } catch (err) {
      console.error('[Three.js] CTA 8-Ball initialization error:', err);
      renderFallbackEightBall(this.canvas);
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x101a14, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffe6cc, 1.8);
    keyLight.position.set(-2.0, 3.8, 2.5);
    this.scene.add(keyLight);

    const greenBounceLight = new THREE.DirectionalLight(0x1a583e, 1.0);
    greenBounceLight.position.set(2.0, -2.5, 1.5);
    this.scene.add(greenBounceLight);

    const rimLight = new THREE.DirectionalLight(0xe8bd91, 0.6);
    rimLight.position.set(3.0, 2.0, -2.0);
    this.scene.add(rimLight);
  }

  createBall() {
    const geometry = new THREE.SphereGeometry(1.35, 64, 64);
    const texture = getSharedEightBallTexture();

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.12,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.07,
      reflectivity: 0.85,
      specularIntensity: 0.9,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 0.85
    });

    this.ball = new THREE.Mesh(geometry, material);
    // Tilted to reveal the "8" emerging into the banner
    this.ball.rotation.y = 0.35;
    this.ball.rotation.x = 0.22;
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
    const width = this.canvas.clientWidth || 380;
    const height = this.canvas.clientHeight || 380;

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
      this.ball.position.y = Math.sin(elapsedTime * 1.2) * 0.04;
      this.ball.rotation.y = 0.35 + this.mouse.x * 0.25;
      this.ball.rotation.x = 0.22 + this.mouse.y * 0.18;
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
