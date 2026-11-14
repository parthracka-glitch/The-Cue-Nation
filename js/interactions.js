/**
 * CUENATION — DOM Interactions, Sticky Navigation & Active State Tracking
 */

function initInteractions() {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
    console.log('[Interactions] Lucide icons initialized.');
  }

  // 2. Sticky Header with Scroll Detection
  const header = document.querySelector('.site-header');
  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // 3. Mobile Navigation Drawer Controls
  const navToggle = document.querySelector('.nav-toggle');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('is-active');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('is-active');
    }
    document.body.style.overflow = '';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close drawer on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // 4. Smooth Anchor Scrolling with Sticky Header Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = 78;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. Active Navigation Indicator via IntersectionObserver
  initActiveNavObserver();

  // 6. Interactive Horizontal Gallery & Lightbox
  initGallery();

  // 7. Premium Customer Testimonials Carousel
  initTestimonials();

  // 8. Customer-Facing Booking Modal Interface
  initBookingModal();
}

/**
 * Horizontal Scrolling Gallery Track & Full-Screen Lightbox Functionality
 */
function initGallery() {
  const track = document.getElementById('gallery-track');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');

  if (!track || !items.length) return;

  // 1. Prev & Next Track Scrolling Buttons
  const getScrollStep = () => {
    const firstItem = items[0];
    return firstItem ? firstItem.offsetWidth + 28 : 420;
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });
  }

  // 2. Mouse Drag-to-Scroll Support
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    hasDragged = false;
    track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 6) {
      hasDragged = true;
    }
    track.scrollLeft = scrollLeft - walk;
  });

  // 3. Full-Screen Lightbox Modal
  if (!lightbox) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  const galleryData = Array.from(items).map(item => ({
    src: item.querySelector('.gallery-img')?.getAttribute('src') || '',
    alt: item.querySelector('.gallery-img')?.getAttribute('alt') || '',
    caption: item.getAttribute('data-caption') || ''
  }));

  let currentIndex = 0;

  const updateLightboxContent = () => {
    const currentItem = galleryData[currentIndex];
    if (!currentItem || !lightboxImg) return;

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.97)';

    setTimeout(() => {
      lightboxImg.src = currentItem.src;
      lightboxImg.alt = currentItem.alt;
      if (lightboxCaption) lightboxCaption.textContent = currentItem.caption;
      if (lightboxCounter) {
        const currentStr = String(currentIndex + 1).padStart(2, '0');
        const totalStr = String(galleryData.length).padStart(2, '0');
        lightboxCounter.textContent = `${currentStr} / ${totalStr}`;
      }
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 100);
  };

  const openLightbox = (index) => {
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Card click & enter key to open lightbox
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (hasDragged) return; // Ignore click if user was dragging
      openLightbox(index);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Lightbox navigation controls
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      updateLightboxContent();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % galleryData.length;
      updateLightboxContent();
    });
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      updateLightboxContent();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % galleryData.length;
      updateLightboxContent();
    }
  });

  console.log('[Interactions] Gallery drag scroll & full-screen lightbox initialized.');
}

/**
 * Tracks sections currently in view and highlights the corresponding nav link
 */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const desktopLinks = document.querySelectorAll('.nav-center .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links .mobile-nav-link');

  if (!sections.length) return;

  const setActiveLink = (currentId) => {
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  };

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Customer Testimonials Carousel Functionality
 * Auto-slide every 5s, pause on hover, prev/next buttons, touch swipe, pagination dots.
 */
function initTestimonials() {
  const panel = document.getElementById('testimonial-panel');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  if (!panel || !slides.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000;

  const showSlide = (index) => {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('is-active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('is-active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('is-active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  };

  const nextSlide = () => {
    showSlide(currentIndex + 1);
  };

  const prevSlide = () => {
    showSlide(currentIndex - 1);
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  // Button Click Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  // Dots Listeners
  dots.forEach(dot => {
    dot.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-slide'), 10);
      if (!isNaN(slideIndex)) {
        showSlide(slideIndex);
        startAutoplay();
      }
    });
  });

  // Pause on hover
  panel.addEventListener('mouseenter', stopAutoplay);
  panel.addEventListener('mouseleave', startAutoplay);

  // Mobile Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  panel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  panel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    startAutoplay();
  }, { passive: true });

  // Start initial slide
  showSlide(0);
  startAutoplay();

  console.log('[Interactions] Testimonials carousel initialized with 5s autoplay and hover pause.');
}

/**
 * =========================================================================
 * 8. Customer-Facing Booking Interface & Modal Logic
 * =========================================================================
 */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const modalBackdrop = document.getElementById('booking-modal-backdrop');
  const closeBtn = document.getElementById('booking-modal-close');
  const successCloseBtn = document.getElementById('booking-success-close-btn');
  const resetBtn = document.getElementById('booking-reset-btn');
  const form = document.getElementById('cuenation-booking-form');
  const formView = document.getElementById('booking-form-view');
  const successView = document.getElementById('booking-success-view');
  const dateInput = document.getElementById('booking-date');
  const gameCards = document.querySelectorAll('.game-option-card');
  const submitBtn = document.getElementById('booking-submit-btn');

  if (!modal || !form) return;

  // 1. Set Minimum Booking Date to Today (Prevents Past Dates)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;

  if (dateInput) {
    dateInput.min = formattedToday;
    if (!dateInput.value) {
      dateInput.value = formattedToday;
    }
  }

  // 2. Open Modal Functionality
  const openModal = (preferredGame = null) => {
    // Reset any previous validation error styles
    clearFormErrors();

    // Show form view, hide success view
    if (formView) formView.style.display = 'block';
    if (successView) successView.style.display = 'none';

    // If a game was specified (e.g. from a game card click), select it
    if (preferredGame) {
      selectGame(preferredGame);
    }

    // Activate modal overlay
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Auto-focus first input with slight delay for smooth transition
    setTimeout(() => {
      const nameInput = document.getElementById('booking-customer-name');
      if (nameInput) nameInput.focus();
    }, 150);
  };

  // 3. Close Modal Functionality
  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // 4. Attach Click Triggers to all "Book" Buttons
  const bookTriggers = document.querySelectorAll('[data-open-booking], a[href="#contact"], .header-cta, .cta-book-btn');
  bookTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Check if this button is intended to open the booking modal
      const text = trigger.textContent ? trigger.textContent.toLowerCase() : '';
      const hasBookingAttr = trigger.hasAttribute('data-open-booking');
      const isBookBtn = text.includes('book') || hasBookingAttr;

      if (isBookBtn) {
        e.preventDefault();
        const game = trigger.getAttribute('data-game') || null;
        openModal(game);
      }
    });
  });

  // 5. Close Event Handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // 6. Interactive Game Radio Card Selection
  const selectGame = (gameName) => {
    const radio = document.querySelector(`input[name="gameSelection"][value="${gameName}"]`);
    if (radio) {
      radio.checked = true;
    }
    gameCards.forEach(card => {
      const input = card.querySelector('input[type="radio"]');
      if (input && input.checked) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    });
  };

  gameCards.forEach(card => {
    card.addEventListener('click', () => {
      const input = card.querySelector('input[type="radio"]');
      if (input) {
        selectGame(input.value);
      }
    });
  });

  // 7. Form Error State Helpers
  const clearFormErrors = () => {
    form.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error');
    });
  };

  const setFieldError = (groupId, hasError = true) => {
    const group = document.getElementById(groupId);
    if (group) {
      if (hasError) {
        group.classList.add('has-error');
      } else {
        group.classList.remove('has-error');
      }
    }
  };

  // Real-time error clearing on input
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function() {
      const parentGroup = this.closest('.form-group');
      if (parentGroup) {
        parentGroup.classList.remove('has-error');
      }
    });
    input.addEventListener('change', function() {
      const parentGroup = this.closest('.form-group');
      if (parentGroup) {
        parentGroup.classList.remove('has-error');
      }
    });
  });

  // 8. Form Submission & Validation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const name = document.getElementById('booking-customer-name')?.value.trim() || '';
    const phone = document.getElementById('booking-customer-phone')?.value.trim() || '';
    const game = document.querySelector('input[name="gameSelection"]:checked')?.value || '';
    const players = document.getElementById('booking-players')?.value || '';
    const duration = document.getElementById('booking-duration')?.value || '';
    const date = document.getElementById('booking-date')?.value || '';
    const timeSlot = document.getElementById('booking-timeslot')?.value || '';

    let isValid = true;
    let firstInvalidEl = null;

    // Validate Customer Name (min 2 chars)
    if (!name || name.length < 2) {
      setFieldError('group-name', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-customer-name');
    }

    // Validate Mobile Number (at least 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^[+]?[\d\s\-()]{10,18}$/;
    if (!phone || digitsOnly.length < 10 || !phoneRegex.test(phone)) {
      setFieldError('group-phone', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-customer-phone');
    }

    // Validate Game Selection
    if (!game) {
      setFieldError('group-game', true);
      isValid = false;
    }

    // Validate Number of Players
    if (!players) {
      setFieldError('group-players', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-players');
    }

    // Validate Duration
    if (!duration) {
      setFieldError('group-duration', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-duration');
    }

    // Validate Booking Date (Must be today or in the future)
    if (!date || date < formattedToday) {
      setFieldError('group-date', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-date');
    }

    // Validate Time Slot
    if (!timeSlot) {
      setFieldError('group-timeslot', true);
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = document.getElementById('booking-timeslot');
    }

    if (!isValid) {
      if (firstInvalidEl) firstInvalidEl.focus();
      return;
    }

    // 9. Construct Structured Payload (Ready for Node.js & MongoDB)
    const bookingPayload = {
      customerName: name,
      mobileNumber: phone,
      gameSelection: game,
      numberOfPlayers: parseInt(players, 10) || players,
      duration: duration,
      bookingDate: date,
      preferredTimeSlot: timeSlot,
      createdAt: new Date().toISOString()
    };

    // Button loading feedback
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Formatting Request...</span>';
    }

    try {
      // Dispatch payload to backend submission function
      const response = await submitBookingToBackend(bookingPayload);

      // Render Structured Summary into the Success View
      renderBookingSummary(bookingPayload);

      // Transition to Success View
      if (formView) formView.style.display = 'none';
      if (successView) successView.style.display = 'block';

      // Update Lucide icons inside new view
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    } catch (err) {
      console.error('[CueNation Booking Error]', err);
      alert('Unable to process booking request. Please check your inputs or try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Confirm Reservation Request</span><span class="btn-arrow">&rarr;</span>';
      }
    }
  });

  // 10. Book Another Table Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      clearFormErrors();
      if (dateInput) dateInput.value = formattedToday;
      selectGame('Pool');
      if (successView) successView.style.display = 'none';
      if (formView) formView.style.display = 'block';
    });
  }

  console.log('[Interactions] Customer booking interface & validation initialized.');
}

/**
 * Formats and renders the customer reservation summary into the modal success screen
 */
function renderBookingSummary(payload) {
  const container = document.getElementById('booking-details-summary');
  const messageDesc = document.getElementById('booking-success-summary-desc');
  if (!container) return;

  // Format Date for readability (e.g. Sat, Nov 15, 2026)
  let formattedDate = payload.bookingDate;
  try {
    const [year, month, day] = payload.bookingDate.split('-');
    const dateObj = new Date(year, month - 1, day);
    formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    formattedDate = payload.bookingDate;
  }

  if (messageDesc) {
    messageDesc.textContent = `Thank you, ${payload.customerName}. Your reservation request for ${payload.gameSelection} has been logged. Our concierge will contact you on ${payload.mobileNumber} to confirm table availability.`;
  }

  container.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">Customer Name</span>
      <span class="summary-val">${escapeHtml(payload.customerName)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Mobile Number</span>
      <span class="summary-val">${escapeHtml(payload.mobileNumber)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Selected Game</span>
      <span class="summary-val highlight">${escapeHtml(payload.gameSelection)} Table</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Party Size</span>
      <span class="summary-val">${escapeHtml(String(payload.numberOfPlayers))} ${Number(payload.numberOfPlayers) === 1 ? 'Player' : 'Players'}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Date &amp; Time Slot</span>
      <span class="summary-val">${escapeHtml(formattedDate)} &bull; ${escapeHtml(payload.preferredTimeSlot)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Duration</span>
      <span class="summary-val">${escapeHtml(payload.duration)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Status</span>
      <span class="summary-val highlight">Request Logged (Pending Concierge Confirmation)</span>
    </div>
  `;
}

/**
 * Escapes HTML characters for safe UI rendering
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/**
 * =========================================================================
 * Clean JavaScript Function Prepared for Node.js & MongoDB Backend
 * =========================================================================
 * 
 * When your backend is mounted (e.g. Express.js + Mongoose):
 * 
 * Backend Schema (Mongoose Model):
 * --------------------------------
 * const BookingSchema = new mongoose.Schema({
 *   customerName: { type: String, required: true, trim: true },
 *   mobileNumber: { type: String, required: true, trim: true },
 *   gameSelection: { type: String, enum: ['Pool', 'Snooker'], required: true },
 *   numberOfPlayers: { type: Number, required: true },
 *   bookingDate: { type: String, required: true },
 *   preferredTimeSlot: { type: String, required: true },
 *   duration: { type: String, required: true },
 *   createdAt: { type: Date, default: Date.now }
 * });
 * 
 * Backend Route (Express):
 * ------------------------
 * app.post('/api/bookings', async (req, res) => {
 *   try {
 *     const booking = await Booking.create(req.body);
 *     return res.status(201).json({ success: true, booking });
 *   } catch (err) {
 *     return res.status(400).json({ success: false, error: err.message });
 *   }
 * });
 * 
 * @param {Object} bookingPayload
 * @returns {Promise<Object>}
 */
async function submitBookingToBackend(bookingPayload) {
  console.group('%c[CueNation Backend Bridge]%c Booking Request Payload', 'background: #123E2C; color: #E8BD91; font-weight: bold; padding: 2px 6px; border-radius: 2px;', 'color: #F4F0E9;');
  console.log('Customer Name:', bookingPayload.customerName);
  console.log('Mobile Number:', bookingPayload.mobileNumber);
  console.log('Game:', bookingPayload.gameSelection);
  console.log('Players:', bookingPayload.numberOfPlayers);
  console.log('Date:', bookingPayload.bookingDate);
  console.log('Preferred Time:', bookingPayload.preferredTimeSlot);
  console.log('Duration:', bookingPayload.duration);
  console.log('Created At:', bookingPayload.createdAt);
  console.log('Ready for POST /api/bookings JSON Body:', JSON.stringify(bookingPayload, null, 2));
  console.groupEnd();

  /*
   * UNCOMMENT ONCE NODE.JS BACKEND IS ACTIVE:
   * 
   * const response = await fetch('/api/bookings', {
   *   method: 'POST',
   *   headers: {
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify(bookingPayload)
   * });
   * 
   * if (!response.ok) {
   *   throw new Error(`Server returned HTTP ${response.status}`);
   * }
   * return await response.json();
   */

  // Frontend simulation returning structured resolution (no pretend database writes or fake PINs)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Booking request validated and structured for backend dispatch.',
        data: bookingPayload
      });
    }, 450);
  });
}
