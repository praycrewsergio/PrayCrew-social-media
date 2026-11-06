// "A church with PrayCrew" — doodle story with app inserts.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const FORM = { crop: [40, 654, 1000, 852], win: { x: 100, y: 640, w: 880, h: 750 }, radius: 10 };   // church page on its own
const SITE = { crop: [40, 708, 1000, 744], win: { x: 100, y: 660, w: 880, h: 655 }, radius: 10 };   // form embedded in a website

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
  draw(L(x + w / 2 - 70, y + h + 32, x + w / 2 + 70, y + h + 32, { strokeWidth: 4 }), t0 + 0.7, 0.15);
}
function laptopFrame(txt, lang, spec, extra) { caption(txt, lang); laptop(spec.win, 0.05); if (extra) extra(); }

function church(x, y, s, t0) {
  const g = group();
  draw(R(x - 170 * s, y - 120 * s, 340 * s, 260 * s, { fill: '#f3e6d3', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.6, g);
  draw(P(`M${x - 200 * s} ${y - 115 * s} L${x} ${y - 260 * s} L${x + 200 * s} ${y - 115 * s}`, { strokeWidth: 5 }), t0 + 0.4, 0.4, g);
  draw(R(x - 50 * s, y - 380 * s, 100 * s, 150 * s, { fill: '#f3e6d3', fillStyle: 'solid', strokeWidth: 5 }), t0 + 0.6, 0.35, g);
  draw(P(`M${x - 65 * s} ${y - 375 * s} L${x} ${y - 440 * s} L${x + 65 * s} ${y - 375 * s}`, { strokeWidth: 5 }), t0 + 0.8, 0.25, g);
  draw(P(`M${x} ${y - 540 * s} L${x} ${y - 450 * s} M${x - 30 * s} ${y - 510 * s} L${x + 30 * s} ${y - 510 * s}`, { stroke: SAND, strokeWidth: 8 }), t0 + 1.0, 0.3, g);
  draw(P(`M${x - 45 * s} ${y + 140 * s} L${x - 45 * s} ${y + 30 * s} Q${x} ${y - 20 * s} ${x + 45 * s} ${y + 30 * s} L${x + 45 * s} ${y + 140 * s}`,
    { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 4 }), t0 + 1.1, 0.3, g);
  [[-115, -40], [115, -40]].forEach(([dx, dy], k) =>
    draw(P(`M${x + dx * s - 25 * s} ${y + dy * s + 40 * s} L${x + dx * s - 25 * s} ${y + dy * s} Q${x + dx * s} ${y + dy * s - 30 * s} ${x + dx * s + 25 * s} ${y + dy * s} L${x + dx * s + 25 * s} ${y + dy * s + 40 * s} Z`,
      { fill: '#bcd6ee', fillStyle: 'solid', strokeWidth: 3 }), t0 + 1.2 + k * 0.1, 0.2, g));
  return g;
}

function noAppBadge(x, y, t0) {
  const g = group();
  draw(P(roundRect(x - 75, y - 75, 150, 150, 34), { fill: '#dceaf7', fillStyle: 'solid', strokeWidth: 5 }), t0, 0.4, g);
  draw(P(`M${x} ${y - 40} L${x} ${y + 25} M${x - 28} ${y} L${x} ${y + 28} L${x + 28} ${y} M${x - 35} ${y + 45} L${x + 35} ${y + 45}`, { strokeWidth: 6, roughness: 0.6 }), t0 + 0.3, 0.3, g);
  draw(C(x, y, 230, { stroke: RED, strokeWidth: 9, roughness: 0.8 }), t0 + 0.6, 0.35, g);
  draw(L(x - 80, y + 80, x + 80, y - 80, { stroke: RED, strokeWidth: 9, roughness: 0.6 }), t0 + 0.9, 0.2, g);
  pop(g, t0, x, y, 0.3);
  return g;
}

const SCENES = [
  { dur: 4.0, build(lang) {
      write(T('One church.\nOne prayer team.', 'Una iglesia.\nUn equipo de oración.')[lang], 540, 470, { size: 116, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 660, { size: 84, color: BLUE, t0: 1.0 });
      church(540, 1380, 1.3, 0.5);
  } },
  { dur: 4.8, build(lang) {
      caption(T('The church gathers\nits prayer team…', 'La iglesia reúne a su\nequipo de oración…'), lang);
      church(540, 900, 0.75, 0.0);
      [[160, 1420], [350, 1460], [540, 1420], [730, 1460], [920, 1420]].forEach(([x, y], k) => person(x, y, 0.95, 0.6 + k * 0.25, null, SHIRTS[k + 1]));
      hands(540, 1680, 0.9, 2.2);
      write(T('Prayer team', 'Equipo de oración')[lang], 540, 1800, { size: 64, color: SAND, t0: 2.4 });
  } },
  { dur: 4.2, app: { clip: 'crews', st: { en: 3.6, es: 3.8 } }, build(lang) {
      appFrame(T('…as a crew in PrayCrew.', '…en un grupo de PrayCrew.'), lang);
  } },
  { dur: 4.6, app: Object.assign({ clip: 'landing', st: { en: 37.0, es: 33.5 } }, SITE), build(lang) {
      laptopFrame(T('They add a prayer request\nform to their website.', 'Agregan un formulario de\npeticiones a su sitio web.'), lang, SITE,
        () => write(T('yourchurch.org', 'tuiglesia.org')[lang], 540, 1560, { size: 60, color: BLUE, t0: 1.0, family: 'Patrick Hand', weight: 400 }));
  } },
  { dur: 5.6, build(lang) {
      caption(T('The congregation shares requests\nfrom any phone or computer.', 'La congregación comparte peticiones\ndesde cualquier teléfono o computadora.'), lang);
      const crowd = [[200, 760], [440, 740], [680, 760], [900, 740], [320, 980], [560, 1000], [800, 980]];
      crowd.forEach(([x, y], k) => person(x, y, 0.75, 0.3 + k * 0.12, null, SHIRTS[(k + 3) % 10]));
      noAppBadge(540, 1380, 1.6);
      write(T('No app to download.\nNo account needed.', 'Sin descargar la app.\nSin crear una cuenta.')[lang], 540, 1690, { size: 90, color: RED, t0: 2.3 });
  } },
  { dur: 4.4, app: Object.assign({ clip: 'landing', st: { en: 0.4, es: 0.4 } }, FORM), build(lang) {
      laptopFrame(T('They just fill out the form.\nEasy.', 'Solo llenan el formulario.\nAsí de fácil.'), lang, FORM);
  } },
  { dur: 5.2, build(lang) {
      caption(T('Every request goes straight\nto the prayer team.', 'Cada petición llega directo\nal equipo de oración.'), lang);
      const req = T(['Healing', 'Lost my job', 'Our bills', 'My son', 'Anxiety'], ['Sanidad', 'Perdí mi trabajo', 'Las deudas', 'Mi hijo', 'Ansiedad'])[lang];
      phone(110, 560, 170, 300, 0.2); phone(110, 960, 170, 300, 0.35); phone(110, 1360, 170, 300, 0.5);
      church(800, 1250, 0.7, 0.4);
      [[290, 700], [290, 1100], [290, 1500]].forEach(([x, y], k) => dashedArc(x, y, 640, 1150 + k * 60, (k - 1) * 0.2, 1.0 + k * 0.3, 0.8, BLUE));
      [[560, 600], [820, 520], [560, 1650], [860, 1700], [520, 860]].forEach(([x, y], k) => {
        const w = Math.max(230, req[k].length * 22 + 70);
        bubble(Math.min(1060 - w / 2, x), y, w, 92, req[k], 1.6 + k * 0.4, { size: 44, fill: ['#dceaf7', '#f6e3cf', '#dff0e6', '#eee6f7', '#fbe3e3'][k] });
      });
  } },
  { dur: 4.2, app: { clip: 'followup', st: { en: 6.03, es: 6.35 } }, build(lang) {
      appFrame(T('The team prays and taps the hands.\nThey know someone prayed.', 'El equipo ora y toca las manos.\nSaben que alguien oró.'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('Then they follow up with a text,\nvoice note or video.', 'Luego dan seguimiento con texto,\nnota de voz o video.'), lang);
  } },
  { dur: 5.2, build(lang) {
      caption(T('The person who asked is\nnotified every time.', 'Quien pidió oración recibe\nuna notificación cada vez.'), lang);
      person(540, 1450, 1.6, 0.2, null, SHIRTS[6]);
      phone(700, 980, 200, 340, 0.8);
      bell(800, 1100, 1.0, 1.3);
      [[300, 640], [780, 680], [320, 900]].forEach(([x, y], k) => {
        const m = T(['Someone prayed for you', 'We are praying for you!', 'New video message'], ['Alguien oró por ti', '¡Estamos orando por ti!', 'Nuevo mensaje en video'])[lang][k];
        const w = Math.min(520, m.length * 20 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 96, m, 1.5 + k * 0.6, { size: 42, fill: '#dceaf7' });
      });
      heart(330, 1150, 0.9, 3.4);
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('A unique experience:\nthey feel seen and cared for.', 'Una experiencia única:\nse sienten vistos y cuidados.'), lang);
  } },
  { dur: 5.2, build(lang) {
      caption(T('Leaders see what the\ncommunity is praying about.', 'Los líderes ven por qué\nestá orando la comunidad.'), lang);
      const lab = T(['Health', 'Family', 'Finances', 'Work', 'Faith'], ['Salud', 'Familia', 'Finanzas', 'Trabajo', 'Fe'])[lang];
      const vals = [0.45, 0.5, 0.95, 0.35, 0.3], x0 = 150, base = 1500, hmax = 760, bw = 120;
      draw(P(`M${x0 - 30} ${base - hmax - 60} L${x0 - 30} ${base} L${x0 + 5 * 165 + 10} ${base}`, { strokeWidth: 5 }), 0.3, 0.5);
      vals.forEach((v, k) => {
        const x = x0 + k * 165, c = k === 2 ? RED : [BLUE, SAND, RED, GREEN, BLUE][k];
        draw(R(x, base - v * hmax, bw, v * hmax, { fill: c, fillStyle: 'hachure', hachureGap: 9, strokeWidth: 4 }), 0.8 + k * 0.2, 0.35);
        write(lab[k], x + bw / 2, base + 60, { size: 44, family: 'Patrick Hand', weight: 400, t0: 0.9 + k * 0.2, d: 0.3 });
      });
      draw(P(`M${x0 + 2 * 165 + 60} ${base - 0.95 * hmax - 30} l0 -90 M${x0 + 2 * 165 + 30} ${base - 0.95 * hmax - 90} l30 -30 l30 30`, { stroke: RED, strokeWidth: 7 }), 2.4, 0.4);
  } },
  { dur: 4.4, app: { clip: 'groupmetrics', st: { en: 17.5, es: 17.2 } }, build(lang) {
      appFrame(T('Prayer topics, answered prayers\nand trends, all in one place.', 'Temas de oración, oraciones contestadas\ny tendencias, en un solo lugar.'), lang);
  } },
  { dur: 6.2, build(lang) {
      caption(T('More requests about finances?\nThe church starts a class.', '¿Más peticiones por finanzas?\nLa iglesia abre una clase.'), lang);
      draw(R(110, 520, 860, 520, { fill: '#2f4a3a', fillStyle: 'solid', strokeWidth: 6, roughness: 0.8 }), 0.3, 0.6);
      draw(R(90, 1040, 900, 24, { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 4 }), 0.7, 0.3);
      write(T('Biblical Stewardship', 'Mayordomía bíblica')[lang], 540, 650, { size: 84, color: '#ffffff', t0: 1.0 });
      write(T('What the Bible teaches\nabout money', 'Lo que enseña la Biblia\nsobre el dinero')[lang], 540, 820, { size: 60, color: '#f4d58d', t0: 1.8, family: 'Patrick Hand', weight: 400 });
      write(T('Proverbs 3:9', 'Proverbios 3:9')[lang], 540, 965, { size: 46, color: '#dfe8e2', t0: 2.6, family: 'Patrick Hand', weight: 400 });
      [[180, 1330], [400, 1350], [620, 1330], [840, 1350], [290, 1600], [520, 1620], [750, 1600]].forEach(([x, y], k) =>
        person(x, y, 0.72, 2.6 + k * 0.15, null, SHIRTS[(k + 2) % 10]));
      heart(930, 1780, 0.6, 4.6);
  } },
  { dur: 5.8, build(lang) {
      church(540, 760, 0.8, 0.1);
      write(T('Collect every request.\nFollow up with every person.\nServe your community better.',
              'Recibe cada petición.\nDa seguimiento a cada persona.\nSirve mejor a tu comunidad.')[lang], 540, 1230, { size: 84, t0: 1.0, d: 2.0 });
      write(T('PrayCrew for churches', 'PrayCrew para iglesias')[lang], 540, 1560, { size: 92, color: BLUE, t0: 3.3 });
      draw(P('M270 1630 C450 1650 630 1620 810 1635', { stroke: BLUE, strokeWidth: 5 }), 4.1, 0.4);
  } },
];
const HOUSES = [];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
