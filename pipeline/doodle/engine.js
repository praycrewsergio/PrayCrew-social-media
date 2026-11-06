// Doodle engine: rough.js shapes that draw themselves on, text that writes itself, all driven by setTime(t).
const W = 1080, H = 1920;
const INK = '#1d2b33', BLUE = '#2f6fb3', SAND = '#d39e6a', RED = '#d9534f', GREEN = '#3f9c6d', PAPER = '#fbf9f4';
const NS = 'http://www.w3.org/2000/svg';
let svg, rc, items = [], defs, clipN = 0, SEED = 7;

function newScene() {
  document.body.innerHTML = '';
  svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.background = PAPER;
  document.body.appendChild(svg);
  defs = document.createElementNS(NS, 'defs'); svg.appendChild(defs);
  rc = rough.svg(svg); items = []; SEED = 7;
}
const O = (o = {}) => Object.assign({ stroke: INK, strokeWidth: 4, roughness: 1.4, bowing: 1.2, seed: SEED++ }, o);

// register a rough drawable (a <g> of paths) to be drawn on between t0 and t0+d
function draw(node, t0, d = 0.8, parent) {
  (parent || svg).appendChild(node);
  const paths = [...node.querySelectorAll('path')];
  const lens = paths.map(p => { try { return p.getTotalLength(); } catch (e) { return 1; } });
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  paths.forEach((p, i) => {
    const a = acc / total, b = (acc + lens[i]) / total; acc += lens[i];
    p.style.strokeDasharray = lens[i] + 1;
    const fill = p.getAttribute('fill');
    items.push({ kind: 'path', el: p, len: lens[i] + 1, t0: t0 + a * d, t1: t0 + b * d, fill: fill && fill !== 'none' });
  });
  return node;
}
function group(parent) { const g = document.createElementNS(NS, 'g'); (parent || svg).appendChild(g); return g; }
function fadeIn(el, t0, d = 0.4, t1 = null) { items.push({ kind: 'fade', el, t0, t1: t0 + d, out: t1 }); return el; }
function pop(el, t0, cx, cy, d = 0.35) { items.push({ kind: 'pop', el, t0, t1: t0 + d, cx, cy }); return el; }
function move(el, t0, d, dx, dy) { items.push({ kind: 'move', el, t0, t1: t0 + d, dx, dy }); return el; }

// handwritten text revealed left to right
function write(str, x, y, { size = 84, color = INK, anchor = 'middle', family = 'Caveat', weight = 700, t0 = 0, d = null, lh = 1.08, parent } = {}) {
  const g = group(parent);
  const lines = str.split('\n');
  { // shrink to fit 980 px
    const probe = document.createElementNS(NS, 'text');
    probe.setAttribute('font-family', family); probe.setAttribute('font-weight', weight); probe.setAttribute('font-size', size);
    svg.appendChild(probe); let mw = 0;
    for (const ln of lines) { probe.textContent = ln; mw = Math.max(mw, probe.getComputedTextLength()); }
    svg.removeChild(probe); if (mw > 980) size = Math.floor(size * 980 / mw);
  }
  const dd = d ?? Math.min(1.6, 0.045 * str.length + 0.3);
  lines.forEach((ln, i) => {
    const t = document.createElementNS(NS, 'text');
    t.textContent = ln; t.setAttribute('x', x); t.setAttribute('y', y + (i - (lines.length - 1) / 2) * size * lh);
    t.setAttribute('text-anchor', anchor); t.setAttribute('dominant-baseline', 'middle');
    t.setAttribute('font-family', family); t.setAttribute('font-weight', weight); t.setAttribute('font-size', size);
    t.setAttribute('fill', color);
    g.appendChild(t);
    const bb = t.getBBox();
    const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'c' + (clipN++);
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', bb.x - 10); r.setAttribute('y', bb.y - 20); r.setAttribute('height', bb.height + 40); r.setAttribute('width', 0);
    cp.appendChild(r); defs.appendChild(cp); t.setAttribute('clip-path', `url(#${cp.id})`);
    const per = dd / lines.length;
    items.push({ kind: 'wipe', el: r, w: bb.width + 20, t0: t0 + i * per, t1: t0 + (i + 1) * per });
  });
  return g;
}

function setTime(t) {
  for (const it of items) {
    const p = Math.max(0, Math.min(1, (t - it.t0) / Math.max(1e-6, it.t1 - it.t0)));
    const e = p < 1 ? 1 - Math.pow(1 - p, 2) : 1;
    if (it.kind === 'path') {
      it.el.style.strokeDashoffset = it.len * (1 - p);
      if (it.fill) it.el.style.fillOpacity = p;
      it.el.style.visibility = p > 0 ? 'visible' : 'hidden';
    } else if (it.kind === 'wipe') it.el.setAttribute('width', it.w * p);
    else if (it.kind === 'fade') {
      let o = e; if (it.out != null && t > it.out) o = Math.max(0, 1 - (t - it.out) / 0.35);
      it.el.style.opacity = o;
    } else if (it.kind === 'pop') {
      const s = p === 0 ? 0 : (p < 1 ? 1.15 * Math.sin(p * Math.PI / 2) + (p > .7 ? -0.15 * (p - .7) / .3 : 0) : 1);
      it.el.setAttribute('transform', `translate(${it.cx} ${it.cy}) scale(${s}) translate(${-it.cx} ${-it.cy})`);
    } else if (it.kind === 'along') {
      const pt = it.path.getPointAtLength(it.len * e);
      it.el.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      it.el.style.opacity = p > 0 && p < 1 ? 1 : 0;
    } else if (it.kind === 'move') {
      const k = p * p * (3 - 2 * p);
      it.el.setAttribute('transform', `translate(${it.dx * k} ${it.dy * k})`);
    }
  }
}

// ---------- doodle library ----------
const L = (x1, y1, x2, y2, o) => rc.line(x1, y1, x2, y2, O(o));
const C = (x, y, d, o) => rc.circle(x, y, d, O(o));
const R = (x, y, w, h, o) => rc.rectangle(x, y, w, h, O(o));
const P = (d, o) => rc.path(d, O(o));
const E = (x, y, w, h, o) => rc.ellipse(x, y, w, h, O(o));

function roundRect(x, y, w, h, r) {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

// person seen from above around a table: shoulders + head, facing the centre
const SHIRTS = ['#7fb3e0', '#f2b880', '#9fd3b0', '#e8a0b4', '#c9b6e8', '#f4d58d', '#9fc5c9', '#f0a58c', '#b5d38a', '#a9b8d8'];
function personTop(cx, cy, ang, i, t0, parent, leader = false) {
  const g = group(parent);
  const r = 330, x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
  const deg = ang * 180 / Math.PI + 90;
  g.setAttribute('transform', `rotate(${deg} ${x} ${y})`);
  draw(E(x, y + 6, 150, 80, { fill: SHIRTS[i % 10], fillStyle: 'hachure', hachureGap: 9, fillWeight: 2.5 }), t0, 0.5, g);
  draw(C(x, y - 6, 66, { fill: '#5b4636', fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.3, 0.3, g);
  if (leader) draw(P(`M${x - 18} ${y - 52} l18 -26 l18 26`, { stroke: SAND, strokeWidth: 5 }), t0 + 0.5, 0.25, g);
  return { x, y };
}

function tableTop(cx, cy, t0, parent, withCups = true) {
  const g = group(parent);
  draw(C(cx, cy, 470, { fill: '#e9d6bd', fillStyle: 'hachure', hachureGap: 14, fillWeight: 2 }), t0, 0.9, g);
  if (withCups) {
    [[-110, -60], [90, 100], [120, -110]].forEach(([dx, dy], k) =>
      draw(C(cx + dx, cy + dy, 46, { strokeWidth: 3 }), t0 + 0.6 + k * 0.1, 0.25, g));
    draw(R(cx - 70, cy + 20, 120, 84, { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.8, 0.3, g);  // Bible
    draw(L(cx - 10, cy + 20, cx - 10, cy + 104, { stroke: '#f5e9d6', strokeWidth: 3 }), t0 + 1.0, 0.15, g);
  }
  return g;
}

function bubble(x, y, w, h, text, t0, { color = INK, tail = 'down', size = 46, fill = '#ffffff', parent } = {}) {
  const g = group(parent);
  const tx = tail === 'left' ? -w / 2 + 30 : tail === 'right' ? w / 2 - 30 : 0;
  const ty = tail === 'up' ? -1 : 1, by = y + ty * (h / 2 - 2);
  draw(P(roundRect(x - w / 2, y - h / 2, w, h, 28) + ` M${x + tx - 16} ${by} L${x + tx} ${by + ty * 32} L${x + tx + 16} ${by}`,
    { fill, fillStyle: 'solid', strokeWidth: 3.5, roughness: 1 }), t0, 0.4, g);
  write(text, x, y + 2, { size, color, t0: t0 + 0.3, family: 'Patrick Hand', weight: 400, d: 0.5, parent: g });
  pop(g, t0, x, y + (tail === 'up' ? -1 : 1) * (h / 2 + 30), 0.35);
  return g;
}

function phone(x, y, w, h, t0, parent, o = {}) {
  const g = group(parent);
  draw(P(roundRect(x, y, w, h, Math.min(w, h) * 0.14), Object.assign({ strokeWidth: 5, roughness: 0.9 }, o)), t0, 0.6, g);
  draw(L(x + w * 0.38, y + h * 0.045, x + w * 0.62, y + h * 0.045, { strokeWidth: 4 }), t0 + 0.5, 0.15, g);
  return g;
}

function house(x, y, s, t0, parent, color = SHIRTS[0]) {
  const g = group(parent);
  draw(R(x - 60 * s, y - 40 * s, 120 * s, 90 * s, { fill: color, fillStyle: 'hachure', hachureGap: 10 * s, strokeWidth: 3.5 }), t0, 0.45, g);
  draw(P(`M${x - 78 * s} ${y - 38 * s} L${x} ${y - 100 * s} L${x + 78 * s} ${y - 38 * s}`, { strokeWidth: 3.5 }), t0 + 0.3, 0.3, g);
  draw(R(x - 14 * s, y + 6 * s, 28 * s, 44 * s, { strokeWidth: 3 }), t0 + 0.5, 0.2, g);
  return g;
}

function hands(x, y, s, t0, parent, color = SAND) {   // simple praying hands
  const g = group(parent);
  draw(P(`M${x} ${y - 46 * s} C${x - 30 * s} ${y - 20 * s} ${x - 34 * s} ${y + 20 * s} ${x - 22 * s} ${y + 42 * s} L${x} ${y + 42 * s} Z`,
    { fill: color, fillStyle: 'solid', strokeWidth: 3 }), t0, 0.3, g);
  draw(P(`M${x} ${y - 46 * s} C${x + 30 * s} ${y - 20 * s} ${x + 34 * s} ${y + 20 * s} ${x + 22 * s} ${y + 42 * s} L${x} ${y + 42 * s} Z`,
    { fill: color, fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.15, 0.3, g);
  return g;
}

function heart(x, y, s, t0, parent, color = RED, fill = true) {
  const g = group(parent);
  draw(P(`M${x} ${y + 40 * s} C${x - 70 * s} ${y - 10 * s} ${x - 40 * s} ${y - 60 * s} ${x} ${y - 25 * s} C${x + 40 * s} ${y - 60 * s} ${x + 70 * s} ${y - 10 * s} ${x} ${y + 40 * s} Z`,
    { stroke: color, fill: fill ? color : undefined, fillStyle: 'solid', strokeWidth: 4 }), t0, 0.5, g);
  return g;
}

function check(x, y, s, t0, parent) {
  const g = group(parent);
  draw(C(x, y, 70 * s, { stroke: GREEN, fill: GREEN, fillStyle: 'solid', strokeWidth: 3 }), t0, 0.25, g);
  draw(P(`M${x - 16 * s} ${y} L${x - 4 * s} ${y + 13 * s} L${x + 18 * s} ${y - 14 * s}`, { stroke: '#fff', strokeWidth: 6, roughness: 0.5 }), t0 + 0.2, 0.2, g);
  return g;
}

function bell(x, y, s, t0, parent) {
  const g = group(parent);
  draw(P(`M${x - 30 * s} ${y + 20 * s} C${x - 30 * s} ${y - 40 * s} ${x + 30 * s} ${y - 40 * s} ${x + 30 * s} ${y + 20 * s} L${x + 38 * s} ${y + 30 * s} L${x - 38 * s} ${y + 30 * s} Z`,
    { fill: SAND, fillStyle: 'solid', strokeWidth: 3 }), t0, 0.3, g);
  draw(C(x, y + 40 * s, 16 * s, { fill: INK, fillStyle: 'solid', strokeWidth: 2 }), t0 + 0.25, 0.15, g);
  return g;
}

function qr(x, y, s, t0, parent) {
  const g = group(parent); const n = 9, c = s / n;
  draw(R(x, y, s, s, { strokeWidth: 3 }), t0, 0.3, g);
  const corners = [[0, 0], [n - 3, 0], [0, n - 3]];
  corners.forEach(([i, j], k) => draw(R(x + i * c + 4, y + j * c + 4, 3 * c - 8, 3 * c - 8, { fill: INK, fillStyle: 'solid', strokeWidth: 2, roughness: 0.6 }), t0 + 0.2 + k * 0.08, 0.15, g));
  let r = 3;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if ((i < 3 && j < 3) || (i > n - 4 && j < 3) || (i < 3 && j > n - 4)) continue;
    r = (r * 37 + 11) % 101; if (r % 3) continue;
    draw(R(x + i * c + 5, y + j * c + 5, c - 10, c - 10, { fill: INK, fillStyle: 'solid', strokeWidth: 1.5, roughness: 0.5 }), t0 + 0.4 + (i + j) * 0.015, 0.1, g);
  }
  return g;
}

function dashedArc(x1, y1, x2, y2, bend, t0, d, color = BLUE, parent, traveler = null) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const dstr = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
  const g = group(parent);
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', dstr); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color);
  p.setAttribute('stroke-width', 6); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-dasharray', '1 16');
  const mask = document.createElementNS(NS, 'mask'); mask.id = 'm' + (clipN++);
  mask.setAttribute('maskUnits', 'userSpaceOnUse'); mask.setAttribute('x', 0); mask.setAttribute('y', 0); mask.setAttribute('width', W); mask.setAttribute('height', H);
  const mp = document.createElementNS(NS, 'path');
  mp.setAttribute('d', dstr); mp.setAttribute('fill', 'none'); mp.setAttribute('stroke', '#fff'); mp.setAttribute('stroke-width', 14);
  mask.appendChild(mp); defs.appendChild(mask); g.appendChild(p); p.setAttribute('mask', `url(#${mask.id})`);
  const len = p.getTotalLength(); mp.style.strokeDasharray = len + 1;
  items.push({ kind: 'path', el: mp, len: len + 1, t0, t1: t0 + d });
  if (traveler) items.push({ kind: 'along', el: traveler, path: p, len, t0, t1: t0 + d });
  return g;
}

function chart(x, y, w, h, t0, parent) {
  const g = group(parent);
  draw(P(`M${x} ${y} L${x} ${y + h} L${x + w} ${y + h}`, { strokeWidth: 4 }), t0, 0.4, g);
  const vals = [0.45, 0.7, 0.55, 0.9, 0.75], bw = w / (vals.length * 1.6);
  vals.forEach((v, i) => draw(R(x + 20 + i * bw * 1.6, y + h - v * h, bw, v * h,
    { fill: [BLUE, SAND, GREEN, BLUE, SAND][i], fillStyle: 'hachure', hachureGap: 8, strokeWidth: 3 }), t0 + 0.4 + i * 0.15, 0.3, g));
  return g;
}

function person(x, y, s, t0, parent, shirt = SHIRTS[0]) {   // front view, waist up
  const g = group(parent);
  draw(P(`M${x - 70 * s} ${y + 120 * s} C${x - 70 * s} ${y + 40 * s} ${x - 40 * s} ${y + 20 * s} ${x} ${y + 20 * s} C${x + 40 * s} ${y + 20 * s} ${x + 70 * s} ${y + 40 * s} ${x + 70 * s} ${y + 120 * s}`,
    { fill: shirt, fillStyle: 'hachure', hachureGap: 9, strokeWidth: 4 }), t0, 0.5, g);
  draw(C(x, y - 30 * s, 92 * s, { fill: '#f6dcc4', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.3, 0.35, g);
  draw(P(`M${x - 46 * s} ${y - 40 * s} C${x - 40 * s} ${y - 90 * s} ${x + 40 * s} ${y - 90 * s} ${x + 46 * s} ${y - 40 * s}`, { stroke: '#5b4636', strokeWidth: 9 }), t0 + 0.5, 0.25, g);
  draw(P(`M${x - 14 * s} ${y - 24 * s} l1 1 M${x + 14 * s} ${y - 24 * s} l1 1 M${x - 14 * s} ${y - 6 * s} Q${x} ${y + 4 * s} ${x + 14 * s} ${y - 6 * s}`, { strokeWidth: 4, roughness: 0.6 }), t0 + 0.7, 0.2, g);
  return g;
}
