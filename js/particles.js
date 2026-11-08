/* ==========================================================================
   particles.js — soft floating sparkles + a burst effect (canvas, no deps)
   Usage: const s = new Sparkles(canvas, { count: 28 }); s.burst(x, y);
   ========================================================================== */
(function () {
  "use strict";
  var COLORS = ["#C8A875", "#E9D6AE", "#EBC9CB", "#D9A6AD", "#FFFFFF"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function Sparkles(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.opts = Object.assign({ count: 26, burstCount: 70 }, opts || {});
    this.parts = [];
    this.bursts = [];
    this.running = false;
    this.last = 0;
    var self = this;
    this.resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      self.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      self.w = w; self.h = h;
    };
    this.resize();
    window.addEventListener("resize", this.resize);
    for (var i = 0; i < this.opts.count; i++) this.parts.push(this._make(true));
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) self.stop(); else if (self.wanted) self.start();
    });
  }

  Sparkles.prototype._make = function (initial) {
    return {
      x: Math.random() * (this.w || 300),
      y: initial ? Math.random() * (this.h || 600) : (this.h || 600) + 10,
      r: 1.5 + Math.random() * 4.5,
      vy: -(6 + Math.random() * 16),
      vx: (Math.random() - 0.5) * 8,
      ph: Math.random() * 6.28,
      sp: 0.6 + Math.random() * 1.6,
      col: COLORS[(Math.random() * COLORS.length) | 0],
      star: Math.random() > 0.45
    };
  };

  Sparkles.prototype._star = function (x, y, r, rot) {
    var g = this.ctx;
    g.save(); g.translate(x, y); g.rotate(rot);
    g.beginPath();
    g.moveTo(0, -r);
    g.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0);
    g.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
    g.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0);
    g.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r);
    g.fill(); g.restore();
  };

  Sparkles.prototype.burst = function (x, y) {
    if (reduce) return;
    for (var i = 0; i < this.opts.burstCount; i++) {
      var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 260;
      this.bursts.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
        r: 2 + Math.random() * 5, life: 0, max: 1.1 + Math.random() * 1.1,
        col: COLORS[(Math.random() * COLORS.length) | 0], star: Math.random() > 0.35
      });
    }
    this.start();
  };

  Sparkles.prototype._frame = function (t) {
    if (!this.running) return;
    var dt = Math.min(0.05, (t - this.last) / 1000 || 0.016);
    this.last = t;
    var g = this.ctx, i, p;
    g.clearRect(0, 0, this.w, this.h);

    for (i = 0; i < this.parts.length; i++) {
      p = this.parts[i];
      p.ph += dt * p.sp;
      p.y += p.vy * dt * (reduce ? 0 : 1);
      p.x += (p.vx + Math.sin(p.ph) * 10) * dt * (reduce ? 0 : 1);
      if (p.y < -12) { this.parts[i] = this._make(false); p = this.parts[i]; p.x = Math.random() * this.w; }
      var tw = 0.35 + 0.65 * Math.abs(Math.sin(p.ph * 1.5));
      g.globalAlpha = tw * 0.85;
      g.fillStyle = p.col;
      if (p.star) this._star(p.x, p.y, p.r * 1.7, p.ph * 0.4);
      else { g.beginPath(); g.arc(p.x, p.y, p.r * 0.55, 0, 6.283); g.fill(); }
    }

    for (i = this.bursts.length - 1; i >= 0; i--) {
      p = this.bursts[i];
      p.life += dt;
      if (p.life >= p.max) { this.bursts.splice(i, 1); continue; }
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 90 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      g.globalAlpha = 1 - p.life / p.max;
      g.fillStyle = p.col;
      if (p.star) this._star(p.x, p.y, p.r * 1.8, p.life * 3);
      else { g.beginPath(); g.arc(p.x, p.y, p.r * 0.6, 0, 6.283); g.fill(); }
    }
    g.globalAlpha = 1;

    var self = this;
    requestAnimationFrame(function (n) { self._frame(n); });
  };

  Sparkles.prototype.start = function () {
    this.wanted = true;
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    var self = this;
    requestAnimationFrame(function (n) { self._frame(n); });
  };
  Sparkles.prototype.stop = function () { this.running = false; };
  Sparkles.prototype.halt = function () { this.wanted = false; this.running = false; };

  window.Sparkles = Sparkles;
})();
