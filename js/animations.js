/**
 * CUENATION — GSAP Scroll & Entrance Animations Orchestrator
 * Staggered text reveal, smooth heading choreography, button entrance,
 * and subtle background parallax.
 */

function initAnimations() {
  if (typeof gsap === 'undefined') {
    console.warn('[Animations] GSAP not loaded. Applying graceful static fallback.');
    return;
  }

  // Register ScrollTrigger plugin if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Check for Reduced Motion Preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.set('.site-header, .hero-label-badge, .hero-main-heading, .hero-lead-desc, .hero-cta-group, .hero-canvas-col, .hero-scroll-indicator, .games-header-col > *, .game-card, .cafe-image-frame, .cafe-text-wrapper > *, .why-header > *, .why-feature-col, .why-divider, .gallery-top-bar > *, .gallery-item, .testimonials-header > *, .testimonial-card-panel, .testimonial-arrow-btn, .cta-banner, .cta-pill-label, .cta-heading, .cta-description, .cta-book-btn, .cta-ball-wrapper, .footer-main-bar > *', {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      scaleY: 1,
      clipPath: 'none',
      clearProps: 'all'
    });
    return;
  }

  // =========================================================================
  // 1. Hero Entrance Master Timeline
  // =========================================================================
  const heroTl = gsap.timeline({
    defaults: {
      duration: 1.05,
      ease: 'power3.out'
    }
  });

  // A. Header drop-in
  heroTl.from('.site-header', {
    y: -35,
    opacity: 0,
    duration: 0.9,
    delay: 0.15
  });

  // B. Hero Label Badge (POOL · SNOOKER · CAFÉ)
  heroTl.from('.hero-label-badge', {
    y: 20,
    opacity: 0,
    duration: 0.8
  }, '-=0.5');

  // C. Main Heading (Play. Eat. Repeat.)
  heroTl.from('.hero-main-heading', {
    y: 35,
    opacity: 0,
    duration: 1.25,
    ease: 'power4.out'
  }, '-=0.6');

  // D. Hero Description text
  heroTl.from('.hero-lead-desc', {
    y: 25,
    opacity: 0,
    duration: 0.9
  }, '-=0.85');

  // E. CTA Action Buttons
  heroTl.from('.hero-cta-group .btn', {
    y: 20,
    opacity: 0,
    stagger: 0.14,
    duration: 0.85,
    ease: 'power2.out'
  }, '-=0.7');

  // F. 3D Canvas Column fade-in with slight scale
  heroTl.from('.hero-canvas-col', {
    scale: 0.92,
    opacity: 0,
    duration: 1.4,
    ease: 'power3.out'
  }, '-=1.0');

  // G. Scroll Indicator at bottom
  heroTl.from('.hero-scroll-indicator', {
    y: -15,
    opacity: 0,
    duration: 0.8
  }, '-=0.6');

  // =========================================================================
  // 2. ScrollTrigger Parallax & Exit Transitions
  // =========================================================================
  if (typeof ScrollTrigger !== 'undefined') {
    // Parallax on the photographic background layer
    gsap.to('.hero-bg-container', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.75
      },
      yPercent: 18,
      ease: 'none'
    });

    // Subtle fade and upward drift of hero text when scrolling down
    gsap.to('.hero-text-col', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '75% top',
        scrub: 0.5
      },
      y: -60,
      opacity: 0.15,
      ease: 'none'
    });

    // Subtle floating drift on 3D ball canvas when scrolling
    gsap.to('.hero-canvas-col', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '85% top',
        scrub: 0.6
      },
      y: -40,
      ease: 'none'
    });

    // Scroll indicator fades out on scroll start
    gsap.to('.hero-scroll-indicator', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '150px top',
        scrub: true
      },
      opacity: 0,
      y: 20,
      ease: 'none'
    });

    // =========================================================================
    // 3. Pool & Snooker Section Reveal Animations
    // =========================================================================
    if (document.querySelector('.games-section')) {
      // Left Heading reveals from bottom
      gsap.from('.games-header-col > *', {
        scrollTrigger: {
          trigger: '.games-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1.05,
        ease: 'power3.out'
      });

      // Responsive animation offsets to completely prevent mobile horizontal overflow
      const isMobile = window.innerWidth < 768;

      // Card 1 enters with subtle movement
      gsap.from('.game-card[data-card="pool"]', {
        scrollTrigger: {
          trigger: '.games-cards-group',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        x: isMobile ? 0 : 25,
        y: isMobile ? 30 : 20,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out'
      });

      // Card 2 follows with staggered reveal
      gsap.from('.game-card[data-card="snooker"]', {
        scrollTrigger: {
          trigger: '.games-cards-group',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        x: isMobile ? 0 : 35,
        y: isMobile ? 35 : 25,
        opacity: 0,
        duration: 1.05,
        delay: 0.16,
        ease: 'power3.out'
      });

      // Subtle parallax to card images
      document.querySelectorAll('.game-card').forEach(card => {
        const img = card.querySelector('.game-card-img');
        if (img) {
          gsap.to(img, {
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            },
            yPercent: 12,
            ease: 'none'
          });
        }
      });
    }

    // =========================================================================
    // 4. Café Section (Clipping Image Reveal, Parallax & Content Fade)
    // =========================================================================
    const cafeSection = document.querySelector('.cafe-section');
    if (cafeSection) {
      // 1. Image smooth clipping reveal animation
      gsap.fromTo('.cafe-image-frame', 
        {
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
          scale: 1.05,
          opacity: 0.3
        },
        {
          scrollTrigger: {
            trigger: '.cafe-section',
            start: 'top 75%',
            toggleActions: 'play none none none'
          },
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          scale: 1,
          opacity: 1,
          duration: 1.35,
          ease: 'power3.inOut'
        }
      );

      // 2. Content fades upward
      gsap.from('.cafe-text-wrapper > *', {
        scrollTrigger: {
          trigger: '.cafe-content-col',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        stagger: 0.14,
        duration: 1.05,
        ease: 'power3.out'
      });

      // 3. Subtle parallax on image scrolling
      const cafeHeroImg = document.querySelector('.cafe-hero-img');
      if (cafeHeroImg) {
        gsap.to(cafeHeroImg, {
          scrollTrigger: {
            trigger: '.cafe-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          },
          yPercent: 14,
          ease: 'none'
        });
      }

      // 4. Abstract circular line artwork subtle rotation and float on scroll
      const artwork = document.querySelector('.cafe-abstract-artwork');
      if (artwork) {
        gsap.to(artwork, {
          scrollTrigger: {
            trigger: '.cafe-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          },
          rotation: 35,
          yPercent: -10,
          ease: 'none'
        });
      }
    }

    // =========================================================================
    // 5. Why CueNation Section (Heading Fade, Sequential Icons & Animated Dividers)
    // =========================================================================
    const whySection = document.querySelector('.why-section');
    if (whySection) {
      // 1. Heading fades in
      gsap.from('.why-header > *', {
        scrollTrigger: {
          trigger: '.why-section',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 1.0,
        ease: 'power3.out'
      });

      // 2. Dividers animate into view while scrolling (scaleY from 0 to 1)
      gsap.fromTo('.why-divider', 
        { scaleY: 0, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.why-features-grid',
            start: 'top 82%',
            toggleActions: 'play none none none'
          },
          scaleY: 1,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power2.out'
        }
      );

      // 3. Icons reveal sequentially with smooth upward and scale motion
      gsap.from('.why-feature-col', {
        scrollTrigger: {
          trigger: '.why-features-grid',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 30,
        scale: 0.92,
        opacity: 0,
        stagger: 0.14,
        duration: 0.95,
        ease: 'power3.out'
      });
    }

    // =========================================================================
    // 6. Gallery Section (Sequential Card Reveal & Scrubbed Image Parallax)
    // =========================================================================
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
      // 1. Top bar reveal
      gsap.from('.gallery-top-bar > *', {
        scrollTrigger: {
          trigger: '.gallery-section',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 1.0,
        ease: 'power3.out'
      });

      // 2. Sequential card entrance
      gsap.from('.gallery-item', {
        scrollTrigger: {
          trigger: '.gallery-track',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        stagger: 0.12,
        duration: 1.05,
        ease: 'power3.out'
      });

      // 3. Subtle image parallax on vertical scrolling
      document.querySelectorAll('.gallery-item').forEach(item => {
        const img = item.querySelector('.gallery-img');
        if (img) {
          gsap.to(img, {
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            },
            yPercent: 8,
            ease: 'none'
          });
        }
      });
    }

    // =========================================================================
    // 7. Customer Testimonials Section (Header Reveal & Panel Scaling)
    // =========================================================================
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection) {
      // 1. Header fade up
      gsap.from('.testimonials-header > *', {
        scrollTrigger: {
          trigger: '.testimonials-section',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 1.0,
        ease: 'power3.out'
      });

      // 2. Review panel scale & entrance
      gsap.from('.testimonial-card-panel', {
        scrollTrigger: {
          trigger: '.testimonials-carousel-wrapper',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 40,
        scale: 0.96,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out'
      });

      // 3. Arrow buttons entrance
      gsap.from('.testimonial-arrow-btn', {
        scrollTrigger: {
          trigger: '.testimonials-carousel-wrapper',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'back.out(1.5)'
      });
    }

    // =========================================================================
    // 8. Final CTA Banner Entrance Animation
    // =========================================================================
    const ctaBanner = document.querySelector('.cta-banner');
    if (ctaBanner) {
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.cta-banner',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      ctaTl.from('.cta-banner', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out'
      })
      .from('.cta-pill-label', {
        y: 15,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, '-=0.8')
      .from('.cta-heading', {
        y: 25,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.cta-description', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.7')
      .from('.cta-book-btn', {
        scale: 0.88,
        y: 15,
        opacity: 0,
        duration: 0.85,
        ease: 'back.out(1.4)'
      }, '-=0.6')
      .from('.cta-ball-wrapper', {
        x: isMobile ? 0 : 45,
        y: isMobile ? 25 : 0,
        opacity: 0,
        duration: 1.15,
        ease: 'power3.out'
      }, '-=0.9')
      .from('.cta-lighting-glow', {
        scale: 0.7,
        opacity: 0,
        duration: 1.4,
        ease: 'power2.out'
      }, '-=1.1');
    }

    // =========================================================================
    // 9. Minimal Site Footer Reveal
    // =========================================================================
    const siteFooter = document.querySelector('.site-footer');
    if (siteFooter) {
      gsap.from('.footer-main-bar > *', {
        scrollTrigger: {
          trigger: '.site-footer',
          start: 'top 92%',
          toggleActions: 'play none none none'
        },
        y: 25,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out'
      });
    }

    // Refresh ScrollTrigger calculations after all assets & fonts load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }

  console.log('[Animations] GSAP entrance timeline and scroll effects initialized.');
}
