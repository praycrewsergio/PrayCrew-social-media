// "A creator / speaker with PrayCrew" — doodle story with app inserts, web form, QR and dashboard.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const SITE = { crop: [40, 708, 1000, 744], win: { x: 100, y: 660, w: 880, h: 654 }, radius: 10 };
const FORM = { crop: [40, 654, 1000, 852], win: { x: 100, y: 640, w: 880, h: 750 }, radius: 10 };
const PORTAL = { image: 'media/portal.png', zoom: [[0, 0, 1657, 936], [820, 500, 837, 436]], win: { x: 100, y: 700, w: 880, h: 458 }, radius: 10 };

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function speaker(x, y, s, t0) {
  person(x, y, s, t0, null, SHIRTS[0]);
  draw(L(x + 60 * s, y + 20 * s, x + 95 * s, y - 40 * s, { strokeWidth: 5 }), t0 + 0.8, 0.2);
  draw(E(x + 100 * s, y - 52 * s, 34 * s, 44 * s, { fill: INK, fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.9, 0.2);
}
function crowd(x0, y0, cols, rows, gap, t0, step = 0.03) {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * gap + (r % 2 ? gap / 2 : 0), y = y0 + r * gap * 0.9, k = r * cols + c;
    draw(C(x, y, gap * 0.42, { fill: '#f6dcc4', fillStyle: 'solid', strokeWidth: 2.5 }), t0 + k * step, 0.12);
    draw(P(`M${x - gap * 0.32} ${y + gap * 0.5} Q${x} ${y + gap * 0.1} ${x + gap * 0.32} ${y + gap * 0.5}`,
      { fill: SHIRTS[k % 10], fillStyle: 'solid', strokeWidth: 2.5 }), t0 + k * step + 0.05, 0.12);
  }
}

const SCENES = [
  { dur: 4.2, build(lang) {
      write(T('One voice.\nThousands listening.', 'Una voz.\nMiles escuchando.')[lang], 540, 470, { size: 116, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 665, { size: 84, color: BLUE, t0: 1.0 });
      speaker(540, 1250, 1.8, 0.5);
      draw(R(200, 1480, 680, 70, { fill: '#e9d6bd', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), 1.2, 0.5);
  } },
  { dur: 5.0, build(lang) {
      caption(T('A speaker and creator with\nthousands of followers online.', 'Un conferencista y creador con\nmiles de seguidores en línea.'), lang);
      phone(110, 560, 380, 680, 0.2);
      draw(R(140, 640, 320, 230, { fill: '#dceaf7', fillStyle: 'solid', strokeWidth: 3 }), 0.6, 0.3);
      draw(P('M275 710 L335 755 L275 800 Z', { fill: RED, fillStyle: 'solid', strokeWidth: 3 }), 0.9, 0.2);
      [0, 1, 2].forEach(i => draw(L(140, 920 + i * 50, 440 - i * 60, 920 + i * 50, { strokeWidth: 3 }), 1.0 + i * 0.1, 0.2));
      counter(48500, 760, 760, { size: 110, color: BLUE, t0: 1.0, d: 2.0 });
      write(T('followers', 'seguidores')[lang], 760, 860, { size: 54, family: 'Patrick Hand', weight: 400, t0: 1.2, d: 0.4 });
      [[640, 1040], [760, 1000], [880, 1060], [700, 1180], [840, 1200]].forEach(([x, y], k) => heart(x, y, 0.45, 1.8 + k * 0.25, null, k % 2 ? RED : SAND));
      crowd(150, 1420, 9, 3, 98, 2.0, 0.02);
  } },
  { dur: 4.8, build(lang) {
      caption(T('But who are they?\nWhat are they going through?', '¿Pero quiénes son?\n¿Qué están viviendo?'), lang);
      crowd(130, 640, 9, 6, 102, 0.2, 0.012);
      [[250, 600], [560, 780], [860, 640], [380, 1030], [720, 1120], [200, 1240]].forEach(([x, y], k) =>
        bubble(x, y, 90, 90, '?', 1.4 + k * 0.25, { size: 64, fill: '#ffffff' }));
  } },
  { dur: 4.6, build(lang) {
      caption(T('PrayCrew helps them know\ntheir community and pray with them.', 'PrayCrew les ayuda a conocer\na su comunidad y orar con ella.'), lang);
      speaker(540, 760, 1.1, 0.2);
      hands(780, 700, 0.9, 1.0);
      crowd(130, 1180, 9, 4, 102, 0.6, 0.012);
      [[250, 1140], [560, 1240], [860, 1150], [380, 1420], [720, 1460]].forEach(([x, y], k) => heart(x, y, 0.5, 2.0 + k * 0.25));
  } },
  { dur: 4.8, app: Object.assign({ clip: 'landing', st: { en: 37.0, es: 33.5 } }, SITE), build(lang) {
      caption(T('An embedded prayer form\non their website…', 'Un formulario de oración\nen su sitio web…'), lang);
      laptop(SITE.win, 0.05);
      write(T('yourname.com', 'tunombre.com')[lang], 540, 1560, { size: 60, color: BLUE, t0: 1.0, family: 'Patrick Hand', weight: 400 });
  } },
  { dur: 5.0, build(lang) {
      caption(T('…or a QR code on stage,\nin videos and at events.', '…o un código QR en el escenario,\nen videos y en eventos.'), lang);
      draw(R(140, 520, 800, 560, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 6 }), 0.2, 0.5);
      qr(410, 600, 260, 0.6);
      write(T('Share your prayer request', 'Comparte tu petición de oración')[lang], 540, 1000, { size: 56, t0: 1.0, family: 'Patrick Hand', weight: 400 });
      draw(L(540, 1080, 540, 1160, { strokeWidth: 5 }), 0.5, 0.2);
      [[180, 1450], [400, 1480], [680, 1480], [900, 1450]].forEach(([x, y], k) => {
        person(x, y, 0.8, 1.2 + k * 0.15, null, SHIRTS[(k + 4) % 10]);
        phone(x + 40, y - 120, 70, 120, 1.6 + k * 0.15);
        check(x + 75, y - 150, 0.7, 2.4 + k * 0.2);
      });
  } },
  { dur: 4.4, app: Object.assign({ clip: 'landing', st: { en: 0.4, es: 0.4 } }, FORM), build(lang) {
      caption(T('Followers share a request in seconds.\nNo app needed.', 'Sus seguidores comparten su petición\nen segundos. Sin app.'), lang);
      laptop(FORM.win, 0.05);
  } },
  { dur: 4.2, app: { clip: 'followup', st: { en: 6.03, es: 6.35 } }, build(lang) {
      appFrame(T('The creator and their team\npray for every request…', 'El creador y su equipo oran\npor cada petición…'), lang);
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('…and follow up personally,\nwith a voice note or video.', '…y dan seguimiento personal,\ncon nota de voz o video.'), lang);
  } },
  { dur: 5.2, build(lang) {
      caption(T('A unique experience\nfor every follower.', 'Una experiencia única\npara cada seguidor.'), lang);
      person(540, 1450, 1.6, 0.2, null, SHIRTS[8]);
      phone(700, 980, 200, 340, 0.8); bell(800, 1100, 1.0, 1.3);
      const msgs = T(['We prayed for you today', 'New video message', "You're not alone"], ['Hoy oramos por ti', 'Nuevo mensaje en video', 'No estás solo'])[lang];
      [[300, 640], [780, 690], [320, 900]].forEach(([x, y], k) => {
        const w = Math.min(520, msgs[k].length * 20 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 96, msgs[k], 1.5 + k * 0.6, { size: 42, fill: '#dceaf7' });
      });
      heart(330, 1150, 0.9, 3.6);
  } },
  { dur: 4.0, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('They know someone\nis praying for them.', 'Saben que alguien\nestá orando por ellos.'), lang);
  } },
  { dur: 5.4, app: PORTAL, build(lang) {
      caption(T('The dashboard shows what\nthe community needs prayer for.', 'El tablero muestra por qué\nnecesita oración la comunidad.'), lang);
      laptop(PORTAL.win, 0.05);
  } },
  { dur: 5.8, build(lang) {
      caption(T('Topics guide what to pray,\nspeak and create about next.', 'Los temas guían sobre qué orar,\nhablar y crear después.'), lang);
      const lab = T(['Anxiety', 'Family', 'Purpose', 'Health', 'Finances'], ['Ansiedad', 'Familia', 'Propósito', 'Salud', 'Finanzas'])[lang];
      const vals = [0.95, 0.75, 0.6, 0.5, 0.4];
      vals.forEach((v, k) => {
        const y = 620 + k * 190, w = v * 560;
        write(lab[k], 250, y + 45, { size: 52, family: 'Patrick Hand', weight: 400, anchor: 'end', t0: 0.4 + k * 0.2, d: 0.3 });
        draw(R(290, y, w, 90, { fill: [RED, BLUE, SAND, GREEN, BLUE][k], fillStyle: 'hachure', hachureGap: 9, strokeWidth: 4 }), 0.6 + k * 0.2, 0.4);
      });
      [[200, 1640], [540, 1640], [880, 1640]].forEach(([x, y], k) => {
        const it = T(['Pray', 'Speak', 'Create'], ['Orar', 'Hablar', 'Crear'])[lang][k];
        bubble(x, y, 240, 100, it, 2.4 + k * 0.4, { size: 54, fill: ['#fbe3e3', '#dceaf7', '#f6e3cf'][k] });
      });
  } },
  { dur: 5.6, build(lang) {
      caption(T('And answered prayers become\ntestimonies to share.', 'Y las oraciones contestadas se\nconvierten en testimonios.'), lang);
      const ans = T(['I got the job!', 'My marriage was restored', 'Anxiety is gone', 'My son came home'], ['¡Conseguí el trabajo!', 'Mi matrimonio fue restaurado', 'La ansiedad se fue', 'Mi hijo volvió a casa'])[lang];
      [[540, 620], [540, 860], [540, 1100], [540, 1340]].forEach(([x, y], k) => {
        const w = Math.max(360, ans[k].length * 22 + 110);
        bubble(x, y, w, 110, ans[k], 0.5 + k * 0.6, { size: 48, fill: '#dff0e6', tail: k % 2 ? 'right' : 'left' });
        check(x - w / 2 + 8, y - 50, 0.9, 0.9 + k * 0.6);
      });
      heart(540, 1620, 1.0, 3.4);
  } },
  { dur: 4.0, app: { clip: 'remember', st: { en: 11.1, es: 11.1 } }, build(lang) {
      appFrame(T('Remember collects every\nanswered prayer.', 'Recordando reúne cada\noración contestada.'), lang);
  } },
  { dur: 5.8, build(lang) {
      speaker(540, 760, 1.2, 0.1);
      heart(780, 600, 0.8, 0.8);
      write(T("Don't just grow an audience.\nKnow your community.", 'No solo hagas crecer tu audiencia.\nConoce a tu comunidad.')[lang], 540, 1180, { size: 84, t0: 1.2, d: 1.6 });
      write(T('PrayCrew for creators & speakers', 'PrayCrew para creadores y conferencistas')[lang], 540, 1440, { size: 76, color: BLUE, t0: 3.2 });
      draw(P('M170 1505 C420 1525 660 1495 910 1510', { stroke: BLUE, strokeWidth: 5 }), 4.1, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
