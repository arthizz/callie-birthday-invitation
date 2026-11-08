/* ==========================================================================
   music.js — optional background music. NEVER autoplays: the first call to
   Music.start() must come from a tap/click (the gift tap does this).
   - If INVITE_CONFIG.musicSrc is set, that audio file is looped.
   - Otherwise a gentle music-box lullaby is synthesised with Web Audio
     (no audio file needed; the melody is a public-domain nursery tune).
   ========================================================================== */
(function () {
  "use strict";
  var cfg = window.INVITE_CONFIG || {};
  var btn = document.getElementById("musicBtn");
  var on = false;

  // --- synthesised music box ---
  var ctx, master, timer, nextTime = 0, idx = 0;
  var N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25 };
  var q = 0.78; // seconds per beat
  var tune = [];
  function phrase(names, lastLong) {
    names.split(" ").forEach(function (n, i, a) { tune.push([N[n], lastLong && i === a.length - 1 ? 2 : 1]); });
  }
  // G G D D E E D(long) | C C B B A A G(long) | D D C C B B A(long) ×2 | repeat start
  phrase("G4 G4 D5 D5 E5 E5 D5", true);
  phrase("C5 C5 B4 B4 A4 A4 G4", true);
  phrase("D5 D5 C5 C5 B4 B4 A4", true);
  phrase("D5 D5 C5 C5 B4 B4 A4", true);
  phrase("G4 G4 D5 D5 E5 E5 D5", true);
  phrase("C5 C5 B4 B4 A4 A4 G4", true);

  function note(freq, when, beats) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.type = "sine"; o2.type = "triangle";
    o1.frequency.value = freq; o2.frequency.value = freq * 2;
    var o2g = ctx.createGain(); o2g.gain.value = 0.18;
    var dur = Math.min(2.2, beats * q * 1.9);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.5, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o1.connect(g); o2.connect(o2g); o2g.connect(g); g.connect(master);
    o1.start(when); o2.start(when); o1.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
  }

  function tick() {
    while (nextTime < ctx.currentTime + 1.4) {
      var n = tune[idx];
      note(n[0], nextTime, n[1]);
      nextTime += n[1] * q;
      idx++;
      if (idx >= tune.length) { idx = 0; nextTime += 1.6; }
    }
    timer = setTimeout(tick, 250);
  }

  function setupCtx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    // gentle echo "room"
    var delay = ctx.createDelay(1); delay.delayTime.value = 0.32;
    var fb = ctx.createGain(); fb.gain.value = 0.3;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(ctx.destination);
    return true;
  }

  function startSynth() {
    if (!ctx && !setupCtx()) return false;
    if (ctx.state === "suspended") ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.4);
    nextTime = ctx.currentTime + 0.15; idx = 0;
    clearTimeout(timer); tick();
    return true;
  }
  function stopSynth() {
    if (!ctx) return;
    clearTimeout(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  }

  // --- optional audio file ---
  var audio;
  function startFile() {
    if (!audio) { audio = new Audio(cfg.musicSrc); audio.loop = true; audio.volume = 0.55; }
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setState(false); });
    return true;
  }
  function stopFile() { if (audio) audio.pause(); }

  function setState(v) {
    on = v;
    if (btn) {
      btn.setAttribute("aria-pressed", String(v));
      btn.setAttribute("aria-label", v ? "Turn music off" : "Turn music on");
    }
  }

  var Music = {
    start: function () {
      if (on) return;
      var ok = cfg.musicSrc ? startFile() : startSynth();
      setState(!!ok);
    },
    stop: function () {
      if (!on) return;
      if (cfg.musicSrc) stopFile(); else stopSynth();
      setState(false);
    },
    toggle: function () { on ? Music.stop() : Music.start(); },
    get isOn() { return on; }
  };
  window.Music = Music;

  if (btn) btn.addEventListener("click", Music.toggle);
  // Be polite: silence when the tab is hidden, resume when back (if it was on)
  var wasOn = false;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { wasOn = on; if (on) { if (cfg.musicSrc) stopFile(); else stopSynth(); } }
    else if (wasOn && on) { if (cfg.musicSrc) startFile(); else { nextTime = ctx.currentTime + 0.1; master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.3); tick(); } }
  });
})();
