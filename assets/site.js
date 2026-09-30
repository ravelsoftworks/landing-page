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
     The mark itself, traced from logo-ravel.png: every face is a polygon in
     the logo's own pixel coordinates with a linear gradient fitted to the
     original colours. g = the piece it belongs to (stem, bowl, leg), which is
     what moves in the hero. Two faces never visible in the logo are included
     so pieces stay solid while apart: the back column's right side and the
     rest of the dark counter behind the front column. Array order is paint order. */
  var MARK = [{"g":"stem","p":[[515,318],[620,264],[620,694],[515,748]],"a":[515,300],"b":[620,300],"c1":"#05668f","c2":"#04587e"},{"g":"stem","p":[[413.0,262.5],[516.5,320.0],[620.0,264.0],[514.0,206.0]],"a":[510.2,216.5],"b":[522.0,307.2],"c1":"#0687ad","c2":"#0482a8"},{"g":"stem","p":[[413.0,262.5],[414.5,509.5],[414.5,509.5],[514.7,455.0],[514.0,318.5]],"a":[433.0,279.8],"b":[479.5,481.3],"c1":"#02e2c7","c2":"#02b4a7"},{"g":"bowl","p":[[518.5,453.5],[519.0,548.0],[593.0,591.0],[643.0,564.3],[640.5,502.5],[539.0,444.5]],"a":[571.7,547.5],"b":[627.9,501.7],"c1":"#001641","c2":"#00153f"},{"g":"bowl","p":[[780.5,301.5],[667.0,241.0],[517.7,320.3],[632.5,383.2]],"a":[696.4,249.8],"b":[603.9,370.7],"c1":"#12a5fb","c2":"#0c97fb"},{"g":"bowl","p":[[878.0,356.5],[780.5,301.5],[632.5,383.2],[735.3,439.6]],"a":[788.3,310.5],"b":[723.8,426.0],"c1":"#15b5fb","c2":"#14b2fc"},{"g":"bowl","p":[[517.7,320.3],[516.7,454.0],[539.0,444.5],[640.5,502.5],[643.0,564.3],[733.2,614.2],[735.3,439.6]],"a":[723.5,447.0],"b":[532.6,475.0],"c1":"#1952ff","c2":"#142f97"},{"g":"bowl","p":[[878.0,356.5],[735.3,439.6],[733.2,614.2],[879.0,530.0]],"a":[874.5,492.8],"b":[740.6,477.9],"c1":"#4c4cfa","c2":"#494efa"},{"g":"leg","p":[[733.2,614.2],[735.5,695.5],[809.3,739.3],[877.5,701.5]],"a":[817.5,730.6],"b":[757.1,624.8],"c1":"#3a2dbf","c2":"#091f62"},{"g":"leg","p":[[877.5,701.5],[809.3,739.3],[809.0,835.0],[878.0,797.0]],"a":[809.5,771.5],"b":[878.5,765.5],"c1":"#5a2bdf","c2":"#5928dd"},{"g":"leg","p":[[733.2,614.2],[671.7,650.7],[672.0,752.5],[809.0,835.0],[809.3,739.3],[735.5,695.5]],"a":[812.7,802.5],"b":[669.1,671.9],"c1":"#4049f9","c2":"#3e4bfa"},{"g":"leg","p":[[593.0,597.0],[593.0,606.0],[671.7,650.7],[733.2,614.2],[643.0,564.3]],"a":[684.7,642.0],"b":[631.3,574.2],"c1":"#0ea2fc","c2":"#0c97fc"},{"g":"leg","p":[[593.0,606.0],[594.0,706.0],[672.0,752.5],[671.7,650.7]],"a":[680.9,718.3],"b":[583.9,639.6],"c1":"#215dfb","c2":"#107ffb"},{"g":"stem","p":[[588.5,499.5],[513.0,456.5],[414.5,509.5],[494.7,554.3]],"a":[546.8,535.5],"b":[456.6,474.1],"c1":"#08f2cc","c2":"#08f1ca"},{"g":"stem","p":[[414.5,509.5],[412.0,746.0],[494.5,797.0],[494.7,554.3]],"a":[490.9,651.2],"b":[414.2,653.1],"c1":"#01d4be","c2":"#01d0ba"},{"g":"stem","p":[[588.5,499.5],[494.7,554.3],[494.5,797.0],[590.0,748.0]],"a":[598.0,644.0],"b":[488.3,657.4],"c1":"#04628c","c2":"#045b82"}];
  var MARK_C = [646, 521];      // centre of the mark in logo pixels

  function drawMark(parent, opt) {
    opt = opt || {};
    var defs = el('defs', {}, parent);
    var id = 'mk' + Math.random().toString(36).slice(2, 7);
    var groups = {};
    var order = [];
    MARK.forEach(function (f, i) {
      // the front column paints last, so it gets its own layer
      var key = f.g === 'stem' && i > 2 ? 'front' : f.g;
      if (!groups[key]) { groups[key] = el('g', {}, parent); order.push(key); }
      var poly = { points: f.p.map(function (q) { return q[0] + ',' + q[1]; }).join(' '), 'stroke-linejoin': 'round' };
      if (opt.line) {
        poly.fill = '#FBFAF7'; poly.stroke = INK; poly['stroke-width'] = opt.sw || 1.4;
        if (i === 0) return;        // the hidden backing face stays out of the line drawing
      } else {
        var gid = id + i;
        var lg = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: f.a[0], y1: f.a[1], x2: f.b[0], y2: f.b[1] }, defs);
        el('stop', { offset: 0, 'stop-color': f.c1 }, lg);
        el('stop', { offset: 1, 'stop-color': f.c2 }, lg);
        poly.fill = 'url(#' + gid + ')'; poly.stroke = 'url(#' + gid + ')'; poly['stroke-width'] = 2;
      }
      el('polygon', poly, groups[key]);
    });
    return { groups: groups, order: order };
  }
  // logo pixels -> the plate's coordinates
  function placer(tx, ty, sc) {
    return {
      t: 'translate(' + tx + ',' + ty + ') scale(' + sc + ') translate(' + (-MARK_C[0]) + ',' + (-MARK_C[1]) + ')',
      at: function (x, y) { return [tx + sc * (x - MARK_C[0]), ty + sc * (y - MARK_C[1])]; }
    };
  }

  /* ---------------------------------------------------------- hero plate --
     The R starts as a cloud of small cubes, each one coloured from the part of
     the logo it belongs to, drifting and tumbling in real 3D on a canvas. Scroll
     pulls every cube home; they straighten, lock edge to edge into the R, and
     then fuse into the exact traced mark (the SVG) with its big solid faces. */
  var VIEW = [1, 1, 1];                       // the iso camera looks down (-1,-1,-1)
  function pointIn(poly, x, y) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixRGB(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  // the logo's colour at a point: the top-most traced face that contains it
  function markColour(x, y) {
    for (var i = MARK.length - 1; i > 0; i--) {
      var f = MARK[i];
      if (!pointIn(f.p, x, y)) continue;
      var dx = f.b[0] - f.a[0], dy = f.b[1] - f.a[1];
      var t = clamp01(((x - f.a[0]) * dx + (y - f.a[1]) * dy) / (dx * dx + dy * dy || 1));
      var key = f.g === 'stem' && i > 2 ? 'front' : f.g;
      return { rgb: mixRGB(hex2rgb(f.c1), hex2rgb(f.c2), t), layer: { stem: 0, bowl: 1, leg: 2, front: 3 }[key] };
    }
    return null;
  }
  function rand(seed) { var s = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  // Where each piece of the mark waits, apart, before the pieces join (logo px).
  var PIECE_OFF = { stem: [-90, 40], bowl: [80, -120], leg: [130, 80] };

  /* The mark as 3D blocks, fitted to the traced logo (world units = logo px;
     x runs right-down, y left-down, z up). Each face names the traced face
     whose colour it takes, so the blocks look like the logo from every side.
     Listed in paint order, back to front. */
  var BLOCKS = [
    { g: 'stem', b: [886, 1004, 290, 403, 0, 383], top: 1, py: 2, px: 0, split: [1, 2, 3] },
    { g: 'bowl', b: [1004, 1143, 234, 378, 209, 245], top: 6, py: 3, px: 7, hideTop: true, split: [2, 1, 1] },
    { g: 'bowl', b: [1004, 1250, 234, 403, 245, 383], top: [4, 1133, 5], py: 6, px: 7, cuts: [1133], split: [1, 2, 1] },
    { g: 'bowl', b: [1143, 1250, 234, 403, 209, 245], top: 6, py: 6, px: 7, hideTop: true, split: [1, 1, 1] },
    { g: 'leg', b: [1150, 1245, 403, 471, 108, 209], top: 11, py: 12, px: 10, split: [1, 1, 2] },
    { g: 'leg', b: [1245, 1406, 392, 471, 103, 198], top: 8, py: 10, px: 9, split: [4, 1, 1] },
    { g: 'stem', b: [996, 1081, 403, 512, 0, 243], top: 13, py: 14, px: 15, split: [1, 1, 2] }
  ];
  function proj(x, y, z) { return [(x - y) * COS, (x + y) * SIN - z]; }
  function faceIndex(spec, x) { return typeof spec === 'number' ? spec : (x < spec[1] ? spec[0] : spec[2]); }
  // the traced gradient of face i, evaluated at a logo-pixel point
  function gradAt(i, sx, sy) {
    var f = MARK[i], dx = f.b[0] - f.a[0], dy = f.b[1] - f.a[1];
    var t = clamp01(((sx - f.a[0]) * dx + (sy - f.a[1]) * dy) / (dx * dx + dy * dy || 1));
    return mixRGB(hex2rgb(f.c1), hex2rgb(f.c2), t);
  }
  // world vector -> camera space (logo-px screen x, screen y, depth toward the viewer)
  function cam(v) { return [(v[0] - v[1]) * COS, (v[0] + v[1]) * SIN - v[2], (v[0] + v[1] + v[2]) * 0.70711]; }

  // Cut every block into a few big chunks (its split, or cuts along x); these
  // are the blocks that float, grow and lock together. Nothing else appears.
  function buildChunks() {
    var chunks = [], n = 0;
    BLOCKS.forEach(function (B, bi) {
      var b = B.b, sp = B.split, xs = [b[0]], ys = [b[2]], zs = [b[4]];
      // x: explicit cuts (where the logo's colours change) or an even split
      if (B.cuts) { xs = xs.concat(B.cuts); xs.push(b[1]); }
      else for (var i = 1; i <= sp[0]; i++) xs.push(b[0] + (b[1] - b[0]) * i / sp[0]);
      for (var j = 1; j <= sp[1]; j++) ys.push(b[2] + (b[3] - b[2]) * j / sp[1]);
      for (var k = 1; k <= sp[2]; k++) zs.push(b[4] + (b[5] - b[4]) * k / sp[2]);
      for (var xi = 0; xi < xs.length - 1; xi++) for (var yi = 0; yi < ys.length - 1; yi++) for (var zi = 0; zi < zs.length - 1; zi++) {
        var x0 = xs[xi], x1 = xs[xi + 1], y0 = ys[yi], y1 = ys[yi + 1], z0 = zs[zi], z1 = zs[zi + 1];
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
        // colour each face from the logo face it belongs to, sampled at its centre
        var pt = proj(cx, cy, z1), pl = proj(cx, y1, cz), pr = proj(x1, cy, cz);
        n++;
        var ang = rand(n * 3.1) * Math.PI * 2, rad = 30 + rand(n + 3) * 85;
        chunks.push({
          g: B.g, block: bi, home: [cx, cy, cz], camHome: cam([cx, cy, cz]), half: [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2],
          // floats in a loose cluster around the piece it will build
          off: [Math.cos(ang) * rad * (Math.cos(ang) < 0 ? 0.6 : 1), Math.sin(ang) * rad * 0.8, (rand(n + 5) - 0.5) * 300],
          rot: [(rand(n + 7) - 0.5) * 2.2, (rand(n + 11) - 0.5) * 2.2, (rand(n + 13) - 0.5) * 2.2],
          ph: rand(n + 17) * 6.283, sp: 0.5 + rand(n + 19) * 0.7,
          top: gradAt(faceIndex(B.top, cx), pt[0], pt[1]),
          left: gradAt(B.py, pl[0], pl[1]),
          right: gradAt(B.px, pr[0], pr[1])
        });
      }
    });
    // Even start: exactly one spot per block on a sunflower spiral filling an oval
    // around the mark, so the opening has no gaps. Each block takes the nearest
    // free spot to where it waits, which keeps every flight short.
    var N = chunks.length, GOLD = Math.PI * (3 - Math.sqrt(5));
    var spots = [];
    for (var s2 = 0; s2 < N; s2++) {
      var r = Math.sqrt((s2 + 0.5) / N), th = s2 * GOLD;
      spots.push([650 + Math.cos(th) * r * 300 + (rand(s2 + 41) - 0.5) * 24, 515 + Math.sin(th) * r * 330 + (rand(s2 + 43) - 0.5) * 24]);
    }
    var pairs = [];
    chunks.forEach(function (c, ci) {
      var po = PIECE_OFF[c.g];
      c.wait = [c.camHome[0] + po[0], c.camHome[1] + po[1]];
      spots.forEach(function (sp, si) {
        var dx = sp[0] - c.wait[0], dy = sp[1] - c.wait[1];
        pairs.push([dx * dx + dy * dy, ci, si]);
      });
    });
    pairs.sort(function (p, q) { return p[0] - q[0]; });
    var takenC = {}, takenS = {};
    pairs.forEach(function (pr) {
      if (takenC[pr[1]] || takenS[pr[2]]) return;
      takenC[pr[1]] = takenS[pr[2]] = true;
      var c = chunks[pr[1]], sp = spots[pr[2]];
      c.off = [sp[0] - c.wait[0], sp[1] - c.wait[1], (rand(pr[2] + 47) - 0.5) * 320];
    });
    return chunks;
  }

  // unit cube faces: normal + corner indices (corners are the 8 sign combos)
  var CORNERS = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  var FACES = [
    { n: [0, 0, 1], v: [4, 5, 6, 7] }, { n: [0, 0, -1], v: [0, 3, 2, 1] },
    { n: [1, 0, 0], v: [1, 2, 6, 5] }, { n: [-1, 0, 0], v: [0, 4, 7, 3] },
    { n: [0, 1, 0], v: [3, 7, 6, 2] }, { n: [0, -1, 0], v: [0, 1, 5, 4] }
  ];
  function rotate(v, r) {
    var x = v[0], y = v[1], z = v[2], c, s, t;
    c = Math.cos(r[0]); s = Math.sin(r[0]); t = y * c - z * s; z = y * s + z * c; y = t;
    c = Math.cos(r[1]); s = Math.sin(r[1]); t = x * c + z * s; z = -x * s + z * c; x = t;
    c = Math.cos(r[2]); s = Math.sin(r[2]); t = x * c - y * s; y = x * s + y * c; x = t;
    return [x, y, z];
  }
  // turn the whole cloud: yaw about the screen's vertical axis, pitch about its horizontal one
  function orbit(v, yaw, pitch) {
    var c = Math.cos(yaw), s = Math.sin(yaw);
    var x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c, y = v[1];
    c = Math.cos(pitch); s = Math.sin(pitch);
    return [x, y * c - z * s, y * s + z * c];
  }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function heroPlate() {
    var svg = document.getElementById('hero-r');
    if (!svg) return null;
    var art = svg.parentNode;
    var P = placer(10, -40, 0.74);
    var VB = [-340, -330, 700, 560];

    // soft contact shadow under the finished mark
    var fid = 'hs' + Math.random().toString(36).slice(2, 7);
    var flt = el('filter', { id: fid, x: '-50%', y: '-50%', width: '200%', height: '200%' }, el('defs', {}, svg));
    el('feGaussianBlur', { stdDeviation: 10 }, flt);
    var sh = P.at(650, 832);
    var shadow = el('ellipse', { cx: sh[0], cy: sh[1], rx: 205, ry: 26, fill: 'rgba(12,27,54,0.14)', filter: 'url(#' + fid + ')' }, svg);

    var solid = el('g', { transform: P.t }, svg);
    var mark = drawMark(solid);

    // callouts: leader lines + labels, in the drawing's own idiom
    var labels = el('g', { class: 'callouts' }, svg);
    var calls = [
      { a: P.at(438, 400), b: [-300, -190], t: 'Software engineering', n: '01', anchor: 'start' },
      { a: P.at(800, 350), b: [300, -250], t: 'AI & automation', n: '02', anchor: 'end' },
      { a: P.at(845, 772), b: [330, 60], t: 'IT & cloud', n: '03', anchor: 'end' }
    ];
    var callEls = calls.map(function (k) {
      var g = el('g', {}, labels);
      var path = el('path', {
        d: 'M' + k.a[0].toFixed(1) + ' ' + k.a[1].toFixed(1) + ' L' + k.b[0] + ' ' + k.b[1],
        fill: 'none', stroke: INK, 'stroke-width': 0.9, pathLength: 1,
        'stroke-dasharray': 1, 'stroke-dashoffset': 1
      }, g);
      var dot = el('circle', { cx: k.a[0].toFixed(1), cy: k.a[1].toFixed(1), r: 2.6, fill: INK, opacity: 0 }, g);
      var tx = el('text', { x: k.b[0], y: k.b[1] - 10, 'text-anchor': k.anchor, 'font-size': 13, fill: INK }, g);
      tx.textContent = k.t;
      var nn = el('text', { x: k.b[0], y: k.b[1] + 20, 'text-anchor': k.anchor, 'font-size': 11, fill: '#0A6E65' }, g);
      nn.textContent = k.n;
      el('line', { x1: k.b[0] - (k.anchor === 'end' ? 150 : 0), y1: k.b[1], x2: k.b[0] + (k.anchor === 'end' ? 0 : 150), y2: k.b[1], stroke: INK, 'stroke-width': 0.9, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, class: 'shelf' }, g);
      return { g: g, path: path, dot: dot, shelf: g.querySelector('.shelf'), text: [tx, nn] };
    });

    // near plane: three loose blocks, the fastest layer
    var nears = Array.prototype.slice.call(document.querySelectorAll('.hero__near .near'));
    var nearPal = [PAL.teal, PAL.indigo, PAL.blue];
    nears.forEach(function (s, i) { box(s, -0.5, -0.5, -0.5, 1, 1, 1, 30, nearPal[i]); });

    // the cube network
    var cubes = reduce ? [] : buildChunks();   // the big blocks, about 6-8 per piece
    var centre = [1130, 400, 200];               // the cloud turns about this point (world)
    var cc = cam(centre);
    var canvas = null, ctx = null, map = null, dpr = 1;
    if (cubes.length) {
      canvas = document.createElement('canvas');
      canvas.className = 'hero__cubes';
      canvas.setAttribute('aria-hidden', 'true');
      art.insertBefore(canvas, svg);
      ctx = canvas.getContext('2d');
    }
    function resize() {
      if (!canvas) return;
      var W = art.clientWidth, H = art.clientHeight;
      // the canvas bleeds past the art box so drifting cubes are never clipped
      var bx = Math.round(W * 0.3), by = Math.round(H * 0.2);
      canvas.style.left = -bx + 'px'; canvas.style.top = -by + 'px';
      canvas.style.width = (W + 2 * bx) + 'px'; canvas.style.height = (H + 2 * by) + 'px';
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round((W + 2 * bx) * dpr); canvas.height = Math.round((H + 2 * by) * dpr);
      // the SVG fills .hero__art exactly, so its viewBox mapping is ours too
      var sc = Math.min(W / VB[2], H / VB[3]);
      var ox = bx + (W - VB[2] * sc) / 2 - VB[0] * sc;
      var oy = by + (H - VB[3] * sc) / 2 - VB[1] * sc;
      map = { s: sc * 0.74 * dpr, ox: (ox + sc * (10 - 0.74 * MARK_C[0])) * dpr, oy: (oy + sc * (-40 - 0.74 * MARK_C[1])) * dpr };
    }
    resize();
    addEventListener('resize', function () { resize(); last = -1; });

    function poly(pts, fill) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = fill; ctx.lineWidth = 1 * dpr; ctx.stroke();
    }
    function toCanvas(sx, sy, off) { return [map.ox + (sx + off[0]) * map.s, map.oy + (sy + off[1]) * map.s]; }
    function offOf(g, kk) { var o = PIECE_OFF[g]; return [o[0] * kk, o[1] * kk]; }

    // the cubes in flight (e: how far home, 0..1)
    var PAPER = [243, 241, 235];
    function shadeFog(c, wn, fog) {
      var wt = Math.max(0, wn[2]), wr = Math.max(0, wn[0]), wl = Math.max(0, wn[1]), sum = wt + wr + wl || 1;
      var r = (c.top[0] * wt + c.right[0] * wr + c.left[0] * wl) / sum;
      var g = (c.top[1] * wt + c.right[1] * wr + c.left[1] * wl) / sum;
      var bl = (c.top[2] * wt + c.right[2] * wr + c.left[2] * wl) / sum;
      // atmospheric depth: far cubes fade toward the paper
      return 'rgb(' + (r + (PAPER[0] - r) * fog | 0) + ',' + (g + (PAPER[1] - g) * fog | 0) + ',' + (bl + (PAPER[2] - bl) * fog | 0) + ')';
    }
    function drawCubes(e, kk, time, yaw, pitch, alpha) {
      var k = 1 - e, list = [];
      var grow = 0.5 + 0.5 * e;                    // half size while floating, full size when home
      for (var i = 0; i < cubes.length; i++) {
        var c = cubes[i], drift = 14 * k, po = offOf(c.g, kk);
        var local = [
          c.camHome[0] + po[0] + c.off[0] * k + Math.sin(time * c.sp + c.ph) * drift - cc[0],
          c.camHome[1] + po[1] + c.off[1] * k + Math.cos(time * c.sp * 0.8 + c.ph) * drift - cc[1],
          c.camHome[2] + c.off[2] * k + Math.sin(time * c.sp * 0.6 + c.ph) * drift - cc[2]
        ];
        var rot = [
          (c.rot[0] + 0.35 * Math.sin(time * 0.5 * c.sp + c.ph)) * k,
          (c.rot[1] + 0.35 * Math.cos(time * 0.4 * c.sp + c.ph)) * k,
          (c.rot[2] + 0.3 * Math.sin(time * 0.35 * c.sp + c.ph * 2)) * k
        ];
        var pos = orbit(local, yaw, pitch);
        var zn = clamp01((pos[2] + 260) / 520);   // 0 far .. 1 near
        // a true cube (h = w = d, same volume) while floating; it takes its exact
        // fitted proportions as it lands, so the pieces still lock together
        var u = Math.cbrt(c.half[0] * c.half[1] * c.half[2]), me = e * e;
        var half = [u + (c.half[0] - u) * me, u + (c.half[1] - u) * me, u + (c.half[2] - u) * me];
        var size = grow * (1 + (zn - 0.5) * 0.45 * k);
        list.push({
          c: c, pos: pos, rot: rot, half: half, size: size,
          r: Math.sqrt(half[0] * half[0] + half[1] * half[1] + half[2] * half[2]) * size,
          fog: (1 - zn) * 0.55 * k
        });
      }
      // keep them from passing through each other: push overlapping blocks apart.
      // Fades out as they land, so neighbours can still sit flush.
      var push = clamp01(k * 1.6);
      if (push > 0) {
        for (var pass = 0; pass < 3; pass++) {
          for (var p1 = 0; p1 < list.length; p1++) for (var p2 = p1 + 1; p2 < list.length; p2++) {
            var A = list[p1].pos, Bq = list[p2].pos;
            var ex = Bq[0] - A[0], ey = Bq[1] - A[1], ez = Bq[2] - A[2];
            var d = Math.sqrt(ex * ex + ey * ey + ez * ez) || 0.001, need = list[p1].r + list[p2].r;
            if (d >= need) continue;
            var mv = (need - d) / 2 * push / d;
            A[0] -= ex * mv; A[1] -= ey * mv; A[2] -= ez * mv;
            Bq[0] += ex * mv; Bq[1] += ey * mv; Bq[2] += ez * mv;
          }
        }
      }
      list.forEach(function (it) { it.sx = map.ox + (it.pos[0] + cc[0]) * map.s; it.sy = map.oy + (it.pos[1] + cc[1]) * map.s; });
      ctx.globalAlpha = alpha;

      // 1. the network: links between blocks that are near each other right now
      var net = Math.pow(k, 0.8);
      if (net > 0.01) {
        var D = 260 * map.s, D2 = D * D;
        ctx.lineWidth = 1 * dpr;
        for (var a1 = 0; a1 < list.length; a1++) {
          for (var b1 = a1 + 1; b1 < list.length; b1++) {
            var dx = list[a1].sx - list[b1].sx, dy = list[a1].sy - list[b1].sy, d2 = dx * dx + dy * dy;
            if (d2 > D2) continue;
            var la = (1 - Math.sqrt(d2) / D) * 0.6 * net * (1 - Math.max(list[a1].fog, list[b1].fog));
            if (la < 0.02) continue;
            ctx.strokeStyle = 'rgba(12,27,54,' + la.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(list[a1].sx, list[a1].sy); ctx.lineTo(list[b1].sx, list[b1].sy); ctx.stroke();
          }
        }
        // a node at each block's centre, so the links read as a network
        ctx.fillStyle = 'rgba(12,27,54,' + (0.55 * net).toFixed(3) + ')';
        list.forEach(function (it) { ctx.beginPath(); ctx.arc(it.sx, it.sy, 1.8 * dpr, 0, 6.283); ctx.fill(); });
      }

      // 2. the blocks: far to near while floating; in build order once they are home
      var settle = e > 0.85;
      list.sort(function (p, q) {
        if (settle && p.c.block !== q.c.block) return p.c.block - q.c.block;
        return settle ? (p.c.home[0] + p.c.home[1] + p.c.home[2]) - (q.c.home[0] + q.c.home[1] + q.c.home[2]) : p.pos[2] - q.pos[2];
      });
      ctx.lineJoin = 'round';
      for (var j = 0; j < list.length; j++) {
        var it2 = list[j], cube = it2.c, hh = it2.half, m = it2.size;
        var pts2 = new Array(8);
        for (var q = 0; q < 8; q++) {
          var cn = CORNERS[q];
          var v = orbit(cam(rotate([cn[0] * hh[0] * m, cn[1] * hh[1] * m, cn[2] * hh[2] * m], it2.rot)), yaw, pitch);
          pts2[q] = [it2.sx + v[0] * map.s, it2.sy + v[1] * map.s];
        }
        for (var f = 0; f < 6; f++) {
          var wn = rotate(FACES[f].n, it2.rot);
          if (orbit(cam(wn), yaw, pitch)[2] <= 0.001) continue;   // faces turned away from the camera
          var v4 = FACES[f].v;
          poly([pts2[v4[0]], pts2[v4[1]], pts2[v4[2]], pts2[v4[3]]], shadeFog(cube, wn, it2.fog));
        }
      }
      ctx.globalAlpha = 1;
    }

    // the landed blocks, drawn solid with the logo's own gradients
    function gradFor(i, off) {
      var f = MARK[i], A = toCanvas(f.a[0], f.a[1], off), Bp = toCanvas(f.b[0], f.b[1], off);
      var g = ctx.createLinearGradient(A[0], A[1], Bp[0], Bp[1]);
      g.addColorStop(0, f.c1); g.addColorStop(1, f.c2);
      return g;
    }
    function drawBlocks(kk, alpha) {
      ctx.globalAlpha = alpha;
      ctx.lineJoin = 'round';
      BLOCKS.forEach(function (B) {
        var b = B.b, off = offOf(B.g, kk);
        var P3 = function (x, y, z) { var q = proj(x, y, z); return toCanvas(q[0], q[1], off); };
        // +y (front-left), +x (front-right), then top
        poly([P3(b[0], b[3], b[4]), P3(b[1], b[3], b[4]), P3(b[1], b[3], b[5]), P3(b[0], b[3], b[5])], gradFor(B.py, off));
        poly([P3(b[1], b[2], b[4]), P3(b[1], b[3], b[4]), P3(b[1], b[3], b[5]), P3(b[1], b[2], b[5])], gradFor(B.px, off));
        if (B.hideTop) {
          // under the upper bowl block: never visible, and painting it would cover that block
        } else if (typeof B.top === 'number') {
          poly([P3(b[0], b[2], b[5]), P3(b[1], b[2], b[5]), P3(b[1], b[3], b[5]), P3(b[0], b[3], b[5])], gradFor(B.top, off));
        } else {
          var xs = B.top[1];
          poly([P3(b[0], b[2], b[5]), P3(xs, b[2], b[5]), P3(xs, b[3], b[5]), P3(b[0], b[3], b[5])], gradFor(B.top[0], off));
          poly([P3(xs, b[2], b[5]), P3(b[1], b[2], b[5]), P3(b[1], b[3], b[5]), P3(xs, b[3], b[5])], gradFor(B.top[2], off));
        }
      });
      ctx.globalAlpha = 1;
    }

    var far = document.querySelector('.hero__far');
    var section = document.getElementById('top');
    var mx = 0, my = 0, tmx = 0, tmy = 0, pointerSeen = false;

    if (finePointer && !reduce) {
      section.addEventListener('pointermove', function (e) {
        pointerSeen = true;
        tmx = (e.clientX / innerWidth - 0.5) * 2;
        tmy = (e.clientY / innerHeight - 0.5) * 2;
      });
      section.addEventListener('pointerleave', function () { tmx = 0; tmy = 0; });
    }

    var last = -1;
    var t0 = performance.now();
    function frame(now) {
      var rect = section.getBoundingClientRect();
      var travel = Math.max(rect.height - innerHeight, 1);
      var p = reduce ? 1 : clamp01(-rect.top / travel);
      var time = ((now || t0) - t0) / 1000;
      mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;

      // one continuous timeline; each stage starts before the last one ends
      var e = ease(clamp01(p / 0.42));                     // 1. the network pulls in, cubes land in their blocks
      var fuse = clamp01((p - 0.34) / 0.1);                // 2. seams close: cubes become solid blocks
      var join = easeInOut(clamp01((p - 0.26) / 0.56));    // 3. the pieces slide together (starts mid-flight)
      var exact = clamp01((p - 0.8) / 0.06);               // 4. hand over to the exact traced logo
      var cp = clamp01((p - 0.84) / 0.16);                 // 5. labels

      var live = canvas && exact < 1;
      var key = p.toFixed(4) + mx.toFixed(3) + my.toFixed(3);
      if ((live && e < 1) || key !== last) {
        last = key;
        if (rect.bottom > 0 && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (live) {
            var kk = 1 - join;
            if (fuse < 1) {
              var free = 1 - e;
              var yaw = (pointerSeen ? mx * 0.7 : Math.sin(time * 0.35) * 0.35) * free;
              var pitch = (pointerSeen ? -my * 0.45 : Math.cos(time * 0.28) * 0.18) * free;
              drawCubes(e, kk, time, yaw, pitch, 1);
            }
            if (fuse > 0) drawBlocks(kk, fuse * fuse * (3 - 2 * fuse));
          }
        }
        solid.setAttribute('opacity', canvas ? exact.toFixed(3) : 1);
        mark.order.forEach(function (name) { mark.groups[name].removeAttribute('transform'); });
        shadow.setAttribute('opacity', (0.3 + 0.7 * join).toFixed(3));
        callEls.forEach(function (c, i) {
          var t = clamp01(cp * 1.6 - i * 0.3);
          c.path.setAttribute('stroke-dashoffset', (1 - t).toFixed(3));
          c.dot.setAttribute('opacity', clamp01(t * 4).toFixed(3));
          c.shelf.setAttribute('stroke-dashoffset', (1 - clamp01(t * 1.4 - 0.3)).toFixed(3));
          c.text[0].setAttribute('opacity', clamp01(t * 2 - 1).toFixed(3));
          c.text[1].setAttribute('opacity', clamp01(t * 2 - 1).toFixed(3));
        });
        if (!reduce) {
          if (far) far.style.transform = 'translate3d(' + (mx * -4).toFixed(2) + 'px,' + (p * -36 + my * -4).toFixed(2) + 'px,0)';
          var tr = 'translate3d(' + (mx * 8).toFixed(2) + 'px,' + (p * -18 + my * 6).toFixed(2) + 'px,0)';
          svg.style.transform = tr;
          if (canvas) canvas.style.transform = tr;
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
    var P = placer(20, -70, 0.7);
    drawMark(el('g', { transform: P.t }, svg), { line: true, sw: 1.6 });
    // dimension lines, drawn like an engineering plate
    function dim(A, B, o, label, anchor) {
      var g = el('g', { stroke: INK, 'stroke-width': 0.8, fill: 'none' }, svg);
      el('line', lineAttrs([A[0] + o[0], A[1] + o[1]], [B[0] + o[0], B[1] + o[1]], {}), g);
      el('line', lineAttrs(A, [A[0] + o[0] * 1.15, A[1] + o[1] * 1.15], { 'stroke-dasharray': '2 3' }), g);
      el('line', lineAttrs(B, [B[0] + o[0] * 1.15, B[1] + o[1] * 1.15], { 'stroke-dasharray': '2 3' }), g);
      [A, B].forEach(function (Q) { el('circle', { cx: Q[0] + o[0], cy: Q[1] + o[1], r: 2.2, fill: INK, stroke: 'none' }, g); });
      var tx = (A[0] + B[0]) / 2 + o[0] * 1.4, ty = (A[1] + B[1]) / 2 + o[1] * 1.4;
      var t = el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': anchor, 'font-size': 12, fill: '#0A6E65', stroke: 'none' }, svg);
      t.textContent = label;
    }
    dim(P.at(412, 264), P.at(412, 746), [-34, 0], 'your roadmap', 'end');
    dim(P.at(594, 706), P.at(808, 835), [-16, 28], 'one team', 'middle');
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
    var section = document.getElementById('automation');
    var pinned = section && section.getAttribute('data-sc-act') === 'pin';
    var trig = document.getElementById('demo-trigger');
    var list = document.getElementById('demo-steps');
    var out = document.getElementById('demo-outcome');
    var human = document.getElementById('demo-human');
    var bar = document.querySelector('.demo__bar');
    var current = null, items = [];

    function load(key) {
      if (current === key) return;
      current = key;
      var f = FLOWS[key];
      trig.textContent = f.trigger; out.textContent = f.outcome; human.textContent = f.human;
      list.innerHTML = '';
      items = f.steps.map(function (t) { var li = document.createElement('li'); li.textContent = t; list.appendChild(li); return li; });
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-flow') === key;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (on) panel.setAttribute('aria-labelledby', t.id);
      });
    }
    // done = how many steps are complete; the step after them is the one running
    function show(done) {
      items.forEach(function (li, i) {
        li.classList.toggle('is-done', i < done);
        li.classList.toggle('is-active', i === done && done < items.length);
      });
      out.classList.toggle('is-done', done >= items.length);
    }

    if (pinned) {
      // Scroll runs it: the pinned span is split into one stretch per workflow,
      // and each stretch walks that workflow's steps through to its outcome.
      var keys = tabs.map(function (t) { return t.getAttribute('data-flow'); });
      var travel = 1, last = '';
      var frame = function () {
        var r = section.getBoundingClientRect();
        travel = Math.max(r.height - innerHeight, 1);
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = clamp01(-r.top / travel) * keys.length;
          var idx = Math.min(keys.length - 1, Math.floor(p)), local = clamp01(p - idx);
          var done = Math.min(FLOWS[keys[idx]].steps.length + 1, Math.floor(clamp01(local * 1.2) * (FLOWS[keys[idx]].steps.length + 1)));
          var key = idx + ':' + done;
          if (key !== last) { last = key; load(keys[idx]); show(done); }
          if (bar) bar.style.setProperty('--demo-p', clamp01(local * 1.2).toFixed(3));
        }
        requestAnimationFrame(frame);
      };
      var go = function (i) {
        var top = section.getBoundingClientRect().top + scrollY;
        scrollTo({ top: top + travel * (i / keys.length) + 2, behavior: reduce ? 'auto' : 'smooth' });
      };
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { go(i); });
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { e.preventDefault(); var j = (i + d + tabs.length) % tabs.length; tabs[j].focus(); go(j); }
        });
      });
      load(keys[0]); show(0);
      requestAnimationFrame(frame);
      return;
    }

    // Unpinned (phones, reduced motion): the tab plays its workflow on a timer.
    var timers = [], seen = false;
    function run(key) {
      timers.forEach(clearTimeout); timers = [];
      current = null; load(key); show(0);
      if (reduce) { show(items.length); return; }
      if (!seen) return;
      items.forEach(function (li, i) { timers.push(setTimeout(function () { show(i); }, 250 + i * 750)); });
      timers.push(setTimeout(function () { show(items.length); }, 250 + items.length * 750));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { run(t.getAttribute('data-flow')); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); run(n.getAttribute('data-flow')); }
      });
    });
    run('onboarding');
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { seen = true; io.disconnect(); run(current || 'onboarding'); }
      }, { threshold: 0.4 });
      io.observe(panel);
    }
  }

  /* ------------------------------------------------------- the problems --
     Not pinned, so it adds no length: everything is driven by how far the
     section has travelled up the screen. The headline lights word by word; the
     three pains start as loose, tilted parts and slide together into one panel
     ("the right parts, fitted together"); the answer lands once they fit. */
  function problemsFx() {
    var section = document.getElementById('problems');
    if (!section) return;
    var h = section.querySelector('.statement .h2');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.pains li'));
    var turn = section.querySelector('.pains__turn');
    // split the headline into words (the text stays real and selectable)
    var words = [];
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var sp = document.createElement('span'); sp.className = 'word'; sp.textContent = part;
            frag.appendChild(sp); words.push(sp);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(h);
    if (reduce) return;
    var small = matchMedia('(max-width: 860px)');
    // where each part starts: [x, y, degrees]
    var WIDE = [[-46, -34, -2.5], [0, 30, 1.5], [46, -12, 2.5]];
    var NARROW = [[-14, -26, -2], [12, 0, 1.5], [-10, 26, 2]];
    var last = '';
    function frame() {
      var r = section.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom > 0 && r.top < vh) {
        // each part is timed from its own place on screen, so every move happens in view:
        // 0 when that element's top is near the bottom of the screen, 1 once it reaches the upper middle
        var at = function (node, from, to) { var t = node.getBoundingClientRect().top; return clamp01((vh * from - t) / (vh * (from - to))); };
        var lit = at(h, 0.95, 0.45), fitRaw = at(cards[0].parentNode, 0.95, 0.5), land = turn ? at(turn, 0.95, 0.75) : 1;
        var key = lit.toFixed(3) + fitRaw.toFixed(3) + land.toFixed(3);
        if (key !== last) {
          last = key;
          words.forEach(function (w, i) {
            var on = clamp01((lit - (i / words.length) * 0.7) / 0.3);
            w.style.setProperty('--lit', (0.22 + 0.78 * on).toFixed(3));
          });
          var fit = easeInOut(fitRaw), k = 1 - fit;
          var start = small.matches ? NARROW : WIDE;
          cards.forEach(function (c, i) {
            var o = start[i] || [0, 0, 0];
            c.style.transform = 'translate3d(' + (o[0] * k).toFixed(2) + 'px,' + (o[1] * k).toFixed(2) + 'px,0) rotate(' + (o[2] * k).toFixed(3) + 'deg)';
            c.style.opacity = (0.4 + 0.6 * clamp01(fitRaw * 2.2 - i * 0.25)).toFixed(3);
          });
          // the answer lands as the parts lock together
          if (turn) turn.style.setProperty('--turn', (land * clamp01((fit - 0.8) / 0.2)).toFixed(3));
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------ small scroll effects --
     The service cards stack (a covered card shrinks back and dims) with their
     pictures drifting inside the frame; the "why" photo eases out of a zoom;
     the tools row drifts sideways, faster when the page is scrolled faster. */
  function scrollFx() {
    if (reduce) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.stack .card'));
    var why = document.querySelector('.why__media');
    var track = document.querySelector('.tools__track');
    var lists = [];
    if (track) {
      var first = track.querySelector('.tools__list');
      var copy = first.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
      lists = [first, copy];
    }
    var x = 0, lastY = scrollY, vel = 0;
    function frame() {
      var vh = innerHeight;
      // stacked cards
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        var cover = 0;
        if (i < cards.length - 1) {
          var n = cards[i + 1].getBoundingClientRect();
          cover = clamp01(1 - (n.top - r.top) / Math.max(r.height, 1));
        }
        cards[i].style.transform = 'scale(' + (1 - cover * 0.05).toFixed(4) + ')';
        cards[i].style.setProperty('--cover', cover.toFixed(3));
        var media = cards[i].querySelector('.card__media > *');
        if (media) {
          var drift = ((r.top + r.height / 2) - vh / 2) / vh;
          media.style.transform = 'translate3d(0,' + (drift * -22).toFixed(2) + 'px,0) scale(1.1)';
        }
      }
      // the "why" photo eases out of a zoom as it passes
      if (why) {
        var wr = why.getBoundingClientRect();
        if (wr.bottom > 0 && wr.top < vh) {
          var img = why.querySelector('.photo, svg');
          var prog = clamp01((vh - wr.top) / (vh + wr.height));
          if (img) img.style.transform = 'scale(' + (1.16 - 0.16 * prog).toFixed(4) + ')';
        }
      }
      // tools marquee
      var y = scrollY; vel += ((y - lastY) - vel) * 0.2; lastY = y;
      if (lists.length) {
        var tr = track.getBoundingClientRect();
        if (tr.bottom > 0 && tr.top < vh) {
          x -= 0.4 + Math.min(Math.abs(vel) * 0.25, 14);
          var w = lists[0].offsetWidth;
          if (-x >= w) x += w;
          lists.forEach(function (l) { l.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; });
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
  // The automation demo is taller than a phone screen once its columns stack, so
  // it only pins on wider screens, and never under reduced motion, where a held
  // frame would just be dead scroll.
  (function () {
    var small = matchMedia('(max-width: 860px)').matches;
    [['automation', small || reduce]].forEach(function (d) {
      var el2 = document.getElementById(d[0]);
      if (el2 && d[1]) { el2.setAttribute('data-sc-act', 'flow'); el2.removeAttribute('data-sc-span'); }
    });
  })();
  heroPlate();
  whyPlate();
  builder();
  nav();
  whatsapp();
  illos();
  photos();
  demo();
  problemsFx();
  scrollFx();
  briefForm();
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);
})();
