/* PC²BS 2027 — interactions (no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Header state, scroll progress, active nav ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset;
      header.classList.toggle("scrolled", y > 40);
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  function closeNav() {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) secObs.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(sibs, 6) * 70 + "ms";
          el.classList.add("in");
          revObs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  function formatNum(n) { return n.toLocaleString("en-IN"); }
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var isYear = target > 1800 && target < 2100;
    var start = isYear ? target - 60 : 0;
    var dur = 1400, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(start + (target - start) * eased);
      el.textContent = (isYear ? String(v) : formatNum(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cObs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Countdown to 07 Jan 2027 (IST) ---------- */
  var cd = document.getElementById("countdown");
  if (cd) {
    var eventTime = new Date("2027-01-07T09:00:00+05:30").getTime();
    var parts = {
      days: cd.querySelector('[data-cd="days"]'),
      hours: cd.querySelector('[data-cd="hours"]'),
      mins: cd.querySelector('[data-cd="mins"]'),
      secs: cd.querySelector('[data-cd="secs"]')
    };
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var timer;
    var tick = function () {
      var diff = eventTime - Date.now();
      if (diff <= 0) { cd.classList.add("done"); clearInterval(timer); return; }
      var s = Math.floor(diff / 1000);
      parts.days.textContent = Math.floor(s / 86400);
      parts.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      parts.mins.textContent = pad(Math.floor((s % 3600) / 60));
      parts.secs.textContent = pad(s % 60);
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Custom cursor + magnetic buttons + tilt cards (desktop only) ---------- */
  var mouse = { x: -9999, y: -9999 };
  if (finePointer && !reduceMotion) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    var ringPos = { x: 0, y: 0 };
    var cursorActive = false, cursorRaf = null;

    function cursorLoop() {
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      dot.style.transform = "translate3d(" + mouse.x + "px," + mouse.y + "px,0)";
      ring.style.transform = "translate3d(" + ringPos.x + "px," + ringPos.y + "px,0)";
      if (Math.abs(mouse.x - ringPos.x) > 0.1 || Math.abs(mouse.y - ringPos.y) > 0.1) {
        cursorRaf = requestAnimationFrame(cursorLoop);
      } else {
        cursorRaf = null;
      }
    }
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!cursorActive) {
        cursorActive = true; ringPos.x = mouse.x; ringPos.y = mouse.y;
        document.body.classList.add("has-cursor");
      }
      if (!cursorRaf) cursorRaf = requestAnimationFrame(cursorLoop);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("has-cursor"); cursorActive = false; });

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest("a, button, .module, .speaker, .fee, .chips li")) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest("a, button, .module, .speaker, .fee, .chips li")) ring.classList.remove("is-hover");
    });

    // Magnetic buttons
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.setProperty("--bx", x.toFixed(1) + "px");
        btn.style.setProperty("--by", y.toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--bx", "0px");
        btn.style.setProperty("--by", "0px");
      });
    });

    // Tilt + spotlight on module cards
    document.querySelectorAll(".tilt").forEach(function (card) {
      var raf = null, ev = null;
      card.addEventListener("mousemove", function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (ev.clientX - r.left) / r.width;
          var py = (ev.clientY - r.top) / r.height;
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          card.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * 6).toFixed(2) + "deg) rotateY(" + ((px - 0.5) * 8).toFixed(2) + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseleave", function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = "";
      });
    });
  }

  /* ---------- Hero particle network ---------- */
  var canvas = document.getElementById("particles");
  var hero = document.getElementById("hero");
  var glow = document.querySelector(".hero-glow");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, particles = [], running = false, visible = true, rafId = null;
    var heroMouse = { x: -9999, y: -9999, active: false };
    var LINK = 130, MOUSE_R = 170;
    var colors = ["255,255,255", "236,200,156", "127,211,242", "224,72,92"];

    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(Math.min(95, Math.max(32, (W * H) / 16000)));
      if (W < 680) target = Math.min(target, 42);
      while (particles.length < target) particles.push(make(Math.random() * W, Math.random() * H));
      if (particles.length > target) particles.length = target;
    }
    function make(x, y, burst) {
      var a = Math.random() * Math.PI * 2;
      var sp = burst ? 1.5 + Math.random() * 2.5 : 0.15 + Math.random() * 0.35;
      return {
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 1 + Math.random() * 2.2,
        c: colors[Math.random() < 0.6 ? 0 : (1 + Math.floor(Math.random() * 3))],
        life: burst ? 1 : -1
      };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d2, n = particles.length;
      for (i = n - 1; i >= 0; i--) {
        p = particles[i];
        if (heroMouse.active) {
          dx = p.x - heroMouse.x; dy = p.y - heroMouse.y; d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_R * MOUSE_R && d2 > 0.01) {
            var d = Math.sqrt(d2), f = (1 - d / MOUSE_R) * 0.6;
            p.x += (dx / d) * f; p.y += (dy / d) * f;
          }
        }
        p.x += p.vx; p.y += p.vy;
        if (p.life > 0) {
          p.vx *= 0.96; p.vy *= 0.96; p.life -= 0.012;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
        } else {
          if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
        }
      }
      n = particles.length;
      ctx.lineWidth = 1;
      for (i = 0; i < n; i++) {
        p = particles[i];
        for (j = i + 1; j < n; j++) {
          q = particles[j];
          dx = p.x - q.x; if (dx > LINK || dx < -LINK) continue;
          dy = p.y - q.y; if (dy > LINK || dy < -LINK) continue;
          d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = "rgba(160,190,255," + (0.22 * (1 - Math.sqrt(d2) / LINK)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (heroMouse.active) {
          dx = p.x - heroMouse.x; dy = p.y - heroMouse.y; d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_R * MOUSE_R) {
            ctx.strokeStyle = "rgba(236,200,156," + (0.45 * (1 - Math.sqrt(d2) / MOUSE_R)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(heroMouse.x, heroMouse.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < n; i++) {
        p = particles[i];
        var alpha = p.life > 0 ? p.life : 0.85;
        ctx.fillStyle = "rgba(" + p.c + "," + alpha + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !document.hidden) { running = true; rafId = requestAnimationFrame(frame); } }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

    size();
    var resizeT;
    window.addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(size, 150); }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(hero);
    }

    var glowRaf = null;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      heroMouse.x = e.clientX - r.left; heroMouse.y = e.clientY - r.top; heroMouse.active = true;
      if (glow && !glowRaf) {
        glowRaf = requestAnimationFrame(function () {
          glow.style.transform = "translate3d(" + (heroMouse.x - 260) + "px," + (heroMouse.y - 260) + "px,0)";
          glowRaf = null;
        });
      }
    }, { passive: true });
    hero.addEventListener("mouseleave", function () { heroMouse.active = false; });
    hero.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      for (var k = 0; k < 14 && particles.length < 160; k++) particles.push(make(x, y, true));
    });
    start();
  }
})();
