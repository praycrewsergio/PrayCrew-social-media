// "A family united in prayer" — couple, then the extended family across cities. Doodle story with app inserts.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function couple(x, y, s, t0, k = 0) {
  person(x - 52 * s, y, s, t0, null, SHIRTS[(2 * k) % 10]);
  person(x + 52 * s, y, s, t0 + 0.15, null, SHIRTS[(2 * k + 3) % 10]);
}
function tree(t0, y0 = 600, step = 0.2) {
  couple(540, y0, 0.95, t0, 7);
  draw(L(540, y0 + 110, 540, y0 + 190, { strokeWidth: 4 }), t0 + 0.5, 0.2);
  draw(L(120, y0 + 190, 960, y0 + 190, { strokeWidth: 4 }), t0 + 0.6, 0.4);
  const xs = [120, 330, 540, 750, 960];
  xs.forEach((x, k) => {
    draw(L(x, y0 + 190, x, y0 + 250, { strokeWidth: 4 }), t0 + 0.9 + k * step, 0.15);
    couple(x, y0 + 330, 0.62, t0 + 1.0 + k * step, k);
  });
  return xs.map(x => [x, y0 + 330]);
}

const SCENES = [
  { dur: 4.4, build(lang) {
      write(T('A family that\nprays together.', 'Una familia que\nora unida.')[lang], 540, 470, { size: 116, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 665, { size: 84, color: BLUE, t0: 1.0 });
      house(540, 1300, 3.2, 0.4, null, SHIRTS[5]);
      heart(540, 960, 1.0, 1.8);
  } },
  { dur: 5.4, build(lang) {
      caption(T('It starts at home,\nhusband and wife.', 'Empieza en casa,\nesposo y esposa.'), lang);
      couple(540, 1200, 1.5, 0.2, 0);
      heart(540, 960, 0.8, 1.0);
      const req = T(['Wisdom at work', 'Our kids', 'Our finances', 'Patience with each other'], ['Sabiduría en el trabajo', 'Nuestros hijos', 'Nuestras finanzas', 'Paciencia entre nosotros'])[lang];
      [[270, 560, 'down'], [800, 620, 'down'], [270, 1560, 'up'], [760, 1620, 'up']].forEach(([x, y, tl], k) => {
        const w = Math.max(280, req[k].length * 21 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 94, req[k], 1.4 + k * 0.5, { size: 44, tail: tl });
      });
  } },
  { dur: 4.4, app: { clip: 'crews', st: { en: 3.6, es: 3.8 } }, build(lang) {
      appFrame(T('They create a crew\njust for the two of them.', 'Crean un grupo\nsolo para los dos.'), lang);
  } },
  { dur: 4.4, app: { clip: 'prayerrequest', st: { en: 5.5, es: 4.5 } }, build(lang) {
      appFrame(T('They share what is\non their heart…', 'Comparten lo que\nhay en su corazón…'), lang);
  } },
  { dur: 5.4, build(lang) {
      caption(T('…and pray for each other,\neven on the busiest days.', '…y oran el uno por el otro,\naun en los días más ocupados.'), lang);
      office(260, 900, 0.7, 0.2);
      person(260, 1180, 1.0, 0.6, null, SHIRTS[0]);
      house(820, 960, 1.6, 0.4, null, SHIRTS[5]);
      person(820, 1180, 1.0, 0.8, null, SHIRTS[3]);
      [[300, 1050, 780, 1050, -0.2], [780, 1120, 300, 1120, -0.2]].forEach(([a, b, c, d, bend], k) => {
        const tr = group(); heart(0, 0, 0.4, 0, tr);
        dashedArc(a, b, c, d, bend, 1.4 + k * 1.0, 0.9, k ? SAND : RED, null, tr);
      });
      write(T('"I prayed for your meeting."', '"Oré por tu reunión."')[lang], 540, 1500, { size: 60, color: BLUE, t0: 2.0 });
      write(T('"I prayed for your day."', '"Oré por tu día."')[lang], 540, 1620, { size: 60, color: SAND, t0: 3.0 });
  } },
  { dur: 5.6, build(lang) {
      caption(T('Then the whole family joins:\nfive kids and their spouses.', 'Luego se une toda la familia:\ncinco hijos y sus esposos.'), lang);
      const kids = tree(0.3, 700);
      write(T('Mom & Dad', 'Mamá y Papá')[lang], 640, 600, { size: 52, family: 'Patrick Hand', weight: 400, anchor: 'start', t0: 0.9, d: 0.4 });
      draw(P(roundRect(30, 930, 1020, 200, 40), { stroke: BLUE, strokeWidth: 5 }), 2.6, 0.8);
      write(T('One family crew', 'Un grupo familiar')[lang], 540, 1300, { size: 76, color: BLUE, t0: 3.2 });
  } },
  { dur: 4.4, app: { clip: 'addmembers', st: { en: 5.2, es: 4.0 } }, build(lang) {
      appFrame(T('Invite everyone with\na link or QR code.', 'Invita a todos con\nun enlace o código QR.'), lang);
  } },
  { dur: 6.0, build(lang) {
      caption(T("It doesn't matter\nwhere they live.", 'No importa\ndónde vivan.'), lang);
      const cities = [['Monterrey', 180, 1350], ['Dallas', 200, 760], ['Chicago', 540, 600], ['Madrid', 880, 760], ['Toronto', 900, 1350]];
      heart(540, 1050, 1.3, 0.3);
      cities.forEach(([name, x, y], k) => {
        house(x, y, 1.2, 0.6 + k * 0.25, null, SHIRTS[k + 1]);
        write(name, x, y + 110, { size: 50, family: 'Patrick Hand', weight: 400, t0: 0.9 + k * 0.25, d: 0.4 });
        dashedArc(x, y - 20, 540, 1050, 0.1 * (k % 2 ? 1 : -1), 1.8 + k * 0.3, 0.7, k % 2 ? SAND : RED);
      });
      write(T('Five cities. One crew.', 'Cinco ciudades. Un grupo.')[lang], 540, 1660, { size: 76, color: BLUE, t0: 3.6 });
  } },
  { dur: 5.8, build(lang) {
      caption(T('Everyone knows what the others\nare going through.', 'Todos saben lo que los demás\nestán viviendo.'), lang);
      const req = T(['A baby on the way!', 'Job interview Friday', "Dad's surgery", 'Moving to a new city', 'Finals this week'],
                    ['¡Viene un bebé!', 'Entrevista el viernes', 'La cirugía de papá', 'Mudanza a otra ciudad', 'Exámenes esta semana'])[lang];
      const kids = tree(0.1, 900, 0.1);
      [[250, 560], [800, 560], [540, 720], [260, 1560], [820, 1560]].forEach(([x, y], k) => {
        const w = Math.max(300, req[k].length * 21 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 94, req[k], 1.8 + k * 0.5, { size: 44, tail: k < 3 ? 'down' : 'up', fill: k === 0 ? '#dff0e6' : '#ffffff' });
      });
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('A notification: someone in your\nfamily just prayed for you.', 'Una notificación: alguien de tu\nfamilia acaba de orar por ti.'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('Encourage each other with\na voice note or video.', 'Anímense unos a otros con\nnota de voz o video.'), lang);
  } },
  { dur: 4.6, app: { clip: 'groupmetrics', st: { en: 17.5, es: 17.2 } }, build(lang) {
      appFrame(T('Understand what your\nfamily is praying about.', 'Entiende por qué está\norando tu familia.'), lang);
  } },
  { dur: 4.2, app: { clip: 'remember', st: { en: 11.1, es: 11.1 } }, build(lang) {
      appFrame(T('Remember every answered\nprayer, together.', 'Recuerden juntos cada\noración contestada.'), lang);
  } },
  { dur: 6.2, build(lang) {
      tree(0.1, 560, 0.1);
      [[120, 760], [330, 760], [540, 760], [750, 760], [960, 760]].forEach(([x, y], k) => heart(x, y + 250, 0.35, 1.4 + k * 0.15));
      write(T('Distance can\'t divide a family\nthat prays together.', 'La distancia no puede dividir\na una familia que ora unida.')[lang], 540, 1270, { size: 84, t0: 1.6, d: 1.6 });
      write(T('PrayCrew for families', 'PrayCrew para familias')[lang], 540, 1520, { size: 92, color: BLUE, t0: 3.4 });
      draw(P('M250 1590 C430 1610 650 1580 830 1595', { stroke: BLUE, strokeWidth: 5 }), 4.2, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
