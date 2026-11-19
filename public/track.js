// Private visit counting for alongsidego.com.
// No cookies and nothing personal: a random id that lives only in this browser tab, which parts of the page
// were seen, which buttons were pressed, how long the visit lasted, where the visit came from, and phone or computer.
(function () {
  'use strict';
  var URL_ = 'https://app.alongsidego.com/api/t';
  if (!navigator.sendBeacon || /bot|crawl|spider|headless/i.test(navigator.userAgent || '')) return;
  var id;
  try { id = sessionStorage.getItem('ag-v'); if (!id) { id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem('ag-v', id); } } catch (e) { id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); }
  var started = Date.now(), before = 0;
  try { before = Number(sessionStorage.getItem('ag-secs')) || 0; } catch (e) { before = 0; }
  function send(o) { o.s = 'go'; o.v = id; try { navigator.sendBeacon(URL_, new Blob([JSON.stringify(o)], { type: 'text/plain' })); } catch (e) { /* nothing to do */ } }
  var pages = { '/privacy.html': 'Privacy policy page', '/terms.html': 'Terms page', '/manage.html': 'Manage subscription page', '/welcome.html': 'Welcome page' };
  var page = pages[location.pathname] || 'Top';
  var ref = '';
  try { var r = document.referrer ? new URL(document.referrer) : null; ref = r && r.hostname !== location.hostname ? r.hostname : (r ? 'alongsidego.com' : ''); } catch (e) { ref = ''; }
  var phone = window.matchMedia && window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
  send({ e: 'start', p: page, r: ref, d: phone ? 'phone' : 'computer' });
  if (page !== 'Top') send({ e: 'see', n: page });

  // parts of the home page: counted once per visit when at least a third of it shows on screen
  var parts = { top: 'Top', how: 'How it works', demos: 'Demos', makeups: 'Makeups', privacy: 'Privacy', who: "Who it's for", reviews: 'Reviews', pricing: 'Pricing', join: 'Sign-up form', faq: 'Questions' };
  var seen = {};
  function saw(name) { if (seen[name]) return; seen[name] = true; send({ e: 'see', n: name }); }
  if (page === 'Top') {
    saw('Top');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (list) { list.forEach(function (en) { if (en.isIntersecting) { saw(parts[en.target.id]); io.unobserve(en.target); } }); }, { threshold: 0.33 });
      Object.keys(parts).forEach(function (k) { var el = document.getElementById(k); if (el && k !== 'top') io.observe(el); });
    }
  }

  // buttons and links worth knowing about
  var clicked = {};
  function click(name, once) { if (once && clicked[name]) return; clicked[name] = true; send({ e: 'click', n: name }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href === '#join') click('Get Alongside Go');
    else if (href === '#how' && /btn/.test(a.className)) click('See how it works');
    else if (/manage\.html/.test(href)) click('Manage subscription');
    else if (/alongsideot\.com/.test(href)) click('Alongside OT link');
    else if (/^mailto:/.test(href)) click('Email us');
  }, true);
  document.addEventListener('submit', function (e) { if (e.target && e.target.id === 'signup') click('Start free trial'); }, true);
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'plan') click(e.target.value === 'monthly' ? 'Chose monthly' : 'Chose yearly'); }, true);
  document.addEventListener('toggle', function (e) { if (e.target && e.target.tagName === 'DETAILS' && e.target.open) click('Opened a question'); }, true);

  // how long the visit lasted, across pages in the same tab; sent when the page is put away
  var shownAt = Date.now(), visible = 0;
  function total() { return before + visible + (document.visibilityState === 'visible' ? Date.now() - shownAt : 0) / 1000; }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      visible += (Date.now() - shownAt) / 1000;
      var t = Math.round(before + visible);
      try { sessionStorage.setItem('ag-secs', String(t)); } catch (e) { /* fine */ }
      send({ e: 'end', secs: t });
    } else shownAt = Date.now();
  });
  window.addEventListener('pagehide', function () { if (document.visibilityState === 'visible') { var t = Math.round(total()); try { sessionStorage.setItem('ag-secs', String(t)); } catch (e) { /* fine */ } send({ e: 'end', secs: t }); } });
  void started;
})();
