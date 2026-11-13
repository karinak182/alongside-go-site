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
