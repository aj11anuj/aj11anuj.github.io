(function () {
  const c = document.getElementById('scene-metro');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const r = c.getBoundingClientRect();
    W = r.width;
    H = r.height;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, nx: 0, ny: 0, inside: false, clicked: false };
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.nx = (mouse.x / W - 0.5) * 2;
    mouse.ny = (mouse.y / H - 0.5) * 2;
    mouse.inside = true;
  });
  c.addEventListener('mouseleave', () => { mouse.inside = false; });
  c.addEventListener('click', () => { mouse.clicked = true; });

  // Abstract research themes per dibba on hover
  const COACHES = [
    {
      badge: 'DIBBA 01',
      title: 'Cross-Lingual Reasoning',
      line1: 'How meaning & logic hold across',
      line2: 'diverse scripts, tones, and prompts.'
    },
    {
      badge: 'DIBBA 02',
      title: 'Spoken & Cultural Nuance',
      line1: 'Observing native voices, prosody,',
      line2: 'and lived context in the real world.'
    },
    {
      badge: 'DIBBA 03',
      title: 'Social Stance & Vision',
      line1: 'Studying multilingual polarization',
      line2: 'and culturally grounded datasets.'
    }
  ];

  // Starfield
  const stars = Array.from({ length: 52 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.48,
    r: 0.35 + Math.random() * 1.25,
    p: Math.random() * 6.28
  }));

  // 2-Layer Parallax City Skyline
  const farSkyline = Array.from({ length: 18 }, (_, i) => ({
    x: i * 64,
    bw: 34 + ((i * 19) % 28),
    bh: 52 + ((i * 37) % 62),
    spire: i % 4 === 0
  }));

  const nearSkyline = Array.from({ length: 22 }, (_, i) => {
    const bw = 24 + ((i * 17) % 24);
    const bh = 32 + ((i * 29) % 48);
    const wins = [];
    for (let wy = 6; wy < bh - 8; wy += 6) {
      for (let wx = 4; wx < bw - 5; wx += 5) {
        if (((wx * 7 + wy * 11 + i * 3) % 10) > 4) {
          wins.push({ wx, wy, gold: ((wx + wy + i) % 3 === 0) });
        }
      }
    }
    return { x: i * 52, bw, bh, wins };
  });

  // Train geometry — large cut-away coaches with full interior details
  const numCoaches = 3;
  const coachW = 202;
  const coachH = 64;
  const coachGap = 8;
  const trainTotalW = numCoaches * coachW + (numCoaches - 1) * coachGap;

  // Storyboard States:
  // 'arriving' -> 'doors_open' -> 'boarding' -> 'observing' -> 'departing'
  let state = 'arriving';
  let stateTime = 0;
  let trainX = -trainTotalW - 30;
  let trainV = 2.4;
  let bgScroll = 0;
  let doorOpen = 0;       // 0..1
  let anujBoarded = false;
  let anujWalkProg = 0;   // 0..1
  let activeSpeaker = 0;  // 0 = Punjabi (Dibba 1), 1 = Hindi (Dibba 2), 2 = English (Dibba 3)
  let speakerTimer = 0;

  const arcSparks = [];
  let shootStar = { active: false, x: 0, y: 0, vx: 0, vy: 0, a: 0 };

  // Conversational exchanges inside the 3 dibbas (speaker A & listener B reply to each other!)
  const dialogues = [
    {
      coach: 0,
      spkAX: 76,
      spkBX: 100,
      lang: 'Punjabi · ਪੰਜਾਬੀ',
      color: '#fbbf24',
      turns: [
        { who: 'A', word: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ!', sub: 'Greeting · Prosodic warmth' },
        { who: 'B', word: 'ਹਾਂਜੀ ਵੀਰ ਜੀ!', sub: 'Honorific particle "जी"' },
        { who: 'A', word: 'ਕੀ ਹਾਲ ਚਾਲ?', sub: 'Tonal contour & gesture' }
      ]
    },
    {
      coach: 1,
      spkAX: 140,
      spkBX: 164,
      lang: 'Hindi · हिन्दी',
      color: '#38bdf8',
      turns: [
        { who: 'A', word: 'नमस्ते भाई!', sub: 'Colloquial register' },
        { who: 'B', word: 'अरे वाह, सही है!', sub: 'Discourse marker "अरे"' },
        { who: 'A', word: 'मतलब समझो...', sub: 'Pragmatic implicature' }
      ]
    },
    {
      coach: 2,
      spkAX: 66,
      spkBX: 90,
      lang: 'English · Code-Mix',
      color: '#a78bfa',
      turns: [
        { who: 'A', word: 'Wait, seriously?', sub: 'Rising pitch question' },
        { who: 'B', word: 'Yeah, literally!', sub: 'Emphatic stance shift' },
        { who: 'A', word: 'Makes total sense.', sub: 'Shared context nod' }
      ]
    }
  ];

  function spawnPantographSpark(x, y) {
    for (let i = 0; i < 6; i++) {
      arcSparks.push({
        x, y,
        vx: -0.8 + (Math.random() - 0.5) * 1.6,
        vy: -0.4 - Math.random() * 1.1,
        a: 1
      });
    }
  }

  function resetCycle(t) {
    state = 'arriving';
    stateTime = t;
    trainX = -trainTotalW - 20;
    trainV = 2.4;
    doorOpen = 0;
    anujBoarded = false;
    anujWalkProg = 0;
    activeSpeaker = 0;
    speakerTimer = t;
  }

  // Detailed 2D Character Renderer
  function drawPerson(x, footY, opts) {
    const h = opts.h || 29;
    const t = opts.t || 0;
    const breath = Math.sin(t * 0.003 + (opts.seed || 0)) * 0.5;
    const headR = 4.5;
    const headY = footY - h + headR + breath;
    const torsoY = headY + headR + 1;
    const torsoH = h - headR * 2 - 8;

    // Subtle floor shadow under feet
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x, footY, 5.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backpack (if worn)
    if (opts.backpack) {
      const bpDir = (opts.lookX || 1) >= 0 ? -1 : 1;
      ctx.fillStyle = opts.backpackColor || '#0f172a';
      ctx.beginPath();
      ctx.roundRect(x + bpDir * 3.5 - 3, torsoY + 1, 6, torsoH - 2, 2);
      ctx.fill();
    }

    // Legs & Shoes
    ctx.strokeStyle = opts.pants || '#1e293b';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    const stride = opts.stride || 0;
    ctx.beginPath();
    if (opts.seated) {
      ctx.moveTo(x - 1.5, torsoY + torsoH - 2);
      ctx.lineTo(x + 3.5, torsoY + torsoH + 3);
      ctx.lineTo(x + 3.5, footY - 1);
      ctx.moveTo(x + 1.5, torsoY + torsoH - 2);
      ctx.lineTo(x + 6.5, torsoY + torsoH + 3);
      ctx.lineTo(x + 6.5, footY - 1);
    } else {
      ctx.moveTo(x - 1.8, torsoY + torsoH);
      ctx.lineTo(x - 1.8 - stride, footY - 1);
      ctx.moveTo(x + 1.8, torsoY + torsoH);
      ctx.lineTo(x + 1.8 + stride, footY - 1);
    }
    ctx.stroke();

    // Torso / Jacket / Hoodie
    ctx.fillStyle = opts.shirt || '#334155';
    ctx.beginPath();
    ctx.roundRect(x - 5.2, torsoY, 10.4, torsoH, 3.2);
    ctx.fill();

    // Collar / Hoodie detail
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x - 2.5, torsoY, 5, 2);

    // Arm holding overhead grab-strap (for standing commuters minding their own business)
    if (opts.holdStrap) {
      ctx.strokeStyle = opts.shirt || '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 2, torsoY + 2);
      ctx.lineTo(x + 3, headY - 8);
      ctx.stroke();
    }

    // Head
    const look = opts.lookX || 0;
    const nod = opts.speaking ? Math.sin(t * 0.015) * 0.9 : opts.listening ? Math.sin(t * 0.008) * 0.5 : 0;
    ctx.fillStyle = opts.skin || '#d4a373';
    ctx.beginPath();
    ctx.arc(x + look * 0.45, headY + nod, headR, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (tiny directional dot)
    const eyeDir = opts.faceLeft ? -1 : (look < 0 ? -1 : 1);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + look * 0.45 + eyeDir * 2.2, headY + nod - 0.3, 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Turban / Bun
    if (opts.turban) {
      ctx.fillStyle = opts.turbanColor || '#ea580c';
      ctx.beginPath();
      ctx.ellipse(x + look * 0.45, headY + nod - 2.2, headR + 1.4, 3.8, -0.08, Math.PI * 0.82, Math.PI * 2.18);
      ctx.fill();
      // Turban fold line
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 3, headY + nod - 2.5);
      ctx.lineTo(x + 4, headY + nod - 1);
      ctx.stroke();
      // Beard for turbaned speaker
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x + look * 0.45, headY + nod + 1.2, headR - 0.4, 0.15, Math.PI - 0.15);
      ctx.fill();
    } else {
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(x + look * 0.35, headY + nod - 1.2, headR + 0.6, Math.PI * 0.82, Math.PI * 2.18);
      ctx.fill();
      if (opts.isAnuj) {
        // Wavy hair lock on top
        ctx.beginPath();
        ctx.arc(x + look * 0.35 + 1.5, headY + nod - 4.5, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sleeping commuter Zzz (for passenger minding own business)
    if (opts.sleeping) {
      const zProg = (t * 0.0008 + (opts.seed || 0)) % 1;
      ctx.font = '700 7px Inter, sans-serif';
      ctx.fillStyle = `rgba(15, 23, 42, ${(1 - zProg) * 0.55})`;
      ctx.fillText('z', x + 4 + zProg * 4, headY - 4 - zProg * 7);
    }

    // Open book / newspaper for quiet reader passenger
    if (opts.book) {
      const bx = x + (opts.faceLeft ? -7 : 4);
      const by = torsoY + 3;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx, by, 4.5, 5);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(bx, by, 4.5, 5);
    }

    // Smartphone with screen glow for commuters scrolling minding their own business
    if (opts.phone) {
      const phX = x + (opts.faceLeft ? -6.8 : 4.5);
      const phY = torsoY + 3.5;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(phX, phY, 2.6, 4.2);
      const pg = ctx.createRadialGradient(phX + 1, phY, 0.5, phX + 1, phY - 3, 9);
      pg.addColorStop(0, 'rgba(56,189,248,0.32)');
      pg.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(phX + 1, phY - 2, 9, 0, Math.PI * 2); ctx.fill();
    }

    // Anuj's signature Gold Studio Headphones, Field Notebook & Animated Pen
    if (opts.isAnuj) {
      ctx.strokeStyle = '#fcba28';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(x + look * 0.4, headY - 0.5, headR + 1.3, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = '#fcba28';
      ctx.beginPath();
      ctx.arc(x + look * 0.2, headY + 0.6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Field notebook + writing hand
      const nbDir = look >= 0 ? 1 : -1;
      const nbX = x + (nbDir > 0 ? 5.2 : -10.2);
      const nbY = torsoY + 2.5;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(nbX, nbY, 5, 6.2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(nbX, nbY, 5, 6.2);

      // Pen jotting notes in rhythm
      const jot = Math.sin(t * 0.022) * 1.3;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x + nbDir * 3, torsoY + 4);
      ctx.lineTo(nbX + 2.5 + jot, nbY + 3);
      ctx.stroke();
    }

    // Expressive gesturing hand when actively speaking
    if (opts.speaking) {
      const wave = Math.sin(t * 0.014) * 3.2;
      const dir = opts.faceLeft ? -1 : 1;
      ctx.strokeStyle = opts.skin || '#d4a373';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + dir * 3, torsoY + 3.5);
      ctx.lineTo(x + dir * 9, torsoY + 1 + wave);
      ctx.stroke();
    }
  }

  function render(t) {
    if (!W || !H) { requestAnimationFrame(render); return; }
    if (stateTime === 0) { stateTime = t; speakerTimer = t; }
    ctx.clearRect(0, 0, W, H);

    const px = mouse.inside ? mouse.nx * 6 : Math.sin(t * 0.0004) * 2.5;
    const waterH = 26;
    const bridgeY = H - waterH - 18;
    const stationCenterX = W * 0.5;
    const stopTrainX = stationCenterX - trainTotalW * 0.5;

    // Click cycles the active observed language speaker
    if (mouse.clicked) {
      mouse.clicked = false;
      activeSpeaker = (activeSpeaker + 1) % 3;
      speakerTimer = t;
    }

    // Rotate active language group every 3.4 seconds while observing
    if (t - speakerTimer > 3400) {
      activeSpeaker = (activeSpeaker + 1) % 3;
      speakerTimer = t;
    }

    // Storyboard State Machine
    if (state === 'arriving') {
      const dist = stopTrainX - trainX;
      if (dist > 3.5) {
        trainV = Math.max(0.25, Math.min(2.6, dist * 0.032));
        trainX += trainV;
      } else {
        trainX = stopTrainX;
        trainV = 0;
        state = 'doors_open';
        stateTime = t;
      }
    } else if (state === 'doors_open') {
      doorOpen = Math.min(1, (t - stateTime) / 600);
      if (doorOpen >= 1 && t - stateTime > 750) {
        state = 'boarding';
        stateTime = t;
      }
    } else if (state === 'boarding') {
      anujWalkProg = Math.min(1, (t - stateTime) / 1150);
      if (anujWalkProg >= 1) {
        anujBoarded = true;
        state = 'observing';
        stateTime = t;
        speakerTimer = t;
        spawnPantographSpark(trainX + coachW + coachGap + coachW * 0.5, bridgeY - coachH - 14);
      }
    } else if (state === 'observing') {
      doorOpen = Math.max(0, 1 - (t - stateTime) / 600);
      if (t - stateTime > 700) {
        const cruiseSpeed = mouse.inside ? 0.35 : 0.95;
        bgScroll += cruiseSpeed;
        trainX = stopTrainX + Math.sin(t * 0.0022) * 3.5;
        if (Math.random() < 0.02) {
          spawnPantographSpark(trainX + coachW + coachGap + coachW * 0.5, bridgeY - coachH - 14);
        }
      }
      if (!mouse.inside && t - stateTime > 14500) {
        state = 'departing';
        stateTime = t;
        trainV = 0.4;
      }
    } else if (state === 'departing') {
      trainV = Math.min(3.5, trainV + 0.065);
      trainX += trainV;
      bgScroll += trainV * 0.5;
      if (trainX > W + 40) {
        resetCycle(t);
      }
    }

    // 1. Night Sky, Stars, Shooting Star & Crescent Moon
    const sky = ctx.createLinearGradient(0, 0, 0, bridgeY);
    sky.addColorStop(0, '#03060d');
    sky.addColorStop(0.55, '#091020');
    sky.addColorStop(1, '#141e36');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(st => {
      const a = 0.22 + 0.58 * (0.5 + 0.5 * Math.sin(t * 0.002 + st.p));
      ctx.fillStyle = `rgba(226,232,240,${a})`;
      ctx.beginPath();
      ctx.arc(st.x * W - px * 0.2, st.y * H, st.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!shootStar.active && Math.random() < 0.003) {
      shootStar = { active: true, x: W * (0.3 + Math.random() * 0.55), y: 14, vx: -4.2, vy: 1.7, a: 1 };
    }
    if (shootStar.active) {
      shootStar.x += shootStar.vx; shootStar.y += shootStar.vy; shootStar.a -= 0.025;
      if (shootStar.a <= 0) shootStar.active = false;
      const sg = ctx.createLinearGradient(shootStar.x, shootStar.y, shootStar.x - shootStar.vx * 7, shootStar.y - shootStar.vy * 7);
      sg.addColorStop(0, `rgba(252,186,40,${shootStar.a})`);
      sg.addColorStop(1, 'rgba(252,186,40,0)');
      ctx.strokeStyle = sg; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(shootStar.x, shootStar.y);
      ctx.lineTo(shootStar.x - shootStar.vx * 7, shootStar.y - shootStar.vy * 7);
      ctx.stroke();
    }

    const moonX = W - 40 - px * 0.3, moonY = 24;
    const mGlow = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 36);
    mGlow.addColorStop(0, 'rgba(252,186,40,0.22)');
    mGlow.addColorStop(1, 'rgba(252,186,40,0)');
    ctx.fillStyle = mGlow;
    ctx.beginPath(); ctx.arc(moonX, moonY, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fcd472';
    ctx.beginPath(); ctx.arc(moonX, moonY, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#050912';
    ctx.beginPath(); ctx.arc(moonX + 3.5, moonY - 2, 7.5, 0, Math.PI * 2); ctx.fill();

    // 2. Two-Layer Parallax City Skyline
    const farTotalW = farSkyline.length * 64;
    farSkyline.forEach(b => {
      const bx = ((b.x - bgScroll * 0.22 - px * 0.35) % farTotalW + farTotalW) % farTotalW - 50;
      const by = bridgeY - b.bh;
      ctx.fillStyle = '#060b16';
      ctx.fillRect(bx, by, b.bw, b.bh);
      if (b.spire) {
        ctx.fillRect(bx + b.bw * 0.5 - 1, by - 9, 2, 9);
        ctx.fillStyle = 'rgba(239,68,68,0.65)';
        ctx.beginPath(); ctx.arc(bx + b.bw * 0.5, by - 10, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    });

    const nearTotalW = nearSkyline.length * 52;
    nearSkyline.forEach(b => {
      const bx = ((b.x - bgScroll * 0.48 - px * 0.55) % nearTotalW + nearTotalW) % nearTotalW - 40;
      const by = bridgeY - b.bh;
      ctx.fillStyle = '#091020';
      ctx.fillRect(bx, by, b.bw, b.bh);
      b.wins.forEach(w => {
        ctx.fillStyle = w.gold ? 'rgba(252,186,40,0.2)' : 'rgba(148,163,184,0.12)';
        ctx.fillRect(bx + w.wx, by + w.wy, 2.5, 3.2);
      });
    });

    // 3. "SCHOLARS RESIDENCE" Architectural Metro Station Platform
    const stationOffset = (state === 'observing' && t - stateTime > 700)
      ? Math.min(W + 380, (t - stateTime - 700) * 0.085)
      : 0;
    const stW = 340;
    const stX = stationCenterX - stW * 0.5 - stationOffset;
    const stTop = bridgeY - 84;

    if (stX + stW > -50) {
      // Station arched glass canopy
      const stG = ctx.createLinearGradient(stX, stTop, stX, bridgeY);
      stG.addColorStop(0, 'rgba(30, 41, 59, 0.85)');
      stG.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
      ctx.fillStyle = stG;
      ctx.strokeStyle = 'rgba(252, 186, 40, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(stX, stTop, stW, 84, [12, 12, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Station architectural steel pillars & roof trusses
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1.2;
      for (let gx = stX + 28; gx < stX + stW - 20; gx += 48) {
        ctx.beginPath(); ctx.moveTo(gx, stTop + 4); ctx.lineTo(gx, bridgeY); ctx.stroke();
      }

      // Warm station lamp cones
      const lampGlow = ctx.createRadialGradient(stX + stW * 0.5, stTop + 14, 8, stX + stW * 0.5, stTop + 34, 150);
      lampGlow.addColorStop(0, 'rgba(252, 186, 40, 0.24)');
      lampGlow.addColorStop(1, 'rgba(252, 186, 40, 0)');
      ctx.fillStyle = lampGlow;
      ctx.fillRect(stX + 4, stTop + 4, stW - 8, 78);

      // Station Main Nameboard: "SCHOLARS RESIDENCE"
      const sbW = 248, sbH = 14;
      const sbX = stX + (stW - sbW) * 0.5, sbY = stTop + 5;
      ctx.fillStyle = '#050811';
      ctx.strokeStyle = '#fcba28';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.roundRect(sbX, sbY, sbW, sbH, 3.5);
      ctx.fill();
      ctx.stroke();

      // Pulsing status dot on station board
      ctx.fillStyle = !anujBoarded ? '#22c55e' : '#fcba28';
      ctx.beginPath();
      ctx.arc(sbX + 10, sbY + sbH * 0.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 7.6px Inter, sans-serif';
      ctx.fillStyle = '#fcba28';
      ctx.textAlign = 'center';
      const stBanner = !anujBoarded
        ? 'SCHOLARS RESIDENCE · ANUJ BOARDING METRO'
        : 'SCHOLARS RESIDENCE';
      ctx.fillText(stBanner, sbX + sbW * 0.5 + 4, sbY + 9.8);
    }

    // Overhead Catenary Wire & Masts
    const wireY = bridgeY - coachH - 14;
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, wireY);
    ctx.lineTo(W, wireY);
    ctx.moveTo(0, wireY - 6);
    ctx.lineTo(W, wireY - 6);
    ctx.stroke();
    for (let m = 0; m < 6; m++) {
      const mx = ((m * 155 - bgScroll * 1.1) % W + W) % W;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx, bridgeY);
      ctx.lineTo(mx, wireY - 8);
      ctx.stroke();
    }

    // 4. Anuj Waiting on "Scholars Residence" Platform & Boarding Dibba 02
    const dibba2DoorX = stopTrainX + (coachW + coachGap) + coachW * 0.5;
    if (!anujBoarded) {
      const waitX = dibba2DoorX - 20;
      const curAnujX = waitX + (dibba2DoorX - waitX) * anujWalkProg;
      const walkStride = state === 'boarding' ? Math.sin(t * 0.022) * 3.8 : 0;

      // Warm golden spotlight around Anuj on platform
      const ag = ctx.createRadialGradient(curAnujX, bridgeY - 18, 2, curAnujX, bridgeY - 18, 28);
      ag.addColorStop(0, 'rgba(252,186,40,0.38)');
      ag.addColorStop(1, 'rgba(252,186,40,0)');
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.arc(curAnujX, bridgeY - 18, 28, 0, Math.PI * 2); ctx.fill();

      drawPerson(curAnujX, bridgeY - 2, {
        h: 30,
        shirt: '#1d4ed8',
        pants: '#0f172a',
        isAnuj: true,
        backpack: true,
        lookX: 1,
        stride: walkStride,
        t
      });

      ctx.font = '700 8px Inter, sans-serif';
      ctx.fillStyle = '#fcba28';
      ctx.textAlign = 'center';
      ctx.fillText(state === 'boarding' ? 'Boarding Dibba 02...' : 'Anuj', curAnujX, bridgeY - 37);
    }

    // 5. Render 3 Large Cut-Away Metro Dibbas (Detailed Interior Architecture)
    let hoveredCoach = null;
    const cy = bridgeY - coachH - 2;
    const floorY = cy + coachH - 5;

    // Inter-coach gangway bellows
    for (let c = 0; c < numCoaches - 1; c++) {
      const gx = trainX + (c + 1) * coachW + c * coachGap;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gx - 1, cy + 6, coachGap + 2, coachH - 10);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let k = 2; k < coachGap; k += 2.5) {
        ctx.beginPath(); ctx.moveTo(gx + k, cy + 6); ctx.lineTo(gx + k, cy + coachH - 4); ctx.stroke();
      }
    }

    for (let c = 0; c < numCoaches; c++) {
      const cx = trainX + c * (coachW + coachGap);
      const isCoachHov = mouse.inside && mouse.x >= cx && mouse.x <= cx + coachW && mouse.y >= cy - 12 && mouse.y <= cy + coachH + 8;
      if (isCoachHov) {
        hoveredCoach = { x: cx + coachW * 0.5, y: cy, info: COACHES[c], index: c };
        activeSpeaker = c;
      }

      // Undercarriage bogies & rotating wheels
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx + 18, cy + coachH - 2, 34, 4);
      ctx.fillRect(cx + coachW - 52, cy + coachH - 2, 34, 4);
      ctx.fillStyle = '#475569';
      [cx + 24, cx + 44, cx + coachW - 44, cx + coachW - 24].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, cy + coachH + 1, 2.8, 0, Math.PI * 2); ctx.fill();
      });

      // Outer Metallic Coach Shell
      const shellG = ctx.createLinearGradient(cx, cy, cx, cy + coachH);
      shellG.addColorStop(0, isCoachHov ? '#64748b' : '#475569');
      shellG.addColorStop(0.16, '#334155');
      shellG.addColorStop(0.86, '#1e293b');
      shellG.addColorStop(1, '#0f172a');
      ctx.fillStyle = shellG;
      ctx.strokeStyle = isCoachHov ? '#fcba28' : 'rgba(252,186,40,0.55)';
      ctx.lineWidth = isCoachHov ? 1.9 : 1.2;

      const radii = c === numCoaches - 1 ? [4, 16, 4, 4] : c === 0 ? [14, 4, 4, 4] : 4;
      ctx.beginPath();
      ctx.roundRect(cx, cy, coachW, coachH, radii);
      ctx.fill();
      ctx.stroke();

      // Middle coach Diamond Pantograph
      if (c === 1) {
        const px = cx + coachW * 0.5;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(px - 12, cy);
        ctx.lineTo(px - 18, cy - 6);
        ctx.lineTo(px, cy - 12);
        ctx.lineTo(px + 18, cy - 6);
        ctx.lineTo(px + 12, cy);
        ctx.moveTo(px - 12, cy - 12);
        ctx.lineTo(px + 12, cy - 12);
        ctx.stroke();
      }

      // Cut-Away Panoramic Interior Cabin
      const inX = cx + 7;
      const inY = cy + 7;
      const inW = coachW - 14;
      const inH = coachH - 14;

      // Warm lit interior wall gradient
      const intG = ctx.createLinearGradient(inX, inY, inX, inY + inH);
      intG.addColorStop(0, '#fef3c7');
      intG.addColorStop(0.4, '#fde68a');
      intG.addColorStop(0.88, '#f59e0b');
      intG.addColorStop(1, '#b45309');
      ctx.fillStyle = intG;
      ctx.beginPath();
      ctx.roundRect(inX, inY, inW, inH, 4);
      ctx.fill();

      // Interior back-wall windows (showing dark night sky passing behind the passengers!)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      [inX + 10, inX + 52, inX + 114, inX + 150].forEach(bwX => {
        ctx.beginPath();
        ctx.roundRect(bwX, inY + 11, 26, 14, 2);
        ctx.fill();
      });

      // Interior LED Route Map Strip above back windows (with glowing station dots!)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(inX + 12, inY + 5.5, inW - 24, 3);
      for (let sd = 0; sd < 7; sd++) {
        const dotX = inX + 20 + sd * ((inW - 40) / 6);
        ctx.fillStyle = sd === 3 ? '#22c55e' : '#fcba28';
        ctx.beginPath(); ctx.arc(dotX, inY + 7, 1, 0, Math.PI * 2); ctx.fill();
      }

      // Overhead grab rail & swaying straps
      ctx.strokeStyle = 'rgba(15,23,42,0.35)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(inX + 6, inY + 9.5);
      ctx.lineTo(inX + inW - 6, inY + 9.5);
      ctx.stroke();
      const strapSway = Math.sin(t * 0.004) * 0.8;
      for (let s = 18; s < inW - 14; s += 20) {
        ctx.beginPath();
        ctx.moveTo(inX + s, inY + 9.5);
        ctx.lineTo(inX + s + strapSway, inY + 14.5);
        ctx.stroke();
        ctx.strokeRect(inX + s - 1.4 + strapSway, inY + 14.5, 2.8, 2.4);
      }

      // Blue Metro Bench Seats on left & right sides of each coach
      ctx.fillStyle = 'rgba(30, 58, 138, 0.55)';
      ctx.fillRect(inX + 5, floorY - 9, 46, 4.5);
      ctx.fillRect(inX + inW - 51, floorY - 9, 46, 4.5);

      // Stainless steel vertical grab poles
      ctx.strokeStyle = 'rgba(15,23,42,0.45)';
      ctx.lineWidth = 1.4;
      [inX + 56, inX + inW - 56].forEach(poleX => {
        ctx.beginPath();
        ctx.moveTo(poleX, inY + 5);
        ctx.lineTo(poleX, floorY);
        ctx.stroke();
      });

      // Exterior Gold & Crimson Metro Ribbon
      ctx.fillStyle = '#fcba28';
      ctx.fillRect(cx + 4, cy + coachH - 6, coachW - 8, 2.2);

      // Turn-taking state for the active conversation in this coach
      const turnIdx = Math.floor(t / 1100) % 3;
      const curTurn = dialogues[c].turns[turnIdx];
      const isThisCoachActive = anujBoarded && activeSpeaker === c;

      // =========================================================
      // PASSENGERS INSIDE EACH DIBBA
      // =========================================================
      if (c === 0) {
        // DIBBA 01:
        // Left bench: 1 commuter sleeping ("z"), 1 scrolling phone
        drawPerson(cx + 22, floorY, { h: 25, seated: true, shirt: '#334155', sleeping: true, seed: 1, t });
        drawPerson(cx + 40, floorY, { h: 25, seated: true, shirt: '#475569', phone: true, faceLeft: true, seed: 2, t });

        // Center: Punjabi Speaker A (turban & beard) + Listener B conversing back & forth
        drawPerson(cx + dialogues[0].spkAX, floorY, {
          h: 30,
          turban: true,
          turbanColor: '#ea580c',
          shirt: '#1e293b',
          speaking: isThisCoachActive && curTurn.who === 'A',
          listening: isThisCoachActive && curTurn.who === 'B',
          t, seed: 3
        });
        drawPerson(cx + dialogues[0].spkBX, floorY, {
          h: 29,
          shirt: '#334155',
          faceLeft: true,
          lookX: -1,
          speaking: isThisCoachActive && curTurn.who === 'B',
          listening: isThisCoachActive && curTurn.who === 'A',
          t, seed: 4
        });

        // Right: 1 standing commuter holding strap, 1 seated reading book
        drawPerson(cx + 140, floorY, { h: 29, shirt: '#475569', holdStrap: true, phone: true, faceLeft: true, seed: 5, t });
        drawPerson(cx + 166, floorY, { h: 25, seated: true, shirt: '#1e293b', book: true, faceLeft: true, seed: 6, t });
      }

      if (c === 1) {
        // DIBBA 02 (Center Coach where Anuj stands & observes):
        // Left bench: quiet commuters minding their own business
        drawPerson(cx + 22, floorY, { h: 25, seated: true, shirt: '#475569', book: true, seed: 7, t });
        drawPerson(cx + 44, floorY, { h: 29, shirt: '#334155', holdStrap: true, phone: true, faceLeft: true, seed: 8, t });

        // Center Doorway: ANUJ observing & jotting notes in his field notebook!
        if (anujBoarded) {
          const anujX = cx + 92;
          const targetLook = activeSpeaker === 0 ? -3.8 : 3.8;

          // Subtle cyan-gold researcher focus aura around Anuj
          const obsGlow = ctx.createRadialGradient(anujX, floorY - 16, 2, anujX, floorY - 16, 24);
          obsGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
          obsGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = obsGlow;
          ctx.beginPath(); ctx.arc(anujX, floorY - 16, 24, 0, Math.PI * 2); ctx.fill();

          drawPerson(anujX, floorY, {
            h: 30,
            shirt: '#1d4ed8',
            pants: '#0f172a',
            isAnuj: true,
            backpack: true,
            lookX: targetLook,
            t, seed: 9
          });

          // Tiny 'ANUJ' pill above his head
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath(); ctx.roundRect(anujX - 13, floorY - 41, 26, 9, 4); ctx.fill();
          ctx.font = '700 6.2px Inter, sans-serif';
          ctx.fillStyle = '#fcba28';
          ctx.textAlign = 'center';
          ctx.fillText('ANUJ', anujX, floorY - 34.3);
        }

        // Right: Hindi Speaker A + Listener B conversing
        drawPerson(cx + dialogues[1].spkAX, floorY, {
          h: 30,
          shirt: '#7c2d12',
          speaking: isThisCoachActive && curTurn.who === 'A',
          listening: isThisCoachActive && curTurn.who === 'B',
          t, seed: 10
        });
        drawPerson(cx + dialogues[1].spkBX, floorY, {
          h: 29,
          shirt: '#1e293b',
          faceLeft: true,
          lookX: -1,
          speaking: isThisCoachActive && curTurn.who === 'B',
          listening: isThisCoachActive && curTurn.who === 'A',
          t, seed: 11
        });
      }

      if (c === 2) {
        // DIBBA 03:
        // Left: quiet seated commuter
        drawPerson(cx + 24, floorY, { h: 25, seated: true, shirt: '#334155', phone: true, seed: 12, t });

        // Center-Left: English Speaker A + Listener B conversing
        drawPerson(cx + dialogues[2].spkAX, floorY, {
          h: 30,
          shirt: '#0f766e',
          speaking: isThisCoachActive && curTurn.who === 'A',
          listening: isThisCoachActive && curTurn.who === 'B',
          t, seed: 13
        });
        drawPerson(cx + dialogues[2].spkBX, floorY, {
          h: 29,
          shirt: '#334155',
          faceLeft: true,
          lookX: -1,
          speaking: isThisCoachActive && curTurn.who === 'B',
          listening: isThisCoachActive && curTurn.who === 'A',
          t, seed: 14
        });

        // Right: 3 commuters minding their own business (holding strap, sleeping, reading phone)
        drawPerson(cx + 132, floorY, { h: 29, shirt: '#475569', holdStrap: true, phone: true, seed: 15, t });
        drawPerson(cx + 154, floorY, { h: 25, seated: true, shirt: '#1e293b', sleeping: true, seed: 16, t });
        drawPerson(cx + 174, floorY, { h: 25, seated: true, shirt: '#334155', phone: true, faceLeft: true, seed: 17, t });
      }

      // Sliding Glass Doors overlay
      const doorCenter = cx + coachW * 0.5;
      const leafW = 12;
      const slide = doorOpen * 11;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(doorCenter - leafW - slide, inY, leafW, inH);
      ctx.strokeRect(doorCenter + slide, inY, leafW, inH);
    }

    // 6. Electric Pantograph Sparks
    for (let i = arcSparks.length - 1; i >= 0; i--) {
      const sp = arcSparks[i];
      sp.x += sp.vx; sp.y += sp.vy; sp.a -= 0.04;
      if (sp.a <= 0) { arcSparks.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(254, 240, 138, ${sp.a})`;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }

    // 7. Pulsating Turn-Taking Speech Waves & Anuj's Live Observation Stream
    if (anujBoarded) {
      const anujWorldX = trainX + (coachW + coachGap) + 92;
      const anujNotebookY = cy + coachH - 22;

      dialogues.forEach((d, idx) => {
        const turnIdx = Math.floor(t / 1100) % d.turns.length;
        const turn = d.turns[turnIdx];
        const spkX = trainX + d.coach * (coachW + coachGap) + (turn.who === 'A' ? d.spkAX : d.spkBX);
        const midPairX = trainX + d.coach * (coachW + coachGap) + (d.spkAX + d.spkBX) * 0.5;
        const spkY = cy + 20;
        const isActive = activeSpeaker === idx;

        if (isActive) {
          // Concentric acoustic voice rings pulsing from the currently speaking person (A or B)
          for (let r = 0; r < 2; r++) {
            const prog = ((t * 0.0018 + r * 0.5) % 1);
            const rad = 5 + prog * 22;
            ctx.strokeStyle = `rgba(15, 23, 42, ${(1 - prog) * 0.6})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(spkX, spkY + 6, rad, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Golden Observation Arc from active speaker into Anuj's Field Notebook
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(spkX, spkY + 4);
          ctx.quadraticCurveTo((spkX + anujWorldX) * 0.5, cy - 16, anujWorldX, anujNotebookY);
          ctx.stroke();
          ctx.setLineDash([]);

          // 2 Semantic Data Packets streaming along the curve into Anuj's notebook
          for (let pk = 0; pk < 2; pk++) {
            const p = ((t * 0.0011 + pk * 0.5) % 1);
            const qx = (1 - p) * (1 - p) * spkX + 2 * (1 - p) * p * ((spkX + anujWorldX) * 0.5) + p * p * anujWorldX;
            const qy = (1 - p) * (1 - p) * (spkY + 4) + 2 * (1 - p) * p * (cy - 16) + p * p * anujNotebookY;
            ctx.fillStyle = d.color;
            ctx.beginPath(); ctx.arc(qx, qy, 2.3, 0, Math.PI * 2); ctx.fill();
          }

          // Floating Dialogue Pill above the conversing pair (shows utterance + linguistic cue + waveform)
          const pulse = 1 + Math.sin(t * 0.008) * 0.03;
          const bw = 138 * pulse, bh = 30;
          const bx = Math.min(W - bw - 6, Math.max(6, midPairX - bw * 0.5));
          const by = cy - 36 + Math.sin(t * 0.005) * 1.5;

          ctx.fillStyle = 'rgba(7, 11, 20, 0.95)';
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 8);
          ctx.fill();
          ctx.stroke();

          // Tail pointing specifically to Speaker A or Speaker B depending on whose turn it is!
          ctx.fillStyle = d.color;
          ctx.beginPath();
          const tailX = Math.min(bx + bw - 10, Math.max(bx + 10, spkX));
          ctx.moveTo(tailX - 4, by + bh);
          ctx.lineTo(tailX + 4, by + bh);
          ctx.lineTo(tailX, by + bh + 5);
          ctx.closePath();
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.font = '700 9.8px Inter, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(turn.word, bx + 9, by + 13);

          ctx.font = '500 8px Inter, sans-serif';
          ctx.fillStyle = d.color;
          ctx.fillText(turn.sub, bx + 9, by + 24);

          // Live voice waveform bars on right side of bubble
          for (let k = 0; k < 4; k++) {
            const barH = 3 + Math.abs(Math.sin(t * 0.018 + k * 1.1)) * 9;
            ctx.fillStyle = d.color;
            ctx.fillRect(bx + bw - 20 + k * 3.3, by + 12 - barH * 0.5, 1.8, barH);
          }
        } else {
          // Muted label above inactive language groups
          ctx.font = '600 7.5px Inter, sans-serif';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
          ctx.textAlign = 'center';
          ctx.fillText(d.lang, midPairX, cy - 7);
        }
      });
    }

    // Front Headlight Beam
    const noseX = trainX + trainTotalW;
    const beam = ctx.createLinearGradient(noseX, 0, noseX + 95, 0);
    beam.addColorStop(0, 'rgba(254,240,138,0.5)');
    beam.addColorStop(1, 'rgba(252,186,40,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(noseX, cy + coachH - 14);
    ctx.lineTo(noseX + 95, cy + 4);
    ctx.lineTo(noseX + 95, cy + coachH + 4);
    ctx.closePath();
    ctx.fill();

    // 8. Viaduct Bridge Deck & Yamuna River Reflection
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, bridgeY, W, 7);
    ctx.fillStyle = 'rgba(252,186,40,0.34)';
    ctx.fillRect(0, bridgeY, W, 1.3);

    for (let p = 0; p < 7; p++) {
      const px = ((p * 130 - bgScroll * 0.9) % W + W) % W;
      ctx.fillStyle = '#0d1424';
      ctx.fillRect(px, bridgeY + 7, 14, H - waterH - (bridgeY + 7));
    }

    const waterY = H - waterH;
    const waterG = ctx.createLinearGradient(0, waterY, 0, H);
    waterG.addColorStop(0, '#070d1a');
    waterG.addColorStop(1, '#03060c');
    ctx.fillStyle = waterG;
    ctx.fillRect(0, waterY, W, waterH);

    for (let c = 0; c < numCoaches; c++) {
      const rcx = trainX + c * (coachW + coachGap);
      for (let rRow = 2; rRow < waterH - 2; rRow += 3.4) {
        const shift = Math.sin(t * 0.008 + rRow + c) * 4;
        const alpha = (1 - rRow / waterH) * 0.25;
        ctx.fillStyle = `rgba(252,186,40,${alpha})`;
        ctx.fillRect(rcx + 12 + shift, waterY + rRow, coachW - 24, 1.6);
      }
    }

    // 9. Hover Abstract Research Theme Card per Dibba
    if (hoveredCoach) {
      const { x, y, info } = hoveredCoach;
      const tw = 228, th = 50;
      const tx = Math.min(W - tw - 8, Math.max(8, x - tw * 0.5));
      const ty = Math.max(4, y - th - 8);

      ctx.fillStyle = 'rgba(7, 11, 20, 0.96)';
      ctx.strokeStyle = '#fcba28';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 7);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '700 8px Inter, sans-serif';
      ctx.fillStyle = 'rgba(252, 186, 40, 0.85)';
      ctx.fillText(info.badge, tx + 10, ty + 14);

      ctx.font = '700 10.8px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(info.title, tx + 58, ty + 14);

      ctx.font = '450 9.5px Inter, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(info.line1, tx + 10, ty + 28);
      ctx.fillText(info.line2, tx + 10, ty + 41);
    }

    ctx.textAlign = 'left';
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
