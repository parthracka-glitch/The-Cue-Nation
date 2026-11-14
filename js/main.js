/**
 * CUENATION — Application Entry Point
 * Orchestrates Three.js, GSAP Animations, and Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c CUENATION %c Premium Billiards & Snooker Lounge ', 'background: #123E2C; color: #E8BD91; font-weight: bold; padding: 4px 8px; border-radius: 2px;', 'background: #090B09; color: #F4F0E9; padding: 4px 8px;');

  // Initialize Interactive Behaviors (Nav, Lucide Icons, Diagnostics)
  if (typeof initInteractions === 'function') {
    initInteractions();
  }

  // Initialize 3D Hero Scene
  let threeSceneInstance = null;
  if (typeof initThreeScene === 'function') {
    threeSceneInstance = initThreeScene();
  }

  // Initialize 3D CTA Banner Scene (Partially Visible Glossy 8-Ball)
  let ctaSceneInstance = null;
  if (typeof initCtaThreeScene === 'function') {
    ctaSceneInstance = initCtaThreeScene();
  }

  // Initialize GSAP Entrance Animations
  if (typeof initAnimations === 'function') {
    // Wait briefly or run after fonts/dom paint
    if (document.fonts) {
      document.fonts.ready.then(() => {
        initAnimations();
      });
    } else {
      setTimeout(initAnimations, 100);
    }
  }

  // Expose global namespace for debugging/extensions if needed
  window.CueNation = {
    version: '1.0.0-foundation',
    scene: threeSceneInstance,
    ctaScene: ctaSceneInstance
  };
});
