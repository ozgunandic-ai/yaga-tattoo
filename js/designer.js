// Tattoo Tasarım: dövmeyi vücut üzerinde dene.
import { TATTOOS, svgDataUrl, svgMarkup } from "./tattoos.js";
import { t, tz, tName, onLang } from "./i18n.js";

// Vücut bölgeleri: x,y = görsel içindeki konum (%), size = görsel genişliğine oranla varsayılan boyut (%),
// rot = uzvun açısı (derece), wrap = kıvrımlı yüzeyde yatay daralma (kol/bacak silindir gibi sarar).
const Z = (name, x, y, size, rot = 0, wrap = 1) => ({ name, x: x / 100, y: y / 100, size: size / 100, rot, wrap });
const ZONES = {
  "f-front": [Z("Göğüs üstü", 50, 18, 30), Z("Karın", 50, 37, 24), Z("Kaburga", 32, 33, 14, -8, 0.85), Z("Kaburga", 68, 33, 14, 8, 0.85),
    Z("Üst kol", 11, 28, 15, 8, 0.75), Z("Ön kol", 7, 43, 14, 5, 0.75), Z("Üst kol", 88, 28, 15, -8, 0.75), Z("Ön kol", 92, 43, 14, -5, 0.75),
    Z("Uyluk", 36, 60, 17, 3, 0.85), Z("Uyluk", 63, 60, 17, -3, 0.85), Z("Kaval", 38, 80, 11, 2, 0.8), Z("Kaval", 61, 80, 11, -2, 0.8)],
  "f-back": [Z("Ense", 50, 17, 16), Z("Sırt", 50, 35, 30), Z("Bel", 50, 41, 26), Z("Arka kol", 16, 30, 15, 8, 0.75), Z("Arka kol", 83, 30, 15, -8, 0.75),
    Z("Ön kol", 11, 44, 14, 5, 0.75), Z("Ön kol", 88, 44, 14, -5, 0.75), Z("Uyluk arkası", 38, 62, 17, 3, 0.85), Z("Uyluk arkası", 62, 62, 17, -3, 0.85),
    Z("Baldır", 37, 78, 13, 2, 0.8), Z("Baldır", 60, 78, 13, -2, 0.8)],
  "f-right": [Z("Omuz", 32, 22, 14, -5, 0.8), Z("Üst kol", 30, 30, 18, -12, 0.75), Z("Ön kol", 46, 46, 16, -22, 0.75), Z("Kaburga", 47, 36, 14, 0, 0.8),
    Z("Uyluk", 47, 62, 22, -4, 0.85), Z("Baldır", 50, 80, 14, -6, 0.8)],
  "f-left": [Z("Omuz", 72, 22, 14, 5, 0.8), Z("Üst kol", 72, 30, 18, 8, 0.75), Z("Ön kol", 60, 46, 16, 18, 0.75), Z("Kaburga", 54, 36, 14, 0, 0.8),
    Z("Uyluk", 55, 62, 22, 4, 0.85), Z("Baldır", 56, 80, 14, 6, 0.8)],
  "m-front": [Z("Göğüs", 50, 25, 40), Z("Göğüs", 36, 25, 20, 0, 0.9), Z("Göğüs", 64, 25, 20, 0, 0.9), Z("Karın", 50, 38, 22),
    Z("Üst kol", 14, 30, 16, 10, 0.75), Z("Ön kol", 8, 46, 15, 8, 0.75), Z("Üst kol", 86, 30, 16, -10, 0.75), Z("Ön kol", 92, 46, 15, -8, 0.75),
    Z("Uyluk", 36, 62, 16, 4, 0.85), Z("Uyluk", 64, 62, 16, -4, 0.85), Z("Kaval", 34, 82, 11, 3, 0.8), Z("Kaval", 66, 82, 11, -3, 0.8)],
  "m-back": [Z("Sırt", 50, 24, 48), Z("Kürek", 37, 25, 20, 0, 0.9), Z("Kürek", 63, 25, 20, 0, 0.9), Z("Bel", 50, 38, 26),
    Z("Arka kol", 12, 30, 16, 10, 0.75), Z("Arka kol", 88, 30, 16, -10, 0.75), Z("Ön kol", 12, 47, 15, 8, 0.75), Z("Ön kol", 88, 47, 15, -8, 0.75),
    Z("Uyluk arkası", 38, 64, 16, 3, 0.85), Z("Uyluk arkası", 62, 64, 16, -3, 0.85), Z("Baldır", 37, 80, 13, 2, 0.8), Z("Baldır", 63, 80, 13, -2, 0.8)],
  "m-right": [Z("Omuz", 38, 21, 14, 0, 0.8), Z("Üst kol", 40, 30, 18, -6, 0.75), Z("Ön kol", 44, 46, 16, -14, 0.75), Z("Sırt yanı", 31, 34, 13, 0, 0.8),
    Z("Uyluk", 47, 64, 18, -2, 0.85), Z("Baldır", 44, 82, 13, 2, 0.8)],
  "m-left": [Z("Omuz", 65, 22, 14, 0, 0.8), Z("Üst kol", 64, 30, 18, 6, 0.75), Z("Ön kol", 57, 46, 16, 14, 0.75), Z("Sırt yanı", 70, 34, 13, 0, 0.8),
    Z("Uyluk", 53, 64, 18, 2, 0.85), Z("Baldır", 56, 82, 13, -2, 0.8)],
};

const INK = "#1a1620";
// Küçük dövmelerde çizgi kalınlaşır (gerçekte de küçük dövme kalın çizgiyle yapılır)
const WEIGHTS = [4.2, 6.5, 9];
const inkImgs = WEIGHTS.map((w) => TATTOOS.map((t) => { const im = new Image(); im.onload = () => paint(); im.src = svgDataUrl(t, INK, "#ffffff", w); return im; }));
const weightFor = (size) => (size < 0.11 ? 2 : size < 0.18 ? 1 : 0);
const params = new URLSearchParams(location.search);

const $ = (s) => document.querySelector(s);
const wrap = $("#figure-wrap"), figure = $("#figure"), bodyImg = $("#body-img"), cv = $("#figcanvas"), overlay = $("#overlay");
const cx = cv.getContext("2d"), off = document.createElement("canvas"), ox = off.getContext("2d");
const RES = 2; // görselin doğal çözünürlüğünün 2 katı: dövme çizgileri net kalsın
const zoneLabel = $("#zone-label"), sizeIn = $("#size"), rotIn = $("#rot"), stage = $("#tstage");

let gender = "f", view = "front", selected = null, uid = 0;
const store = {}; // "f-front" -> [{id, t, x, y, size, rot, wrap, zone}]
const key = () => `${gender}-${view}`;
let zoom = 1, panX = 0, panY = 0;
function applyZoom(animate) {
  wrap.classList.toggle("zooming", !!animate);
  wrap.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  document.getElementById("zoom-val").textContent = Math.round(zoom * 100) + "%";
}
function zoomTo(z, focus) {
  zoom = Math.min(4, Math.max(1, z));
  if (zoom === 1) { panX = panY = 0; }
  else {
    const f = focus || list().find((x) => x.id === selected);
    if (f) { panX = -(f.x - 0.5) * wrap.offsetWidth * zoom; panY = -(f.y - 0.5) * wrap.offsetHeight * zoom; }
  }
  applyZoom(true);
}
const list = () => (store[key()] ||= []);

// ---------- görünüm ----------
function setFigure() {
  const src = `assets/body/${key()}.png`;
  bodyImg.onload = () => { paint(); render(); if (params.has("zones")) drawZones(); };
  bodyImg.src = src;
  selected = null; zoom = 1; panX = panY = 0; applyZoom(); render();
}
document.querySelectorAll("[data-gender]").forEach((b) => b.addEventListener("click", () => {
  gender = b.dataset.gender; document.querySelectorAll("[data-gender]").forEach((x) => x.setAttribute("aria-pressed", x === b)); setFigure();
}));
document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
  view = b.dataset.view; document.querySelectorAll("[data-view]").forEach((x) => x.setAttribute("aria-pressed", x === b)); setFigure();
}));

// ---------- çizim: vücut + dövmeler tek canvas'ta (dövme vücut hattıyla kırpılır, deriye multiply ile basılır) ----------
function paint() {
  if (!bodyImg.complete || !bodyImg.naturalWidth) return;
  const W = bodyImg.naturalWidth * RES, H = bodyImg.naturalHeight * RES;
  if (cv.width !== W || cv.height !== H) { cv.width = off.width = W; cv.height = off.height = H; }
  cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1;
  cx.clearRect(0, 0, W, H); cx.drawImage(bodyImg, 0, 0, W, H);
  for (const d of list()) {
    const im = inkImgs[weightFor(d.size)][d.t];
    if (!im.complete) continue;
    ox.globalCompositeOperation = "source-over"; ox.clearRect(0, 0, W, H);
    ox.save(); ox.filter = "blur(0.5px)";
    ox.translate(d.x * W, d.y * H); ox.rotate(d.rot * Math.PI / 180); ox.scale(d.wrap, 1);
    const sz = d.size * W; ox.drawImage(im, -sz / 2, -sz / 2, sz, sz); ox.restore();
    ox.globalCompositeOperation = "destination-in"; ox.drawImage(bodyImg, 0, 0, W, H);
    cx.globalCompositeOperation = "multiply"; cx.globalAlpha = 0.88; cx.drawImage(off, 0, 0);
  }
  cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1;
}
function render() {
  overlay.innerHTML = "";
  for (const d of list()) {

    const box = document.createElement("div");
    box.className = "tbox" + (d.id === selected ? " sel" : "");
    place(box, d, d.wrap);
    box.innerHTML = d.id === selected ? `<i class="h nw"></i><i class="h ne"></i><i class="h sw"></i><i class="h se"></i><i class="h rot"></i><span class="tip">${tz(d.zone)}</span>` : "";
    box.addEventListener("pointerdown", (e) => startGesture(e, d, e.target.classList.contains("rot") ? "rotate" : e.target.classList.contains("h") ? "resize" : "move"));
    overlay.appendChild(box); d.box = box;
  }
  paint(); syncControls();
}
function place(el, d, w) {
  el.style.left = d.x * 100 + "%"; el.style.top = d.y * 100 + "%";
  el.style.width = d.size * w * 100 + "%"; el.style.height = figure.clientWidth * d.size + "px";
  el.style.transform = `translate(-50%,-50%) rotate(${d.rot}deg)`;
}
function update(d) {
  place(d.box, d, d.wrap); paint();
  const tip = d.box.querySelector(".tip"); if (tip) tip.textContent = tz(d.zone);
  syncControls();
}
function syncControls() {
  const d = list().find((x) => x.id === selected);
  document.getElementById("tcontrols").classList.toggle("off", !d);
  if (!d) { zoneLabel.textContent = t("d.empty"); return; }
  zoneLabel.textContent = d.zone ? `${tz(d.zone)} · ${t("d.fitted")}` : t("d.free");
  sizeIn.value = Math.round(d.size * 100); rotIn.value = Math.round(d.rot);
}

// ---------- bölgeye uyarlama ----------
function nearestZone(x, y) {
  const W = figure.clientWidth, H = figure.clientHeight;
  let best = null, bd = Infinity;
  for (const z of ZONES[key()]) { const dd = Math.hypot((z.x - x) * W, (z.y - y) * H); if (dd < bd) { bd = dd; best = z; } }
  return bd < H * 0.09 ? best : null;
}
function fitToBody(d, fresh) {
  const z = nearestZone(d.x, d.y);
  d.zone = z?.name || null;
  if (z) {
    d.rot = z.rot; d.wrap = z.wrap;
    d.size = fresh ? z.size : Math.min(d.size, z.size * 1.8);
    if (fresh) { d.x = z.x; d.y = z.y; }
  } else d.wrap = 1;
  d.box.classList.add("snap");
  update(d);
  setTimeout(() => d.box?.classList.remove("snap"), 380);
}

function addTattoo(t, x, y) {
  const z0 = ZONES[key()][0], fresh = x == null;
  const d = { id: ++uid, t, x: fresh ? z0.x : x, y: fresh ? z0.y : y, size: 0.2, rot: 0, wrap: 1, zone: null };
  list().push(d); selected = d.id; render(); fitToBody(d, true);
  if (d.zone && d.size < 0.16) zoomTo(Math.max(zoom, 2.4), d);
}

// ---------- hareket / boyut / döndürme ----------
function startGesture(e, d, mode) {
  e.preventDefault(); e.stopPropagation();
  if (selected !== d.id) { selected = d.id; render(); d = list().find((x) => x.id === selected); }
  const r = figure.getBoundingClientRect();
  const cx = r.left + d.x * r.width, cy = r.top + d.y * r.height;
  const s = { px: e.clientX, py: e.clientY, x: d.x, y: d.y, size: d.size, dist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1 };
  const move = (ev) => {
    if (mode === "move") { d.x = s.x + (ev.clientX - s.px) / r.width; d.y = s.y + (ev.clientY - s.py) / r.height; }
    else if (mode === "resize") d.size = Math.min(1.4, Math.max(0.03, s.size * Math.hypot(ev.clientX - cx, ev.clientY - cy) / s.dist));
    else d.rot = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90;
    update(d);
  };
  const up = () => {
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
    if (mode === "move") fitToBody(d, false);
  };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
}
stage.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".tbox") || e.target.closest(".zoomctl")) return;
  selected = null; render();
  if (zoom <= 1) return;
  const sx = e.clientX - panX, sy = e.clientY - panY;
  const move = (ev) => { panX = ev.clientX - sx; panY = ev.clientY - sy; applyZoom(false); };
  const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
});
document.getElementById("zoom-in").addEventListener("click", () => zoomTo(zoom * 1.5));
document.getElementById("zoom-out").addEventListener("click", () => zoomTo(zoom / 1.5));
document.getElementById("zoom-fit").addEventListener("click", () => zoomTo(1));
stage.addEventListener("wheel", (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoomTo(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, { passive: false });

sizeIn.addEventListener("input", () => { const d = list().find((x) => x.id === selected); if (d) { d.size = sizeIn.value / 100; update(d); } });
rotIn.addEventListener("input", () => { const d = list().find((x) => x.id === selected); if (d) { d.rot = +rotIn.value; update(d); } });
$("#t-del").addEventListener("click", () => { store[key()] = list().filter((x) => x.id !== selected); selected = null; render(); });
$("#t-clear").addEventListener("click", () => { store[key()] = []; selected = null; render(); });
$("#t-save").addEventListener("click", () => {
  try {
    cv.toBlob((blob) => {
      if (!blob) return alert(t("d.errImg"));
      const a = document.createElement("a"); a.download = `yaga-tattoo-tasarim-${key()}.png`;
      a.href = URL.createObjectURL(blob); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  } catch (e) { alert(t("d.errDl")); }
});
window.addEventListener("keydown", (e) => {
  if ((e.key === "Delete" || e.key === "Backspace") && selected && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) {
    e.preventDefault(); store[key()] = list().filter((x) => x.id !== selected); selected = null; render();
  }
});
window.addEventListener("resize", () => list().forEach((d) => d.box && update(d)));

// ---------- dövme listesi (tıkla ya da sürükleyip bırak) ----------
const picker = $("#tpicker");
const paintPicker = () => picker.querySelectorAll(".tthumb").forEach((b, i) => { b.title = tName(TATTOOS[i]); b.querySelector("span").textContent = tName(TATTOOS[i]); });
picker.innerHTML = TATTOOS.map((tt, i) => `<button class="tthumb" data-t="${i}">${svgMarkup(tt, "#e9dfcb", "#141116")}<span></span></button>`).join("");
paintPicker();
onLang(() => { paintPicker(); render(); });
picker.querySelectorAll(".tthumb").forEach((btn) => btn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const t = +btn.dataset.t, sx = e.clientX, sy = e.clientY;
  let ghost = null;
  const move = (ev) => {
    if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
      ghost = document.createElement("img"); ghost.src = svgDataUrl(TATTOOS[t], "#e9dfcb", "#141116"); ghost.className = "tghost"; document.body.appendChild(ghost);
    }
    if (ghost) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
  };
  const up = (ev) => {
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
    if (!ghost) return addTattoo(t);
    ghost.remove();
    const r = figure.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) addTattoo(t, x, y);
  };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
}));

// test: ?zones bölge noktalarını gösterir
function drawZones() {
  overlay.querySelectorAll(".zdot").forEach((n) => n.remove());
  for (const z of ZONES[key()]) {
    const n = document.createElement("div"); n.className = "zdot"; n.style.left = z.x * 100 + "%"; n.style.top = z.y * 100 + "%"; n.textContent = tz(z.name); overlay.appendChild(n);
  }
}
if (params.get("view")) { const [g, v] = params.get("view").split("-"); gender = g; view = v; }
document.querySelectorAll("[data-gender]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.gender === gender));
document.querySelectorAll("[data-view]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.view === view));
setFigure();
if (params.get("demo") === "1") bodyImg.addEventListener("load", () => { if (!list().length) { addTattoo(4); addTattoo(0, ZONES[key()][4].x, ZONES[key()][4].y); } }, { once: true });
if (params.get("demo") === "2") bodyImg.addEventListener("load", () => { addTattoo(0); addTattoo(4, ZONES[key()][4].x, ZONES[key()][4].y); zoomTo(1); }, { once: true });

