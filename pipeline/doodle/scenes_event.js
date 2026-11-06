// "Artists & speakers: prayer at your events" — doodle story with app inserts, web form, QR and dashboard.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const FORM = { crop: [40, 654, 1000, 852], win: { x: 100, y: 640, w: 880, h: 750 }, radius: 10 };
const PORTAL = { image: 'media/portal.png', zoom: [[0, 0, 1657, 936], [820, 500, 837, 436]], win: { x: 100, y: 700, w: 880, h: 458 }, radius: 10 };
const GREY = '#8f9aa1';

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function crowd(x0, y0, cols, rows, gap, t0, step = 0.03) {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * gap + (r % 2 ? gap / 2 : 0), y = y0 + r * gap * 0.9, k = r * cols + c;
    draw(C(x, y, gap * 0.42, { fill: '#f6dcc4', fillStyle: 'solid', strokeWidth: 2.5 }), t0 + k * step, 0.12);
    draw(P(`M${x - gap * 0.32} ${y + gap * 0.5} Q${x} ${y + gap * 0.1} ${x + gap * 0.32} ${y + gap * 0.5}`,
      { fill: SHIRTS[k % 10], fillStyle: 'solid', strokeWidth: 2.5 }), t0 + k * step + 0.05, 0.12);
  }
}
const seat = (x0, y0, gap, r, c) => [x0 + c * gap + (r % 2 ? gap / 2 : 0), y0 + r * gap * 0.9];
function note(x, y, s, t0) {
  draw(E(x, y, 34 * s, 24 * s, { fill: INK, fillStyle: 'solid', strokeWidth: 2 }), t0, 0.15);
  draw(L(x + 16 * s, y, x + 16 * s, y - 70 * s, { strokeWidth: 4 }), t0 + 0.1, 0.15);
  draw(P(`M${x + 16 * s} ${y - 70 * s} q${22 * s} ${10 * s} ${26 * s} ${34 * s}`, { strokeWidth: 4 }), t0 + 0.2, 0.15);
}
function stage(x, y, w, t0, lights = true) {
  if (lights) [[x - w / 2 + 40, 1], [x + w / 2 - 40, -1]].forEach(([lx, dir], k) =>
    draw(P(`M${lx} ${y - 420} L${lx + dir * 40} ${y - 420} L${x + dir * 40} ${y} L${x - dir * 160} ${y} Z`,
      { stroke: '#e9cf6e', fill: '#fbeeb8', fillStyle: 'solid', strokeWidth: 2 }), t0 + k * 0.15, 0.3));
  draw(R(x - w / 2, y, w, 60, { fill: '#e9d6bd', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0 + 0.2, 0.5);
}
function artist(x, y, s, t0, shirt = SHIRTS[4]) {
  person(x, y, s, t0, null, shirt);
  draw(L(x - 10 * s, y + 92 * s, x + 120 * s, y + 10 * s, { strokeWidth: 9 * s }), t0 + 0.8, 0.2);
  draw(E(x - 28 * s, y + 100 * s, 92 * s, 74 * s, { fill: SAND, fillStyle: 'solid', strokeWidth: 3.5 }), t0 + 0.9, 0.25);
  draw(E(x + 6 * s, y + 80 * s, 70 * s, 56 * s, { fill: SAND, fillStyle: 'solid', strokeWidth: 3.5 }), t0 + 1.0, 0.25);
  draw(C(x - 8 * s, y + 90 * s, 22 * s, { fill: INK, fillStyle: 'solid', strokeWidth: 2 }), t0 + 1.15, 0.15);
}
function speaker(x, y, s, t0) {
  person(x, y, s, t0, null, SHIRTS[0]);
  draw(L(x + 60 * s, y + 20 * s, x + 95 * s, y - 40 * s, { strokeWidth: 5 }), t0 + 0.8, 0.2);
  draw(E(x + 100 * s, y - 52 * s, 34 * s, 44 * s, { fill: INK, fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.9, 0.2);
}
function screen(x, y, w, h, t0) {
  draw(R(x, y, w, h, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 6 }), t0, 0.4);
  draw(L(x + w * 0.3, y + h, x + w * 0.3, y + h + 40, { strokeWidth: 5 }), t0 + 0.3, 0.15);
  draw(L(x + w * 0.7, y + h, x + w * 0.7, y + h + 40, { strokeWidth: 5 }), t0 + 0.3, 0.15);
}
function team(xs, y, s, t0) {
  xs.forEach((x, k) => person(x, y, s, t0 + k * 0.15, null, SHIRTS[[2, 6, 8][k % 3]]));
  hands(xs[Math.floor(xs.length / 2)], y - 150 * s, 0.6, t0 + 0.6);
}
// Venue: stage at top, prayer team in front, crowd behind them.
const CX = 130, CY = 880, GAP = 102;
function venue(t0) {
  draw(R(140, 470, 800, 50, { fill: '#e9d6bd', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.4);
  speaker(540, 395, 0.55, t0 + 0.2);
  team([400, 540, 680], 650, 0.55, t0 + 0.4);
  crowd(CX, CY, 9, 6, GAP, t0 + 0.6, 0.01);
}

const SCENES = [
  { dur: 4.4, build(lang) {
      write(T('The event ends.\nThe prayer doesn\'t.', 'El evento termina.\nLa oración no.')[lang], 540, 470, { size: 116, t0: 0.1 });
      write(T('with PrayCrew', 'con PrayCrew')[lang], 540, 665, { size: 84, color: BLUE, t0: 1.0 });
      stage(540, 1480, 760, 0.4);
      artist(540, 1260, 1.6, 0.6);
      [[220, 1080], [860, 1000], [900, 1240]].forEach(([x, y], k) => note(x, y, 1.1, 2.0 + k * 0.3));
  } },
  { dur: 4.8, build(lang) {
      caption(T('An artist or speaker on stage.\nThousands in the room.', 'Un artista o conferencista en el\nescenario. Miles en el lugar.'), lang);
      stage(540, 760, 760, 0.1);
      artist(400, 560, 0.9, 0.3);
      speaker(700, 560, 0.9, 0.6);
      [[200, 520], [880, 460]].forEach(([x, y], k) => note(x, y, 0.9, 1.4 + k * 0.3));
      crowd(130, 960, 9, 7, 102, 1.0, 0.012);
  } },
  { dur: 5.0, build(lang) {
      caption(T('Up front, a prayer team\nis ready to pray.', 'Al frente, un equipo de oración\nestá listo para orar.'), lang);
      venue(0.1);
      const [px, py] = seat(CX, CY, GAP, 0, 4);
      dashedArc(px, py - 40, 540, 720, 0.15, 1.8, 0.6, GREEN);
      check(px + 50, py - 50, 0.8, 2.6);
  } },
  { dur: 5.6, build(lang) {
      caption(T('But for someone in the last row,\nwalking up isn\'t easy.', 'Pero para alguien en la última fila,\npasar al frente no es fácil.'), lang);
      venue(0.05);
      const [lx, ly] = seat(CX, CY, GAP, 5, 7);
      draw(E(lx, ly + 10, 150, 150, { stroke: RED, strokeWidth: 6 }), 1.0, 0.4);
      dashedArc(lx, ly - 60, 700, 720, -0.25, 1.6, 1.2, GREY);
      bubble(lx - 40, ly + 210, 100, 100, '?', 2.6, { size: 70, tail: 'up' });
      write(T('Too shy. Too far. Too much.', 'Mucha pena. Muy lejos. Demasiado.')[lang], 540, 1640, { size: 64, color: RED, t0: 3.2 });
  } },
  { dur: 5.6, build(lang) {
      caption(T('With PrayCrew, everyone\ncan receive prayer.', 'Con PrayCrew, todos pueden\nrecibir oración.'), lang);
      screen(280, 420, 520, 300, 0.1); qr(460, 445, 160, 0.4);
      write(T('Share your prayer request', 'Comparte tu petición')[lang], 540, 680, { size: 42, family: 'Patrick Hand', weight: 400, t0: 0.9, d: 0.4 });
      crowd(CX, CY, 9, 6, GAP, 0.3, 0.01);
      [[0, 1], [1, 5], [2, 2], [3, 6], [4, 0], [2, 8], [4, 4], [1, 3]].forEach(([r, c], k) => {
        const [x, y] = seat(CX, CY, GAP, r, c); heart(x, y - 62, 0.4, 1.4 + k * 0.18);
      });
      const [lx, ly] = seat(CX, CY, GAP, 5, 7);
      draw(E(lx, ly + 10, 150, 150, { stroke: GREEN, strokeWidth: 6 }), 2.6, 0.4);
      check(lx + 60, ly - 50, 0.9, 3.0);
      write(T('Even the last row.', 'Incluso la última fila.')[lang], 540, 1640, { size: 70, color: GREEN, t0: 3.3 });
  } },
  { dur: 4.4, app: { clip: 'crews', st: { en: 3.6, es: 3.8 } }, build(lang) {
      appFrame(T('First, create your\nprayer ministry…', 'Primero, crea tu\nministerio de oración…'), lang);
  } },
  { dur: 4.4, app: { clip: 'addmembers', st: { en: 5.2, es: 4.0 } }, build(lang) {
      appFrame(T('…and invite your\nprayer team.', '…e invita a tu\nequipo de oración.'), lang);
  } },
  { dur: 5.2, build(lang) {
      caption(T('Put the QR on the big screen.\nEmbed the form on your website.', 'Pon el QR en la pantalla.\nAgrega el formulario a tu sitio web.'), lang);
      screen(90, 560, 420, 340, 0.2); qr(190, 600, 220, 0.5);
      write(T('At the event', 'En el evento')[lang], 300, 1020, { size: 60, color: BLUE, t0: 1.2 });
      draw(P(roundRect(600, 590, 400, 290, 16), { strokeWidth: 5, roughness: 0.9 }), 0.9, 0.5);
      draw(P('M560 940 L600 880 L1000 880 L1040 940 Z', { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5 }), 1.2, 0.3);
      [0, 1, 2].forEach(i => draw(R(640, 640 + i * 62, 320, 40, { strokeWidth: 3 }), 1.4 + i * 0.12, 0.2));
      draw(R(640, 830, 140, 34, { fill: BLUE, fillStyle: 'solid', strokeWidth: 3 }), 1.8, 0.2);
      write(T('yourname.com', 'tunombre.com')[lang], 800, 1020, { size: 60, color: BLUE, t0: 1.6 });
      [[180, 1480], [400, 1510], [680, 1510], [900, 1480]].forEach(([x, y], k) => {
        person(x, y, 0.8, 2.0 + k * 0.15, null, SHIRTS[(k + 3) % 10]);
        phone(x + 40, y - 120, 70, 120, 2.3 + k * 0.15);
        check(x + 75, y - 150, 0.7, 3.0 + k * 0.2);
      });
  } },
  { dur: 4.4, app: Object.assign({ clip: 'landing', st: { en: 0.4, es: 0.4 } }, FORM), build(lang) {
      caption(T('Attendees share a request\nin seconds. No app needed.', 'Los asistentes comparten su petición\nen segundos. Sin app.'), lang);
      laptop(FORM.win, 0.05);
  } },
  { dur: 4.4, app: { clip: 'followup', st: { en: 6.03, es: 6.35 } }, build(lang) {
      appFrame(T('Your team prays for\nevery single request.', 'Tu equipo ora por\ncada petición.'), lang);
  } },
  { dur: 6.0, build(lang) {
      caption(T('After the event, you are still\npresent through prayer.', 'Después del evento, sigues\npresente a través de la oración.'), lang);
      stage(540, 680, 420, 0.1, false);
      artist(470, 540, 0.6, 0.2); speaker(640, 540, 0.6, 0.4);
      const days = T(['Next day', 'One week later', 'One month later'], ['Al día siguiente', 'Una semana después', 'Un mes después'])[lang];
      [[200, 1300], [540, 1460], [880, 1300]].forEach(([x, y], k) => {
        house(x, y, 1.3, 1.0 + k * 0.2, null, SHIRTS[k + 1]);
        const tr = group(); heart(0, 0, 0.4, 0, tr);
        dashedArc(540, 760, x, y - 140, 0.12 * (k - 1), 1.8 + k * 0.6, 0.8, RED, null, tr);
        write(days[k], x, y + 130, { size: 50, family: 'Patrick Hand', weight: 400, t0: 2.3 + k * 0.6, d: 0.4 });
      });
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('Follow up personally,\nwith a voice note or video.', 'Da seguimiento personal,\ncon nota de voz o video.'), lang);
  } },
  { dur: 5.4, build(lang) {
      caption(T('A unique experience\nof intentionality.', 'Una experiencia única\nde intencionalidad.'), lang);
      person(540, 1450, 1.6, 0.2, null, SHIRTS[8]);
      phone(700, 980, 200, 340, 0.8); bell(800, 1100, 1.0, 1.3);
      const msgs = T(['We prayed for you today', 'How is your mom doing?', 'Still praying for you'], ['Hoy oramos por ti', '¿Cómo sigue tu mamá?', 'Seguimos orando por ti'])[lang];
      [[300, 640], [780, 690], [320, 900]].forEach(([x, y], k) => {
        const w = Math.min(520, msgs[k].length * 20 + 70);
        bubble(Math.min(1060 - w / 2, Math.max(20 + w / 2, x)), y, w, 96, msgs[k], 1.5 + k * 0.6, { size: 42, fill: '#dceaf7' });
      });
      heart(330, 1150, 0.9, 3.6);
  } },
  { dur: 5.4, app: PORTAL, build(lang) {
      caption(T('Better understand what your\naudience is going through.', 'Entiende mejor lo que está\nviviendo tu audiencia.'), lang);
      laptop(PORTAL.win, 0.05);
  } },
  { dur: 5.8, build(lang) {
      caption(T('See what every crowd\nneeds prayer for.', 'Ve por qué necesita oración\ncada público.'), lang);
      const lab = T(['Anxiety', 'Family', 'Health', 'Grief', 'Purpose'], ['Ansiedad', 'Familia', 'Salud', 'Duelo', 'Propósito'])[lang];
      const vals = [0.95, 0.8, 0.6, 0.5, 0.4];
      vals.forEach((v, k) => {
        const y = 620 + k * 190, w = v * 560;
        write(lab[k], 250, y + 45, { size: 52, family: 'Patrick Hand', weight: 400, anchor: 'end', t0: 0.4 + k * 0.2, d: 0.3 });
        draw(R(290, y, w, 90, { fill: [RED, BLUE, GREEN, SAND, BLUE][k], fillStyle: 'hachure', hachureGap: 9, strokeWidth: 4 }), 0.6 + k * 0.2, 0.4);
      });
      write(T('…and let it shape your next\nsong, message and event.', '…y deja que guíe tu próxima\ncanción, mensaje y evento.')[lang], 540, 1640, { size: 66, color: BLUE, t0: 2.4 });
  } },
  { dur: 5.6, build(lang) {
      caption(T('Collect testimonies of\nanswered prayers.', 'Reúne testimonios de\noraciones contestadas.'), lang);
      const ans = T(['I got the job!', 'My marriage was restored', 'Mom is cancer-free', 'I found my purpose'], ['¡Conseguí el trabajo!', 'Mi matrimonio fue restaurado', 'Mamá está libre de cáncer', 'Encontré mi propósito'])[lang];
      [[540, 620], [540, 860], [540, 1100], [540, 1340]].forEach(([x, y], k) => {
        const w = Math.max(360, ans[k].length * 22 + 110);
        bubble(x, y, w, 110, ans[k], 0.5 + k * 0.6, { size: 48, fill: '#dff0e6', tail: k % 2 ? 'right' : 'left' });
        check(x - w / 2 + 8, y - 50, 0.9, 0.9 + k * 0.6);
      });
      heart(540, 1620, 1.0, 3.4);
  } },
  { dur: 6.0, build(lang) {
      stage(540, 860, 640, 0.1);
      artist(440, 660, 1.0, 0.2); speaker(680, 660, 1.0, 0.4);
      heart(880, 480, 0.8, 1.0);
      write(T('The event ends.\nThe prayer continues.', 'El evento termina.\nLa oración continúa.')[lang], 540, 1210, { size: 92, t0: 1.3, d: 1.4 });
      write(T('PrayCrew for artists & speakers', 'PrayCrew para artistas y conferencistas')[lang], 540, 1470, { size: 76, color: BLUE, t0: 3.2 });
      draw(P('M170 1535 C420 1555 660 1525 910 1540', { stroke: BLUE, strokeWidth: 5 }), 4.1, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
