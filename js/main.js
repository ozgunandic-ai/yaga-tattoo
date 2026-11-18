import { TATTOOS } from "./tattoos.js";
import { mountLens } from "./gallery-lens.js";

// ---------- ayarlar ----------
const FRAME_COUNT = 277;            // 1–73 bulutlar/şato · 74–145 kapı/koridor · 146–277 salon/dövme odası
const params = new URLSearchParams(location.search);
const FIXED_U = params.has("u") ? parseFloat(params.get("u")) : null; // test: ?u=0.5
const mobile = window.matchMedia("(max-width: 767px)").matches;
const DIR = mobile ? "frames/m" : "frames/d";
const src = (i) => `${DIR}/${String(i + 1).padStart(4, "0")}.jpg`;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------- kareleri yükle (önce seyrek, sonra sık: kaba kaydırma hemen çalışır) ----------
const frames = new Array(FRAME_COUNT);
const loader = document.getElementById("loader");
let loaded = 0;
const order = [];
const seen = new Set();
for (const step of [24, 8, 4, 2, 1])
  for (let i = 0; i < FRAME_COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
if (!seen.has(FRAME_COUNT - 1)) order.push(FRAME_COUNT - 1);

let next = 0;
function loadNext() {
  if (next >= order.length) return;
  const i = order[next++];
  const img = new Image();
  img.decoding = "async";
  img.onload = img.onerror = () => {
    if (img.naturalWidth) frames[i] = img;
    loaded++;
    loader.style.transform = `scaleX(${loaded / order.length})`;
    if (loaded === order.length) loader.style.opacity = 0;
    needsDraw = true;
    loadNext();
  };
  img.src = src(i);
}
for (let k = 0; k < 6; k++) loadNext(); // 6 paralel bağlantı

// ---------- çizim ----------
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
let needsDraw = true, drawn = -1;

function nearest(i) {
  for (let d = 0; d < FRAME_COUNT; d++) {
    if (frames[i - d]) return frames[i - d];
    if (frames[i + d]) return frames[i + d];
  }
  return null;
}
function draw(i) {
  const img = nearest(i);
  if (!img) return;
  const cw = canvas.width, ch = canvas.height;
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.imageSmoothingQuality = "high";
  needsDraw = true;
}
window.addEventListener("resize", resize); resize();

// ---------- kaydırma ----------
const journey = document.getElementById("journey");
const beats = [...document.querySelectorAll(".beat")];
const smoke = document.getElementById("smoke");
const hint = document.getElementById("hint");
let target = 0, cur = FIXED_U ?? 0;
function readScroll() {
  const r = journey.getBoundingClientRect();
  target = clamp(-r.top / (r.height - window.innerHeight));
}
window.addEventListener("scroll", readScroll, { passive: true }); readScroll();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function tick() {
  if (FIXED_U === null) cur += (target - cur) * (reduce ? 1 : 0.12);
  const u = clamp(cur);
  const idx = Math.round(u * (FRAME_COUNT - 1));
  if (idx !== drawn || needsDraw) { draw(idx); drawn = idx; needsDraw = false; }

  for (const b of beats) {
    const a = +b.dataset.in, z = +b.dataset.out, f = 0.025;
    const fin = a === 0 ? 1 : smooth(a, a + f, u);
    const o = z >= 1 ? fin : Math.min(fin, 1 - smooth(z - f, z, u));
    b.style.opacity = o; b.style.transform = `translateY(${(1 - o) * 24}px)`;
    b.style.pointerEvents = o > 0.5 ? "auto" : "none";
  }
  const sm = smooth(0.95, 1, u);
  smoke.style.opacity = sm; smoke.style.transform = `translateY(${(1 - sm) * 40}%)`;
  hint.style.opacity = 1 - smooth(0.01, 0.04, u);
  requestAnimationFrame(tick);
}
tick();

// ---------- galeri ----------
mountLens(document.getElementById("gallery-lens"), TATTOOS);

// kara bulut dokusu (canvas'ta üretilir)
function cloudCanvas(size, seed, color) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const x = size * (0.22 + r() * 0.56), y = size * (0.3 + r() * 0.42), rad = size * (0.1 + r() * 0.2);
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${color},0.55)`); grd.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  return c;
}
const dark = cloudCanvas(512, 21, "70,66,78").toDataURL();
document.querySelectorAll(".smoke-layer").forEach((el) => (el.style.backgroundImage = `url(${dark})`));
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.2 });
document.querySelectorAll(".card, .reveal").forEach((el) => io.observe(el));
const parallax = [...document.querySelectorAll("[data-speed]")];
window.addEventListener("scroll", () => {
  for (const el of parallax) { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(0, ${r.top * +el.dataset.speed}px, 0)`; }
}, { passive: true });
if (params.has("nojourney")) journey.style.display = "none";
if (params.has("focus")) document.querySelectorAll("#journey, .storm, .contact").forEach((el) => (el.style.display = "none"));
