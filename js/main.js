// ===== Scroll Reveal =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}



// ===== Mobile Nav =====
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ===== Active Nav =====
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('navbar__link--active');
    }
  });
}

// ===== Navbar Scroll Effect =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // check initial state
}

// ===== Scroll to Top =====
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Research Filters =====
function initResearchFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card[data-category]');
  const sections = document.querySelectorAll('.section');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter cards
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Filter sections (hide sections with no visible cards)
      sections.forEach(section => {
        const sectionCards = section.querySelectorAll('.card[data-category]');
        if (sectionCards.length === 0) return; // Skip sections without filterable cards

        const hasVisibleCards = Array.from(sectionCards).some(card => !card.classList.contains('hidden'));
        if (hasVisibleCards) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
}

// ===== PDF Modal Viewer =====
function initPdfModal() {
  const modal = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-modal-iframe');
  const closeBtn = document.getElementById('pdf-modal-close');
  const backdrop = document.getElementById('pdf-modal-backdrop');
  const posterBtn = document.getElementById('poster-btn');

  if (!modal || !posterBtn) return;

  function openModal() {
    const pdfSrc = posterBtn.getAttribute('data-pdf');
    iframe.src = pdfSrc;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pdf-modal-open');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pdf-modal-open');
    // Clear iframe after transition to free resources
    setTimeout(() => { iframe.src = ''; }, 350);
  }

  posterBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveNav();
  initScrollReveal();
  initNavbarScroll();
  initScrollTop();
  initResearchFilters();
  initPdfModal();
});
