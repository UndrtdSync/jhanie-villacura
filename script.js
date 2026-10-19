(function () {
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var revealEls = document.querySelectorAll('.fade, .sec-head');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  var sections = document.querySelectorAll('main section, #home');
  var links = document.querySelectorAll('.nav-links a');
  function setActive() {
    var pos = window.scrollY + 120;
    var current = 'home';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  function splitWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (p.classList && p.classList.contains('word')) return NodeFilter.FILTER_REJECT;
        var disp = '';
        try { disp = getComputedStyle(p).display; } catch (e) {}
        if (disp === 'flex' || disp === 'inline-flex' || disp === 'grid' || disp === 'inline-grid') {
          if (!(p.matches && p.matches('.hero-tag, .btn, .logo, .course-chip'))) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      tn.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part || /^\s+$/.test(part)) return;
        var s = document.createElement('span');
        s.className = 'word';
        s.textContent = part;
        frag.appendChild(s);
      });
      if (frag.childNodes.length) tn.parentNode.replaceChild(frag, tn);
    });
  }

  function initWords() {
    splitWords(document.body);
    var wordEls = document.querySelectorAll('.word');
    if (!wordEls.length) return;

    var blocks = [];
    wordEls.forEach(function (w) {
      var p = w.parentElement;
      if (p && blocks.indexOf(p) === -1) blocks.push(p);
    });
    blocks.forEach(function (b) {
      b.querySelectorAll('.word').forEach(function (w, i) {
        w.style.transitionDelay = Math.min(i * 45, 520) + 'ms';
      });
    });

    var active = [], leaveTimers = [], lastRun = 0;
    for (var i = 0; i < blocks.length; i++) { active.push(false); leaveTimers.push(null); }

    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        var r = b.getBoundingClientRect();
        var vis = r.bottom > 1 && r.top < vh * 0.92;
        if (vis && !active[i]) {
          if (leaveTimers[i]) { clearTimeout(leaveTimers[i]); leaveTimers[i] = null; }
          active[i] = true;
          b.querySelectorAll('.word').forEach(function (w) { w.classList.add('in'); });
        } else if (!vis && active[i] && !leaveTimers[i]) {
          (function (idx, blk) {
            leaveTimers[idx] = setTimeout(function () {
              blk.querySelectorAll('.word').forEach(function (w) { w.classList.remove('in'); });
              active[idx] = false;
              leaveTimers[idx] = null;
            }, 1000);
          })(i, b);
        }
      }
    }
    function onScroll() {
      var now = Date.now();
      if (now - lastRun < 50) return;
      lastRun = now;
      check();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWords);
  } else {
    initWords();
  }
})();
