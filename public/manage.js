(function () {
  var API = 'https://app.alongsidego.com';
  var form = document.getElementById('mform'), input = document.getElementById('mcode'), btn = document.getElementById('mbtn'), msg = document.getElementById('mmsg');
  function say(t) { msg.textContent = t; msg.hidden = !t; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = input.value.trim();
    if (!code) { say('Please enter your access code.'); return; }
    btn.disabled = true; say('Opening your account page...');
    fetch(API + '/api/portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: code }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (x.ok && x.d.url) { window.location.href = x.d.url; return; }
        btn.disabled = false;
        if (x.d && x.d.error === 'not-found') say('We could not find a subscription for that code. Please check it and try again, or write to hello@alongsidego.com.');
        else if (x.d && x.d.error === 'bad-code') say('That does not look like an access code. It looks like GO-XXXX-XXXX-XXXX.');
        else say('Something went wrong on our side. Please write to hello@alongsidego.com and we will help right away.');
      })
      .catch(function () { btn.disabled = false; say('We could not reach the server. Please check your connection and try again.'); });
  });
})();
