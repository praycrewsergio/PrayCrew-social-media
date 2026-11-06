// "James didn't beat cancer alone" — a true story told as a doodle, with app inserts.
const WIN = { x: 240, y: 520, w: 600, h: 1220 };
const CAP_Y = 270;
const T = (en, es) => ({ en, es });
const JAMES = SHIRTS[0];

function caption(txt, lang, t0 = 0.1, y = CAP_Y, size = 84) { return write(txt[lang], 540, y, { size, t0 }); }
function appFrame(txt, lang) { caption(txt, lang); phone(WIN.x - 22, WIN.y - 34, WIN.w + 44, WIN.h + 70, 0.05); }
function family(cx, cy, r, s, t0, step = 0.2) {
  const n = 6, out = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.95 + i * 1.1 / (n - 1)) ;
    const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * 0.55 + 40;
    person(x, y, s, t0 + i * step, null, SHIRTS[(i + 2) % 10]); out.push([x, y]);
  }
  return out;
}
function chair(x, y, s, t0) {
  draw(P(`M${x - 110 * s} ${y + 150 * s} L${x - 110 * s} ${y - 40 * s} Q${x - 110 * s} ${y - 80 * s} ${x - 70 * s} ${y - 80 * s} L${x + 70 * s} ${y - 80 * s} Q${x + 110 * s} ${y - 80 * s} ${x + 110 * s} ${y - 40 * s} L${x + 110 * s} ${y + 150 * s}`,
    { fill: '#e7d3c0', fillStyle: 'hachure', hachureGap: 12, strokeWidth: 5 }), t0, 0.5);
  draw(R(x - 140 * s, y + 60 * s, 280 * s, 60 * s, { fill: '#d8bfa6', fillStyle: 'solid', strokeWidth: 4 }), t0 + 0.3, 0.3);
}
function ivPole(x, y, s, t0) {
  draw(L(x, y - 300 * s, x, y + 160 * s, { strokeWidth: 5 }), t0, 0.3);
  draw(L(x - 50 * s, y + 160 * s, x + 50 * s, y + 160 * s, { strokeWidth: 5 }), t0 + 0.2, 0.2);
  draw(P(roundRect(x - 40 * s, y - 280 * s, 80 * s, 110 * s, 18 * s), { fill: '#dceaf7', fillStyle: 'solid', strokeWidth: 3.5 }), t0 + 0.3, 0.3);
}

const SCENES = [
  { dur: 5.0, build(lang) {
      write(T("James didn't beat\ncancer alone.", 'James no venció\nel cáncer solo.')[lang], 540, 480, { size: 116, t0: 0.1, d: 1.4 });
      write(T('A true story about prayer, family,\nand never feeling forgotten.', 'Una historia real de oración, familia\ny de nunca sentirse olvidado.')[lang], 540, 720, { size: 60, color: BLUE, t0: 1.6 });
      person(540, 1300, 1.8, 0.8, null, JAMES);
      heart(540, 1020, 0.9, 3.2);
  } },
  { dur: 5.8, build(lang) {
      caption(T('Two years ago, James received\na diagnosis that changed everything.', 'Hace dos años, James recibió un\ndiagnóstico que lo cambió todo.'), lang);
      person(540, 1150, 1.7, 0.4, null, JAMES);
      write(T('Cancer.', 'Cáncer.')[lang], 540, 700, { size: 120, color: RED, t0: 1.8, d: 0.8 });
      write(T('The kind of news that makes\nthe world go quiet.', 'La clase de noticia que hace\nque el mundo se quede en silencio.')[lang], 540, 1560, { size: 62, color: '#6b7a83', t0: 3.0, d: 1.4 });
  } },
  { dur: 6.0, build(lang) {
      caption(T('His faith grew because his family\nrefused to let him face it alone.', 'Su fe creció porque su familia\nse negó a dejarlo solo.'), lang);
      person(540, 1000, 1.3, 0.2, null, JAMES);
      write('James', 540, 1220, { size: 54, family: 'Patrick Hand', weight: 400, t0: 0.6, d: 0.3 });
      const pts = [[170, 760], [910, 760], [140, 1380], [400, 1500], [680, 1500], [940, 1380]];
      const who = T(['Wife', 'Son', 'Daughter', 'Son', 'Daughter', 'Son'], ['Esposa', 'Hijo', 'Hija', 'Hijo', 'Hija', 'Hijo'])[lang];
      pts.forEach(([x, y], k) => {
        person(x, y, 0.85, 1.0 + k * 0.25, null, SHIRTS[(k + 2) % 10]);
        write(who[k], x, y + 140, { size: 44, family: 'Patrick Hand', weight: 400, t0: 1.3 + k * 0.25, d: 0.3 });
        const tr = group(); heart(0, 0, 0.35, 0, tr);
        dashedArc(x, y - 60, 540, 840, 0.12 * (k % 2 ? 1 : -1), 2.6 + k * 0.2, 0.8, k % 2 ? SAND : RED, null, tr);
      });
  } },
  { dur: 5.8, build(lang) {
      caption(T('His sons and daughters made\na decision together:', 'Sus hijos e hijas tomaron\nuna decisión juntos:'), lang);
      const w = T(['We will fast.', 'We will pray.', 'We will believe God\nfor a miracle.'], ['Vamos a ayunar.', 'Vamos a orar.', 'Vamos a creerle a Dios\npor un milagro.'])[lang];
      write(w[0], 540, 640, { size: 96, color: SAND, t0: 0.8 });
      write(w[1], 540, 860, { size: 96, color: BLUE, t0: 1.7 });
      write(w[2], 540, 1120, { size: 96, color: GREEN, t0: 2.6 });
      hands(540, 1480, 1.6, 3.6);
      write(T('Every single day.', 'Cada día.')[lang], 540, 1700, { size: 70, t0: 4.2 });
  } },
  { dur: 4.4, app: { clip: 'crews', st: { en: 3.6, es: 3.8 } }, build(lang) {
      appFrame(T('They came together in\none family prayer crew.', 'Se unieron en un\ngrupo de oración familiar.'), lang);
  } },
  { dur: 6.6, build(lang) {
      caption(T('Before every chemotherapy session,\nJames\'s phone lit up.', 'Antes de cada sesión de quimioterapia,\nel teléfono de James se iluminaba.'), lang);
      chair(380, 1300, 1.3, 0.2);
      person(380, 1190, 1.15, 0.5, null, JAMES);
      ivPole(160, 1180, 1.0, 0.7);
      phone(700, 1120, 240, 420, 1.0); bell(820, 1260, 1.1, 1.4);
      const n = T(['Your daughter is praying for you', 'Your son is praying for you', 'Your wife is praying for you'],
                  ['Tu hija está orando por ti', 'Tu hijo está orando por ti', 'Tu esposa está orando por ti'])[lang];
      [560, 720, 880].forEach((y, k) => {
        const w = Math.min(820, n[k].length * 21 + 90);
        bubble(540, y, w, 100, n[k], 1.8 + k * 0.9, { size: 44, fill: '#dceaf7' });
      });
  } },
  { dur: 4.2, app: { clip: 'notifications', st: { en: 6.3, es: 6.4 } }, build(lang) {
      appFrame(T('"We are praying for you\nright now."', '"Estamos orando por ti\nen este momento."'), lang);
  } },
  { dur: 6.4, build(lang) {
      caption(T('For an entire year, through\nevery treatment, every hard morning…', 'Durante todo un año, en cada\ntratamiento, cada mañana difícil…'), lang);
      const m = T(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'])[lang];
      m.forEach((lab, k) => {
        const x = 150 + (k % 4) * 260, y = 560 + Math.floor(k / 4) * 330;
        draw(R(x - 110, y, 220, 270, { fill: '#ffffff', fillStyle: 'solid', strokeWidth: 3.5 }), 0.3 + k * 0.06, 0.3);
        draw(R(x - 110, y, 220, 60, { fill: '#f6e3cf', fillStyle: 'solid', strokeWidth: 3.5 }), 0.4 + k * 0.06, 0.2);
        write(lab, x, y + 32, { size: 40, family: 'Patrick Hand', weight: 400, t0: 0.5 + k * 0.06, d: 0.2 });
        heart(x, y + 170, 0.75, 1.4 + k * 0.25, null, k % 3 === 1 ? SAND : RED);
      });
      write(T('…and every moment of uncertainty.', '…y cada momento de incertidumbre.')[lang], 540, 1600, { size: 66, t0: 4.4 });
  } },
  { dur: 4.6, app: { clip: 'followup', st: { en: 35.2, es: 30.8 } }, build(lang) {
      appFrame(T('His family showed up. Not just\nin the room. In prayer.', 'Su familia estuvo ahí. No solo\nen el cuarto. En oración.'), lang);
  } },
  { dur: 5.0, build(lang) {
      const w = T(['Consistently.', 'Intentionally.', 'Together.'], ['Con constancia.', 'Con intención.', 'Juntos.'])[lang];
      w.forEach((s, k) => write(s, 540, 560 + k * 230, { size: 110, color: [BLUE, SAND, GREEN][k], t0: 0.3 + k * 0.9 }));
      person(540, 1450, 1.0, 2.4, null, JAMES);
      [[300, 1460], [780, 1460], [200, 1300], [880, 1300]].forEach(([x, y], k) => person(x, y, 0.8, 2.6 + k * 0.15, null, SHIRTS[(k + 3) % 10]));
      heart(540, 1230, 0.7, 3.6);
  } },
  { dur: 6.4, build(lang) {
      caption(T('By the grace of God…', 'Por la gracia de Dios…'), lang);
      person(540, 1050, 1.8, 0.4, null, JAMES);
      write(T('James is\ncancer free today.', 'James hoy está\nlibre de cáncer.')[lang], 540, 1480, { size: 110, color: GREEN, t0: 1.6, d: 1.4 });
      check(800, 760, 2.0, 3.0);
      [[220, 620], [880, 560], [180, 1000], [920, 1080], [540, 560]].forEach(([x, y], k) => heart(x, y, 0.55, 3.2 + k * 0.2, null, k % 2 ? SAND : RED));
  } },
  { dur: 4.4, app: { clip: 'remember', st: { en: 11.1, es: 11.1 } }, build(lang) {
      appFrame(T('Answered prayers become\ntestimonies to remember.', 'Las oraciones contestadas se\nvuelven testimonios para recordar.'), lang);
  } },
  { dur: 6.4, build(lang) {
      write(T('Never let someone you love\nfeel forgotten.', 'Nunca dejes que alguien que amas\nse sienta olvidado.')[lang], 540, 520, { size: 88, t0: 0.2, d: 1.6 });
      person(540, 1050, 1.1, 0.8, null, JAMES);
      [[260, 1000], [820, 1000], [360, 1220], [720, 1220]].forEach(([x, y], k) => person(x, y, 0.8, 1.1 + k * 0.15, null, SHIRTS[(k + 2) % 10]));
      heart(540, 820, 0.7, 2.0);
      write(T('Pray together with PrayCrew', 'Oren juntos con PrayCrew')[lang], 540, 1520, { size: 84, color: BLUE, t0: 3.0 });
      draw(P('M210 1590 C420 1610 660 1580 870 1595', { stroke: BLUE, strokeWidth: 5 }), 4.0, 0.4);
  } },
];
function buildScene(i, lang) { newScene(); SCENES[i].build(lang); setTime(0); return { dur: SCENES[i].dur, app: SCENES[i].app || null }; }
function sceneCount() { return SCENES.length; }
