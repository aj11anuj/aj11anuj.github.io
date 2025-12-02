// Quick live patch: inject CSS, hide theme toggle, add small title, and toggle on scroll.
// Paste the whole block into DevTools Console and press Enter.

(function () {
  // --- Inject CSS for small title + hiding helpers ---
  const css = `
    /* injected small-title css */
    .small-site-title {
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%) translateY(-6px);
      opacity: 0;
      transition: opacity .22s ease, transform .22s ease;
      z-index: 99999;
      font-size: 1.05rem;
      text-decoration: none;
      color: inherit;
      pointer-events: auto;
      background: transparent;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      display: inline-block;
      font-family: inherit;
    }
    .small-site-title .fname { font-weight: 700; }
    .small-site-title .lname { font-weight: 400; }
    body.show-small-title .small-site-title {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    /* extra: ensure injected element doesn't block clicks on page edges */
    .small-site-title { pointer-events: auto; }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-injected', 'small-site-title');
  style.textContent = css;
  document.head.appendChild(style);

  // --- Hide theme toggle aggressively by heuristics ---
  function hideThemeToggles() {
    const patterns = [
      /theme/i, /mode/i, /dark/i, /color/i, /toggle/i, /switch/i
    ];
    const candidates = Array.from(document.querySelectorAll('button, a, div, span, input, li'));
    candidates.forEach(el => {
      try {
        const cls = (el.className || '').toString();
        const id = (el.id || '').toString();
        const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
        const txt = (el.innerText || el.textContent || '').toString();
        const combined = [cls, id, aria, txt].join(' ').toLowerCase();
        // quick heuristic: if any pattern matches the combined string AND element is visible -> hide it
        if (patterns.some(p => p.test(combined))) {
          const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
          const visible = rect && rect.width > 6 && rect.height > 6;
          if (visible) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      } catch (ignore) {}
    });

    // second pass: hide any element that visually looks like a moon/sun icon (unicode or emoji)
    const iconCandidates = Array.from(document.querySelectorAll('button, a, span, i'));
    iconCandidates.forEach(el => {
      const t = (el.innerText || el.textContent || '').trim();
      if (t && /☾|☀|🌙|🌞|moon|sun/i.test(t)) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
      }
    });
  }

  hideThemeToggles();

  // --- Create small-site-title element ---
  function createSmallTitle() {
    if (document.querySelector('.small-site-title')) return document.querySelector('.small-site-title');
    const a = document.createElement('a');
    a.className = 'small-site-title';
    a.href = window.location.origin + '/';
    a.style.textDecoration = 'none';
    a.setAttribute('aria-hidden', 'false');
    const spanF = document.createElement('span'); spanF.className = 'fname'; spanF.textContent = 'Anuj';
    const spanL = document.createElement('span'); spanL.className = 'lname'; spanL.textContent = 'Tiwari';
    a.appendChild(spanF);
    a.appendChild(document.createTextNode(' '));
    a.appendChild(spanL);
    document.body.appendChild(a);
    return a;
  }

  const small = createSmallTitle();

  // --- Find the big header element to observe (smart heuristics) ---
  function findBigHeader() {
    // prefer an h1 that contains "Anuj" if exists
    const h1s = Array.from(document.querySelectorAll('h1'));
    for (const h of h1s) {
      if (/anuj/i.test(h.textContent || '')) return h;
    }
    // try common hero/header selectors
    const selectors = ['.page-header', '.hero', '.site-hero', 'header.site-header', 'header', '.masthead', '.intro'];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) {
        // prefer child h1
        const h = el.querySelector && el.querySelector('h1');
        if (h) return h;
        return el;
      }
    }
    // fallback to first h1 if any
    if (h1s.length) return h1s[0];
    return null;
  }

  const target = findBigHeader();

  // --- Setup IntersectionObserver or fallback ---
  function setupObserver(targetEl) {
    if (!targetEl) {
      // no target found — fallback to pixel threshold
      window.addEventListener('scroll', () => {
        if (window.scrollY > 220) document.body.classList.add('show-small-title'); else document.body.classList.remove('show-small-title');
      }, { passive: true });
      return;
    }
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        const e = entries[0];
        if (e && e.isIntersecting) document.body.classList.remove('show-small-title'); else document.body.classList.add('show-small-title');
      }, { threshold: 0 });
      obs.observe(targetEl);
    } else {
      // fallback: use element bottom as threshold
      const rect = targetEl.getBoundingClientRect();
      const topOffset = rect.bottom + window.scrollY;
      window.addEventListener('scroll', () => {
        if (window.scrollY > topOffset) document.body.classList.add('show-small-title'); else document.body.classList.remove('show-small-title');
      }, { passive: true });
    }
  }

  setupObserver(target);

  // final: try hiding toggles again after some time (in case theme script injects later)
  setTimeout(hideThemeToggles, 800);
  setTimeout(hideThemeToggles, 1800);

  console.log('Live patch applied — small-site-title injected and theme toggle hiding attempted.');
})();
