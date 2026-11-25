// Thanksgiving testimony: a mom and her daughter, surgery, and a church that prayed with them. Names kept private.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const SITE = { crop: [40, 708, 1000, 744], win: { x: 100, y: 660, w: 880, h: 654 }, radius: 10 };
const MOM = SHIRTS[3], GIRL = SHIRTS[8];

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function laptop(win, t0) {
  const x = win.x - 26, y = win.y - 26, w = win.w + 52, h = win.h + 52;
  draw(P(roundRect(x, y, w, h, 22), { strokeWidth: 5, roughness: 0.9 }), t0, 0.6);
  draw(P(`M${x - 50} ${y + h + 60} L${x} ${y + h} L${x + w} ${y + h} L${x + w + 50} ${y + h + 60} Z`,
    { fill: '#e7e2d8', fillStyle: 'hachure', hachureGap: 10, strokeWidth: 5, roughness: 0.9 }), t0 + 0.4, 0.4);
}
function leaf(x, y, s, rot, t0, color) {
  const g = group(); g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  draw(P('M0 -60 C40 -40 45 20 0 60 C-45 20 -40 -40 0 -60 Z', { fill: color, fillStyle: 'hachure', hachureGap: 6, stroke: color, strokeWidth: 3 }), t0, 0.3, g);
  draw(P('M0 -50 L0 75', { stroke: color, strokeWidth: 3 }), t0 + 0.2, 0.2, g);
}
function leaves(t0, pts) { pts.forEach(([x, y, r], k) => leaf(x, y, 0.9, r, t0 + k * 0.15, [SAND, RED, '#c9822f'][k % 3])); }
function momDaughter(x, y, s, t0) {
  person(x - 80 * s, y, s, t0, null, MOM);
  person(x + 80 * s, y + 25 * s, s * 0.85, t0 + 0.2, null, GIRL);
}
function hospital(x, y, s, t0) {
  draw(R(x - 300 * s, y - 260 * s, 600 * s, 400 * s, { fill: '#eef3f6', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.5);
  draw(R(x - 70 * s, y - 380 * s, 140 * s, 120 * s, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.3, 0.3);
  draw(P(`M${x} ${y - 360 * s} L${x} ${y - 280 * s} M${x - 40 * s} ${y - 320 * s} L${x + 40 * s} ${y - 320 * s}`, { stroke: RED, strokeWidth: 12 }), t0 + 0.5, 0.3);
  [-210, -110, 110, 210].forEach((dx, k) => [-190, -90].forEach(dy =>
    draw(R(x + dx * s - 35 * s, y + dy * s, 70 * s, 60 * s, { fill: '#bcd6ee', fillStyle: 'solid', strokeWidth: 3 }), t0 + 0.6 + k * 0.05, 0.15)));
  draw(R(x - 70 * s, y - 10 * s, 140 * s, 150 * s, { fill: '#cfe3ef', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.9, 0.3);
  draw(L(x, y - 10 * s, x, y + 140 * s, { strokeWidth: 3 }), t0 + 1.1, 0.15);
}
function church(x, y, s, t0) {
  draw(R(x - 170 * s, y - 120 * s, 340 * s, 260 * s, { fill: '#f3e6d3', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.5);
  draw(P(`M${x - 200 * s} ${y - 115 * s} L${x} ${y - 260 * s} L${x + 200 * s} ${y - 115 * s}`, { strokeWidth: 5 }), t0 + 0.3, 0.3);
  draw(R(x - 50 * s, y - 380 * s, 100 * s, 150 * s, { fill: '#f3e6d3', fillStyle: 'solid', strokeWidth: 5 }), t0 + 0.4, 0.3);
  draw(P(`M${x - 65 * s} ${y - 375 * s} L${x} ${y - 440 * s} L${x + 65 * s} ${y - 375 * s}`, { strokeWidth: 5 }), t0 + 0.5, 0.2);
  draw(P(`M${x} ${y - 540 * s} L${x} ${y - 450 * s} M${x - 30 * s} ${y - 510 * s} L${x + 30 * s} ${y - 510 * s}`, { stroke: SAND, strokeWidth: 8 }), t0 + 0.6, 0.25);
  draw(P(`M${x - 45 * s} ${y + 140 * s} L${x - 45 * s} ${y + 30 * s} Q${x} ${y - 20 * s} ${x + 45 * s} ${y + 30 * s} L${x + 45 * s} ${y + 140 * s}`,
    { fill: '#8a5a3c', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.7, 0.25);
}

const SCENES = [
  { dur: 5.0, build(lang) {
      write(T('A Thanksgiving\ntestimony', 'Un testimonio de\nAcción de Gracias')[lang], 540, 480, { size: 112, t0: 0.1, d: 1.2 });
      write(T('A true story of prayer, community\nand a living God.', 'Una historia real de oración, comunidad\ny un Dios vivo.')[lang], 540, 720, { size: 58, color: BLUE, t0: 1.4 });
      momDaughter(540, 1260, 1.6, 0.8);
      leaves(2.2, [[150, 1000, -20], [930, 960, 25], [190, 1620, 40], [900, 1640, -35], [540, 960, 5]]);
  } },
  { dur: 5.6, build(lang) {
      caption(T('A mom and her daughter received\na diagnosis that led to surgery.', 'Una mamá y su hija recibieron\nun diagnóstico que las llevó a cirugía.'), lang);
      momDaughter(540, 1120, 1.5, 0.3);
      draw(P(roundRect(330, 1450, 420, 220, 24), { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 4.5 }), 1.6, 0.4);
      draw(R(330, 1450, 420, 60, { fill: '#f3c9c0', fillStyle: 'solid', strokeWidth: 4.5 }), 1.8, 0.3);
      write(T('Surgery', 'Cirugía')[lang], 540, 1585, { size: 70, color: RED, t0: 2.2, d: 0.5 });
      write(T('in a few days', 'en unos días')[lang], 540, 1740, { size: 56, color: '#6b7a83', t0: 2.8, d: 0.6 });
  } },
  { dur: 4.8, app: Object.assign({ clip: 'landing', st: { en: 37.0, es: 33.5 } }, SITE), build(lang) {
      caption(T('They shared their prayer request\nthrough the church website.', 'Compartieron su petición de oración\nen el sitio web de la iglesia.'), lang);
      laptop(SITE.win, 0.05);
  } },
  { dur: 6.2, build(lang) {
      caption(T('Right away, the church\nwas praying for them.', 'De inmediato, la iglesia\nestaba orando por ellas.'), lang);
      counter(37, 540, 640, { size: 230, color: RED, t0: 0.3, d: 2.0 });
      write(T('people praying', 'personas orando')[lang], 540, 800, { size: 64, t0: 0.8 });
      momDaughter(540, 1230, 1.0, 0.4);
      const ring = [[130, 1050], [250, 1430], [130, 1720], [950, 1050], [830, 1430], [950, 1720], [400, 1700], [680, 1700]];
      ring.forEach(([x, y], k) => {
        person(x, y, 0.62, 0.8 + k * 0.15, null, SHIRTS[(k + 1) % 10]);
        const tr = group(); heart(0, 0, 0.3, 0, tr, k % 2 ? SAND : RED);
        dashedArc(x, y - 70, 540, 1110, 0.12 * (k % 2 ? 1 : -1), 2.0 + k * 0.25, 0.8, k % 2 ? SAND : RED, null, tr);
      });
  } },
  { dur: 4.4, app: { clip: 'followup', st: { en: 29.5, es: 26.0 } }, build(lang) {
      appFrame(T('Prayer warriors sent\nencouragement…', 'Los guerreros de oración\nenviaron ánimo…'), lang);
  } },
  { dur: 6.6, build(lang) {
      caption(T('…and Scripture to\nanchor their faith.', '…y la Palabra para\nanclar su fe.'), lang);
      const v = T([['"Do not fear, for I am with you."', 'Isaiah 41:10'], ['"God is our refuge and strength."', 'Psalm 46:1'], ['"Is anything too difficult for Me?"', 'Jeremiah 32:27']],
                  [['"No temas, que yo soy contigo."', 'Isaías 41:10'], ['"Dios es nuestro amparo y fortaleza."', 'Salmos 46:1'], ['"He aquí que yo soy Jehová,\nDios de toda carne."', 'Jeremías 32:27']])[lang];
      v.forEach(([q, r], k) => {
        const y = 560 + k * 330, h = q.includes('\n') ? 230 : 190;
        draw(P(roundRect(90, y, 900, h, 30), { fill: ['#fff6dd', '#dceaf7', '#dff0e6'][k], fillStyle: 'solid', strokeWidth: 4 }), 0.4 + k * 1.0, 0.4);
        write(q, 540, y + (q.includes('\n') ? 80 : 75), { size: 50, family: 'Patrick Hand', weight: 400, t0: 0.6 + k * 1.0, d: 0.6, lh: 1.15 });
        write(r, 540, y + h - 40, { size: 44, color: BLUE, t0: 1.1 + k * 1.0, d: 0.3 });
      });
      draw(P('M540 1600 L540 1740 M490 1650 L590 1650 M470 1740 Q540 1800 610 1740', { stroke: INK, strokeWidth: 7 }), 3.8, 0.6);
  } },
  { dur: 5.4, build(lang) {
      caption(T('As a community, we believed God could\ndo a miracle, even through doctors.', 'Como comunidad, creímos que Dios podía\nhacer un milagro, aun a través de los médicos.'), lang);
      [[300, 1150], [780, 1150]].forEach(([x, y], k) => {
        person(x, y, 1.2, 0.4 + k * 0.3, null, '#7fb7b2');
        draw(P(`M${x - 40} ${y + 40} q40 40 80 0`, { stroke: INK, strokeWidth: 4 }), 1.2 + k * 0.3, 0.3);
        draw(C(x + 40, y + 45, 22, { strokeWidth: 4 }), 1.4 + k * 0.3, 0.2);
      });
      hands(540, 760, 1.1, 1.8);
      [[200, 760], [880, 760], [540, 560]].forEach(([x, y], k) => heart(x, y, 0.5, 2.6 + k * 0.25, null, k % 2 ? SAND : RED));
      write(T('Nothing is too hard for Him.', 'Nada es difícil para Él.')[lang], 540, 1600, { size: 72, color: BLUE, t0: 3.4 });
  } },
  { dur: 5.8, build(lang) {
      caption(T('The day of surgery arrived.\nAs they walked through the hospital doors…', 'Llegó el día de la cirugía.\nAl cruzar las puertas del hospital…'), lang);
      hospital(540, 980, 1.3, 0.2);
      momDaughter(380, 1450, 1.0, 1.4);
      phone(720, 1250, 200, 340, 2.2); bell(820, 1380, 1.0, 2.6);
      [[700, 1210], [940, 1210], [960, 1460]].forEach(([x, y], k) => heart(x, y, 0.4, 3.0 + k * 0.3, null, k % 2 ? SAND : RED));
  } },
  { dur: 4.4, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('…their phones started\nlighting up.', '…sus teléfonos empezaron\na iluminarse.'), lang);
  } },
  { dur: 6.0, build(lang) {
      caption(T('Prayer warriors standing with them.\nTheir spirit was lifted.', 'Guerreros de oración con ellas.\nSu espíritu fue levantado.'), lang);
      const n = T(['Praying for you right now', 'God is with you today', 'We believe in a living God!'], ['Orando por ustedes ahora mismo', 'Dios está con ustedes hoy', '¡Creemos en un Dios vivo!'])[lang];
      [600, 790, 980].forEach((y, k) => {
        const w = Math.min(860, n[k].length * 23 + 100);
        bubble(540, y, w, 110, n[k], 0.4 + k * 0.8, { size: 48, fill: '#dceaf7' });
      });
      momDaughter(540, 1450, 1.3, 2.4);
      [[300, 1250], [780, 1250], [540, 1130]].forEach(([x, y], k) => heart(x, y, 0.5, 3.2 + k * 0.25, null, k % 2 ? SAND : RED));
  } },
  { dur: 6.2, build(lang) {
      caption(T('By the grace of God…', 'Por la gracia de Dios…'), lang);
      momDaughter(540, 1010, 1.6, 0.3);
      write(T('the surgery went well.\nA miracle happened.', 'la cirugía salió bien.\nSucedió un milagro.')[lang], 540, 1460, { size: 100, color: GREEN, t0: 1.5, d: 1.4 });
      check(860, 640, 1.8, 3.0);
      [[200, 600], [540, 500], [900, 1080], [170, 1100]].forEach(([x, y], k) => heart(x, y, 0.55, 3.2 + k * 0.2, null, k % 2 ? SAND : RED));
  } },
  { dur: 7.0, build(lang) {
      caption(T('As a church, we celebrate\na culture of prayer.', 'Como iglesia, celebramos\nuna cultura de oración.'), lang);
      church(540, 860, 0.75, 0.2);
      const pts = T(['We don\'t pray just once.', 'We walk with people in their journey.', 'We remind each other of Scripture.', 'We encourage one another.'],
                    ['No oramos solo una vez.', 'Caminamos con las personas en su proceso.', 'Nos recordamos la Palabra.', 'Nos animamos unos a otros.'])[lang];
      pts.forEach((p, k) => {
        check(130, 1210 + k * 140, 0.6, 1.2 + k * 0.9);
        write(p, 190, 1230 + k * 140, { size: 52, anchor: 'start', family: 'Patrick Hand', weight: 400, t0: 1.4 + k * 0.9, d: 0.6 });
      });
  } },
  { dur: 4.4, app: { clip: 'remember', st: { en: 11.1, es: 11.1 } }, build(lang) {
      appFrame(T('And we remember every\nanswered prayer.', 'Y recordamos cada\noración contestada.'), lang);
  } },
  { dur: 7.0, build(lang) {
      leaves(0.1, [[140, 560, -20], [940, 520, 30], [160, 1120, 35], [930, 1160, -25]]);
      write(T('This Thanksgiving,\nwe give thanks to a living God.', 'Este Día de Acción de Gracias,\ndamos gracias a un Dios vivo.')[lang], 540, 760, { size: 84, t0: 0.6, d: 1.6 });
      heart(540, 1060, 0.9, 2.2);
      write(T('PrayCrew: the tool that helps build\na culture of prayer.', 'PrayCrew: la herramienta que ayuda a\nconstruir una cultura de oración.')[lang], 540, 1330, { size: 64, color: BLUE, t0: 3.0, d: 1.2 });
      write(T('Happy Thanksgiving!', '¡Feliz Día de Acción de Gracias!')[lang], 540, 1620, { size: 80, color: SAND, t0: 4.6 });
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
