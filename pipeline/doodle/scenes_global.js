// "A global ministry with PrayCrew" — doodle story with app inserts, web form and dashboard.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const SITE = { crop: [40, 708, 1000, 744], win: { x: 100, y: 660, w: 880, h: 654 }, radius: 10 };
const PORTAL = { image: 'media/portal.png', zoom: [[0, 0, 1657, 936], [820, 500, 837, 436]], win: { x: 100, y: 700, w: 880, h: 458 }, radius: 10 };
const REGIONS = T(['Latin America', 'Africa', 'Asia', 'Europe', 'North America'], ['Latinoamérica', 'África', 'Asia', 'Europa', 'Norteamérica']);
const RPOS = [[190, 900], [540, 900], [890, 900], [360, 1330], [720, 1330]];

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function regionCards(lang, t0, pos = RPOS, scale = 1) {
  pos.forEach(([x, y], k) => {
    draw(P(roundRect(x - 160 * scale, y - 170 * scale, 320 * scale, 340 * scale, 30), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4 }), t0 + k * 0.2, 0.4);
    miniGroup(x, y - 30 * scale, 4 + (k % 3), t0 + 0.3 + k * 0.2, null, 70 * scale);
    write(REGIONS[lang][k], x, y + 120 * scale, { size: 44 * scale, family: 'Patrick Hand', weight: 400, t0: t0 + 0.5 + k * 0.2, d: 0.4 });
  });
}
function screenDoodle(x, y, w, h, kind, t0) {
  draw(P(roundRect(x, y, w, h, 14), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4 }), t0, 0.35);
  if (kind === 'play') draw(P(`M${x + w / 2 - 18} ${y + h / 2 - 24} L${x + w / 2 + 24} ${y + h / 2} L${x + w / 2 - 18} ${y + h / 2 + 24} Z`, { fill: RED, fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.3, 0.2);
  else [0, 1, 2].forEach(i => draw(L(x + 18, y + 24 + i * 22, x + w - 18 - i * 20, y + 24 + i * 22, { strokeWidth: 3 }), t0 + 0.3 + i * 0.05, 0.12));
}

const SCENES = [
  { dur: 4.2, build(lang) {
      write(T('One ministry.\nA global audience.', 'Un ministerio.\nUna audiencia global.')[lang], 540, 470, { size: 116, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 665, { size: 84, color: BLUE, t0: 1.0 });
      globe(540, 1250, 330, 0.4);
      [[420, 1110], [480, 1300], [700, 1150], [760, 1420], [620, 1000], [880, 1250], [350, 1200]].forEach(([x, y], k) => pin(x, y, 1.6 + k * 0.15, [RED, BLUE, SAND][k % 3]));
  } },
  { dur: 5.2, build(lang) {
      caption(T('Every day, the ministry reaches\npeople in every country online.', 'Cada día, el ministerio alcanza\npersonas en todos los países.'), lang);
      globe(540, 1080, 260, 0.1);
      const sc = [[90, 560, 'play'], [780, 560, 'text'], [60, 1420, 'text'], [800, 1420, 'play'], [430, 1520, 'play']];
      sc.forEach(([x, y, k], i) => { screenDoodle(x, y, 210, 140, k, 0.8 + i * 0.25); dashedArc(540, 1080, x + 105, y + 70, (i % 2 ? 0.15 : -0.15), 0.9 + i * 0.25, 0.6, BLUE); });
      [[170, 1000], [910, 1050]].forEach(([x, y], k) => person(x, y, 0.75, 2.2 + k * 0.3, null, SHIRTS[k + 2]));
  } },
  { dur: 6.0, build(lang) {
      caption(T('With PrayCrew, prayer warriors are\norganized by region or country.', 'Con PrayCrew, los guerreros de oración\nse organizan por región o país.'), lang);
      globe(540, 560, 130, 0.0);
      RPOS.forEach(([x, y], k) => dashedArc(540, 650, x, y - 170, (k - 2) * 0.05, 0.6 + k * 0.15, 0.5, SAND));
      regionCards(lang, 0.8);
      write(T('Prayer warriors', 'Guerreros de oración')[lang], 540, 1640, { size: 70, color: SAND, t0: 2.6 });
      hands(540, 1760, 0.8, 3.0);
  } },
  { dur: 4.4, app: { clip: 'crews', st: { en: 7.3, es: 7.46 } }, build(lang) {
      appFrame(T('Each region is a crew, and\nrequests are shared among its warriors.', 'Cada región es un grupo, y las\npeticiones se reparten entre sus guerreros.'), lang);
  } },
  { dur: 4.8, app: Object.assign({ clip: 'landing', st: { en: 37.0, es: 33.5 } }, SITE), build(lang) {
      caption(T('The audience submits requests\nthrough the ministry\'s web form.', 'La audiencia envía sus peticiones\nen el formulario web del ministerio.'), lang);
      laptop(SITE.win, 0.05);
      write(T('No app. No account.', 'Sin app. Sin cuenta.')[lang], 540, 1560, { size: 80, color: RED, t0: 1.2 });
  } },
  { dur: 5.6, build(lang) {
      caption(T('Requests arrive from everywhere,\nand go to the right region.', 'Las peticiones llegan de todas partes\ny van a la región correcta.'), lang);
      const scaled = [[190, 1200], [540, 1200], [890, 1200], [360, 1570], [720, 1570]];
      [[150, 620], [380, 560], [700, 560], [930, 620], [540, 760]].forEach(([x, y], k) => {
        person(x, y, 0.55, 0.2 + k * 0.12, null, SHIRTS[(k + 5) % 10]);
        phone(x + 36, y + 10, 50, 86, 0.4 + k * 0.12);
      });
      const req = T(['Healing', 'My family', 'Anxiety', 'Finances', 'Salvation'], ['Sanidad', 'Mi familia', 'Ansiedad', 'Finanzas', 'Salvación'])[lang];
      regionCards(lang, 1.2, scaled, 0.8);
      scaled.forEach(([x, y], k) => {
        const tr = group(); bubble(0, 0, Math.max(170, req[k].length * 19 + 50), 70, req[k], 0, { size: 36, parent: tr, fill: '#dceaf7' });
        dashedArc([150, 380, 700, 930, 540][k], 760 + (k === 4 ? 140 : 0), x, y - 140, 0.1, 2.0 + k * 0.35, 0.9, BLUE, null, tr);
      });
  } },
  { dur: 4.2, app: { clip: 'followup', st: { en: 6.03, es: 6.35 } }, build(lang) {
      appFrame(T('A warrior in their region\nprays for them…', 'Un guerrero de su región\nora por ellos…'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('…and follows up personally,\nwalking in faith with them.', '…y les da seguimiento personal,\ncaminando en fe con ellos.'), lang);
  } },
  { dur: 5.4, build(lang) {
      caption(T('Not an automated reply.\nIntentional prayer.', 'No una respuesta automática.\nOración intencional.'), lang);
      person(540, 1450, 1.6, 0.2, null, SHIRTS[7]);
      phone(700, 980, 200, 340, 0.8); bell(800, 1100, 1.0, 1.3);
      const msgs = T(['Someone prayed for you', "We're walking with you", 'New voice message'], ['Alguien oró por ti', 'Caminamos contigo', 'Nuevo mensaje de voz'])[lang];
      [[300, 640], [780, 690], [320, 900]].forEach(([x, y], k) => {
        const w = Math.min(520, msgs[k].length * 20 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 96, msgs[k], 1.5 + k * 0.6, { size: 42, fill: '#dceaf7' });
      });
      heart(330, 1150, 0.9, 3.6);
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('Every person gets a unique\nexperience. They are not alone.', 'Cada persona vive una experiencia\núnica. No están solos.'), lang);
  } },
  { dur: 5.6, app: PORTAL, build(lang) {
      caption(T('The ministry sees it all\nin one dashboard.', 'El ministerio lo ve todo\nen un solo tablero.'), lang);
      laptop(PORTAL.win, 0.05);
      write(T('Prayers · People · Topics', 'Oraciones · Personas · Temas')[lang], 540, 1500, { size: 70, color: BLUE, t0: 1.2 });
  } },
  { dur: 6.0, build(lang) {
      caption(T('Real numbers on prayer\nand the people it reaches.', 'Números reales sobre la oración\ny las personas que alcanza.'), lang);
      const cards = [
        [290, 720, 4588, T('prayers offered', 'oraciones ofrecidas'), RED],
        [790, 720, 234, T('prayer requests', 'peticiones de oración'), SAND],
        [290, 1170, 52, T('people prayed for', 'personas con oración'), BLUE],
        [790, 1170, 92, T('follow-up rate', 'con seguimiento'), GREEN],
      ];
      cards.forEach(([x, y, n, lab, c], k) => {
        draw(P(roundRect(x - 220, y - 180, 440, 360, 34), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4.5 }), 0.4 + k * 0.25, 0.4);
        counter(n, x, y - 30, { size: 150, color: c, t0: 0.8 + k * 0.25, d: 1.6, suffix: k === 3 ? '%' : '' });
        write(lab[lang], x, y + 110, { size: 50, family: 'Patrick Hand', weight: 400, t0: 1.0 + k * 0.25, d: 0.5 });
      });
      write(T('Example from a PrayCrew dashboard', 'Ejemplo de un tablero de PrayCrew')[lang], 540, 1520, { size: 46, color: '#7a8790', t0: 3.0, family: 'Patrick Hand', weight: 400 });
  } },
  { dur: 6.4, build(lang) {
      caption(T('Topics by region show what\nthe community is going through.', 'Los temas por región muestran\nlo que vive la comunidad.'), lang);
      globe(540, 860, 300, 0.1);
      const topics = T(['Family', 'Health', 'Faith', 'Anxiety', 'Finances'], ['Familia', 'Salud', 'Fe', 'Ansiedad', 'Finanzas'])[lang];
      [[200, 640], [880, 620], [930, 1060], [150, 1100], [540, 1280]].forEach(([x, y], k) => {
        const s = `${REGIONS[lang][k]}: ${topics[k]}`, w = Math.min(500, s.length * 19 + 60);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 90, s, 1.0 + k * 0.4, { size: 38, fill: ['#dceaf7', '#f6e3cf', '#dff0e6', '#eee6f7', '#fbe3e3'][k] });
      });
      write(T('So they can create content, resources\nand care where it matters most.', 'Así crean contenido, recursos\ny cuidado donde más se necesita.')[lang], 540, 1600, { size: 70, color: BLUE, t0: 3.4 });
  } },
  { dur: 5.8, build(lang) {
      globe(540, 700, 230, 0.1); heart(540, 700, 1.2, 0.9);
      write(T('Intentional prayer, at global scale.\nAn audience you truly understand.',
              'Oración intencional a escala global.\nUna audiencia que de verdad conoces.')[lang], 540, 1150, { size: 82, t0: 1.4, d: 1.6 });
      write(T('PrayCrew for global ministries', 'PrayCrew para ministerios globales')[lang], 540, 1420, { size: 84, color: BLUE, t0: 3.3 });
      draw(P('M200 1490 C420 1510 640 1480 880 1495', { stroke: BLUE, strokeWidth: 5 }), 4.1, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
