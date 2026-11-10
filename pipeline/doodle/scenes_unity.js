// "Churches united in prayer for the Great Commission" — a church-network story with app inserts.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const GREY = '#8f9aa1';
const NAMES = T(['Grace', 'Hope', 'Calvary', 'New Life', 'Cornerstone'], ['Gracia', 'Esperanza', 'Calvario', 'Vida Nueva', 'Roca Firme']);

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function church(x, y, s, t0) {
  const g = group();
  draw(R(x - 170 * s, y - 120 * s, 340 * s, 260 * s, { fill: '#f3e6d3', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.5, g);
  draw(P(`M${x - 200 * s} ${y - 115 * s} L${x} ${y - 260 * s} L${x + 200 * s} ${y - 115 * s}`, { strokeWidth: 5 }), t0 + 0.3, 0.3, g);
  draw(R(x - 50 * s, y - 380 * s, 100 * s, 150 * s, { fill: '#f3e6d3', fillStyle: 'solid', strokeWidth: 5 }), t0 + 0.4, 0.3, g);
  draw(P(`M${x - 65 * s} ${y - 375 * s} L${x} ${y - 440 * s} L${x + 65 * s} ${y - 375 * s}`, { strokeWidth: 5 }), t0 + 0.5, 0.2, g);
  draw(P(`M${x} ${y - 540 * s} L${x} ${y - 450 * s} M${x - 30 * s} ${y - 510 * s} L${x + 30 * s} ${y - 510 * s}`, { stroke: SAND, strokeWidth: 7 }), t0 + 0.6, 0.25, g);
  draw(P(`M${x - 45 * s} ${y + 140 * s} L${x - 45 * s} ${y + 30 * s} Q${x} ${y - 20 * s} ${x + 45 * s} ${y + 30 * s} L${x + 45 * s} ${y + 140 * s}`,
    { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.7, 0.25, g);
  return g;
}
function envelope(x, y, w, h, t0, color = INK) {
  draw(R(x - w / 2, y - h / 2, w, h, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 5, stroke: color }), t0, 0.35);
  draw(P(`M${x - w / 2} ${y - h / 2} L${x} ${y + h * 0.1} L${x + w / 2} ${y - h / 2}`, { strokeWidth: 5, stroke: color }), t0 + 0.25, 0.3);
}
// Five churches in an arc around a center point.
const RING = [[150, 1150], [330, 1480], [750, 1480], [930, 1150], [540, 1600]];
function ring(lang, t0, s = 0.42, labels = true) {
  RING.forEach(([x, y], k) => {
    church(x, y, s, t0 + k * 0.2);
    if (labels) write(NAMES[lang][k], x, y + 110, { size: 42, family: 'Patrick Hand', weight: 400, t0: t0 + 0.6 + k * 0.2, d: 0.3 });
  });
}

const SCENES = [
  { dur: 4.6, build(lang) {
      write(T('Many churches.\nOne mission.', 'Muchas iglesias.\nUna misión.')[lang], 540, 470, { size: 120, t0: 0.1 });
      write(T('United in prayer for the Great Commission', 'Unidas en oración por la Gran Comisión')[lang], 540, 690, { size: 58, color: BLUE, t0: 1.0 });
      globe(540, 1050, 230, 0.6);
      ring(lang, 1.2, 0.36, false);
  } },
  { dur: 5.4, build(lang) {
      caption(T('A ministry network unites churches\nto pray for the nations.', 'Una red ministerial une iglesias\npara orar por las naciones.'), lang);
      office(540, 820, 0.8, 0.2);
      ring(lang, 0.8);
      RING.forEach(([x, y], k) => dashedArc(540, 960, x, y - 230, 0.12 * (k % 2 ? 1 : -1), 2.2 + k * 0.2, 0.6, SAND));
  } },
  { dur: 5.6, build(lang) {
      caption(T('Their best tool so far?\nA monthly email.', '¿Su mejor herramienta hasta hoy?\nUn correo mensual.'), lang);
      envelope(540, 760, 420, 280, 0.4);
      write(T('Prayer topics: November', 'Temas de oración: noviembre')[lang], 540, 960, { size: 52, family: 'Patrick Hand', weight: 400, t0: 1.0, d: 0.4 });
      RING.forEach(([x, y], k) => {
        const tr = group(); envelope(0, 0, 70, 46, 0, GREY);
        dashedArc(540, 1000, x, y - 230, 0.1 * (k % 2 ? 1 : -1), 1.6 + k * 0.15, 0.6, GREY);
      });
      ring(lang, 0.2, 0.42);
  } },
  { dur: 5.6, build(lang) {
      caption(T('Sent… but did anyone pray?', 'Enviado… ¿pero alguien oró?'), lang);
      envelope(540, 700, 420, 280, 0.1, GREY);
      const q = T(['Opened?', 'Prayed?', 'What did God\nshow them?'], ['¿Lo abrieron?', '¿Oraron?', '¿Qué les mostró\nDios?'])[lang];
      [[230, 1050], [850, 1050], [540, 1300]].forEach(([x, y], k) => {
        const w = k === 2 ? 440 : 320;
        bubble(x, y, w, k === 2 ? 150 : 100, q[k], 0.8 + k * 0.7, { size: 50 });
      });
      write(T('One-way. No conversation.\nNo way to know.', 'En una sola dirección. Sin conversación.\nSin forma de saberlo.')[lang], 540, 1620, { size: 64, color: RED, t0: 3.0, d: 1.2 });
  } },
  { dur: 4.4, app: { clip: 'addmembers', st: { en: 5.2, es: 4.0 } }, build(lang) {
      appFrame(T('With PrayCrew, every church\nleader joins one crew.', 'Con PrayCrew, cada líder\nse une a un solo grupo.'), lang);
  } },
  { dur: 6.2, build(lang) {
      caption(T('The network posts each\nprayer topic in the crew.', 'La red publica cada tema\nde oración en el grupo.'), lang);
      phone(330, 480, 420, 760, 0.1);
      const topics = T(['Laborers for the harvest', 'Unreached people groups', 'Missionaries on the field', 'Open doors for the Gospel'],
                       ['Obreros para la cosecha', 'Pueblos no alcanzados', 'Misioneros en el campo', 'Puertas abiertas al Evangelio'])[lang];
      const refs = ['Matthew 9:38', 'Revelation 7:9', 'Romans 10:15', 'Colossians 4:3'];
      const refsEs = ['Mateo 9:38', 'Apocalipsis 7:9', 'Romanos 10:15', 'Colosenses 4:3'];
      topics.forEach((tp, k) => {
        const y = 600 + k * 160;
        draw(R(360, y, 360, 130, { fill: ['#fdeee0', '#e3eef8', '#e5f3ea', '#f6e9f2'][k], fillStyle: 'solid', strokeWidth: 3 }), 0.6 + k * 0.5, 0.3);
        write(tp, 540, y + 48, { size: 34, family: 'Patrick Hand', weight: 400, t0: 0.8 + k * 0.5, d: 0.3 });
        write((lang === 'en' ? refs : refsEs)[k], 540, y + 95, { size: 28, family: 'Patrick Hand', weight: 400, color: BLUE, t0: 0.9 + k * 0.5, d: 0.3 });
      });
      office(170, 1500, 0.45, 0.4);
      hands(880, 1450, 1.0, 2.8);
  } },
  { dur: 4.4, app: { clip: 'followup', st: { en: 6.03, es: 6.35 } }, build(lang) {
      appFrame(T('Every leader prays,\nand everyone sees it.', 'Cada líder ora,\ny todos lo ven.'), lang);
  } },
  { dur: 6.4, build(lang) {
      caption(T('And they share what God\nput on their hearts.', 'Y comparten lo que Dios\npuso en su corazón.'), lang);
      const msgs = T(['God put North Africa on my heart', 'Our church will fast this Friday', '"Here am I. Send me." Isaiah 6:8', 'Two of our youth feel called to go!'],
                     ['Dios puso el norte de África en mi corazón', 'Nuestra iglesia ayunará este viernes', '"Heme aquí, envíame a mí." Isaías 6:8', '¡Dos de nuestros jóvenes sienten el llamado!'])[lang];
      [[200, 1500], [420, 1560], [660, 1560], [880, 1500]].forEach(([x, y], k) => person(x, y, 0.85, 0.2 + k * 0.15, null, SHIRTS[(k + 1) % 10]));
      [560, 760, 960, 1160].forEach((y, k) => {
        const w = Math.min(900, msgs[k].length * 21 + 90);
        bubble(540 + (k % 2 ? 60 : -60), y, w, 110, msgs[k], 1.0 + k * 0.8, { size: 44, fill: ['#ffffff', '#dceaf7', '#fff6dd', '#dff0e6'][k] });
      });
  } },
  { dur: 4.4, app: { clip: 'chat', st: { en: 5.77, es: 6.6 } }, build(lang) {
      appFrame(T('The conversation keeps going,\nwell past the email.', 'La conversación sigue,\nmucho más allá del correo.'), lang);
  } },
  { dur: 6.0, build(lang) {
      caption(T('See how engaged each\nchurch is in prayer.', 'Ve qué tan involucrada está\ncada iglesia en la oración.'), lang);
      const vals = [0.95, 0.8, 0.7, 0.55, 0.35];
      NAMES[lang].forEach((n, k) => {
        const y = 560 + k * 200, w = vals[k] * 520;
        church(130, y + 70, 0.2, 0.2 + k * 0.15);
        write(n, 330, y + 45, { size: 48, family: 'Patrick Hand', weight: 400, anchor: 'start', t0: 0.4 + k * 0.15, d: 0.3 });
        draw(R(330, y + 80, w, 60, { fill: [GREEN, GREEN, BLUE, SAND, RED][k], fillStyle: 'hachure', hachureGap: 9, strokeWidth: 3.5 }), 0.8 + k * 0.2, 0.5);
      });
      write(T('…and who might need encouragement.', '…y quién podría necesitar ánimo.')[lang], 540, 1620, { size: 62, color: BLUE, t0: 3.2 });
  } },
  { dur: 4.6, app: { clip: 'groupmetrics', st: { en: 7.88, es: 7.87 } }, build(lang) {
      appFrame(T('Who is praying, how often,\nand for what.', 'Quién ora, con qué frecuencia\ny por qué.'), lang);
  } },
  { dur: 6.2, build(lang) {
      caption(T('Measure how united\nyour network is in prayer.', 'Mide qué tan unida está\ntu red en oración.'), lang);
      const cards = [
        [290, 700, 37, T('churches', 'iglesias'), BLUE],
        [790, 700, 112, T('leaders praying', 'líderes orando'), GREEN],
        [290, 1150, 1284, T('prayers offered', 'oraciones ofrecidas'), RED],
        [790, 1150, 86, T('engaged this month', 'activas este mes'), SAND],
      ];
      cards.forEach(([x, y, n, lab, c], k) => {
        draw(P(roundRect(x - 220, y - 180, 440, 360, 34), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4.5 }), 0.4 + k * 0.25, 0.4);
        counter(n, x, y - 30, { size: 150, color: c, t0: 0.8 + k * 0.25, d: 1.6, suffix: k === 3 ? '%' : '' });
        write(lab[lang], x, y + 110, { size: 50, family: 'Patrick Hand', weight: 400, t0: 1.0 + k * 0.25, d: 0.5 });
      });
      write(T('Not just informed. United.', 'No solo informadas. Unidas.')[lang], 540, 1600, { size: 76, color: BLUE, t0: 3.4 });
  } },
  { dur: 6.2, build(lang) {
      globe(540, 760, 260, 0.1);
      RING.forEach(([x, y], k) => {
        const [cx, cy] = [[220, 560], [860, 560], [180, 960], [900, 960], [540, 1110]][k];
        heart(cx, cy, 0.5, 0.8 + k * 0.2, null, k % 2 ? SAND : RED);
      });
      write(T('From a monthly email…\nto a movement of prayer.', 'De un correo mensual…\na un movimiento de oración.')[lang], 540, 1300, { size: 86, t0: 1.6, d: 1.6 });
      write(T('PrayCrew for church networks', 'PrayCrew para redes de iglesias')[lang], 540, 1560, { size: 80, color: BLUE, t0: 3.4 });
      draw(P('M200 1625 C420 1645 660 1615 880 1630', { stroke: BLUE, strokeWidth: 5 }), 4.3, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
