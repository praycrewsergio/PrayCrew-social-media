// "A small group with PrayCrew" — doodle story with app inserts.
// Each scene: dur (s), app (optional: feature reel clip shown inside the doodle phone), build(lang).
const WIN = { x: 240, y: 520, w: 600, h: 1220 };   // where the app clip goes in app scenes
const CAP_Y = 270;
const T = (en, es) => ({ en, es });

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang, accent) {
  caption(txt, lang);
  phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05);
  if (accent) accent();
}

const ROUND = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => -Math.PI / 2 + i * 2 * Math.PI / 10);
function table10(cx, cy, t0, step = 0.12, cups = true) {
  tableTop(cx, cy, t0, null, cups);
  return ROUND.map((a, i) => personTop(cx, cy, a, i, t0 + 0.5 + i * step, null, i === 0));
}

const SCENES = [
  { dur: 3.6, build(lang) {
      write(T('One small group.\nOne month.', 'Un grupo pequeño.\nUn mes.')[lang], 540, 560, { size: 120, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 760, { size: 84, color: BLUE, t0: 1.0 });
      // calendar
      draw(R(300, 930, 480, 440, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 5 }), 0.4, 0.6);
      draw(R(300, 930, 480, 90, { fill: SAND, fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5 }), 0.8, 0.4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++)
        draw(R(330 + c * 88, 1050 + r * 75, 60, 50, { strokeWidth: 2.5, roughness: 0.8 }), 1.0 + (r * 5 + c) * 0.025, 0.12);
      draw(E(330 + 2 * 88 + 30, 1050 + 75 + 25, 110, 80, { stroke: RED, strokeWidth: 5 }), 1.9, 0.5);
      write(T('Group night', 'Noche de grupo')[lang], 540, 1450, { size: 60, color: RED, t0: 2.2, family: 'Patrick Hand', weight: 400 });
  } },
  { dur: 4.6, build(lang) {
      caption(T('Once a month, 10 friends\ngather around the table.', 'Una vez al mes, 10 amigos\nse reúnen alrededor de la mesa.'), lang);
      table10(540, 1130, 0.3, 0.14);
  } },
  { dur: 4.4, build(lang) {
      caption(T("The leader shares\nthe crew's QR code…", 'El líder comparte\nel código QR del grupo…'), lang);
      person(300, 1300, 1.5, 0.2, null, SHIRTS[0]);
      draw(P('M420 1460 l-6 -6', { strokeWidth: 3 }), 0.4, 0.1);
      phone(400, 760, 300, 520, 0.6);
      qr(455, 860, 190, 0.9);
      const pts = [[860, 760], [900, 1020], [860, 1290], [900, 1560]];
      pts.forEach(([x, y], k) => {
        dashedArc(710, 1000, x - 50, y, 0.12, 1.4 + k * 0.25, 0.6);
        phone(x - 45, y - 75, 90, 150, 1.8 + k * 0.25);
        check(x, y, 0.9, 2.3 + k * 0.25);
      });
  } },
  { dur: 4.0, app: { clip: 'addmembers', st: { en: 5.2, es: 4.0 } }, build(lang) {
      appFrame(T('…and everyone joins\nin seconds.', '…y todos se unen\nen segundos.'), lang);
  } },
  { dur: 5.6, build(lang) {
      caption(T("They share what's\non their hearts.", 'Comparten lo que\nhay en su corazón.'), lang);
      const P10 = table10(540, 1180, 0.0, 0.03, true);
      const req = T(["Mom's surgery", 'A new job', 'My marriage', 'Finals week', 'Healing', 'Our kids'],
                    ['La cirugía de mamá', 'Un trabajo nuevo', 'Mi matrimonio', 'Mis exámenes', 'Sanidad', 'Nuestros hijos'])[lang];
      const spots = [[540, 520, 'down'], [850, 760, 'down'], [880, 1530, 'up'], [540, 1690, 'up'], [200, 1530, 'up'], [230, 760, 'down']];
      spots.forEach(([x, y, tl], k) => {
        const w = Math.max(250, req[k].length * 21 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 92, req[k], 1.0 + k * 0.55, { tail: tl, size: 44 });
      });
  } },
  { dur: 4.6, app: { clip: 'prayerrequest', st: { en: 5.5, es: 4.5 } }, build(lang) {
      appFrame(T("Each request goes into the crew.\nSee who's praying for you.", 'Cada petición queda en el grupo.\nMira quién ora por ti.'), lang);
  } },
  { dur: 4.2, build(lang) {
      caption(T('Then everyone\ngoes home…', 'Luego cada quien\nse va a casa…'), lang);
      tableTop(540, 1150, 0.0, null, false).setAttribute('transform', 'translate(540 1150) scale(0.35) translate(-540 -1150)');
      HOUSES.forEach(([x, y], k) => {
        dashedArc(540, 1150, x, y + 40, (k % 2 ? 0.15 : -0.15), 0.6 + k * 0.08, 0.7, BLUE);
        house(x, y, 0.85, 1.0 + k * 0.1, null, SHIRTS[k]);
      });
  } },
  { dur: 5.2, build(lang) {
      caption(T("…but the praying\ndoesn't stop.", '…pero la oración\nno se detiene.'), lang);
      HOUSES.forEach(([x, y], k) => house(x, y, 0.85, 0.0 + k * 0.03, null, SHIRTS[k]));
      const pairs = [[0, 5], [3, 8], [6, 1], [9, 4], [2, 7], [5, 9], [8, 0], [1, 6]];
      pairs.forEach(([a, b], k) => {
        const [x1, y1] = HOUSES[a], [x2, y2] = HOUSES[b];
        const tr = group(); hands(0, 0, 0.55, 0, tr);
        dashedArc(x1, y1 - 70, x2, y2 - 70, (k % 2 ? 0.25 : -0.25), 0.8 + k * 0.42, 0.9, SAND, null, tr);
        bell(x2 + 55, y2 - 95, 0.7, 1.6 + k * 0.42);
      });
  } },
  { dur: 4.0, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('Every prayer sends\na notification.', 'Cada oración envía\nuna notificación.'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 29.5, es: 26.0 } }, build(lang) {
      appFrame(T('They follow up with a message,\nvoice note or selfie.', 'Dan seguimiento con mensaje,\nnota de voz o selfie.'), lang);
  } },
  { dur: 5.0, build(lang) {
      caption(T('Between meetings, the\ncrew stays connected.', 'Entre reuniones, el\ngrupo sigue conectado.'), lang);
      phone(250, 520, 580, 1220, 0.2);
      const msgs = T(['Praying for you today!', 'How did the interview go?', 'It went great, thank you!', 'Dinner on Friday?'],
                     ['¡Orando por ti hoy!', '¿Cómo te fue en la entrevista?', '¡Muy bien, gracias!', '¿Cena el viernes?'])[lang];
      msgs.forEach((m, k) => {
        const left = k % 2 === 0, w = Math.min(470, m.length * 17 + 70);
        bubble(left ? 290 + w / 2 : 790 - w / 2, 720 + k * 230, w, 100, m, 0.8 + k * 0.75,
          { tail: left ? 'left' : 'right', size: 40, fill: left ? '#ffffff' : '#dceaf7' });
      });
      heart(720, 1600, 0.7, 3.8);
      hands(380, 1610, 0.7, 4.0);
  } },
  { dur: 4.0, app: { clip: 'chat', st: { en: 5.8, es: 6.6 } }, build(lang) {
      appFrame(T('A private chat,\nonly for the crew.', 'Un chat privado,\nsolo para el grupo.'), lang);
  } },
  { dur: 5.2, build(lang) {
      caption(T('The leader sees what\nthe group is carrying.', 'El líder ve lo que\nel grupo está cargando.'), lang);
      person(270, 1450, 1.4, 0.2, null, SHIRTS[0]);
      draw(P('M228 1290 l42 -60 l42 60', { stroke: SAND, strokeWidth: 6 }), 0.9, 0.25);   // leader crown mark
      chart(520, 650, 470, 420, 0.8);
      const tags = T(['Health', 'Family', 'Work', 'Faith'], ['Salud', 'Familia', 'Trabajo', 'Fe'])[lang];
      tags.forEach((tg, k) => bubble(560 + (k % 2) * 250, 1250 + Math.floor(k / 2) * 170, 220, 96, tg, 2.0 + k * 0.4,
        { size: 48, fill: ['#dceaf7', '#f6e3cf', '#dff0e6', '#eee6f7'][k] }));
      // magnifying glass
      draw(C(410, 760, 150, { strokeWidth: 6 }), 1.5, 0.4); draw(L(462, 812, 520, 870, { strokeWidth: 9 }), 1.8, 0.2);
  } },
  { dur: 4.6, app: { clip: 'groupmetrics', st: { en: 17.5, es: 17.2 } }, build(lang) {
      appFrame(T('Group metrics: what your crew\nprays about, and what God answers.', 'Métricas del grupo: por qué ora\ntu grupo y qué ha contestado Dios.'), lang);
  } },
  { dur: 5.8, build(lang) {
      caption(T('Next month, they come back\nwith answered prayers.', 'Al mes siguiente, regresan\ncon oraciones contestadas.'), lang);
      table10(540, 1200, 0.0, 0.03, true);
      const ans = T(['Surgery went well!', 'I got the job!', 'Passed my finals!'], ['¡La cirugía salió bien!', '¡Conseguí el trabajo!', '¡Pasé mis exámenes!'])[lang];
      [[540, 560], [800, 1640], [280, 1640]].forEach(([x, y], k) => {
        const w = Math.max(300, ans[k].length * 21 + 90);
        const bx = Math.min(1060 - w / 2, Math.max(20 + w / 2, x));
        bubble(bx, y, w, 96, ans[k], 1.0 + k * 0.8, { size: 44, fill: '#dff0e6', tail: k ? 'up' : 'down' });
        check(bx - w / 2 + 6, y - 44, 0.8, 1.4 + k * 0.8);
      });
      heart(540, 1200, 0.9, 3.8);
  } },
  { dur: 4.0, app: { clip: 'remember', st: { en: 11.1, es: 11.1 } }, build(lang) {
      appFrame(T('Remember turns them into\na video every month.', 'Recordando las convierte en\nun video cada mes.'), lang);
  } },
  { dur: 5.2, build(lang) {
      heart(540, 720, 2.6, 0.1);
      write(T('Wherever two or three\ngather, there\'s a PrayCrew.', 'Donde se reúnan dos o tres,\nhay un PrayCrew.')[lang], 540, 1130, { size: 92, t0: 1.0 });
      write(T('Start your crew free.', 'Empieza tu grupo gratis.')[lang], 540, 1390, { size: 88, color: BLUE, t0: 2.6 });
      draw(P('M300 1460 C450 1480 630 1450 780 1465', { stroke: BLUE, strokeWidth: 5 }), 3.4, 0.4);
  } },
];
const HOUSES = [[170, 640], [450, 600], [760, 640], [960, 900], [180, 1000], [930, 1300], [160, 1380], [420, 1720], [720, 1700], [960, 1660]];

function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
