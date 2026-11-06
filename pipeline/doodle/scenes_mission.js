// "A missions organization with PrayCrew" — doodle story with app inserts and the leadership portal.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const PORTAL = { image: 'media/portal.png', zoom: [[0, 0, 1657, 936], [0, 60, 1100, 621]], win: { x: 100, y: 700, w: 880, h: 496 }, radius: 10 };
const PLACES = T(['Guatemala', 'Kenya', 'Philippines'], ['Guatemala', 'Kenia', 'Filipinas']);

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function countryCards(lang, t0, y = 1560) {
  return [190, 540, 890].map((x, k) => {
    draw(P(roundRect(x - 160, y - 190, 320, 380, 30), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4 }), t0 + k * 0.3, 0.4);
    miniGroup(x, y - 30, 5 + k, t0 + 0.3 + k * 0.3, null, 78);
    write(PLACES[lang][k], x, y + 140, { size: 52, family: 'Patrick Hand', weight: 400, t0: t0 + 0.6 + k * 0.3, d: 0.4 });
    return [x, y - 190];
  });
}

const SCENES = [
  { dur: 4.2, build(lang) {
      write(T('One mission.\nMany nations.', 'Una misión.\nMuchas naciones.')[lang], 540, 470, { size: 120, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 665, { size: 84, color: BLUE, t0: 1.0 });
      globe(540, 1250, 330, 0.4);
      [[440, 1200], [700, 1150], [760, 1420]].forEach(([x, y], k) => pin(x, y, 1.8 + k * 0.3));
  } },
  { dur: 5.2, build(lang) {
      caption(T('Missionaries serve small groups\naround the world.', 'Misioneros sirven a grupos\npequeños alrededor del mundo.'), lang);
      globe(540, 830, 330, 0.0);
      const pins = [[440, 780], [700, 730], [760, 1000]];
      pins.forEach(([x, y], k) => pin(x, y, 0.8 + k * 0.25));
      const cards = countryCards(lang, 1.6);
      cards.forEach(([x, y], k) => dashedArc(pins[k][0], pins[k][1], x, y, 0.08 * (k - 1), 1.8 + k * 0.3, 0.6, RED));
  } },
  { dur: 5.4, build(lang) {
      caption(T('Each group shares its prayer\nrequests in its own crew.', 'Cada grupo comparte sus\npeticiones en su propio grupo.'), lang);
      table10(540, 1180, 0.0, 0.03, true);
      write(PLACES[lang][1], 540, 1180, { size: 60, family: 'Patrick Hand', weight: 400, t0: 0.8, color: '#5b4636' });
      const req = T(['Rain for our crops', "My daughter's health", 'Our new church', 'Clean water'],
                    ['Lluvia para la cosecha', 'La salud de mi hija', 'Nuestra nueva iglesia', 'Agua limpia'])[lang];
      [[540, 520, 'down'], [800, 1640, 'up'], [280, 1640, 'up'], [830, 760, 'down']].forEach(([x, y, tl], k) => {
        const w = Math.max(260, req[k].length * 21 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 94, req[k], 1.0 + k * 0.6, { size: 44, tail: tl });
      });
  } },
  { dur: 4.4, app: { clip: 'prayerrequest', st: { en: 5.5, es: 4.5 } }, build(lang) {
      appFrame(T("They pray for one another,\nand see who's praying.", 'Oran unos por otros\ny ven quién está orando.'), lang);
  } },
  { dur: 5.8, build(lang) {
      caption(T('Back home, the organization assigns\nprayer warriors to every group.', 'Desde casa, la organización asigna\nguerreros de oración a cada grupo.'), lang);
      office(540, 820, 0.85, 0.2);
      [[230, 1010], [380, 1040], [700, 1040], [850, 1010]].forEach(([x, y], k) => person(x, y, 0.7, 0.8 + k * 0.15, null, SHIRTS[k + 4]));
      hands(540, 1090, 0.7, 1.5);
      const cards = countryCards(lang, 1.8);
      cards.forEach(([x, y], k) => {
        const tr = group(); heart(0, 0, 0.35, 0, tr);
        dashedArc(540, 1140, x, y, 0.1 * (k - 1), 2.8 + k * 0.35, 0.9, SAND, null, tr);
      });
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('Every prayer reaches the field\nas a notification.', 'Cada oración llega al campo\ncomo una notificación.'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 29.5, es: 26.0 } }, build(lang) {
      appFrame(T('Prayer warriors encourage them with\nmessages, voice notes and video.', 'Los guerreros los animan con\nmensajes, notas de voz y video.'), lang);
  } },
  { dur: 5.0, build(lang) {
      caption(T('Missionaries and their people\nare never alone in prayer.', 'Los misioneros y su gente nunca\nestán solos en oración.'), lang);
      person(540, 1250, 1.7, 0.2, null, SHIRTS[2]);
      phone(700, 1120, 170, 290, 0.8);
      [[150, 650], [540, 560], [930, 650], [100, 1050], [980, 1000], [150, 1450], [960, 1450]].forEach(([x, y], k) => {
        const tr = group(); heart(0, 0, 0.45, 0, tr, k % 2 ? RED : SAND);
        dashedArc(x, y, 560 + (k % 3) * 40, 1000, (k % 2 ? 0.15 : -0.15), 1.0 + k * 0.3, 0.9, k % 2 ? RED : SAND, null, tr);
      });
      heart(540, 1660, 0.8, 3.6);
  } },
  { dur: 4.6, app: { clip: 'groupmetrics', st: { en: 17.5, es: 17.2 } }, build(lang) {
      appFrame(T('Missionaries see what their\ncommunity is praying about.', 'Los misioneros ven por qué\nestá orando su comunidad.'), lang);
  } },
  { dur: 5.6, app: PORTAL, build(lang) {
      caption(T('Leadership sees every group\nin one portal.', 'El liderazgo ve todos los\ngrupos en un solo portal.'), lang);
      laptop(PORTAL.win, 0.05);
      globe(160, 1560, 90, 1.0); office(920, 1600, 0.4, 1.2);
  } },
  { dur: 6.2, build(lang) {
      caption(T('See the impact of prayer\nin real numbers.', 'Ve el impacto de la oración\nen números reales.'), lang);
      const cards = [
        [290, 700, 11, T('prayer groups', 'grupos de oración'), BLUE],
        [790, 700, 55, T('active members', 'miembros activos'), GREEN],
        [290, 1150, 234, T('prayer requests', 'peticiones de oración'), SAND],
        [790, 1150, 4588, T('prayers offered', 'oraciones ofrecidas'), RED],
      ];
      cards.forEach(([x, y, n, lab, c], k) => {
        draw(P(roundRect(x - 220, y - 180, 440, 360, 34), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4.5 }), 0.4 + k * 0.25, 0.4);
        counter(n, x, y - 30, { size: 150, color: c, t0: 0.8 + k * 0.25, d: 1.6 });
        write(lab[lang], x, y + 110, { size: 50, family: 'Patrick Hand', weight: 400, t0: 1.0 + k * 0.25, d: 0.5 });
      });
      write(T('92% of requests got a follow-up', '92% de las peticiones recibió seguimiento')[lang], 540, 1520, { size: 64, color: GREEN, t0: 3.2 });
      write(T('52 people received prayer', '52 personas recibieron oración')[lang], 540, 1640, { size: 64, color: BLUE, t0: 3.9 });
  } },
  { dur: 5.8, build(lang) {
      caption(T('Show donors and partners the\nimpact. Raise more support.', 'Muestra el impacto a donantes\ny aliados. Recauda más apoyo.'), lang);
      draw(R(330, 560, 640, 460, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 5 }), 0.2, 0.5);
      counter(4588, 650, 690, { size: 120, color: RED, t0: 0.6, d: 1.4 });
      write(T('prayers offered', 'oraciones ofrecidas')[lang], 650, 790, { size: 50, family: 'Patrick Hand', weight: 400, t0: 1.0, d: 0.4 });
      draw(P('M400 960 L520 910 L620 930 L760 860 L900 800', { stroke: GREEN, strokeWidth: 7 }), 1.4, 0.6);
      draw(P('M870 790 L905 798 L893 832', { stroke: GREEN, strokeWidth: 7 }), 1.9, 0.2);
      draw(L(650, 1020, 650, 1120, { strokeWidth: 5 }), 0.5, 0.2);
      person(190, 1150, 1.1, 0.6, null, SHIRTS[0]);
      [[400, 1500], [640, 1530], [880, 1500]].forEach(([x, y], k) => person(x, y, 0.9, 1.6 + k * 0.2, null, SHIRTS[k + 5]));
      [[400, 1290], [640, 1320], [880, 1290]].forEach(([x, y], k) => heart(x, y, 0.45, 2.6 + k * 0.3));
      write(T('Donors & partners', 'Donantes y aliados')[lang], 640, 1760, { size: 60, color: SAND, t0: 3.0 });
  } },
  { dur: 5.8, build(lang) {
      globe(540, 700, 230, 0.1);
      heart(540, 700, 1.2, 0.9);
      write(T('Every missionary covered in prayer.\nEvery community better understood.',
              'Cada misionero cubierto en oración.\nCada comunidad mejor entendida.')[lang], 540, 1150, { size: 84, t0: 1.4, d: 1.6 });
      write(T('PrayCrew for missions', 'PrayCrew para misiones')[lang], 540, 1420, { size: 92, color: BLUE, t0: 3.3 });
      draw(P('M270 1490 C450 1510 630 1480 810 1495', { stroke: BLUE, strokeWidth: 5 }), 4.1, 0.4);
  } },
];
const ROUND = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => -Math.PI / 2 + i * 2 * Math.PI / 10);
function table10(cx, cy, t0, step = 0.12, cups = true) {
  tableTop(cx, cy, t0, null, false);
  return ROUND.map((a, i) => personTop(cx, cy, a, i, t0 + 0.5 + i * step, null, false));
}
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
