(function () {
  var API = 'https://app.alongsidego.com';
  document.addEventListener('contextmenu', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  var form = document.getElementById('signup');
  if (!form) return;
  var err = document.getElementById('err'), btn = document.getElementById('go');
  function fail(t) { err.textContent = t; err.hidden = false; btn.disabled = false; btn.textContent = 'Start my free 14-day trial'; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var role = document.getElementById('role');
    err.hidden = true;
    if (!role.value) { role.focus(); fail('Please tell us what you do.'); return; }
    btn.disabled = true; btn.textContent = 'One moment...';
    fetch(API + '/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: role.value, source: document.getElementById('source').value, referral: document.getElementById('referral').value, plan: document.getElementById('plan').value }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok && x.j.url) { window.location.href = x.j.url; return; }
        fail(x.j && x.j.error === 'not-set-up' ? 'Sign-ups are not open yet. Write to hello@alongsidego.com and we will let you know the moment they are.' : 'Something went wrong on our side. Please try again, or write to hello@alongsidego.com.');
      })
      .catch(function () { fail('We could not reach the sign-up service. Check your connection and try again, or write to hello@alongsidego.com.'); });
  });
})();
