(function () {
  var API = 'https://app.alongsidego.com';
  document.addEventListener('contextmenu', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  // Menu links glide to their section and leave the address bar clean (no #pricing and so on).
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function jump(id) {
    var el = id === 'top' || !id ? document.body : document.getElementById(id);
    if (!el) return false;
    if (id === 'top' || !id) window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (jump(id)) { e.preventDefault(); if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); }
  });
  if (location.hash && history.replaceState) {
    var start = location.hash.slice(1);
    setTimeout(function () { jump(start); history.replaceState(null, '', location.pathname + location.search); }, 50);
  }
  // demo clips play while visible, never for people who prefer less motion, and can always be paused
  var vids = [].slice.call(document.querySelectorAll('.vwrap video'));
  vids.forEach(function (v) {
    var btn = v.parentNode.querySelector('.vbtn'), userPaused = calm;
    function label() { btn.textContent = v.paused ? 'Play' : 'Pause'; btn.setAttribute('aria-label', v.paused ? 'Play the demo' : 'Pause the demo'); }
    btn.addEventListener('click', function () { if (v.paused) { userPaused = false; v.play().catch(function () {}); } else { userPaused = true; v.pause(); } label(); });
    v.addEventListener('play', label); v.addEventListener('pause', label); label();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !userPaused) v.play().catch(function () {}); else v.pause(); }); }, { threshold: 0.5 }).observe(v);
    } else if (!calm) { v.play().catch(function () {}); }
  });
  // reviews carousel
  var track = document.getElementById('track');
  if (track) {
    var cards = [].slice.call(track.children), cnt = document.getElementById('cnt');
    var at = function () { return Math.round(track.scrollLeft / (track.clientWidth + 16)); };
    var go = function (i) { i = Math.max(0, Math.min(cards.length - 1, i)); track.scrollTo({ left: i * (track.clientWidth + 16), behavior: calm ? 'auto' : 'smooth' }); };
    document.getElementById('prev').addEventListener('click', function () { go(at() - 1); });
    document.getElementById('next').addEventListener('click', function () { go(at() + 1); });
    track.addEventListener('scroll', function () { cnt.textContent = (at() + 1) + ' of ' + cards.length; });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(at() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(at() - 1); } });
  }
  var form = document.getElementById('signup');
  if (!form) return;
  var err = document.getElementById('err'), btn = document.getElementById('go');
  // choosing "Other" opens a box so people can say in their own words
  function wire(selId, wrapId) {
    var sel = document.getElementById(selId), wrap = document.getElementById(wrapId);
    sel.addEventListener('change', function () { wrap.hidden = sel.value !== 'Other'; });
  }
  wire('role', 'role-other-wrap'); wire('source', 'source-other-wrap');
  function answer(selId, otherId) {
    var v = document.getElementById(selId).value, o = document.getElementById(otherId).value.trim();
    return v === 'Other' && o ? 'Other: ' + o : v;
  }
  function fail(t) { err.textContent = t; err.hidden = false; btn.disabled = false; btn.textContent = 'Start my free 14-day trial'; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var role = document.getElementById('role');
    err.hidden = true;
    if (!role.value) { role.focus(); fail('Please tell us what you do.'); return; }
    btn.disabled = true; btn.textContent = 'One moment...';
    fetch(API + '/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: answer('role', 'role-other'), source: answer('source', 'source-other'), referral: document.getElementById('referral').value, plan: document.getElementById('plan').value }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok && x.j.url) { window.location.href = x.j.url; return; }
        fail(x.j && x.j.error === 'not-set-up' ? 'Sign-ups are not open yet. Write to hello@alongsidego.com and we will let you know the moment they are.' : 'Something went wrong on our side. Please try again, or write to hello@alongsidego.com.');
      })
      .catch(function () { fail('We could not reach the sign-up service. Check your connection and try again, or write to hello@alongsidego.com.'); });
  });
})();
