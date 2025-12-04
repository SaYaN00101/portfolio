// Minimal JS: mobile menu toggle, smooth scroll, year placeholder, dark/light mode
function init() {
  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);
    
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const newTheme = body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('dark', 'light');
    body.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    // Update icon
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // Contact form handling
  // Contact form handling for Web3Forms
  const contactForm = document.getElementById('contact-form-element');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formStatus = document.getElementById('form-status');
      
      try {
        // Show loading message
        formStatus.textContent = 'Sending message...';
        formStatus.className = '';
        
        // Submit to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(contactForm)
        });

        const result = await response.json();
        
        if (result.success) {
          formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
          formStatus.classList.add('success');
          contactForm.reset();
          
          // Clear message after 5 seconds
          setTimeout(() => {
            formStatus.textContent = '';
            formStatus.classList.remove('success');
          }, 5000);
        } else {
          throw new Error(result.message || 'Form submission failed');
        }
      } catch (error) {
        formStatus.textContent = '✗ Error sending message. Please try again or contact directly.';
        formStatus.classList.add('error');
        console.error('Form submission error:', error);
      }
    });
  }

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  function openMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('open');
    hamburger.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded','true');
    mobileMenu.setAttribute('aria-hidden','false');
    mobileMenu.setAttribute('aria-modal','true');
    // focus first link for accessibility
    const firstLink = mobileMenu.querySelector('a');
    firstLink && firstLink.focus();
  }
  function closeMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('is-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    hamburger.setAttribute('aria-expanded','false');
    mobileMenu.setAttribute('aria-hidden','true');
    mobileMenu.removeAttribute('aria-modal');
    // return focus to hamburger for keyboard users
    hamburger && hamburger.focus();
  }

  function toggleMenuFromBtn(e) {
    if (e) { e.preventDefault && e.preventDefault(); }
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  }

  hamburger && hamburger.addEventListener('click', toggleMenuFromBtn);
  // Some mobile browsers prefer touchstart, add it (prevent double-invoke)
  hamburger && hamburger.addEventListener('touchstart', function (e) { e.preventDefault(); toggleMenuFromBtn(e); }, { passive: false });

  // close via close button
  mobileClose && mobileClose.addEventListener('click', closeMenu);

  // Close and scroll when clicking internal links inside the mobile menu
  // We'll handle mobile menu links inside the main anchor handler for smooth behavior.

  // Make the mobile dock links focusable and add active state on click
  document.querySelectorAll('.mobile-list a').forEach(a => {
    a.addEventListener('click', function () {
      document.querySelectorAll('.mobile-list a').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Click outside the nav area in mobile menu should close the menu
  mobileMenu && mobileMenu.addEventListener('click', function (e) {
    if (e.target === mobileMenu) closeMenu();
  });

  // Toggle aria-label for hamburger (accessibility)
  function updateAria() {
    if (!hamburger) return;
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  }

  // ensure aria-label is updated on toggle
  const ariaObserver = new MutationObserver(updateAria);
  if (hamburger) ariaObserver.observe(hamburger, { attributes: true, attributeFilter: ['aria-expanded'] });

  // Smooth scroll for internal hash links.
  // If the click comes from the open mobile menu, close the menu first then scroll to prevent overlay reflows blocking the scroll.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Ignore href="#" placeholders
      if (href === '#') return;
      const targetId = href.slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        // If the mobile menu is open, close the overlay first, then scroll into view to avoid conflicts.
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          closeMenu();
          // wait for close animation to complete (align with CSS transition ~280-350ms)
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 320);
        } else {
          // normal flow
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Close mobile menu on Escape only when it's open
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
  });

  // Keep mobile menu closed when resizing to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Basic focus trap for mobile menu while open (Tab/Shift+Tab)
  function focusTrap(e) {
    if (!mobileMenu || !mobileMenu.classList.contains('open')) return;
    if (e.key !== 'Tab') return;
    const focusable = mobileMenu.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  document.addEventListener('keydown', focusTrap);

  // Reveal animations using IntersectionObserver (stagger + reduced-motion aware)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.card, .project-card, .skill-card');
  if (prefersReduced) {
    // avoid animations for reduced motion: just make elements visible
    revealEls.forEach(el => el.classList.add('in-view'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // set a small staggered delay if not defined
          if (!el.getAttribute('data-delay')) {
            const index = Array.from(revealEls).indexOf(el) % 6; // safe modulo
            el.setAttribute('data-delay', index);
          }
          el.classList.add('in-view');
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: add in-view to all
    revealEls.forEach(el => el.classList.add('in-view'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
