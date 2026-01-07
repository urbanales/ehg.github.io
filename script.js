// Robust tab handler + initials avatars + equal-height cards
(function () {
  function openTab(tabId, ev) {
    ev = ev || window.event;
    const contents = document.querySelectorAll('.tab-content');
    const tabs = document.querySelectorAll('.tab');

    contents.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('hidden', '');
      c.setAttribute('aria-hidden', 'true');
    });
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    const panel = document.getElementById(tabId);
    if (!panel) return;
    panel.classList.add('active');
    panel.removeAttribute('hidden');
    panel.removeAttribute('aria-hidden');

    const target = ev && (ev.currentTarget || ev.target);
    if (target && target.classList) {
      target.classList.add('active');
      target.setAttribute('aria-selected', 'true');
      try { target.focus(); } catch (e) {}
    }
    // after switching tabs, ensure card heights are equal
    equalizeCards();
  }

  // keyboard nav
  function handleTabKeydown(e) {
    const active = document.activeElement;
    if (!active || !active.classList.contains('tab')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const index = tabs.indexOf(active);
      if (index === -1) return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      let next = (index + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      active.click();
      e.preventDefault();
    }
  }

  // avatars
  function initialsFromName(name) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0,2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  function hashStringToInt(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }
  function pastelColorFromString(s) {
    const hash = hashStringToInt(String(s));
    const hue = hash % 360;
    return `hsl(${hue} 60% 78%)`;
  }
  function textColorForBg() { return '#0f1724'; }

  function generateAvatars() {
    const avatars = document.querySelectorAll('.team-photo.avatar');
    avatars.forEach(av => {
      const name = av.getAttribute('data-name') || '';
      const initials = initialsFromName(name);
      const bg = pastelColorFromString(name || 'default');
      av.style.background = bg;
      av.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'avatar-text';
      span.textContent = initials;
      span.style.color = textColorForBg();
      av.appendChild(span);
      av.setAttribute('role', 'img');
      av.setAttribute('aria-label', name || 'Team member');
    });
  }

  // Equalize heights -------------------------------------------------------
  function equalizeCards() {
    const cards = Array.from(document.querySelectorAll('.team-card'));
    if (!cards.length) return;
    // Reset heights to natural height first
    cards.forEach(c => { c.style.height = ''; });

    // compute max height across cards
    let max = 0;
    cards.forEach(c => {
      const h = c.getBoundingClientRect().height;
      if (h > max) max = h;
    });
    if (max > 0) {
      cards.forEach(c => { c.style.height = Math.ceil(max) + 'px'; });
    }
  }

  // debounce helper
  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), wait);
    };
  }

  // Initialization & events ------------------------------------------------
  function init() {
    generateAvatars();
    equalizeCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // recalc on resize (debounced)
  window.addEventListener('resize', debounce(equalizeCards, 150));
  // also recalc when images load (in case you add photos later)
  window.addEventListener('load', equalizeCards);

  document.addEventListener('keydown', handleTabKeydown);
  window.openTab = openTab;

})();