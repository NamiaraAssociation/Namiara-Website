/* ============================================================
   NAMIARA — Main JavaScript
   Navigation, Scroll Animations, Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ===== NAVIGATION =====
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  // Scroll-based navbar styling
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ===== SCROLL SPY =====
  const sections = document.querySelectorAll('section[id]');

  const updateActiveLink = () => {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ===== REVEAL ON SCROLL =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve to allow re-triggering if needed
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.stat-number[data-count]');
  let countersAnimated = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const noSeparator = el.hasAttribute('data-no-separator');
    const duration = 2000;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(eased * target);

      if (noSeparator) {
        el.textContent = currentValue + suffix;
      } else {
        el.textContent = currentValue.toLocaleString('fr-FR') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(counter => animateCounter(counter));
      }
    });
  }, { threshold: 0.5 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsObserver.observe(statsBar);

  // ===== IMPACT COUNTER ANIMATION =====
  const impactCounters = document.querySelectorAll('.impact-number[data-count]');
  let impactAnimated = false;

  const impactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !impactAnimated) {
        impactAnimated = true;
        impactCounters.forEach(counter => animateCounter(counter));
      }
    });
  }, { threshold: 0.5 });

  const impactBar = document.querySelector('.impact-bar');
  if (impactBar) impactObserver.observe(impactBar);

  // ===== DONATION AMOUNT SELECTION =====
  const amountBtns = document.querySelectorAll('.amount-btn');
  const donateAmountEl = document.getElementById('donateAmount');
  const customAmountGroup = document.getElementById('customAmountGroup');
  const customAmountInput = document.getElementById('customAmount');
  let selectedAmount = 50;

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const amount = btn.getAttribute('data-amount');
      if (amount === 'custom') {
        customAmountGroup.style.display = 'block';
        customAmountInput.focus();
        selectedAmount = parseInt(customAmountInput.value) || 0;
        donateAmountEl.textContent = selectedAmount || '...';
      } else {
        customAmountGroup.style.display = 'none';
        selectedAmount = parseInt(amount);
        donateAmountEl.textContent = selectedAmount;
      }
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('input', () => {
      selectedAmount = parseInt(customAmountInput.value) || 0;
      donateAmountEl.textContent = selectedAmount || '...';
    });
  }

  // ===== DONATE BUTTON =====
  const donateBtn = document.getElementById('donateBtn');
  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      const name = document.getElementById('donorName').value.trim();
      const email = document.getElementById('donorEmail').value.trim();

      if (!name || !email) {
        showNotification('Veuillez remplir votre nom et email.', 'warning');
        return;
      }

      if (!selectedAmount || selectedAmount <= 0) {
        showNotification('Veuillez sélectionner un montant.', 'warning');
        return;
      }

      // Simulate success
      showNotification(`Merci ${name} ! Votre don de ${selectedAmount}€ a bien été enregistré. 💚`, 'success');

      // Reset form
      document.getElementById('donorName').value = '';
      document.getElementById('donorEmail').value = '';
      document.getElementById('donorMessage').value = '';
    });
  }


  // ===== NOTIFICATION SYSTEM =====
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
      <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="notification-text">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
    `;

    // Styles
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '440px',
      padding: '16px 20px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: '10000',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.9rem',
      color: '#F0F7F4',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
      animation: 'slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
    });

    if (type === 'success') {
      toast.style.background = 'rgba(45, 106, 79, 0.9)';
      toast.style.borderColor = 'rgba(82, 183, 136, 0.4)';
    } else if (type === 'warning') {
      toast.style.background = 'rgba(231, 111, 81, 0.9)';
      toast.style.borderColor = 'rgba(244, 162, 97, 0.4)';
    } else {
      toast.style.background = 'rgba(13, 31, 20, 0.95)';
      toast.style.borderColor = 'rgba(82, 183, 136, 0.3)';
    }

    const closeBtn = toast.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.6)',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '4px',
      lineHeight: '1',
    });

    document.body.appendChild(toast);

    // Add animation keyframes if not already
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto-dismiss
    setTimeout(() => {
      toast.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  }

  // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== PARALLAX EFFECT ON HERO =====
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }

  // ===== TILT EFFECT ON PROJECT CARDS =====
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // ===== TYPEWRITER EFFECT ON HERO BADGE =====
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    const text = heroBadge.textContent.trim();
    // Badge already has HTML content, so just add a subtle pulse
    heroBadge.style.animationDuration = '0.8s';
  }

  console.log('%c🌍 NAMIARA — Humanitaire Internationale', 'font-size: 16px; font-weight: bold; color: #52B788;');
  console.log('%c"Chaque vie mérite un horizon"', 'font-size: 12px; font-style: italic; color: #F4A261;');
});
