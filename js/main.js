/* ================= FRENCH RIOT — OCTOBER 17 ================= */
(function(){
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid on scroll + active link ---------- */
  const head = document.getElementById('head');
  const links = [...document.querySelectorAll('nav a')];
  const onScroll = () => head.classList.toggle('solid', scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'about', 'info'].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- Reveal sections on scroll ---------- */
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); reveal.unobserve(e.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

  /* ---------- Countdown ---------- */
  const TARGET = new Date('2026-10-17T00:00:00+02:00');
  const pad = n => String(n).padStart(2, '0');
  const units = { d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
                  m: document.getElementById('cd-m'), s: document.getElementById('cd-s') };
  const kicker = document.getElementById('kicker');
  const prev = {};
  function tick(){
    const diff = Math.max(0, TARGET - Date.now()), t = Math.floor(diff / 1000);
    const vals = { d: pad(Math.floor(t / 86400)), h: pad(Math.floor(t % 86400 / 3600)),
                   m: pad(Math.floor(t % 3600 / 60)), s: pad(t % 60) };
    for (const k in vals) {
      if (vals[k] !== prev[k]) {
        units[k].textContent = vals[k];
        if (!reduce) { units[k].classList.remove('tick'); void units[k].offsetWidth; units[k].classList.add('tick'); }
        prev[k] = vals[k];
      }
    }
    kicker.textContent = diff === 0 ? 'Today is the day' : 'Next demonstration';
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Contract address: 1-click copy ---------- */
  const caBtn = document.getElementById('ca');
  const CA = caBtn.dataset.ca;
  caBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(CA); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = CA;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const addr = caBtn.querySelector('.ca-addr');
    const label = addr.textContent;
    caBtn.classList.add('copied');
    addr.textContent = 'Copied!';
    setTimeout(() => { caBtn.classList.remove('copied'); addr.textContent = label; }, 1600);
  });

  /* ---------- TV static sound (Web Audio, no file needed) ---------- */
  let audioCtx = null, noiseBuf = null;
  function ensureAudio(){
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }
  addEventListener('pointerdown', ensureAudio);
  function playStatic(){
    if (!audioCtx || audioCtx.state !== 'running') return;
    const t = audioCtx.currentTime;
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = .8;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(6000, t + .45);
    filter.frequency.exponentialRampToValueAtTime(900, t + .95);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(.25, t + .06);
    gain.gain.setValueAtTime(.25, t + .7);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .95);
    src.connect(filter).connect(gain).connect(audioCtx.destination);
    src.start(t);
    src.stop(t + 1);
  }

  /* ---------- State machine: uprising -> fire -> ruins ---------- */
  const STATES = [
    { src: 'assets/soulevement.png', pos: 'center 62%', caption: 'The people rise up' },
    { src: 'assets/feu.png',         pos: 'center 55%', caption: 'If anger ignites…' },
    { src: 'assets/ruines.png',      pos: 'center 62%', caption: '…what will be left?' }
  ];
  STATES.forEach(s => { const im = new Image(); im.src = s.src; });

  const hero = document.getElementById('home');
  const layers = [document.getElementById('layerA'), document.getElementById('layerB')];
  const cloneR = document.getElementById('cloneR');
  const cloneC = document.getElementById('cloneC');
  const caption = document.getElementById('caption');

  let state = 0, cur = 0, busy = false, heroVisible = true;
  hero.dataset.state = 0;
  layers[0].style.backgroundImage = `url("${STATES[0].src}")`;
  layers[0].style.backgroundPosition = STATES[0].pos;

  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }).observe(hero);

  const GLITCH_MS = reduce ? 0 : 900;
  const AUTO_MS = 5000;

  function advance(){
    if (busy) return;
    busy = true;

    const next = (state + 1) % STATES.length;
    const out = layers[cur], into = layers[1 - cur];
    into.style.backgroundImage = `url("${STATES[next].src}")`;
    into.style.backgroundPosition = STATES[next].pos;

    if (reduce) {
      out.classList.remove('on');
      into.classList.add('on');
      finish();
    } else {
      playStatic();
      cloneR.style.backgroundImage = cloneC.style.backgroundImage = `url("${STATES[state].src}")`;
      cloneR.style.backgroundPosition = cloneC.style.backgroundPosition = STATES[state].pos;
      hero.classList.add('glitching');
      out.classList.add('leave');
      into.classList.add('on', 'enter');
      setTimeout(() => setCaption(next), 460);
      setTimeout(() => {
        hero.classList.remove('glitching');
        out.classList.remove('on', 'leave');
        into.classList.remove('enter');
        finish();
      }, GLITCH_MS + 60);
    }

    function finish(){
      cur = 1 - cur;
      state = next;
      hero.dataset.state = state;
      if (reduce) setCaption(state);
      busy = false;
    }
  }

  /* Manual click advances + resets the auto-play timer */
  let autoTimer = setInterval(autoAdvance, AUTO_MS);
  function autoAdvance(){ if (!busy && heroVisible) advance(); }
  function restartAuto(){ clearInterval(autoTimer); autoTimer = setInterval(autoAdvance, AUTO_MS); }

  hero.addEventListener('click', e => {
    if (e.target.closest('a,button')) return;
    restartAuto();
    advance();
  });

  function setCaption(s){
    caption.textContent = STATES[s].caption;
    if (reduce) return;
    caption.classList.remove('swap');
    void caption.offsetWidth;
    caption.classList.add('swap');
  }

  /* ---------- TV static ---------- */
  (function(){
    const cv = document.getElementById('noise');
    const ctx = cv.getContext('2d');
    const W = 160, H = 90;
    cv.width = W; cv.height = H;
    const img = ctx.createImageData(W, H);
    let frame = 0;
    function draw(){
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    draw();
    if (reduce) return;
    (function loop(){
      frame++;
      if (hero.classList.contains('glitching') || frame % 6 === 0) draw();
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- Embers / particles ---------- */
  (function(){
    if (reduce) return;
    const cv = document.getElementById('embers');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;
    const P = [];
    const PALETTES = [
      ['#3b6cff', '#eef2ff', '#ff4a52'],   // blue white red
      ['#ff9a3c', '#ffce54', '#ff5a2a'],   // embers
      ['#9aa4b5', '#c8cfdb', '#7c8698']    // ashes
    ];
    function resize(){
      const r = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    addEventListener('resize', resize);
    function spawn(){
      const pal = PALETTES[state];
      P.push({
        x: Math.random() * W,
        y: H + 10,
        vx: (Math.random() - .5) * .5,
        vy: -(.35 + Math.random() * (state === 1 ? 1.6 : .9)),
        r: .8 + Math.random() * 2.2,
        t: 0,
        sp: .003 + Math.random() * .006,
        ph: Math.random() * 6.28,
        c: pal[Math.random() * pal.length | 0]
      });
    }
    function loop(){
      ctx.clearRect(0, 0, W, H);
      const rate = state === 1 ? .9 : .45;
      if (P.length < 130 && Math.random() < rate) spawn();
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.t += p.sp;
        p.x += p.vx + Math.sin(p.t * 30 + p.ph) * .5;
        p.y += p.vy;
        if (p.t >= 1 || p.y < -12) { P.splice(i, 1); continue; }
        const a = Math.min(1, p.t * 8) * Math.pow(1 - p.t, 1.1) * (state === 1 ? .9 : .6);
        ctx.globalAlpha = a * .3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fillStyle = p.c; ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (heroVisible) requestAnimationFrame(loop);
    }
    new IntersectionObserver(es => {
      const was = heroVisible;
      if (es[0].isIntersecting && !was) loop();
    }).observe(hero);
    loop();
  })();
})();
