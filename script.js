/* =====================================================
   SCRIPT.JS
   1) PUT YOUR REAL VIDEO LINKS IN THE TWO LISTS BELOW
   ===================================================== */

/* url can be: a YouTube link, a Google Drive share link,
   an .mp4 file (e.g. "assets/my-video.mp4"), or any other link.
   thumb = a picture shown on the card (put it in the assets folder). */
var VIDEO_EDITING = [
  { title: "Video 1 title", tag: "Instagram Reel",  url: "", thumb: "assets/p1.jpg" },
  { title: "Video 2 title", tag: "YouTube edit",    url: "", thumb: "assets/p2.jpg" },
  { title: "Video 3 title", tag: "Short film",      url: "", thumb: "assets/p4.jpg" }
];

var VIDEOGRAPHY = [
  { title: "Video 4 title", tag: "Cinematic travel", url: "", thumb: "assets/p3.jpg" }
];

var ANIMATION = [
  /* Add animation projects here using the same fields as the lists above. */
];

/* words that type out under "Portfolio" on the home screen */
var TYPED_WORDS = ["Cuts that keep people watching.", "Colour that sets the mood.", "Stories worth sharing."];

/* =====================================================
   2) Code below makes everything work. Safe to leave.
   ===================================================== */

/* ----- one-time side-scrolling runner intro ----- */
var gameIntro = document.getElementById("game-intro");
var runnerCanvas = document.getElementById("runner-canvas");
var runnerContext = runnerCanvas.getContext("2d");
var gameMessage = document.getElementById("game-message");
var gameStatus = document.getElementById("game-status");
var gameJump = document.getElementById("game-jump");
var gameSkip = document.getElementById("game-skip");
var runner = { active: false, phase: "playing", width: 0, height: 0, dpr: 1, scale: 1,
  playerX: 0, playerW: 0, playerH: 0, groundY: 0, speed: 0, jumpHeight: 0, velocityY: 0,
  elapsed: 0, lastFrame: 0, camera: 0, obstacles: [], finishX: 0, phaseTime: 0, landTimer: 0 };
var gameTimers = [];
var introFinished = false;

function later(fn, delay) { gameTimers.push(setTimeout(fn, delay)); }
function finishGameIntro() {
  if (introFinished) return;
  introFinished = true;
  runner.active = false;
  gameTimers.forEach(clearTimeout);
  try { sessionStorage.setItem("kapil-portfolio-runner-seen", "yes"); } catch (e) {}
  gameIntro.classList.add("leaving");
  gameIntro.setAttribute("aria-hidden", "true");
  later(function () {
    gameIntro.style.display = "none";
    document.body.classList.remove("runner-active");
    document.body.classList.add("ready");
    startTyping();
  }, 700);
}
function announceGame(text) { gameStatus.textContent = text; }
function resizeRunner() {
  var rect = runnerCanvas.getBoundingClientRect();
  var oldX = runner.playerX;
  runner.width = rect.width;
  runner.height = rect.height;
  runner.dpr = Math.min(window.devicePixelRatio || 1, 2);
  runnerCanvas.width = Math.round(runner.width * runner.dpr);
  runnerCanvas.height = Math.round(runner.height * runner.dpr);
  runnerContext.setTransform(runner.dpr, 0, 0, runner.dpr, 0, 0);
  runnerContext.imageSmoothingEnabled = false;
  runner.scale = Math.max(.72, Math.min(1.08, runner.width / 900, runner.height / 620));
  runner.playerW = 50 * runner.scale;
  runner.playerH = 64 * runner.scale;
  runner.playerX = Math.max(42 * runner.scale, runner.width * .18);
  runner.groundY = runner.height - 76 * runner.scale;
  runner.speed = 370 * runner.scale;
  if (oldX && runner.obstacles.length) {
    var shift = runner.playerX - oldX;
    runner.obstacles.forEach(function (obstacle) { obstacle.x += shift; });
    runner.finishX += shift;
  }
}
function createRunnerCourse() {
  var firstX = runner.playerX + runner.playerW + runner.speed * 1.5;
  var gap = runner.speed * 2.18;
  runner.obstacles = [
    { number: "3", x: firstX, passed: false, announced: false },
    { number: "2", x: firstX + gap, passed: false, announced: false },
    { number: "1", x: firstX + gap * 2, passed: false, announced: false }
  ];
  runner.finishX = firstX + gap * 2 + runner.speed * 1.95;
}
function jumpRunner() {
  if (!runner.active || runner.phase !== "playing" || runner.jumpHeight > 0) return;
  runner.velocityY = -735 * runner.scale;
  announceGame("Jump!");
}
function gameOver() {
  if (runner.phase !== "playing") return;
  runner.phase = "crashed";
  runner.phaseTime = 0;
  gameMessage.textContent = "GAME OVER!";
  announceGame("Game over. Returning to the portfolio.");
  later(finishGameIntro, 1250);
}
function celebrateRunner() {
  if (runner.phase !== "playing") return;
  runner.phase = "won";
  runner.phaseTime = 0;
  gameMessage.textContent = "FINISH!";
  gameIntro.classList.add("cinematic-out");
  announceGame("You crossed the finish line. Welcome to the portfolio.");
  later(finishGameIntro, 1050);
}
function drawRunnerBackground(ctx) {
  var w = runner.width, h = runner.height, s = runner.scale;
  var sky = ctx.createLinearGradient(0, 0, 0, runner.groundY);
  sky.addColorStop(0, "#0d0b0a"); sky.addColorStop(.58, "#171311"); sky.addColorStop(1, "#0d0b0a");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  var glow = ctx.createRadialGradient(runner.playerX + runner.playerW * .5, runner.groundY - 100 * s, 4, runner.playerX + runner.playerW * .5, runner.groundY - 100 * s, w * .48);
  glow.addColorStop(0, "rgba(185,148,76,.15)"); glow.addColorStop(.42, "rgba(185,148,76,.045)"); glow.addColorStop(1, "rgba(13,11,10,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, runner.groundY);
  var flareX = (runner.elapsed * 28) % (w + 360) - 180;
  var flare = ctx.createLinearGradient(flareX, 0, flareX + 280 * s, 0);
  flare.addColorStop(0, "rgba(232,207,122,0)"); flare.addColorStop(.5, "rgba(232,207,122,.035)"); flare.addColorStop(1, "rgba(232,207,122,0)");
  ctx.fillStyle = flare; ctx.fillRect(0, runner.groundY * .18, w, runner.groundY * .56);
  for (var i = 0; i < 34; i++) {
    var dustX = ((i * 83 - runner.camera * (.08 + (i % 3) * .025)) % (w + 60) + (w + 60)) % (w + 60) - 30;
    var dustY = runner.groundY * (.18 + (i * 37 % 57) / 100);
    var alpha = .08 + (Math.sin(runner.elapsed * 1.7 + i) + 1) * .055;
    ctx.fillStyle = "rgba(232,207,122," + alpha + ")";
    ctx.fillRect(dustX, dustY, (i % 3 ? 1 : 2) * s, (i % 4 ? 1 : 2) * s);
  }
  var floor = ctx.createLinearGradient(0, runner.groundY, 0, h);
  floor.addColorStop(0, "#2c2622"); floor.addColorStop(.13, "#171311"); floor.addColorStop(1, "#0d0b0a");
  ctx.fillStyle = floor; ctx.fillRect(0, runner.groundY, w, h - runner.groundY);
  ctx.fillStyle = "rgba(232,207,122,.72)"; ctx.fillRect(0, runner.groundY - 2 * s, w, 2 * s);
  var tick = 42 * s, offset = -(runner.camera % tick);
  for (var x = offset; x < w + tick; x += tick) {
    var major = Math.round((x - offset) / tick) % 4 === 0;
    ctx.fillStyle = major ? "rgba(232,207,122,.55)" : "rgba(167,157,144,.25)";
    ctx.fillRect(x, runner.groundY + 5 * s, 1 * s, (major ? 10 : 5) * s);
    ctx.fillRect(x + 13 * s, runner.groundY + 29 * s, 12 * s, 8 * s);
    ctx.strokeStyle = "rgba(185,148,76,.42)";
    ctx.strokeRect(x + 13 * s, runner.groundY + 29 * s, 12 * s, 8 * s);
  }
}
function drawSpikeObstacle(ctx, obstacle) {
  var s = runner.scale, x = obstacle.x, ground = runner.groundY;
  var width = 62 * s, spikeH = 37 * s, baseH = 20 * s;
  ctx.save(); ctx.shadowColor = "rgba(232,207,122,.3)"; ctx.shadowBlur = 14 * s;
  ctx.fillStyle = "#e8cf7a";
  for (var i = 0; i < 3; i++) {
    var sx = x + (i * 20 + 3) * s;
    ctx.beginPath(); ctx.moveTo(sx, ground - baseH);
    ctx.lineTo(sx + 9 * s, ground - baseH - spikeH);
    ctx.lineTo(sx + 18 * s, ground - baseH); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = "#0d0b0a"; ctx.fillRect(x, ground - baseH, width, baseH);
  ctx.strokeStyle = "#b9944c"; ctx.lineWidth = 2 * s; ctx.strokeRect(x + s, ground - baseH + s, width - 2 * s, baseH - 2 * s);
  ctx.fillStyle = "rgba(232,207,122,.28)"; ctx.fillRect(x + 5 * s, ground - baseH + 4 * s, 3 * s, baseH - 8 * s);
  ctx.fillStyle = "#f2ece0"; ctx.font = "600 " + (15 * s) + "px " + "'Playfair Display', Georgia, serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(obstacle.number, x + width / 2, ground - baseH / 2 + s);
}
function drawFinishLine(ctx) {
  var s = runner.scale, x = runner.finishX, ground = runner.groundY;
  ctx.fillStyle = "#e8cf7a"; ctx.fillRect(x, ground - 112 * s, 3 * s, 112 * s);
  var cell = 10 * s;
  for (var row = 0; row < 5; row++) for (var col = 0; col < 4; col++) {
    ctx.fillStyle = (row + col) % 2 ? "#2c2622" : "#e8cf7a";
    ctx.fillRect(x + 7 * s + col * cell, ground - 112 * s + row * cell, cell, cell);
  }
  ctx.fillStyle = "#f2ece0"; ctx.font = "600 " + (10 * s) + "px 'Quicksand', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText("FINISH", x + 27 * s, ground - 116 * s);
}
function pixel(ctx, x, y, width, height, color) {
  ctx.fillStyle = color; ctx.fillRect(x, y, width, height);
}
function drawRunnerCharacter(ctx, timestamp) {
  var s = runner.scale, unit = runner.playerH / 20;
  var x = runner.playerX, y = runner.groundY - runner.playerH - runner.jumpHeight;
  var frame = Math.floor(runner.elapsed * 12) % 2;
  ctx.save();
  if (runner.phase === "crashed") {
    var fall = Math.min(runner.phaseTime / .55, 1);
    ctx.translate(x + runner.playerW / 2, y + runner.playerH / 2 + fall * 16 * s);
    ctx.rotate(fall * 1.25); ctx.globalAlpha = Math.max(.25, 1 - fall * .6);
    x = -runner.playerW / 2; y = -runner.playerH / 2;
  }
  if (runner.landTimer > 0 && runner.phase === "playing") {
    var squash = Math.min(runner.landTimer / .13, 1);
    ctx.translate(x, runner.groundY);
    ctx.scale(1 + .07 * squash, 1 - .12 * squash);
    ctx.translate(-x, -runner.groundY);
  }
  var u = unit;
  /* legs and shoes keep cycling while the player runs or jumps */
  if (frame === 0) {
    pixel(ctx, x + 4*u, y + 15*u, 4*u, 4*u, "#171311");
    pixel(ctx, x + 2*u, y + 18*u, 4*u, 2*u, "#a79d90");
    pixel(ctx, x + 9*u, y + 15*u, 4*u, 3*u, "#171311");
    pixel(ctx, x + 10*u, y + 18*u, 4*u, 2*u, "#a79d90");
  } else {
    pixel(ctx, x + 6*u, y + 15*u, 4*u, 3*u, "#171311");
    pixel(ctx, x + 6*u, y + 18*u, 4*u, 2*u, "#a79d90");
    pixel(ctx, x + 10*u, y + 15*u, 3*u, 4*u, "#171311");
    pixel(ctx, x + 9*u, y + 18*u, 4*u, 2*u, "#a79d90");
  }
  pixel(ctx, x + 4*u, y + 4*u, 8*u, 5*u, "#b79a7e");
  pixel(ctx, x + 3*u, y + 5*u, 2*u, 3*u, "#b79a7e");
  pixel(ctx, x + 11*u, y + 5*u, 2*u, 3*u, "#b79a7e");
  /* dark hair, small gold headphone cups, and a low profile headset band */
  pixel(ctx, x + 4*u, y + 3*u, 9*u, 2*u, "#171311");
  pixel(ctx, x + 5*u, y + 2*u, 7*u, 1*u, "#171311");
  pixel(ctx, x + 5*u, y + 1*u, 7*u, 1*u, "#2c2622");
  pixel(ctx, x + 3*u, y + 4*u, 1*u, 4*u, "#b9944c");
  pixel(ctx, x + 12*u, y + 4*u, 1*u, 4*u, "#b9944c");
  pixel(ctx, x + 9*u, y + 6*u, 1*u, 1*u, "#171311");
  pixel(ctx, x + 6*u, y + 8*u, 4*u, 1*u, "#5a4034");
  /* charcoal editor jacket with warm-metal piping */
  pixel(ctx, x + 4*u, y + 9*u, 8*u, 2*u, "#2c2622");
  pixel(ctx, x + 3*u, y + 10*u, 2*u, 2*u, "#2c2622");
  pixel(ctx, x + 11*u, y + 10*u, 2*u, 2*u, "#2c2622");
  pixel(ctx, x + 4*u, y + 11*u, 8*u, 5*u, "#2c2622");
  pixel(ctx, x + 3*u, y + 12*u, 2*u, 3*u, "#2c2622");
  pixel(ctx, x + 11*u, y + 12*u, 2*u, 3*u, "#2c2622");
  pixel(ctx, x + 5*u, y + 10*u, 1*u, 5*u, "#b9944c");
  pixel(ctx, x + 6*u, y + 11*u, 1*u, 2*u, "#e8cf7a");
  /* miniature gold-edged camera rig on the chest */
  pixel(ctx, x + 8*u, y + 12*u, 3*u, 3*u, "#b9944c");
  pixel(ctx, x + 9*u, y + 13*u, 1*u, 1*u, "#0d0b0a");
  pixel(ctx, x + 10*u, y + 14*u, 1*u, 1*u, "#e8cf7a");
  /* opposite jacket sleeves and warm neutral hands swing with each stride */
  var swing = frame ? 2 : 0;
  pixel(ctx, x + (2+swing)*u, y + 9*u, 2*u, 3*u, "#2c2622");
  pixel(ctx, x + (1+swing)*u, y + 11*u, 2*u, 2*u, "#b79a7e");
  pixel(ctx, x + (11-swing)*u, y + 9*u, 2*u, 3*u, "#2c2622");
  pixel(ctx, x + (13-swing)*u, y + 11*u, 2*u, 2*u, "#b79a7e");
  ctx.restore();
}
function drawRunner(timestamp) {
  var ctx = runnerContext;
  ctx.clearRect(0, 0, runner.width, runner.height);
  drawRunnerBackground(ctx);
  runner.obstacles.forEach(function (obstacle) { if (obstacle.x < runner.width + 100) drawSpikeObstacle(ctx, obstacle); });
  if (runner.obstacles.every(function (obstacle) { return obstacle.passed; }) && runner.finishX < runner.width + 100) drawFinishLine(ctx);
  drawRunnerCharacter(ctx, timestamp);
  if (runner.phase === "won") {
    var colors = ["#e8cf7a", "#b9944c", "#f2ece0", "#a79d90", "#8c4241"];
    for (var i = 0; i < 28; i++) {
      var rise = (runner.phaseTime * 180 + i * 29) % 190;
      var confettiX = runner.playerX + ((i * 47) % 250 - 110) * runner.scale;
      var confettiY = runner.groundY - 16 * runner.scale - rise * runner.scale;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(confettiX, confettiY, 5 * runner.scale, 7 * runner.scale);
    }
  }
}
function updateRunner(timestamp) {
  if (!runner.active) return;
  if (!runner.lastFrame) runner.lastFrame = timestamp;
  var dt = Math.min((timestamp - runner.lastFrame) / 1000, .04);
  runner.lastFrame = timestamp;
  runner.elapsed += dt;
  runner.phaseTime += dt;
  if (runner.phase === "playing") {
    runner.camera += runner.speed * dt;
    runner.finishX -= runner.speed * dt;
    runner.obstacles.forEach(function (obstacle) {
      obstacle.x -= runner.speed * dt;
      var distance = obstacle.x - (runner.playerX + runner.playerW);
      if (!obstacle.announced && distance < runner.speed * .9) {
        obstacle.announced = true;
        announceGame("Spike " + obstacle.number + " approaching. Press jump to clear it.");
      }
      if (!obstacle.passed && distance < 0 && obstacle.x + 62 * runner.scale > runner.playerX + 8 * runner.scale) {
        var spikeHeight = 58 * runner.scale;
        if (runner.jumpHeight < spikeHeight) gameOver();
      }
      if (obstacle.x + 62 * runner.scale < runner.playerX) obstacle.passed = true;
    });
    if (runner.jumpHeight > 0 || runner.velocityY < 0) {
      runner.velocityY += 1900 * runner.scale * dt;
      runner.jumpHeight -= runner.velocityY * dt;
      if (runner.jumpHeight <= 0) { runner.jumpHeight = 0; runner.velocityY = 0; runner.landTimer = .13; }
    } else runner.landTimer = Math.max(0, runner.landTimer - dt);
    if (runner.obstacles.every(function (obstacle) { return obstacle.passed; }) && runner.finishX < runner.playerX + runner.playerW) {
      celebrateRunner();
    }
  }
  drawRunner(timestamp);
  if (runner.phase === "crashed") {
    /* Keep the track moving behind the short collision effect. */
    runner.camera += runner.speed * dt * .4;
    runner.obstacles.forEach(function (obstacle) { obstacle.x -= runner.speed * dt * .4; });
    runner.finishX -= runner.speed * dt * .4;
  }
  if (runner.active) window.requestAnimationFrame(updateRunner);
}
function startRunnerGame() {
  resizeRunner();
  createRunnerCourse();
  runner.active = true;
  runner.phase = "playing";
  runner.lastFrame = 0;
  announceGame("Run! Jump over the numbered spikes in order: 3, 2, then 1.");
  try { gameJump.focus({ preventScroll: true }); } catch (e) { gameJump.focus(); }
  window.requestAnimationFrame(updateRunner);
}
function startGameIntro() {
  document.body.classList.add("runner-active");
  runnerCanvas = document.getElementById("runner-canvas");
  startRunnerGame();
}
window.addEventListener("resize", function () { if (runner.active) resizeRunner(); });
gameJump.addEventListener("click", jumpRunner);
gameSkip.addEventListener("click", finishGameIntro);
document.addEventListener("keydown", function (e) {
  if (runner.active && e.key === "Tab") {
    if (e.shiftKey && document.activeElement === gameJump) {
      e.preventDefault(); gameSkip.focus();
    } else if (!e.shiftKey && document.activeElement === gameSkip) {
      e.preventDefault(); gameJump.focus();
    }
  }
  if (runner.active && document.activeElement !== gameSkip && (e.code === "Space" || e.code === "ArrowUp")) {
    e.preventDefault();
    if (runner.phase === "playing") jumpRunner();
  }
});

var introSeen = false;
try { introSeen = sessionStorage.getItem("kapil-portfolio-runner-seen") === "yes"; } catch (e) {}
if (introSeen) {
  gameIntro.style.display = "none";
  gameIntro.setAttribute("aria-hidden", "true");
  document.body.classList.add("ready");
  window.setTimeout(startTyping, 0);
} else {
  try { sessionStorage.setItem("kapil-portfolio-runner-seen", "yes"); } catch (e) {}
  startGameIntro();
}

/* ----- split "Portfolio" into letters so they animate one by one ----- */
var title = document.getElementById("hero-title");
var text = title.textContent;
title.textContent = "";
text.split("").forEach(function (ch, i) {
  var s = document.createElement("span");
  s.className = "ch";
  s.textContent = ch;
  s.setAttribute("aria-hidden", "true");
  s.style.transitionDelay = (i * 80) + "ms";
  title.appendChild(s);
});

/* ----- typing effect ----- */
var typedEl = document.getElementById("typed");
var started = false;
function startTyping() {
  if (started) return; started = true;
  var w = 0, c = 0, del = false;
  (function tick() {
    var word = TYPED_WORDS[w];
    typedEl.textContent = word.slice(0, c);
    if (!del && c < word.length) { c++; return setTimeout(tick, 55); }
    if (!del) { del = true; return setTimeout(tick, 1600); }
    if (c > 0) { c--; return setTimeout(tick, 25); }
    del = false; w = (w + 1) % TYPED_WORDS.length; setTimeout(tick, 300);
  })();
}

/* The contact slide echoes the hero's typing rhythm without changing the hero. */
var contactTypedEl = document.getElementById("contact-typed");
var contactTypingStarted = false;
function startContactTyping() {
  if (!contactTypedEl || contactTypingStarted) return;
  contactTypingStarted = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    contactTypedEl.textContent = TYPED_WORDS[0];
    return;
  }
  var w = 0, c = 0, deleting = false;
  (function tickContact() {
    var phrase = TYPED_WORDS[w];
    contactTypedEl.textContent = phrase.slice(0, c);
    if (!deleting && c < phrase.length) { c++; return window.setTimeout(tickContact, 55); }
    if (!deleting) { deleting = true; return window.setTimeout(tickContact, 1600); }
    if (c > 0) { c--; return window.setTimeout(tickContact, 25); }
    deleting = false;
    w = (w + 1) % TYPED_WORDS.length;
    window.setTimeout(tickContact, 300);
  })();
}
var contactSection = document.getElementById("contact");
if (contactSection && "IntersectionObserver" in window) {
  var contactTypingObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      startContactTyping();
      contactTypingObserver.disconnect();
    }
  }, { threshold: .35 });
  contactTypingObserver.observe(contactSection);
} else startContactTyping();

/* ----- build the video cards ----- */
function makeCards(listId, list) {
  var grid = document.getElementById(listId);
  list.forEach(function (v) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "card reveal";
    b.innerHTML =
      '<div class="frame"><img alt=""><span class="play"><i>▶</i></span>' +
      (v.url ? "" : '<span class="soon">Real video coming soon</span>') +
      '</div><div class="meta"><b></b><span></span></div>';
    b.querySelector("img").src = v.thumb;
    b.querySelector("b").textContent = v.title;
    b.querySelector(".meta span").textContent = v.tag;
    b.addEventListener("click", function () { openVideo(v); });
    grid.appendChild(b);
  });
  var m = document.createElement("div");
  m.className = "more reveal";
  m.textContent = "More work coming soon";
  grid.appendChild(m);
}
makeCards("grid-editing", VIDEO_EDITING);
makeCards("grid-videography", VIDEOGRAPHY);
makeCards("grid-animation", ANIMATION);

/* ----- work category carousel ----- */
var workModal = document.getElementById("work-modal");
var workCarousel = document.getElementById("work-carousel");
var openWorkButton = document.getElementById("open-work");
var closeWorkButton = document.getElementById("work-close");

function openWork() {
  workModal.hidden = false;
  document.body.classList.add("modal-open");
  closeWorkButton.focus();
}
function closeWork() {
  workModal.hidden = true;
  document.body.classList.remove("modal-open");
  openWorkButton.focus();
}
openWorkButton.addEventListener("click", openWork);
closeWorkButton.addEventListener("click", closeWork);
workModal.addEventListener("click", function (e) {
  if (e.target === workModal) closeWork();
});
document.getElementById("work-prev").addEventListener("click", function () {
  workCarousel.scrollBy({ left: -workCarousel.clientWidth * 0.78, behavior: "smooth" });
});
document.getElementById("work-next").addEventListener("click", function () {
  workCarousel.scrollBy({ left: workCarousel.clientWidth * 0.78, behavior: "smooth" });
});
workCarousel.addEventListener("wheel", function (e) {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    workCarousel.scrollLeft += e.deltaY;
  }
}, { passive: false });
var dragStartX = 0;
var dragScrollLeft = 0;
workCarousel.addEventListener("pointerdown", function (e) {
  if (e.target.closest("a, button")) return;
  dragStartX = e.clientX;
  dragScrollLeft = workCarousel.scrollLeft;
  workCarousel.classList.add("dragging");
  workCarousel.setPointerCapture(e.pointerId);
});
workCarousel.addEventListener("pointermove", function (e) {
  if (!workCarousel.classList.contains("dragging")) return;
  workCarousel.scrollLeft = dragScrollLeft - (e.clientX - dragStartX);
});
function stopCarouselDrag() { workCarousel.classList.remove("dragging"); }
workCarousel.addEventListener("pointerup", stopCarouselDrag);
workCarousel.addEventListener("pointercancel", stopCarouselDrag);
workCarousel.querySelectorAll(".panel-link").forEach(function (link) {
  link.addEventListener("click", function () {
    workModal.hidden = true;
    document.body.classList.remove("modal-open");
  });
});

/* ----- video pop-up ----- */
var player = document.getElementById("player");
var box = document.getElementById("player-box");

function embedFor(url) {
  var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (yt) return '<iframe src="https://www.youtube.com/embed/' + yt[1] + '?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  var dr = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (dr) return '<iframe src="https://drive.google.com/file/d/' + dr[1] + '/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return '<video src="' + url + '" controls autoplay playsinline></video>';
  return null;
}
function openVideo(v) {
  if (!v.url) return;
  var html = embedFor(v.url);
  if (!html) { window.open(v.url, "_blank", "noopener"); return; }   /* Instagram etc. open in a new tab */
  box.innerHTML = html;
  player.hidden = false;
}
function closeVideo() { player.hidden = true; box.innerHTML = ""; }
document.getElementById("close").addEventListener("click", closeVideo);
player.addEventListener("click", function (e) { if (e.target === player) closeVideo(); });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (!workModal.hidden) closeWork();
    closeVideo();
  }
});

/* ----- reversible scroll-driven portfolio transitions ----- */
var scrollHero = document.querySelector(".hero");
var scrollHeroText = document.querySelector(".hero-text");
var scrollHeroBackground = document.querySelector(".gooey-bg");
var scrollItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
var aboutItems = Array.prototype.slice.call(document.querySelectorAll("#about .reveal"));
var scrollSections = Array.prototype.slice.call(document.querySelectorAll(".section.alt"));
var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
var scrollFramePending = false;

function clampProgress(value) { return Math.max(0, Math.min(1, value)); }
function updateScrollProgress() {
  scrollFramePending = false;
  if (reduceMotionQuery.matches) return;

  var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  var heroHeight = scrollHero.offsetHeight || viewportHeight;
  var heroProgress = clampProgress(scrollY / (heroHeight * .82));

  scrollHeroText.style.opacity = (1 - heroProgress).toFixed(3);
  scrollHeroText.style.transform = "translate3d(0," + (-heroProgress * 28).toFixed(1) + "px,0) scale(" + (1 + heroProgress * .34).toFixed(3) + ")";
  scrollHeroText.style.filter = "blur(" + (heroProgress * 5).toFixed(2) + "px)";
  scrollHeroBackground.style.opacity = (.78 * (1 - heroProgress * .82)).toFixed(3);
  scrollHeroBackground.style.transform = "translate3d(0," + (heroProgress * 24).toFixed(1) + "px,0) scale(" + (1 + heroProgress * .08).toFixed(3) + ")";

  var aboutStart = heroHeight * .7;
  scrollItems.forEach(function (item) {
    var progress;
    if (item.closest("#about")) {
      var index = aboutItems.indexOf(item);
      var start = aboutStart + index * viewportHeight * .06;
      progress = clampProgress((scrollY - start) / (viewportHeight * .28));
    } else {
      var rect = item.getBoundingClientRect();
      var entering = clampProgress((viewportHeight * .88 - rect.top) / (viewportHeight * .5));
      var leaving = clampProgress((rect.bottom + viewportHeight * .22) / (viewportHeight * .48));
      progress = Math.min(entering, leaving);
    }
    var isHeading = item.matches("h2");
    item.style.setProperty("--reveal-opacity", progress.toFixed(3));
    if (item.classList.contains("portrait-frame")) {
      item.style.setProperty("--frame-glow", (progress * 22).toFixed(1) + "px");
      item.style.setProperty("--frame-glow-opacity", (progress * .2).toFixed(3));
      return;
    }
    item.style.setProperty("--reveal-y", ((1 - progress) * (isHeading ? 30 : 24)).toFixed(1) + "px");
    item.style.setProperty("--reveal-scale", (isHeading ? .94 + progress * .06 : .975 + progress * .025).toFixed(3));
    item.style.setProperty("--reveal-blur", ((1 - progress) * 2.2).toFixed(2) + "px");
  });

  scrollSections.forEach(function (section) {
    var top = section.getBoundingClientRect().top;
    var parallax = Math.max(-18, Math.min(18, (viewportHeight * .5 - top) * .035));
    section.style.setProperty("--section-parallax", parallax.toFixed(1) + "px");
  });
}
function requestScrollProgress() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateScrollProgress);
}
window.addEventListener("scroll", requestScrollProgress, { passive: true });
window.addEventListener("resize", requestScrollProgress);

/* ----- profile portrait runner: reuse the intro's exact pixel sprite ----- */
(function startPortraitRunner() {
  var canvas = document.getElementById("portrait-runner");
  var frame = canvas && canvas.closest(".portrait-frame");
  var image = frame && frame.querySelector(".portrait");
  if (!canvas || !frame || !image || !window.requestAnimationFrame) return;
  var ctx = canvas.getContext("2d");
  var width = 0, height = 0, dpr = 1, visible = false, raf = 0;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!ctx || reducedMotion) return;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function draw(timestamp) {
    raf = 0;
    if (!visible) return;
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);

    var cycle = (timestamp / 1000) % 5.1;
    var spriteScale = Math.min(.84, Math.max(.58, width / 390));
    var spriteW = 50 * spriteScale, spriteH = 64 * spriteScale;
    var safeRadius = Math.hypot(spriteW * .5, spriteH * .5);
    var anchorX = width - safeRadius - 3;
    var runStartX = Math.max(spriteW * .52, 3);
    var topY = safeRadius + 3;
    var bottomY = height - safeRadius - 3;
    var jumpEndY = Math.max(topY + 12, height * .7);
    var impactY = bottomY;
    var x = anchorX, y = bottomY, angle = 0;
    if (cycle < .55) {
      var run = smooth(cycle / .55);
      x = runStartX + (anchorX - runStartX) * run;
      y += Math.sin(timestamp / 45) * 2;
    } else if (cycle < .9) {
      var jump = (cycle - .55) / .35;
      x = anchorX;
      y = bottomY - (bottomY - jumpEndY) * jump - Math.sin(jump * Math.PI) * Math.min(spriteH * .3, 18);
      angle = -Math.PI * .5 * smooth(jump);
    } else if (cycle < 3) {
      var climb = smooth((cycle - .9) / 2.1);
      x = anchorX;
      y = jumpEndY + (topY - jumpEndY) * climb;
      angle = -Math.PI / 2;
    } else if (cycle < 3.78) {
      var fall = (cycle - 3) / .78;
      x = Math.max(safeRadius + 2, Math.min(width - safeRadius - 2, anchorX + Math.sin(fall * Math.PI) * Math.min(8, width * .035)));
      y = topY + (impactY - topY) * smooth(fall);
      angle = -Math.PI / 2 + 2.75 * smooth(fall);
    } else if (cycle < 4.18) {
      x = anchorX;
      y = impactY;
      angle = 1.18;
    } else if (cycle < 4.62) {
      var getUp = smooth((cycle - 4.18) / .44);
      x = anchorX;
      y = impactY - Math.sin(getUp * Math.PI) * 5;
      angle = 1.18 * (1 - getUp);
    } else {
      x = anchorX;
      y = bottomY + Math.sin(timestamp / 170) * 1.4;
    }

    /* drawRunnerCharacter is the same pixel-art drawing routine used by the intro */
    var keys = ["playerX", "playerW", "playerH", "groundY", "jumpHeight", "scale", "elapsed", "phase", "phaseTime", "landTimer"];
    var previous = keys.map(function (key) { return runner[key]; });
    runner.scale = spriteScale;
    runner.playerW = 50 * spriteScale;
    runner.playerH = 64 * spriteScale;
    runner.playerX = -runner.playerW / 2;
    runner.groundY = height;
    runner.jumpHeight = height - runner.playerH + runner.playerH / 2;
    runner.elapsed = timestamp / 1000;
    runner.phase = "playing";
    runner.phaseTime = 0;
    runner.landTimer = cycle < .55 ? .08 : 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawRunnerCharacter(ctx, timestamp);
    ctx.restore();
    keys.forEach(function (key, index) { runner[key] = previous[index]; });

    /* Tiny dust puffs stay close to the landing point inside the measured image bounds. */
    if (cycle >= 3.78 && cycle < 4.2) {
      var dustAge = (cycle - 3.78) / .42;
      var dustX = anchorX, dustY = Math.min(height - 5, impactY + safeRadius * .58);
      for (var i = 0; i < 7; i++) {
        var direction = i % 2 ? 1 : -1;
        var spread = (Math.floor(i / 2) + 1) * 2.2;
        var px = dustX + direction * spread * dustAge;
        var py = dustY - (i % 3) * 1.5 - dustAge * (5 + (i % 3) * 2);
        if (px < 2 || px > width - 2 || py < 2 || py > height - 2) continue;
        ctx.globalAlpha = (1 - dustAge) * .32;
        ctx.fillStyle = i % 2 ? "#d5c39c" : "#a9d8cc";
        ctx.beginPath();
        ctx.arc(px, py, Math.max(.7, 1.8 * (1 - dustAge)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (visible) raf = window.requestAnimationFrame(draw);
  }
  function setVisible(next) {
    visible = next;
    if (visible && !raf) { resize(); raf = window.requestAnimationFrame(draw); }
    if (!visible && raf) { window.cancelAnimationFrame(raf); raf = 0; }
  }
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      setVisible(entries[0].isIntersecting);
    }, { threshold: .15 });
    observer.observe(frame);
  } else setVisible(true);
  if ("ResizeObserver" in window) {
    var sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(frame);
    sizeObserver.observe(image);
  }
  window.addEventListener("resize", resize, { passive: true });
})();
if (reduceMotionQuery.addEventListener) reduceMotionQuery.addEventListener("change", requestScrollProgress);
else if (reduceMotionQuery.addListener) reduceMotionQuery.addListener(requestScrollProgress);
updateScrollProgress();
