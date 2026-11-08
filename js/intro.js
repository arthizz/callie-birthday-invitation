/* ==========================================================================
   intro.js — gift box open sequence and replay
   Timeline (ms):  0 bow loosens → 750 lid lifts → 1250 glow + sparkle burst
                   → 1650 card rises → 3600 reveal → 4700 main screen is live
   ========================================================================== */
(function () {
  "use strict";
  var cfg = window.INVITE_CONFIG || {};
  var intro = document.getElementById("intro");
  var gift = document.getElementById("giftBtn");
  var main = document.getElementById("invitation");
  var body = document.body;
  var canvas = document.getElementById("introSparkles");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var sparkles = new window.Sparkles(canvas, { count: 30, burstCount: 90 });
  sparkles.start();

  var state = "idle"; // idle | opening | open
  var timers = [];
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function openGift() {
    if (state !== "idle") return;
    state = "opening";
    intro.classList.add("is-opening");

    // This tap is the user gesture that allows audio.
    if (cfg.musicStartsOnOpen !== false && window.Music) window.Music.start();

    var k = reduce ? 0.15 : 1;
    intro.classList.add("is-loosening");
    at(750 * k, function () { intro.classList.add("is-lifting"); });
    at(1250 * k, function () {
      intro.classList.add("is-glowing");
      var r = gift.getBoundingClientRect();
      sparkles.burst(r.left + r.width / 2, r.top + r.height * 0.4);
    });
    at(1650 * k, function () { intro.classList.add("is-rising"); });
    at(3600 * k, function () {
      intro.classList.add("is-revealing");
      body.classList.add("is-open");
      body.classList.remove("is-locked");
      document.dispatchEvent(new CustomEvent("invite:opened"));
    });
    at(4700 * k, function () {
      state = "open";
      intro.hidden = true;
      sparkles.halt();
      try { main.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    });
  }

  function replay() {
    clearTimers();
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent("invite:replay"));
    body.classList.remove("is-open");
    body.classList.add("is-locked");
    intro.hidden = false;
    intro.classList.remove("is-opening", "is-loosening", "is-lifting", "is-glowing", "is-rising", "is-revealing");
    void intro.offsetWidth; // restart CSS transitions cleanly
    state = "idle";
    sparkles.resize();
    sparkles.start();
    try { gift.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  gift.addEventListener("click", openGift);
  window.addEventListener("resize", function () { if (state === "idle") sparkles.resize(); });

  window.Intro = { open: openGift, replay: replay };
})();
