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

/* words that type out under "Portfolio" on the home screen */
var TYPED_WORDS = ["Cuts that keep people watching.", "Colour that sets the mood.", "Stories worth sharing."];

/* =====================================================
   2) Code below makes everything work. Safe to leave.
   ===================================================== */

/* ----- start page ----- */
var splash = document.getElementById("splash");
var count = document.getElementById("count");
var timers = [];

function endSplash() {
  timers.forEach(clearTimeout);
  splash.classList.add("done");
  document.body.classList.remove("loading");
  setTimeout(function () { document.body.classList.add("ready"); startTyping(); }, 500);
  setTimeout(function () { splash.style.display = "none"; }, 1000);
}
timers.push(setTimeout(function () { count.textContent = "2"; }, 1000));
timers.push(setTimeout(function () { count.textContent = "1"; }, 2000));
timers.push(setTimeout(endSplash, 3600));
document.getElementById("skip").addEventListener("click", endSplash);

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
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideo(); });

/* ----- reveal on scroll ----- */
var items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 90) + "ms"; io.observe(el); });
} else {
  items.forEach(function (el) { el.classList.add("show"); });
}
