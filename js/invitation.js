/* ==========================================================================
   invitation.js — fills in your details from config.js and powers the
   countdown, scroll animations, gallery, calendar, location and RSVP form.
   ========================================================================== */
(function () {
  "use strict";
  var cfg = window.INVITE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- toast */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  }

  /* --------------------------------------------------- event date & time */
  var eventDate = new Date(cfg.eventDate);
  var validDate = !isNaN(eventDate.getTime());
  var tz = cfg.timeZone || "Asia/Manila";

  function fmtDate() {
    if (cfg.dateDisplay) return cfg.dateDisplay;
    if (!validDate) return "[BIRTHDAY DATE]";
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(eventDate);
  }
  function fmtTime() {
    if (cfg.timeDisplay) return cfg.timeDisplay;
    if (!validDate) return "[BIRTHDAY TIME]";
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(eventDate);
  }

  /* ----------------------------------------------------- bind the config */
  var values = {
    childName: cfg.childName, message: cfg.message, venue: cfg.venue, address: cfg.address,
    rsvpDeadline: cfg.rsvpDeadline, contactName: cfg.contactName, contactNumber: cfg.contactNumber,
    hostNames: cfg.hostNames, dateText: fmtDate(), timeText: fmtTime()
  };
  $$("[data-bind]").forEach(function (el) {
    var v = values[el.getAttribute("data-bind")];
    if (v) el.textContent = v;
  });
  if (cfg.childName && cfg.childName.charAt(0) !== "[") {
    document.title = "Two Sweet! — " + cfg.childName + "'s 2nd Birthday";
  }

  // Location button
  if (cfg.mapsUrl) $("#mapBtn").setAttribute("href", cfg.mapsUrl);

  // Tap-to-call / text
  if (cfg.contactPhoneLink) {
    var num = cfg.contactPhoneLink.replace(/[^\d+]/g, "");
    $("#callBtn").setAttribute("href", "tel:" + num);
    $("#smsBtn").setAttribute("href", "sms:" + num);
    $("#contactActions").hidden = false;
  }

  // Photos (with a safe fallback so nothing ever shows as broken)
  var FALLBACK = "assets/images/child-portrait.svg";
  var portrait = $("#portraitImg");
  if (cfg.photo) portrait.src = cfg.photo;
  portrait.addEventListener("error", function () { if (portrait.getAttribute("src") !== FALLBACK) portrait.src = FALLBACK; });

  /* -------------------------------------------------------------- gallery */
  var galleryGrid = $("#galleryGrid");
  var photos = Array.isArray(cfg.gallery) ? cfg.gallery : [];
  if (!photos.length) {
    $("#gallery").hidden = true;
  } else {
    photos.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gallery__item";
      b.setAttribute("aria-label", "View photo: " + (p.alt || "gallery photo"));
      var img = document.createElement("img");
      img.src = p.src; img.alt = p.alt || ""; img.loading = "lazy"; img.decoding = "async";
      img.addEventListener("error", function () { img.src = FALLBACK; });
      b.appendChild(img);
      b.addEventListener("click", function () { openLightbox(img.src, img.alt); });
      galleryGrid.appendChild(b);
    });
  }
  var lb = $("#lightbox"), lbImg = $("#lbImg");
  function openLightbox(src, alt) {
    lbImg.src = src; lbImg.alt = alt || "";
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
  }
  function closeLightbox() { if (lb.close) lb.close(); else lb.removeAttribute("open"); }
  $("#lbClose").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLightbox(); });

  /* ------------------------------------------------------------ countdown */
  var cd = { d: $("#cdDays"), h: $("#cdHours"), m: $("#cdMins"), s: $("#cdSecs") };
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function tick() {
    if (!validDate) return;
    var diff = eventDate.getTime() - Date.now();
    if (diff <= 0) {
      $("#cdGrid").hidden = true; $("#cdDone").hidden = false;
      return;
    }
    $("#cdGrid").hidden = false; $("#cdDone").hidden = true;
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    cd.d.textContent = d < 100 ? pad(d) : String(d);
    cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------------------------------------------- add to calendar */
  $("#calBtn").addEventListener("click", function () {
    if (!validDate) { toast("Please set the event date first."); return; }
    var end = new Date(eventDate.getTime() + (cfg.durationHours || 3) * 3600 * 1000);
    var stamp = function (d) { return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; };
    var esc = function (t) { return String(t || "").replace(/\\/g, "\\\\").replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n"); };
    var title = (cfg.childName && cfg.childName.charAt(0) !== "[" ? cfg.childName + "'s " : "") + "2nd Birthday";
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Birthday Invitation//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + stamp(eventDate) + "@birthday-invitation",
      "DTSTAMP:" + stamp(new Date()), "DTSTART:" + stamp(eventDate), "DTEND:" + stamp(end),
      "SUMMARY:" + esc(title),
      "LOCATION:" + esc([cfg.venue, cfg.address].filter(Boolean).join(", ")),
      "DESCRIPTION:" + esc("You're invited! " + (cfg.mapsUrl ? "Map: " + cfg.mapsUrl : "")),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url; a.download = "birthday-invitation.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast("Calendar file ready — open it to save the date.");
  });

  /* ------------------------------------------- scroll-in animations (IO) */
  var io = null;
  function observe() {
    var targets = $$(".reveal, .gallery__item");
    if (!("IntersectionObserver" in window)) { targets.forEach(function (t) { t.classList.add("is-in"); }); return; }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------------------------------------------- soft sparkles on page */
  var mainSparkles = new window.Sparkles($("#mainSparkles"), { count: 14 });

  document.addEventListener("invite:opened", function () {
    requestAnimationFrame(function () { observe(); });
    mainSparkles.resize(); mainSparkles.start();
  });
  document.addEventListener("invite:replay", function () {
    if (io) io.disconnect();
    $$(".reveal, .gallery__item").forEach(function (t) { t.classList.remove("is-in"); });
    mainSparkles.halt();
    closeDialog($("#rsvpDialog"));
    closeLightbox();
  });
  $("#replayBtn").addEventListener("click", function () { if (window.Intro) window.Intro.replay(); });

  /* ------------------------------------------------------------ RSVP form */
  var dlg = $("#rsvpDialog"), form = $("#rsvpForm"), thanks = $("#rsvpThanks");
  var nameInput = $("#rsvpName"), guests = $("#rsvpGuests"), guestsField = $("#guestsField");
  var statusEl = $("#rsvpStatus"), submitBtn = $("#rsvpSubmit");
  var maxGuests = Math.max(1, parseInt(cfg.maxGuests, 10) || 10);
  guests.max = maxGuests;

  function openDialog(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function closeDialog(d) { if (!d) return; if (d.close) { if (d.open) d.close(); } else d.removeAttribute("open"); }

  $("#rsvpBtn").addEventListener("click", function () {
    form.hidden = false; thanks.hidden = true; statusEl.textContent = ""; submitBtn.disabled = false;
    openDialog(dlg);
    setTimeout(function () { nameInput.focus(); }, 60);
  });
  $("#rsvpClose").addEventListener("click", function () { closeDialog(dlg); });
  $("#thanksClose").addEventListener("click", function () { closeDialog(dlg); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(dlg); });

  function clampGuests(v) { v = parseInt(v, 10); if (isNaN(v)) v = 1; return Math.min(maxGuests, Math.max(1, v)); }
  $("#guestsMinus").addEventListener("click", function () { guests.value = clampGuests(guests.value - 1); });
  $("#guestsPlus").addEventListener("click", function () { guests.value = clampGuests(+guests.value + 1); });
  guests.addEventListener("change", function () { guests.value = clampGuests(guests.value); });

  $$('input[name="attending"]').forEach(function (r) {
    r.addEventListener("change", function () { guestsField.hidden = form.attending.value === "no"; });
  });
  nameInput.addEventListener("input", function () { setError(""); });

  function setError(msg) {
    $('[data-error-for="name"]').textContent = msg;
    nameInput.closest(".field").classList.toggle("is-invalid", !!msg);
    nameInput.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (name.length < 2) { setError("Please enter your name."); nameInput.focus(); return; }
    if (form.website.value) { return; } // honeypot tripped: silently ignore bots

    var attending = form.attending.value === "yes";
    var entry = {
      name: name,
      attending: attending ? "yes" : "no",
      guests: attending ? clampGuests(guests.value) : 0,
      message: form.message.value.trim(),
      submittedAt: new Date().toISOString(),
      child: cfg.childName
    };

    submitBtn.disabled = true;
    statusEl.className = "form__status is-info";
    statusEl.textContent = "Sending your RSVP…";

    // Always keep a copy on this device (this is NOT visible to the host).
    try {
      var all = JSON.parse(localStorage.getItem("rsvp-submissions") || "[]");
      all.push(entry);
      localStorage.setItem("rsvp-submissions", JSON.stringify(all));
    } catch (err) { /* storage may be unavailable (private mode) — ignore */ }

    send(entry).then(function () {
      showThanks(entry);
    }).catch(function () {
      submitBtn.disabled = false;
      statusEl.className = "form__status";
      statusEl.textContent = "We couldn't send that just now. Please try again" +
        (cfg.contactNumber && cfg.contactNumber.charAt(0) !== "[" ? ", or message " + cfg.contactName + " at " + cfg.contactNumber + "." : ".");
    });
  });

  function send(entry) {
    if (!cfg.rsvpEndpoint) {
      console.warn("[invitation] RSVP not sent anywhere: set `rsvpEndpoint` in js/config.js (see README.md).");
      return new Promise(function (res) { setTimeout(res, 600); });
    }
    var opts = { method: "POST", body: JSON.stringify(entry) };
    if (cfg.rsvpNoCors) { opts.mode = "no-cors"; opts.headers = { "Content-Type": "text/plain;charset=utf-8" }; }
    else { opts.headers = { "Content-Type": "application/json" }; }
    return fetch(cfg.rsvpEndpoint, opts).then(function (r) {
      if (!cfg.rsvpNoCors && !r.ok) throw new Error("HTTP " + r.status);
    });
  }

  function showThanks(entry) {
    form.hidden = true; thanks.hidden = false;
    var t = $("#thanksText");
    t.textContent = entry.attending === "yes"
      ? "Thank you, " + entry.name + "! We've saved a place for " + entry.guests + (entry.guests === 1 ? " guest" : " guests") + " and can't wait to celebrate with you."
      : "Thank you for letting us know, " + entry.name + ". You will be missed!";
    var old = $(".demo-note", thanks); if (old) old.remove();
    if (!cfg.rsvpEndpoint) {
      var n = document.createElement("small");
      n.className = "demo-note";
      n.style.cssText = "display:block;margin:-.6rem 0 1rem;font-size:.78rem;color:#A5505C";
      n.textContent = "Preview mode: this RSVP was saved only on this device. Set up rsvpEndpoint in js/config.js to receive responses.";
      t.after(n);
    }
    toast(entry.attending === "yes" ? "RSVP sent — see you there!" : "RSVP sent — thank you!");
    form.reset(); guests.value = 1; guestsField.hidden = false; setError("");
  }

  // Reset the dialog's "decline" state if the user closes mid-way
  dlg.addEventListener("close", function () { submitBtn.disabled = false; });
})();
