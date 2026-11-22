// Startseite, Effekte (22.11.): Sternenfeld mit Tiefe, Fortschrittsbalken, Zahlen zählen hoch, kippende Karten,
// Zielkreuz als Mauszeiger, Bildbetrachter, Parallax der Welle. Bei „weniger Bewegung“ bleibt alles ruhig.
(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Sternenfeld: drei Tiefen, driftet langsam, schiebt mit dem Scrollen und der Maus
  var cv = document.getElementById('stars'), cx = cv && cv.getContext('2d');
  var stars = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), mx = 0, my = 0;
  function size() {
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    var n = Math.round(innerWidth * innerHeight / 5200);
    stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1, t: Math.random() * 6.3 });
  }
  function draw(t) {
    cx.clearRect(0, 0, W, H);
    var sy = scrollY * dpr;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], z = s.z;
      var x = (s.x + (still ? 0 : t * .006 * z * dpr) - mx * z * 18 * dpr) % W; if (x < 0) x += W;
      var y = (s.y - sy * z * .25 - my * z * 18 * dpr) % H; if (y < 0) y += H;
      var a = .35 + .65 * z * (still ? 1 : .75 + .25 * Math.sin(t * .0015 + s.t));
      cx.fillStyle = z > .8 ? 'rgba(170,240,255,' + a + ')' : 'rgba(210,220,240,' + a * .8 + ')';
      var r = (z * 1.6 + .3) * dpr;
      cx.fillRect(x, y, r, r);
    }
    if (!still) requestAnimationFrame(draw);
  }
  if (cx) { size(); addEventListener('resize', size); requestAnimationFrame(draw); }

  // Fortschrittsbalken und Parallax der Welle
  var bar = document.querySelector('.progress'), wave = document.querySelector('.wave-art');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0).toFixed(4) + ')';
    if (wave && !still) {
      var r = wave.parentNode.getBoundingClientRect();
      wave.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * parseFloat(wave.dataset.parallax)).toFixed(1) + 'px,0)';
    }
    if (still && cx) requestAnimationFrame(draw);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Zahlen zählen hoch, sobald sie im Bild sind
  var nums = document.querySelectorAll('.stats b[data-n]');
  if ('IntersectionObserver' in window && !still) {
    nums.forEach(function (b) { b.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, n = +el.dataset.n, t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / 1400); k = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(n * k);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .6 });
    nums.forEach(function (b) { io.observe(b); });
  }

  // Kippende Karten mit Lichtfleck unter der Maus
  if (fine && !still) document.querySelectorAll('.tilt').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.transform = 'perspective(800px) rotateX(' + ((.5 - py) * 10).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 12).toFixed(2) + 'deg) translateZ(6px)';
      c.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); c.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  // Zielkreuz folgt der Maus, wird über Links größer
  var ret = document.querySelector('.reticle');
  if (fine && ret) {
    var tx = 0, ty = 0, rx = 0, ry = 0;
    addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; ret.classList.add('on');
      mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
      ret.classList.toggle('hot', !!e.target.closest('a, button, .shot, .tilt'));
    });
    document.addEventListener('mouseleave', function () { ret.classList.remove('on'); });
    (function follow() {
      rx += (tx - rx) * (still ? 1 : .25); ry += (ty - ry) * (still ? 1 : .25);
      ret.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(follow);
    })();
  }

  // Bildbetrachter für die Galerie
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var img = lb.querySelector('img');
    document.querySelectorAll('.shot').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); img.src = a.href; img.alt = a.querySelector('img').alt; lb.hidden = false;
      });
    });
    lb.addEventListener('click', function () { lb.hidden = true; });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
  }
})();
