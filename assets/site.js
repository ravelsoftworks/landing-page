/* Ravel Softworks: page script.
   One small isometric renderer draws every plate on the page (the hero R, the
   brief builder, the line plate in chapter V). The scroll engine
   (scrollcraft.js) is untouched; everything bespoke lives here. */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var COS = 0.8660254, SIN = 0.5;

  var INK = '#0C1B36';
  var PAL = {
    teal:   { t: '#5FE6D2', r: '#12B8A6', l: '#0B7F80' },
    blue:   { t: '#6CC3FF', r: '#1E7BF2', l: '#1A4FC4' },
    indigo: { t: '#8C92FF', r: '#4A52E6', l: '#3036B0' },
    navy:   { t: '#3C5282', r: '#1D2F57', l: '#13223F' },
    paper:  { t: '#FFFFFF', r: '#DCD8CE', l: '#BEB8AA' },
    sky:    { t: '#C8EEFF', r: '#86CBEF', l: '#5499C4' },
    deep:   { t: '#34B3A3', r: '#16786E', l: '#0E5550' },
    plinth: { t: '#E2DED4', r: '#CFC9BC', l: '#B7B0A1' }
  };

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function iso(x, y, z, u) { return [(x - y) * COS * u, (x + y) * SIN * u - z * u]; }
  function pts(list, u) {
    return list.map(function (p) { var q = iso(p[0], p[1], p[2], u); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' ');
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  // A box from (x,y,z) with size (w,d,h). Draws the three faces the viewer sees.
  function box(parent, x, y, z, w, d, h, u, pal, opt) {
    opt = opt || {};
    var g = el('g', {}, parent);
    var X = x + w, Y = y + d, Z = z + h;
    var stroke = opt.stroke || 'rgba(12,27,54,0.38)';
    var sw = opt.sw || 0.7;
    var fill = function (c) { return opt.line ? '#F3F1EB' : c; };
    el('polygon', { points: pts([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], u), fill: fill(pal.l), stroke: stroke, 'stroke-width': sw, 'stroke-linejoin': 'round' }, g);
    el('polygon', { points: pts([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], u), fill: fill(pal.r), stroke: stroke, 'stroke-width': sw, 'stroke-linejoin': 'round' }, g);
    el('polygon', { points: pts([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], u), fill: fill(pal.t), stroke: stroke, 'stroke-width': sw, 'stroke-linejoin': 'round' }, g);
    if (opt.grid) {
      // unit seams, so a slab still reads as blocks
      var seam = { stroke: 'rgba(12,27,54,0.16)', 'stroke-width': 0.6 };
      for (var i = 1; i < w; i++) {
        el('line', lineAttrs(iso(x + i, y, Z, u), iso(x + i, Y, Z, u), seam), g);
        el('line', lineAttrs(iso(x + i, Y, z, u), iso(x + i, Y, Z, u), seam), g);
      }
      for (var j = 1; j < d; j++) {
        el('line', lineAttrs(iso(x, y + j, Z, u), iso(X, y + j, Z, u), seam), g);
        el('line', lineAttrs(iso(X, y + j, z, u), iso(X, y + j, Z, u), seam), g);
      }
    }
    return g;
  }
  function lineAttrs(a, b, extra) {
    var o = { x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2) };
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  /* ------------------------------------------------------------------ R --
     The mark as voxels: a 5 x 7 pixel R in the x/z plane, two blocks deep.
     Stem = software, bowl = AI & automation, leg = IT & cloud. */
  var R_ROWS = [
    // z = 6 at the top
    '####.',
    '#...#',
    '#...#',
    '####.',
    '#.#..',
    '#..#.',
    '#...#'
  ];
  function rVoxels() {
    var out = [];
    for (var r = 0; r < R_ROWS.length; r++) {
      var z = R_ROWS.length - 1 - r;
      for (var x = 0; x < 5; x++) {
        if (R_ROWS[r][x] !== '#') continue;
        var grp = x === 0 ? 'stem' : (z >= 3 ? 'bowl' : 'leg');
        for (var y = 0; y < 2; y++) out.push({ x: x, y: y, z: z, g: grp });
      }
    }
    // painter's order: far to near
    out.sort(function (a, b) { return (a.x + a.y + a.z) - (b.x + b.y + b.z) || a.z - b.z; });
    return out;
  }
  var GROUP_PAL = { stem: PAL.teal, bowl: PAL.blue, leg: PAL.indigo };
  var GROUP_OFF = { stem: [-1.3, 0.9, 0.2], bowl: [0.9, -0.9, 1.9], leg: [2.0, 1.1, 0.5] };

  function hash(n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

  /* ---------------------------------------------------------- hero plate -- */
  function heroPlate() {
    var svg = document.getElementById('hero-r');
    if (!svg) return null;
    var u = 42;
    var root = el('g', {}, svg);
    // centre the finished R (plus plinth) on the origin
    var c = iso(2.5, 1, 3.2, u);
    root.setAttribute('transform', 'translate(' + (-c[0]).toFixed(1) + ',' + (-c[1] + 20).toFixed(1) + ')');

    // ground shadow + plinth stay put: the contact surface
    el('polygon', { points: pts([[-1.6, -1.2, -0.6], [6.8, -1.2, -0.6], [6.8, 3.4, -0.6], [-1.6, 3.4, -0.6]], u), fill: 'rgba(12,27,54,0.06)' }, root);
    box(root, -1, -0.8, -0.45, 7, 3.6, 0.45, u, PAL.plinth, { stroke: 'rgba(12,27,54,0.3)' });

    var vox = rVoxels().map(function (v, i) {
      var g = box(root, v.x, v.y, v.z, 1, 1, 1, u, GROUP_PAL[v.g]);
      var o = GROUP_OFF[v.g];
      var j = [(hash(i + 1) - 0.5) * 0.7, (hash(i + 7) - 0.5) * 0.7, hash(i + 13) * 0.6 + v.z * 0.08];
      var off = [o[0] + j[0], o[1] + j[1], o[2] + j[2]];
      var s = iso(off[0], off[1], off[2], u);
      return { g: g, dx: s[0], dy: s[1] };
    });

    // callouts: leader lines + labels, in the drawing's own idiom
    var labels = el('g', { class: 'callouts' }, root);
    var calls = [
      { a: iso(0.5, 2, 4.6, u), b: [-250, -170], t: 'Software engineering', n: '01', anchor: 'start' },
      { a: iso(3, 1, 7, u), b: [270, -250], t: 'AI & automation', n: '02', anchor: 'end' },
      { a: iso(5, 1.5, 0.6, u), b: [330, 20], t: 'IT & cloud', n: '03', anchor: 'end' }
    ];
    var callEls = calls.map(function (k) {
      var g = el('g', {}, labels);
      var mid = [k.b[0], k.a[1] + (k.b[1] - k.a[1]) * 0.0];
      var path = el('path', {
        d: 'M' + k.a[0].toFixed(1) + ' ' + k.a[1].toFixed(1) + ' L' + k.b[0] + ' ' + k.b[1],
        fill: 'none', stroke: INK, 'stroke-width': 0.9, pathLength: 1,
        'stroke-dasharray': 1, 'stroke-dashoffset': 1
      }, g);
      el('circle', { cx: k.a[0].toFixed(1), cy: k.a[1].toFixed(1), r: 2.6, fill: INK }, g);
      var tx = el('text', { x: k.b[0], y: k.b[1] - 10, 'text-anchor': k.anchor, 'font-size': 13, fill: INK }, g);
      tx.textContent = k.t;
      var nn = el('text', { x: k.b[0], y: k.b[1] + 20, 'text-anchor': k.anchor, 'font-size': 11, fill: '#0A6E65' }, g);
      nn.textContent = k.n;
      el('line', { x1: k.b[0] - (k.anchor === 'end' ? 150 : 0), y1: k.b[1], x2: k.b[0] + (k.anchor === 'end' ? 0 : 150), y2: k.b[1], stroke: INK, 'stroke-width': 0.9, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, class: 'shelf' }, g);
      void mid;
      return { g: g, path: path, shelf: g.querySelector('.shelf'), text: [tx, nn] };
    });

    // near plane: three loose blocks, the fastest layer
    var nears = Array.prototype.slice.call(document.querySelectorAll('.hero__near .near'));
    var nearPal = [PAL.teal, PAL.indigo, PAL.blue];
    nears.forEach(function (s, i) { box(s, -0.5, -0.5, -0.5, 1, 1, 1, 30, nearPal[i]); });

    var far = document.querySelector('.hero__far');
    var section = document.getElementById('top');
    var mx = 0, my = 0, tmx = 0, tmy = 0;

    if (finePointer && !reduce) {
      section.addEventListener('pointermove', function (e) {
        tmx = (e.clientX / innerWidth - 0.5) * 2;
        tmy = (e.clientY / innerHeight - 0.5) * 2;
      });
      section.addEventListener('pointerleave', function () { tmx = 0; tmy = 0; });
    }

    var last = -1;
    function frame() {
      var rect = section.getBoundingClientRect();
      var travel = Math.max(rect.height - innerHeight, 1);
      var p = reduce ? 1 : clamp01(-rect.top / travel);
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      var key = p.toFixed(4) + mx.toFixed(3) + my.toFixed(3);
      if (key !== last && rect.bottom > 0) {
        last = key;
        var e = ease(clamp01(p / 0.72));
        var k = 1 - e;
        for (var i = 0; i < vox.length; i++) {
          vox[i].g.setAttribute('transform', 'translate(' + (vox[i].dx * k).toFixed(2) + ',' + (vox[i].dy * k).toFixed(2) + ')');
        }
        var cp = clamp01((p - 0.35) / 0.5);
        callEls.forEach(function (c, i) {
          var t = clamp01(cp * 1.6 - i * 0.3);
          c.path.setAttribute('stroke-dashoffset', (1 - t).toFixed(3));
          c.shelf.setAttribute('stroke-dashoffset', (1 - clamp01(t * 1.4 - 0.3)).toFixed(3));
          c.text[0].setAttribute('opacity', clamp01(t * 2 - 1).toFixed(3));
          c.text[1].setAttribute('opacity', clamp01(t * 2 - 1).toFixed(3));
        });
        if (!reduce) {
          if (far) far.style.transform = 'translate3d(' + (mx * -4).toFixed(2) + 'px,' + (p * -36 + my * -4).toFixed(2) + 'px,0)';
          svg.style.transform = 'translate3d(' + (mx * 8).toFixed(2) + 'px,' + (p * -18 + my * 6).toFixed(2) + 'px,0)';
          var rates = [-150, -230, -90], pr = [18, 26, 14];
          nears.forEach(function (n, i) {
            n.style.transform = 'translate3d(' + (mx * pr[i]).toFixed(2) + 'px,' + (p * rates[i] + my * pr[i]).toFixed(2) + 'px,0) rotate(' + (p * (i - 1) * 12).toFixed(2) + 'deg)';
          });
        }
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    frame();
    return true;
  }

  /* ------------------------------------------------------- chapter V plate -- */
  function whyPlate() {
    var svg = document.getElementById('why-svg');
    if (!svg) return;
    var u = 38;
    var root = el('g', {}, svg);
    var c = iso(2.5, 1, 3.2, u);
    root.setAttribute('transform', 'translate(' + (-c[0]).toFixed(1) + ',' + (-c[1] + 10).toFixed(1) + ')');
    rVoxels().forEach(function (v) {
      box(root, v.x, v.y, v.z, 1, 1, 1, u, PAL.paper, { line: true, stroke: INK, sw: 1 });
    });
    // dimension lines, drawn like an engineering plate
    function dim(a, b, off, label, anchor) {
      var A = iso(a[0], a[1], a[2], u), B = iso(b[0], b[1], b[2], u);
      var o = off;
      var g = el('g', { stroke: INK, 'stroke-width': 0.8, fill: 'none' }, root);
      el('line', lineAttrs([A[0] + o[0], A[1] + o[1]], [B[0] + o[0], B[1] + o[1]], {}), g);
      el('line', lineAttrs(A, [A[0] + o[0] * 1.15, A[1] + o[1] * 1.15], { 'stroke-dasharray': '2 3' }), g);
      el('line', lineAttrs(B, [B[0] + o[0] * 1.15, B[1] + o[1] * 1.15], { 'stroke-dasharray': '2 3' }), g);
      [A, B].forEach(function (P) { el('circle', { cx: P[0] + o[0], cy: P[1] + o[1], r: 2.2, fill: INK, stroke: 'none' }, g); });
      var mx = (A[0] + B[0]) / 2 + o[0] * 1.4, my = (A[1] + B[1]) / 2 + o[1] * 1.4;
      var t = el('text', { x: mx.toFixed(1), y: my.toFixed(1), 'text-anchor': anchor, 'font-size': 12, fill: '#0A6E65', stroke: 'none' }, root);
      t.textContent = label;
    }
    dim([0, 2, 0], [0, 2, 7], [-38, 0], 'your roadmap', 'end');
    dim([0, 2, 0], [5, 2, 0], [-16, 28], 'one team', 'middle');
  }

  /* -------------------------------------------------------- the builder -- */
  var MODS = [
    { k: 'software',   label: 'Custom software',   pal: PAL.teal,   form: 'Custom software',       phrase: 'custom software' },
    { k: 'team',       label: 'Dedicated team',    pal: PAL.paper,  form: 'Dedicated team',        phrase: 'a dedicated development team' },
    { k: 'automation', label: 'AI automation',     pal: PAL.indigo, form: 'AI automation',         phrase: 'AI automation' },
    { k: 'ai',         label: 'AI implementation', pal: PAL.blue,   form: 'AI implementation',     phrase: 'AI implemented on our own data' },
    { k: 'data',       label: 'Integrations & data', pal: PAL.navy, form: 'Integrations and data', phrase: 'integrations between our systems' },
    { k: 'cloud',      label: 'Cloud & DevOps',    pal: PAL.sky,    form: 'Cloud and DevOps',      phrase: 'cloud infrastructure' },
    { k: 'support',    label: 'IT support',        pal: PAL.deep,   form: 'IT support',            phrase: 'ongoing IT support' }
  ];
  var START = {
    idea:     { form: 'An idea to build',      s: 'We have an idea we want built.' },
    process:  { form: 'A manual process',      s: 'We have a manual process that takes too much of our team’s time.' },
    existing: { form: 'An existing system',    s: 'We have an existing system that needs fixing or extending.' },
    capacity: { form: 'Not enough engineers',  s: 'We have more work than engineers.' }
  };
  var WHEN = {
    now:       { form: 'As soon as possible', s: 'We’d like to start as soon as possible.' },
    quarter:   { form: 'Within three months', s: 'We’d like to start within three months.' },
    exploring: { form: 'Just exploring',      s: 'We’re exploring options for now.' }
  };

  function joinList(a) {
    if (a.length < 2) return a.join('');
    return a.slice(0, -1).join(', ') + (a.length > 2 ? ', and ' : ' and ') + a[a.length - 1];
  }

  function builder() {
    var form = document.getElementById('builder');
    var svg = document.getElementById('builder-svg');
    if (!form || !svg) return;
    var u = 36, W = 4, D = 3;
    var root = el('g', {}, svg);
    var base = iso(W / 2, D / 2, 0, u);
    root.setAttribute('transform', 'translate(' + (-base[0] - 60).toFixed(1) + ',' + (-base[1] + 60).toFixed(1) + ')');

    el('polygon', { points: pts([[-0.8, -0.8, -0.5], [W + 0.8, -0.8, -0.5], [W + 0.8, D + 0.8, -0.5], [-0.8, D + 0.8, -0.5]], u), fill: 'rgba(12,27,54,0.07)' }, root);
    box(root, -0.4, -0.4, -0.45, W + 0.8, D + 0.8, 0.45, u, PAL.plinth, { stroke: 'rgba(12,27,54,0.3)' });
    var empty = el('polygon', {
      points: pts([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], u),
      fill: 'none', stroke: INK, 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.5
    }, root);
    var stack = el('g', {}, root);

    // Pre-build one course per module; they are shown, hidden and re-stacked.
    var courses = {};
    MODS.forEach(function (m, i) {
      var g = el('g', { class: 'course', opacity: 0 }, null);
      box(g, 0, 0, 0, W, D, 1, u, m.pal, { grid: true });
      var a = iso(W, D / 2, 0.5, u);
      var bx = 150;
      var lg = el('g', { class: 'course-label' }, g);
      el('line', lineAttrs(a, [bx, a[1]], { stroke: INK, 'stroke-width': 0.8 }), lg);
      el('circle', { cx: a[0].toFixed(1), cy: a[1].toFixed(1), r: 2.2, fill: INK }, lg);
      var t = el('text', { x: bx + 8, y: (a[1] + 4).toFixed(1), 'font-size': 13, fill: INK }, lg);
      t.textContent = m.label;
      g.style.transition = reduce ? 'none' : 'transform 560ms cubic-bezier(0.23,1,0.32,1), opacity 260ms ease-out';
      courses[m.k] = { g: g, m: m, on: false };
    });

    var running = document.getElementById('running-text');
    var cap = document.getElementById('builder-cap');
    var lastAuto = '';

    function state() {
      var mods = MODS.filter(function (m) { return form.querySelector('input[name="b-mod"][value="' + m.k + '"]').checked; });
      var s = form.querySelector('input[name="b-start"]:checked');
      var w = form.querySelector('input[name="b-when"]:checked');
      return { mods: mods, start: s && s.value, when: w && w.value };
    }

    function briefText(st) {
      var parts = [];
      if (st.start) parts.push(START[st.start].s);
      if (st.mods.length) parts.push('We need ' + joinList(st.mods.map(function (m) { return m.phrase; })) + '.');
      if (st.when) parts.push(WHEN[st.when].s);
      return parts.join(' ');
    }
    function firstStep(st) {
      var has = function (k) { return st.mods.some(function (m) { return m.k === k; }); };
      if (st.start === 'process' || has('automation')) return 'a workflow review, where we map the process and mark what an agent can own.';
      if (st.start === 'capacity' || has('team')) return 'a call to agree skills and roles, then engineers matched to your stack.';
      if (st.start === 'existing') return 'a review of the current system, then a written plan.';
      return 'a short call, then a written scope and estimate.';
    }

    function render() {
      var st = state();
      var level = 0;
      MODS.forEach(function (m) {
        var c = courses[m.k];
        var on = st.mods.indexOf(m) !== -1;
        if (on) {
          var y = -level * u;
          if (!c.on) {
            // enter from above, so the block visibly drops into place
            c.g.style.transition = 'none';
            c.g.style.transform = 'translate(0px,' + (y - (reduce ? 0 : 90)) + 'px)';
            stack.appendChild(c.g);
            c.g.getBoundingClientRect();
            c.g.style.transition = reduce ? 'none' : 'transform 560ms cubic-bezier(0.23,1,0.32,1), opacity 260ms ease-out';
          }
          c.g.style.transform = 'translate(0px,' + y + 'px)';
          c.g.setAttribute('opacity', 1);
          c.on = true;
          level++;
        } else if (c.on) {
          c.on = false;
          c.g.setAttribute('opacity', 0);
          var g = c.g;
          setTimeout(function () { if (!courses[m.k].on && g.parentNode) g.parentNode.removeChild(g); }, reduce ? 0 : 280);
        }
      });
      // DOM order = painter's order, bottom course first
      MODS.forEach(function (m) { if (courses[m.k].on) stack.appendChild(courses[m.k].g); });
      empty.setAttribute('opacity', level ? 0 : 0.5);

      cap.textContent = st.mods.length
        ? 'Your project so far: ' + joinList(st.mods.map(function (m) { return m.label; })) + '.'
        : 'Your project so far: nothing yet.';

      var txt = briefText(st);
      if (!txt) {
        running.textContent = 'Choose what you need and your brief will write itself here.';
      } else {
        running.textContent = txt + ' ';
        var em = document.createElement('em');
        em.textContent = 'Suggested first step: ' + firstStep(st);
        running.appendChild(em);
      }
    }

    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    // colour key on the chips matches the course colour
    MODS.forEach(function (m) {
      var inp = form.querySelector('input[value="' + m.k + '"]');
      if (inp) inp.parentNode.style.setProperty('--c', m.pal.r);
    });

    document.getElementById('builder-go').addEventListener('click', function () {
      var st = state();
      var bf = document.getElementById('brief-form');
      if (!bf) return;
      bf.querySelectorAll('input[name="services"]').forEach(function (cb) {
        cb.checked = st.mods.some(function (m) { return m.form === cb.value; });
      });
      if (st.start) bf.querySelector('#f-start').value = START[st.start].form;
      if (st.when) bf.querySelector('#f-when').value = WHEN[st.when].form;
      var ta = bf.querySelector('#f-message');
      var txt = briefText(st);
      if (txt && (!ta.value.trim() || ta.value === lastAuto)) { ta.value = txt; lastAuto = txt; }
      setTimeout(function () { var n = bf.querySelector('#f-name'); if (n) n.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });

    render();
  }

  /* --------------------------------------------------------------- nav -- */
  function nav() {
    var bar = document.getElementById('nav');
    var burger = bar.querySelector('.nav__burger');
    var links = document.getElementById('nav-links');
    var onScroll = function () { bar.classList.toggle('is-scrolled', scrollY > 8); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    function close() { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
    burger.addEventListener('click', function () {
      var open = !links.classList.contains('is-open');
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('is-open')) { close(); burger.focus(); } });
  }

  /* ---------------------------------------------------------- whatsapp -- */
  // TODO(contact): set to the full international number, digits only, e.g. '919876543210'.
  // While it is empty every WhatsApp button and row stays hidden.
  var WHATSAPP_NUMBER = '';
  function whatsapp() {
    if (!WHATSAPP_NUMBER) return;
    var href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hi Ravel Softworks, I would like to talk about a project.');
    document.querySelectorAll('.js-wa').forEach(function (a) { a.href = href; a.hidden = false; });
    document.querySelectorAll('.js-wa-row').forEach(function (r) { r.hidden = false; });
  }

  /* ------------------------------------------------ service illustrations -- */
  var ILLOS = {
    software: { c: [2, 1.5, 1.2], boxes: [
      [0.6, 0.4, 0, 4, 3, 0.3, PAL.paper], [0.3, 0.2, 1.1, 4, 3, 0.3, PAL.blue], [0, 0, 2.2, 4, 3, 0.3, PAL.teal] ] },
    team: { c: [3, 1, 0.6], boxes: [
      [-0.4, -0.4, -0.3, 6.8, 2.8, 0.3, PAL.plinth],
      [0, 0.5, 0, 1, 1, 1.4, PAL.teal], [1.6, 0.5, 0, 1, 1, 1.4, PAL.blue], [3.2, 0.5, 0, 1, 1, 1.4, PAL.indigo], [4.8, 0.5, 0, 1, 1, 1.4, PAL.paper] ] },
    automation: { c: [3.5, 0.7, 0.8], boxes: [
      [0, 0, 0, 7, 1.4, 0.3, PAL.navy],
      [2.6, 0, 0.3, 0.4, 1.4, 1.8, PAL.indigo],
      [0.6, 0.3, 0.3, 0.8, 0.8, 0.8, PAL.paper], [5.2, 0.3, 0.3, 0.8, 0.8, 0.8, PAL.teal],
      [4, 0, 0.3, 0.4, 1.4, 1.8, PAL.indigo], [2.6, 0, 2.1, 1.8, 1.4, 0.4, PAL.indigo] ] },
    ai: { c: [2, 2, 0.8], boxes: [
      [-0.3, -0.3, -0.3, 4.6, 4.6, 0.3, PAL.plinth],
      [0, 0, 0, 0.7, 0.7, 0.7, PAL.teal], [1.65, 0, 0, 0.7, 0.7, 0.7, PAL.teal], [3.3, 0, 0, 0.7, 0.7, 0.7, PAL.teal],
      [0, 1.65, 0, 0.7, 0.7, 0.7, PAL.teal], [1.2, 1.2, 0, 1.6, 1.6, 1.6, PAL.blue], [3.3, 1.65, 0, 0.7, 0.7, 0.7, PAL.teal],
      [0, 3.3, 0, 0.7, 0.7, 0.7, PAL.teal], [1.65, 3.3, 0, 0.7, 0.7, 0.7, PAL.teal], [3.3, 3.3, 0, 0.7, 0.7, 0.7, PAL.teal] ] },
    data: { c: [2.5, 0.6, 1.5], boxes: [
      [0, 0, 0, 1.2, 1.2, 3, PAL.teal], [1.2, 0.4, 1.9, 2.6, 0.4, 0.4, PAL.paper], [3.8, 0, 0, 1.2, 1.2, 2.3, PAL.indigo] ] },
    cloud: { c: [2.5, 1.5, 1], boxes: [
      [0, 0, 0, 5, 3, 0.3, PAL.paper],
      [0.4, 0.7, 0.3, 1, 1.6, 2.2, PAL.navy], [2, 0.7, 0.3, 1, 1.6, 2.2, PAL.navy], [3.6, 0.7, 0.3, 1, 1.6, 2.2, PAL.navy],
      [0.4, 0.7, 2.5, 1, 1.6, 0.12, PAL.sky], [2, 0.7, 2.5, 1, 1.6, 0.12, PAL.sky], [3.6, 0.7, 2.5, 1, 1.6, 0.12, PAL.sky] ] }
  };
  function illos() {
    document.querySelectorAll('svg[data-illo]').forEach(function (svg) {
      var d = ILLOS[svg.getAttribute('data-illo')];
      if (!d) return;
      var u = 26;
      var g = el('g', {}, svg);
      var c = iso(d.c[0], d.c[1], d.c[2], u);
      g.setAttribute('transform', 'translate(' + (-c[0]).toFixed(1) + ',' + (-c[1]).toFixed(1) + ')');
      el('polygon', { points: pts([[-1, -1, -0.35], [d.c[0] * 2 + 1, -1, -0.35], [d.c[0] * 2 + 1, d.c[1] * 2 + 1, -0.35], [-1, d.c[1] * 2 + 1, -0.35]], u), fill: 'rgba(12,27,54,0.05)' }, g);
      d.boxes.forEach(function (b) { box(g, b[0], b[1], b[2], b[3], b[4], b[5], u, b[6]); });
    });
  }

  /* ------------------------------------------------------------ photos -- */
  // Drop photos into assets/img/ named after the slot (software.jpg, team.jpg ...).
  // A slot with a photo shows it; a slot without one keeps its drawing.
  var PHOTO_ALT = {
    software: 'A developer\u2019s desk with a laptop and wireframe sketches',
    team: 'Engineers planning work at a whiteboard',
    automation: 'An operations desk with invoices being processed',
    ai: 'A workstation at dusk with an abstract AI graph on screen',
    data: 'Printed charts and reports on a desk',
    cloud: 'A server rack in a clean, bright room',
    why: 'A calm workspace in Bengaluru at golden hour'
  };
  function photos() {
    var slots = Array.prototype.slice.call(document.querySelectorAll('svg[data-illo]'))
      .map(function (svg) { return { name: svg.getAttribute('data-illo'), svg: svg }; });
    var why = document.getElementById('why-svg');
    if (why) slots.push({ name: 'why', svg: why });
    slots.forEach(function (slot) {
      var exts = ['jpg', 'png', 'webp'];
      (function attempt(i) {
        if (i >= exts.length) return;
        var img = new Image();
        img.onload = function () {
          img.className = 'photo';
          img.alt = PHOTO_ALT[slot.name] || '';
          img.decoding = 'async';
          slot.svg.parentNode.classList.add('has-photo');
          slot.svg.replaceWith(img);
        };
        img.onerror = function () { attempt(i + 1); };
        img.src = 'assets/img/' + slot.name + '.' + exts[i];
      })(0);
    });
  }

  /* --------------------------------------------------- automation demo -- */
  var FLOWS = {
    onboarding: {
      trigger: 'A new client signs the contract in your CRM.',
      steps: ['Reads the signed contract and pulls the company details', 'Creates the client in your accounting and project tools', 'Sets up a shared folder with the right access', 'Drafts a welcome email with next steps', 'Proposes kickoff times from both calendars'],
      outcome: 'Client set up everywhere, welcome email ready.',
      human: 'A person approves the welcome email before it goes out.'
    },
    invoices: {
      trigger: 'A supplier invoice arrives by email as a PDF.',
      steps: ['Extracts supplier, amounts, tax and due date', 'Matches it to the purchase order and delivery note', 'Flags any difference above your tolerance', 'Posts the bill to your accounting system', 'Schedules payment for the due date'],
      outcome: 'Invoice recorded, matched and scheduled.',
      human: 'Mismatches go to finance with the difference highlighted.'
    },
    leads: {
      trigger: 'An enquiry comes in through your website.',
      steps: ['Looks up the company and the person’s role', 'Scores fit against your ideal customer', 'Creates or updates the CRM record', 'Drafts a personal reply', 'Offers call slots from your sales calendar'],
      outcome: 'Qualified lead in the CRM, reply drafted.',
      human: 'Your sales team reviews the reply before it is sent.'
    },
    support: {
      trigger: 'A customer emails your support inbox.',
      steps: ['Classifies the request and its urgency', 'Looks up the order and account history', 'Finds the answer in your help documents', 'Drafts a reply with the customer’s details', 'Routes complex cases to the right person'],
      outcome: 'Common questions answered, hard ones routed with context.',
      human: 'Refunds and complaints always go to a person.'
    }
  };
  function demo() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.demo__tabs [role="tab"]'));
    var panel = document.getElementById('demo-panel');
    if (!tabs.length || !panel) return;
    var trig = document.getElementById('demo-trigger');
    var list = document.getElementById('demo-steps');
    var out = document.getElementById('demo-outcome');
    var human = document.getElementById('demo-human');
    var timers = [];
    var seen = false;

    function run(key) {
      timers.forEach(clearTimeout); timers = [];
      var f = FLOWS[key];
      trig.textContent = f.trigger;
      out.textContent = f.outcome;
      human.textContent = f.human;
      list.innerHTML = '';
      var items = f.steps.map(function (t) { var li = document.createElement('li'); li.textContent = t; list.appendChild(li); return li; });
      out.classList.remove('is-done');
      if (reduce || !seen) {
        if (reduce) { items.forEach(function (li) { li.classList.add('is-done'); }); out.classList.add('is-done'); }
        return;
      }
      items.forEach(function (li, i) {
        timers.push(setTimeout(function () { li.classList.add('is-active'); }, 250 + i * 750));
        timers.push(setTimeout(function () { li.classList.remove('is-active'); li.classList.add('is-done'); }, 250 + i * 750 + 650));
      });
      timers.push(setTimeout(function () { out.classList.add('is-done'); }, 250 + items.length * 750));
    }
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      if (focus) tab.focus();
      run(tab.getAttribute('data-flow'));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    run('onboarding');
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { seen = true; io.disconnect(); run(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0].getAttribute('data-flow')); }
      }, { threshold: 0.4 });
      io.observe(panel);
    }
  }

  /* ----------------------------------------------------- netlify form -- */
  function briefForm() {
    var f = document.getElementById('brief-form');
    if (!f || !window.fetch) return;
    var status = document.getElementById('form-status');
    var btn = f.querySelector('button[type="submit"]');
    var label = btn.textContent;
    var busy = false;

    function fail() {
      busy = false;
      btn.disabled = false;
      btn.textContent = label;
      f.classList.remove('is-sending');
      status.className = 'brief-form__status is-err';
      status.textContent = 'That didn\u2019t send. Please try again, or email contact@ravelsoftworks.com.';
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy || !f.reportValidity()) return;
      busy = true;
      btn.disabled = true;
      btn.textContent = 'Sending\u2026';
      f.classList.add('is-sending');
      status.className = 'brief-form__status';
      status.textContent = '';

      // Never wait forever: give up after 20 seconds and let them retry.
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); fail(); }, 20000);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(f)).toString(),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error(res.status);
        // Replace the form with an unmistakable confirmation.
        var done = document.createElement('div');
        done.className = 'brief-form brief-form--done';
        done.setAttribute('role', 'status');
        done.tabIndex = -1;
        var name = (f.querySelector('#f-name').value || '').trim().split(/\s+/)[0];
        done.innerHTML = '<p class="brief-form__done-h"></p><p class="brief-form__done-p"></p>';
        done.firstChild.textContent = name ? 'Thanks, ' + name + '. Your brief is with us.' : 'Thanks. Your brief is with us.';
        done.lastChild.textContent = 'We\u2019ll reply within one business day from contact@ravelsoftworks.com.';
        f.replaceWith(done);
        done.focus({ preventScroll: true });
        done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      }).catch(function () {
        clearTimeout(timer);
        if (busy) fail();
      });
    });
  }

  /* ------------------------------------------------------------ mount -- */
  document.querySelectorAll('.rail > .stage').forEach(function (s, i) { s.style.setProperty('--i', i); });
  heroPlate();
  whyPlate();
  builder();
  nav();
  whatsapp();
  illos();
  photos();
  demo();
  briefForm();
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);
})();
