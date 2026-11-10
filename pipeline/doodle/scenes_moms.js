// "Moms praying for kids and schools" — moms' prayer groups + org portal by divisions. Doodle story with app inserts.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const GREY = '#8f9aa1';
const PORTAL = { image: 'media/portal.png', zoom: [[0, 0, 1657, 936], [0, 60, 1100, 621]], win: { x: 100, y: 700, w: 880, h: 496 }, radius: 10 };
const MOMS = [SHIRTS[3], SHIRTS[5], SHIRTS[8], SHIRTS[1], SHIRTS[6], SHIRTS[9]];

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function school(x, y, s, t0) {
  draw(R(x - 260 * s, y - 120 * s, 520 * s, 260 * s, { fill: '#f6dcc4', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.5);
  draw(R(x - 90 * s, y - 280 * s, 180 * s, 160 * s, { fill: '#f6dcc4', fillStyle: 'solid', strokeWidth: 5 }), t0 + 0.3, 0.3);
  draw(P(`M${x - 110 * s} ${y - 275 * s} L${x} ${y - 360 * s} L${x + 110 * s} ${y - 275 * s}`, { strokeWidth: 5 }), t0 + 0.45, 0.25);
  draw(C(x, y - 205 * s, 50 * s, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.6, 0.2);
  draw(P(`M${x} ${y - 205 * s} L${x} ${y - 235 * s} M${x} ${y - 205 * s} L${x + 20 * s} ${y - 195 * s}`, { strokeWidth: 3 }), t0 + 0.7, 0.15);
  draw(L(x, y - 360 * s, x, y - 450 * s, { strokeWidth: 4 }), t0 + 0.7, 0.15);
  draw(P(`M${x} ${y - 450 * s} L${x + 70 * s} ${y - 430 * s} L${x} ${y - 410 * s} Z`, { fill: RED, fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.8, 0.15);
  [-180, -100, 100, 180].forEach((dx, k) => draw(R(x + dx * s - 30 * s, y - 70 * s, 60 * s, 60 * s, { fill: '#bcd6ee', fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.8 + k * 0.05, 0.15));
  draw(R(x - 40 * s, y + 30 * s, 80 * s, 110 * s, { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 3.5 }), t0 + 1.0, 0.2);
}
function envelope(x, y, w, h, t0, color = INK) {
  draw(R(x - w / 2, y - h / 2, w, h, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 5, stroke: color }), t0, 0.35);
  draw(P(`M${x - w / 2} ${y - h / 2} L${x} ${y + h * 0.1} L${x + w / 2} ${y - h / 2}`, { strokeWidth: 5, stroke: color }), t0 + 0.25, 0.3);
}
function node(x, y, w, label, t0, fill = '#ffffff', size = 42) {
  draw(P(roundRect(x - w / 2, y - 45, w, 90, 20), { fill, fillStyle: 'solid', strokeWidth: 4 }), t0, 0.3);
  write(label, x, y + 2, { size, family: 'Patrick Hand', weight: 400, t0: t0 + 0.15, d: 0.3 });
}

const SCENES = [
  { dur: 4.6, build(lang) {
      write(T('Moms who pray.', 'Mamás que oran.')[lang], 540, 470, { size: 124, t0: 0.1 });
      write(T('for their kids and their schools', 'por sus hijos y sus escuelas')[lang], 540, 640, { size: 66, color: BLUE, t0: 1.0 });
      school(540, 1380, 1.2, 0.5);
      [[150, 1560], [930, 1560]].forEach(([x, y], k) => person(x, y, 1.0, 1.6 + k * 0.2, null, MOMS[k]));
      heart(880, 900, 0.8, 2.6);
  } },
  { dur: 5.4, build(lang) {
      caption(T('Small groups of 5 to 10 moms meet\nto pray for their kids and schools.', 'Grupos pequeños de 5 a 10 mamás se\nreúnen a orar por sus hijos y escuelas.'), lang);
      school(540, 820, 0.9, 0.2);
      [[150, 1300], [340, 1400], [540, 1440], [740, 1400], [930, 1300], [540, 1180]].forEach(([x, y], k) => person(x, y, 0.85, 0.8 + k * 0.15, null, MOMS[k]));
      hands(540, 1640, 0.9, 2.2);
  } },
  { dur: 5.6, build(lang) {
      caption(T('Every week, the prayer topics\narrive in a long email.', 'Cada semana, los temas de oración\nllegan en un correo largo.'), lang);
      [[0, 0], [24, 30], [48, 60]].forEach(([dx, dy], k) => envelope(540 + dx, 760 + dy, 460, 300, 0.3 + k * 0.3, k === 2 ? INK : GREY));
      write(T('This week\'s prayer topics', 'Temas de oración de esta semana')[lang], 588, 1040, { size: 50, family: 'Patrick Hand', weight: 400, t0: 1.4, d: 0.4 });
      const q = T(['Lost in the inbox?', 'Read it?', 'How is each mom doing?'], ['¿Perdido en la bandeja?', '¿Lo leyeron?', '¿Cómo está cada mamá?'])[lang];
      [[260, 1300], [820, 1300], [540, 1520]].forEach(([x, y], k) => bubble(x, y, Math.max(300, q[k].length * 22 + 70), 100, q[k], 2.0 + k * 0.6, { size: 46 }));
  } },
  { dur: 4.4, app: { clip: 'crews', st: { en: 3.6, es: 3.8 } }, build(lang) {
      appFrame(T('With PrayCrew, every group\nhas its own crew.', 'Con PrayCrew, cada grupo\ntiene su propio grupo.'), lang);
  } },
  { dur: 6.0, build(lang) {
      caption(T('Leaders post the week\'s\ntopics right in the crew.', 'Las líderes publican los temas\nde la semana en el grupo.'), lang);
      phone(330, 480, 420, 760, 0.1);
      const topics = T(['Our children\'s teachers', 'Safety at school', 'Their friendships', 'Our principal and staff'],
                       ['Los maestros de nuestros hijos', 'Seguridad en la escuela', 'Sus amistades', 'La directora y el personal'])[lang];
      topics.forEach((tp, k) => {
        const y = 610 + k * 160;
        draw(R(360, y, 360, 120, { fill: ['#fdeee0', '#e3eef8', '#e5f3ea', '#f6e9f2'][k], fillStyle: 'solid', strokeWidth: 3 }), 0.6 + k * 0.5, 0.3);
        write(tp, 540, y + 60, { size: 30, family: 'Patrick Hand', weight: 400, t0: 0.8 + k * 0.5, d: 0.3 });
      });
      write(T('No more email.', 'Adiós al correo.')[lang], 540, 1500, { size: 80, color: BLUE, t0: 3.2 });
  } },
  { dur: 5.8, build(lang) {
      caption(T('And as moms share their own\nrequests and pray for each other…', 'Y mientras las mamás comparten sus\npeticiones y oran unas por otras…'), lang);
      const req = T(['My son starts a new school', 'A hard week with my teen', 'Finals on Friday', 'Wisdom as a single mom'],
                    ['Mi hijo entra a otra escuela', 'Una semana difícil con mi adolescente', 'Exámenes el viernes', 'Sabiduría como mamá soltera'])[lang];
      [[330, 560, 'down'], [750, 760, 'down'], [300, 1480, 'up'], [760, 1660, 'up']].forEach(([x, y, tl], k) => {
        const w = Math.max(300, req[k].length * 21 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 96, req[k], 1.0 + k * 0.6, { size: 44, tail: tl });
      });
      [[200, 1150], [430, 1210], [650, 1210], [880, 1150]].forEach(([x, y], k) => person(x, y, 0.9, 0.3 + k * 0.15, null, MOMS[k]));
      heart(540, 980, 0.7, 3.6);
  } },
  { dur: 4.4, app: { clip: 'prayerrequest', st: { en: 5.5, es: 4.5 } }, build(lang) {
      appFrame(T('…they understand what each\nmom is going through.', '…entienden lo que cada\nmamá está viviendo.'), lang);
  } },
  { dur: 5.8, build(lang) {
      caption(T('The praying doesn\'t stop at the group.\nIt keeps going at home, all week.', 'La oración no termina en el grupo.\nSigue en casa, toda la semana.'), lang);
      const hs = [[200, 760], [880, 760], [200, 1420], [880, 1420], [540, 1100]];
      hs.forEach(([x, y], k) => { house(x, y, 1.3, 0.2 + k * 0.2, null, MOMS[k]); });
      [[0, 4], [1, 4], [2, 4], [3, 4], [0, 1], [2, 3]].forEach(([a, b], k) => {
        const tr = group(); heart(0, 0, 0.35, 0, tr, k % 2 ? SAND : RED);
        dashedArc(hs[a][0], hs[a][1] - 60, hs[b][0], hs[b][1] - 60, 0.15, 1.4 + k * 0.4, 0.8, k % 2 ? SAND : RED, null, tr);
      });
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('Every time someone prays,\nshe gets a notification.', 'Cada vez que alguien ora,\nella recibe una notificación.'), lang);
  } },
  { dur: 4.4, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('And the conversation continues,\nwith messages, voice notes and video.', 'Y la conversación continúa,\ncon mensajes, notas de voz y video.'), lang);
  } },
  { dur: 4.4, app: { clip: 'chat', st: { en: 5.77, es: 6.6 } }, build(lang) {
      appFrame(T('Plus a private chat\nfor everything else.', 'Además, un chat privado\npara todo lo demás.'), lang);
  } },
  { dur: 4.6, app: { clip: 'groupmetrics', st: { en: 17.5, es: 17.2 } }, build(lang) {
      appFrame(T('Group leaders see what\ntheir moms need prayer for.', 'Las líderes ven por qué\nnecesitan oración sus mamás.'), lang);
  } },
  { dur: 6.8, build(lang) {
      caption(T('In the PrayCrew portal, set up your\norganization and its divisions.', 'En el portal de PrayCrew, crea tu\norganización y sus divisiones.'), lang);
      node(540, 560, 520, T('Your organization', 'Tu organización')[lang], 0.4, '#dceaf7', 48);
      const c = T(['USA', 'Mexico'], ['EE. UU.', 'México'])[lang];
      [[300, c[0]], [780, c[1]]].forEach(([x, l], k) => {
        draw(L(540, 605, x, 735, { strokeWidth: 4 }), 0.9 + k * 0.2, 0.3);
        node(x, 780, 300, l, 1.1 + k * 0.2, '#fdeee0', 46);
      });
      const st = [[140, 300, 'Texas'], [400, 300, 'California'], [680, 780, 'Nuevo León'], [940, 780, 'Jalisco']];
      st.forEach(([x, px, l], k) => {
        draw(L(px, 825, x, 955, { strokeWidth: 4 }), 1.7 + k * 0.2, 0.3);
        node(x, 1000, 236, l, 1.9 + k * 0.2, '#e5f3ea', 40);
        draw(L(x, 1045, x, 1130, { strokeWidth: 3 }), 2.5 + k * 0.2, 0.2);
        miniGroup(x, 1230, 5 + (k % 3), 2.7 + k * 0.2, null, 70);
      });
      write(T('Country → State → Groups', 'País → Estado → Grupos')[lang], 540, 1540, { size: 70, color: BLUE, t0: 3.8 });
  } },
  { dur: 5.4, app: PORTAL, build(lang) {
      caption(T('Metrics by the divisions\nyou decide.', 'Métricas por las divisiones\nque tú decidas.'), lang);
      laptop(PORTAL.win, 0.05);
  } },
  { dur: 6.4, build(lang) {
      caption(T('Leadership gets a real pulse\nof every region.', 'El liderazgo conoce el pulso\nreal de cada región.'), lang);
      const rows = T([['Texas', '48 groups', 'Anxiety at school'], ['California', '36 groups', 'Friendships'], ['Nuevo León', '22 groups', 'Family']],
                     [['Texas', '48 grupos', 'Ansiedad escolar'], ['California', '36 grupos', 'Amistades'], ['Nuevo León', '22 grupos', 'Familia']])[lang];
      const lbl = T('Top need:', 'Mayor necesidad:')[lang];
      rows.forEach(([s, g, n], k) => {
        const y = 560 + k * 330;
        draw(P(roundRect(80, y, 920, 280, 30), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4.5 }), 0.3 + k * 0.4, 0.4);
        write(s, 130, y + 80, { size: 64, anchor: 'start', color: [BLUE, GREEN, SAND][k], t0: 0.6 + k * 0.4, d: 0.4 });
        write(g, 950, y + 80, { size: 50, anchor: 'end', family: 'Patrick Hand', weight: 400, t0: 0.8 + k * 0.4, d: 0.3 });
        write(`${lbl} ${n}`, 130, y + 190, { size: 50, anchor: 'start', family: 'Patrick Hand', weight: 400, color: RED, t0: 1.0 + k * 0.4, d: 0.4 });
      });
      write(T('Serve every group better.', 'Sirve mejor a cada grupo.')[lang], 540, 1620, { size: 76, color: BLUE, t0: 3.2 });
  } },
  { dur: 6.2, build(lang) {
      school(540, 820, 0.9, 0.1);
      [[160, 1100], [920, 1100], [300, 640], [780, 640]].forEach(([x, y], k) => heart(x, y, 0.55, 0.9 + k * 0.2, null, k % 2 ? SAND : RED));
      write(T('Every mom praying.\nEvery child covered.', 'Cada mamá orando.\nCada hijo cubierto.')[lang], 540, 1260, { size: 96, t0: 1.6, d: 1.6 });
      write(T('PrayCrew for moms who pray', 'PrayCrew para mamás que oran')[lang], 540, 1540, { size: 82, color: BLUE, t0: 3.4 });
      draw(P('M220 1605 C430 1625 650 1595 860 1610', { stroke: BLUE, strokeWidth: 5 }), 4.3, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
