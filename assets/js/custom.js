// assets/js/custom-navbar.js
(function () {
  // create small-site-title element once
  function createSmallTitle() {
    if (document.querySelector('.small-site-title')) return document.querySelector('.small-site-title');
    const a = document.createElement('a');
    a.className = 'small-site-title';
    a.href = window.location.origin + window.location.pathname.replace(/\/$/, '/') ; // root-ish
    const spanF = document.createElement('span'); spanF.className = 'fname'; spanF.textContent = 'Anuj';
    const spanL = document.createElement('span'); spanL.className = 'lname'; spanL.textContent = 'Tiwari';
    a.appendChild(spanF);
    a.appendChild(document.createTextNode(' '));
    a.appendChild(spanL);
    document.body.appendChild(a);
    return a;
  }

  function findBigHeader() {
    // try a few likely selectors (hero/header/large h1). Returns element or null.
    const selectors = [
      '.page-header', '.hero', '.site-hero', 'header.site-header', 'header',
      '.hero h1', '.page-header h1', '.site-hero h1', 'h1'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        // prefer an h1 or an element that actually contains your name
        if (el.tagName && el.tagName.toLowerCase() === 'h1') return el;
        // if the selector returned a container, look inside for h1
        const h = el.querySelector && el.querySelector('h1');
        if (h) return h;
        // fallback to the container itself
        return el;
      }
    }
    return null;
  }

  function setupObserver(targetEl, smallTitleEl) {
    // Use IntersectionObserver if available
    if ('IntersectionObserver' in window && targetEl) {
      const obs = new IntersectionObserver(function (entries) {
        const e = entries[0];
        if (e && e.isIntersecting) {
          document.body.classList.remove('show-small-title');
        } else {
          document.body.classList.add('show-small-title');
        }
      }, { threshold: 0 });
      obs.observe(targetEl);
      return true;
    }
    return false;
  }

  function fallbackScroll(threshold, smallTitleEl) {
    // fallback: show small title when scrolled past threshold pixels
    function check() {
      if (window.scrollY > threshold) document.body.classList.add('show-small-title');
      else document.body.classList.remove('show-small-title');
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
  }

  // run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else main();

  function main() {
    const small = createSmallTitle();
    const big = findBigHeader();

    // If big contains exact text "Anuj Tiwari", prefer that element (safeguard)
    let observed = null;
    if (big) {
      // if it's a large h1 that contains "Anuj", use it; else use the container
      observed = big;
    }

    const ok = setupObserver(observed, small);
    if (!ok) {
      // fallback: use the height of the header or 220px as threshold
      const th = (observed && observed.getBoundingClientRect && Math.max(80, observed.getBoundingClientRect().height)) || 220;
      fallbackScroll(th, small);
    }

    // small title should not capture pointer events except click; keep behaviour same
    small.addEventListener('click', function (e) {
      // default anchor behavior (go to homepage)
    });
  }
})();
