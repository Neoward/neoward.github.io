// E-Mail-Adresse erst im Browser zusammensetzen (Schutz vor Adresssammlern, die kein JavaScript ausführen).
// Teile stehen rückwärts in data-u (Name) und data-d (Domain); ohne JavaScript bleibt die geschützte Schreibweise stehen.
document.querySelectorAll('.em').forEach(function (el) {
  var r = function (s) { return s.split('').reverse().join(''); };
  var a = r(el.dataset.u) + String.fromCharCode(64) + r(el.dataset.d);
  var l = document.createElement('a');
  l.href = 'mai' + 'lto:' + a;
  l.textContent = a;
  el.replaceWith(l);
});
