// Startseite: Banner mit Parallax, Kopfleiste mit Logo erscheint nach dem Banner, Gizmo kommt dazu, sobald das
// Banner (mit seiner eigenen Gizmo-Figur) aus dem Bild ist, schwebt mit und spricht je Abschnitt eine Zeile.
(function () {
  var top = document.querySelector('.top');
  var hero = document.querySelector('.hero-art');
  var giz = document.querySelector('.gizmo');
  var say = document.getElementById('gizmo-say');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  var line = '';
  function frame() {
    ticking = false;
    var y = window.scrollY;
    var h = hero ? hero.offsetHeight : window.innerHeight;
    top.classList.toggle('solid', y > h * 0.6);
    var show = y > h * 0.75;
    if (giz) {
      if (show && !giz.classList.contains('on')) { giz.classList.add('on'); speak(line); }
      if (!show) giz.classList.remove('on');
      if (!still) giz.style.transform = 'translate3d(0,' + (Math.sin(y / 260) * 14).toFixed(1) + 'px,0)';
    }
    if (hero && !still && y < h * 1.5) hero.style.transform = 'translate3d(0,' + (y * parseFloat(hero.dataset.parallax)).toFixed(1) + 'px,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);

  var timer;
  function speak(t) {
    line = t;
    if (!say || !t) return;
    say.classList.remove('on');
    clearTimeout(timer);
    timer = setTimeout(function () { say.textContent = t; say.classList.add('on'); }, 250);
  }
  frame();
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.block').forEach(function (b) { b.classList.add('seen'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('seen');
      if (e.target.dataset.gizmo && e.target.dataset.gizmo !== line) speak(e.target.dataset.gizmo);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.block').forEach(function (b) { io.observe(b); });
})();
