(function () {
  var API = 'https://app.alongsidego.com';
  var id = new URLSearchParams(location.search).get('session_id');
  var show = function (k) { ['wait', 'done', 'miss'].forEach(function (x) { document.getElementById(x).hidden = x !== k; }); };
  if (!id) { show('miss'); return; }
  var tries = 0;
  function poll() {
    fetch(API + '/api/license/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session_id: id }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ready) { document.getElementById('code').textContent = j.code; document.getElementById('ref').textContent = j.refCode || ''; show('done'); return; }
        again();
      }).catch(again);
  }
  function again() { tries++; if (tries > 25) { show('miss'); return; } setTimeout(poll, 1500); }
  document.getElementById('copy').addEventListener('click', function () {
    var b = this, t = document.getElementById('code').textContent;
    navigator.clipboard.writeText(t).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = 'Select the code and copy it'; });
  });
  poll();
})();
