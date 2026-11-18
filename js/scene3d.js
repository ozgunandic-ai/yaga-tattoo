import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { TATTOOS, svgDataUrl, svgMarkup } from "./tattoos.js";

// ---------- yardımcılar ----------
const params = new URLSearchParams(location.search);
const FIXED_U = params.has("u") ? parseFloat(params.get("u")) : null; // test: ?u=0.5
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(7);
const mkCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const toTex = (c, repeat) => {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};

// ---------- prosedürel dokular ----------
function cloudCanvas(size = 256, seed = 1, color = "255,255,255") {
  const c = mkCanvas(size, size), g = c.getContext("2d"), r = rng(seed);
  for (let i = 0; i < 26; i++) {
    const x = size * (0.22 + r() * 0.56), y = size * (0.3 + r() * 0.42), rad = size * (0.1 + r() * 0.2);
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${color},0.55)`); grd.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  return c;
}
function glowTex() {
  const c = mkCanvas(128, 128), g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.25, "rgba(255,255,255,0.5)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128); return toTex(c);
}
function moonTex() {
  const c = mkCanvas(256, 256), g = c.getContext("2d"), r = rng(3);
  const grd = g.createRadialGradient(110, 110, 10, 128, 128, 120);
  grd.addColorStop(0, "#fbf7ea"); grd.addColorStop(1, "#c9cde0");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(120,125,150,${0.12 + r() * 0.15})`; g.beginPath(); g.arc(50 + r() * 156, 50 + r() * 156, 6 + r() * 22, 0, Math.PI * 2); g.fill(); }
  return toTex(c);
}
function stoneTex(base = [44, 40, 38], seed = 2) {
  const S = 512, c = mkCanvas(S, S), g = c.getContext("2d"), r = rng(seed);
  g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, S, S);
  const rowH = 48;
  for (let y = 0, row = 0; y < S; y += rowH, row++) {
    let x = row % 2 ? -50 : 0;
    while (x < S) {
      const w = 80 + r() * 70, s = (r() - 0.5) * 26;
      g.fillStyle = `rgb(${base[0] + s},${base[1] + s},${base[2] + s})`; g.fillRect(x, y, w, rowH);
      g.fillStyle = "rgb(14,12,12)"; g.fillRect(x, y, 3, rowH); x += w;
    }
    g.fillStyle = "rgb(14,12,12)"; g.fillRect(0, y, S, 3);
  }
  const img = g.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0); return toTex(c, [1, 1]);
}
function woodTex() {
  const c = mkCanvas(256, 512), g = c.getContext("2d"), r = rng(9);
  for (let x = 0; x < 256; x += 32) { const s = r() * 14; g.fillStyle = `rgb(${46 + s},${28 + s},${18 + s})`; g.fillRect(x, 0, 32, 512); g.fillStyle = "#120a06"; g.fillRect(x, 0, 2, 512); }
  for (let i = 0; i < 300; i++) { g.strokeStyle = `rgba(0,0,0,${r() * 0.25})`; const x = r() * 256; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 6, 512); g.stroke(); }
  [90, 420].forEach((y) => { g.fillStyle = "#1b1b1f"; g.fillRect(0, y, 256, 26); for (let x = 16; x < 256; x += 40) { g.fillStyle = "#4a4a52"; g.beginPath(); g.arc(x, y + 13, 5, 0, 7); g.fill(); } });
  return toTex(c);
}
function floorTex() {
  const c = mkCanvas(512, 512), g = c.getContext("2d"), r = rng(11);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#1c1112" : "#080606"; g.fillRect(i * 128, j * 128, 128, 128); }
  for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(150,120,110,${r() * 0.12})`; g.lineWidth = r() * 2; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - 0.5) * 80; y += (r() - 0.5) * 80; g.lineTo(x, y); } g.stroke(); }
  return toTex(c, [2, 20]);
}
function backdropTex() {
  const c = mkCanvas(512, 512), g = c.getContext("2d");
  const grd = g.createRadialGradient(256, 290, 10, 256, 290, 256);
  grd.addColorStop(0, "rgba(255,170,90,1)"); grd.addColorStop(0.35, "rgba(200,60,30,0.75)"); grd.addColorStop(1, "rgba(60,5,5,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512); return toTex(c);
}
function silhouetteTex() {
  const c = mkCanvas(1024, 640), g = c.getContext("2d");
  g.fillStyle = g.strokeStyle = "#000"; g.lineCap = "round"; g.lineJoin = "round";
  const limb = (pts, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach((p) => g.lineTo(...p)); g.stroke(); };
  const ell = (x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
  // lamba
  limb([[640, 0], [640, 80], [565, 140]], 7);
  g.beginPath(); g.moveTo(520, 165); g.lineTo(610, 165); g.lineTo(590, 132); g.lineTo(540, 132); g.closePath(); g.fill();
  // dövme koltuğu
  g.fillRect(430, 430, 292, 18); limb([[712, 440], [822, 326]], 20);
  g.fillRect(566, 446, 22, 132); ell(577, 584, 92, 12);
  g.fillRect(556, 394, 96, 9); g.fillRect(600, 400, 8, 32);
  // kız (uzanmış, kolu dövmeciye uzatılmış)
  limb([[440, 420], [600, 426]], 28); limb([[446, 410], [600, 418]], 22); ell(430, 414, 12, 16);
  ell(662, 408, 80, 30, -0.36);
  limb([[738, 374], [760, 360]], 22);
  g.beginPath(); g.arc(782, 340, 30, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(786, 312); g.quadraticCurveTo(846, 336, 836, 420); g.quadraticCurveTo(806, 424, 794, 372); g.closePath(); g.fill();
  limb([[700, 392], [632, 389], [576, 386]], 15); ell(562, 385, 14, 9);
  // dövmeci (taburede, öne eğilmiş)
  ell(300, 472, 48, 10); g.fillRect(294, 476, 12, 100); ell(300, 585, 52, 10);
  limb([[302, 452], [388, 346]], 62);
  g.beginPath(); g.arc(424, 318, 30, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(418, 302, 33, 24, -0.3, Math.PI, 0); g.fill();
  limb([[372, 362], [432, 420], [546, 390]], 20); limb([[384, 350], [446, 398], [538, 374]], 17);
  g.save(); g.translate(550, 378); g.rotate(-0.55); g.fillRect(-6, -30, 12, 36); g.restore();
  g.lineWidth = 3; g.beginPath(); g.moveTo(560, 352); g.bezierCurveTo(540, 290, 470, 420, 462, 600); g.stroke();
  limb([[306, 456], [396, 468], [392, 575]], 30); limb([[300, 462], [382, 478], [374, 578]], 26);
  ell(404, 582, 26, 9); ell(384, 585, 24, 9);
  return toTex(c);
}
function flashTex(t) {
  const c = mkCanvas(320, 400), g = c.getContext("2d");
  const grd = g.createRadialGradient(160, 190, 40, 160, 200, 260);
  grd.addColorStop(0, "#d8c7a2"); grd.addColorStop(1, "#7a6648");
  g.fillStyle = grd; g.fillRect(0, 0, 320, 400);
  const tex = toTex(c);
  const img = new Image();
  img.onload = () => {
    g.drawImage(img, 40, 40, 240, 240);
    g.fillStyle = "#1a120c"; g.font = "italic 30px Georgia, serif"; g.textAlign = "center"; g.fillText(t.name, 160, 340);
    tex.needsUpdate = true;
  };
  img.src = svgDataUrl(t, "#1a120c", "#cdbb95");
  return tex;
}

// ---------- sahne ----------
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const EXT_FOG = new THREE.Color(0x0a1022), INT_FOG = new THREE.Color(0x0d0605);
scene.fog = new THREE.FogExp2(EXT_FOG.clone(), 0.0035);
scene.background = scene.fog.color;
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2500);

const hemi = new THREE.HemisphereLight(0x46598f, 0x0a0806, 0.9);
scene.add(hemi);
const moonLight = new THREE.DirectionalLight(0xa9bcff, 2.2);
moonLight.position.set(-90, 140, 160); scene.add(moonLight);

const GLOW = glowTex();
const sprite = (color, scale, opacity = 1, additive = true) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  s.scale.setScalar(scale); return s;
};

// gökyüzü: yıldızlar + ay
{
  const n = 1800, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = R() * Math.PI * 2, ph = Math.acos(R() * 0.9), r = 1500;
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) - 100, r * Math.sin(ph) * Math.sin(th)], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 })));
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex(), fog: false, transparent: true }));
  moon.position.set(-260, 330, -900); moon.scale.setScalar(110); scene.add(moon);
  const halo = sprite(0x8fa6ff, 600, 0.35); halo.material.fog = false; halo.position.copy(moon.position); scene.add(halo);
}

// dağlar
const rockMat = new THREE.MeshStandardMaterial({ color: 0x1d2130, roughness: 0.95, flatShading: true });
function mountain(rTop, rBot, h, x, y, z, seed) {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, 40, 12, false), p = geo.attributes.position, r = rng(seed);
  for (let i = 0; i < p.count; i++) {
    const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), a = Math.atan2(vz, vx);
    const n = 1 + 0.16 * Math.sin(a * 5 + seed) + 0.08 * Math.sin(a * 13 + vy * 0.2) + (r() - 0.5) * 0.12;
    p.setXYZ(i, vx * n, vy + (vy < h / 2 - 0.1 ? (r() - 0.5) * h * 0.03 : 0), vz * n);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, rockMat); m.position.set(x, y, z); scene.add(m); return m;
}
mountain(62, 150, 160, 0, -80, -44, 1);
mountain(2, 70, 150, -170, -45, -150, 2);
mountain(3, 80, 170, 200, -50, -90, 3);
mountain(2, 60, 120, -230, -50, 60, 4);
mountain(2, 90, 200, 120, -60, -420, 5);
mountain(2, 80, 180, -60, -70, -520, 6);

// bulut denizi
const cloudTexes = [1, 2, 3, 4].map((s) => toTex(cloudCanvas(256, s)));
const clouds = [];
for (let i = 0; i < 520; i++) {
  const nearCastle = i < 120;
  let x, y, z;
  if (nearCastle) { const a = R() * Math.PI * 2, rr = 40 + R() * 90; x = Math.cos(a) * rr; z = -44 + Math.sin(a) * rr; y = -16 + R() * 10; if (Math.abs(x) < 32 && z > -118 && z < 26) continue; }
  else { x = (R() - 0.5) * 700; z = 25 + R() * 380; y = -10 + R() * 32 * (1 - Math.abs(x) / 700); }
  const light = 0.55 + R() * 0.45;
  const mat = new THREE.SpriteMaterial({ map: cloudTexes[i % 4], color: new THREE.Color(0.42 * light, 0.47 * light, 0.62 * light), transparent: true, opacity: 0.55, depthWrite: false });
  const s = new THREE.Sprite(mat); s.position.set(x, y, z); s.scale.setScalar(28 + R() * 55); s.material.rotation = R() * 6.28;
  s.userData.drift = (R() - 0.5) * 0.6; scene.add(s); clouds.push(s);
}

// ---------- şato ----------
const stone = stoneTex();
const stoneMat = new THREE.MeshStandardMaterial({ map: stone, color: 0x9a96a6, roughness: 0.92 });
const innerStoneMat = new THREE.MeshStandardMaterial({ map: stone, color: 0xb59a86, roughness: 0.85 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x161a28, roughness: 0.7, metalness: 0.2, flatShading: true });
const windowMat = new THREE.MeshBasicMaterial({ color: 0xff8a3a });
const castle = new THREE.Group(); scene.add(castle);

function box(w, h, d, mat, x, y, z, parent = castle) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(w, d) / 6, uv.getY(i) * h / 6);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); parent.add(m); return m;
}
function windowAt(x, y, z, w = 0.9, h = 1.8, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), windowMat); m.position.set(x, y, z); m.rotation.y = ry; castle.add(m);
}
function tower(x, z, r, h, roofH, tilt = 0) {
  const g = new THREE.CylinderGeometry(r, r * 1.08, h, 20), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * r, uv.getY(i) * h / 6);
  const t = new THREE.Mesh(g, stoneMat); t.position.set(x, h / 2, z); castle.add(t);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.3, roofH, 20), roofMat);
  roof.position.set(x + tilt * roofH * 0.3, h + roofH / 2, z); roof.rotation.z = -tilt; castle.add(roof);
  for (let k = 0; k < 3; k++) if (R() > 0.3) windowAt(x, h * (0.45 + k * 0.17), z + r + 0.1, 0.8, 1.6);
}
box(80, 6, 50, stoneMat, 0, -3, 6);
box(19, 22, 2, stoneMat, -12.5, 11, 12);
box(19, 22, 2, stoneMat, 12.5, 11, 12);
box(6, 13, 2, stoneMat, 0, 15.5, 12);
{
  const s = new THREE.Shape(); s.moveTo(3, 6); s.lineTo(3, 9); s.lineTo(-3, 9); s.lineTo(-3, 6); s.absarc(0, 6, 3, Math.PI, 0, true);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 2, bevelEnabled: false }), stoneMat); m.position.z = 11; castle.add(m);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.32, 8, 32, Math.PI), stoneMat); trim.position.set(0, 6, 13.1); castle.add(trim);
  box(0.6, 6, 0.6, stoneMat, -3.25, 3, 13.1); box(0.6, 6, 0.6, stoneMat, 3.25, 3, 13.1);
}
for (let x = -21; x <= 21; x += 2.2) box(1.1, 1.4, 2.2, stoneMat, x, 22.7, 12);
box(2, 22, 112, stoneMat, -21, 11, -44); box(2, 22, 112, stoneMat, 21, 11, -44);
box(44, 22, 2, stoneMat, 0, 11, -100); box(44, 1, 112, roofMat, 0, 22.5, -44);
tower(-23, 12, 5, 34, 18, 0.05); tower(23, 12, 5, 34, 18, -0.06);
tower(0, -25, 6.5, 48, 28, 0.04); tower(-14, -52, 4, 40, 20, -0.12); tower(15, -70, 4.5, 44, 22, 0.1);
tower(-22, -100, 5, 34, 18, 0); tower(22, -100, 5, 36, 20, 0.08); tower(-8, -78, 3, 52, 18, 0.15);
[[-15, 16], [-9, 16], [9, 16], [15, 16], [-15, 9], [15, 9]].forEach(([x, y]) => windowAt(x, y, 13.05));

// kapı
const doorMat = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.8, color: 0xc0a090 });
const doorL = new THREE.Group(), doorR = new THREE.Group();
doorL.position.set(-3, 0, 11.6); doorR.position.set(3, 0, 11.6);
box(3, 9, 0.4, doorMat, 1.5, 4.5, 0, doorL); box(3, 9, 0.4, doorMat, -1.5, 4.5, 0, doorR);
castle.add(doorL, doorR);
const gapGlow = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshBasicMaterial({ color: 0xff9440 }));
gapGlow.position.set(0, 4.5, 10.9); castle.add(gapGlow);
const doorLight = new THREE.PointLight(0xff9a4a, 0, 30, 1.6); doorLight.position.set(0, 4, 14); scene.add(doorLight);

// kapı fenerleri (yeşil alev)
const flickers = [];
[-4.6, 4.6].forEach((x) => {
  box(0.7, 1.1, 0.7, roofMat, x, 6.2, 13.6);
  const f = sprite(0x55ff99, 2.2); f.position.set(x, 6.3, 13.7); scene.add(f);
  const l = new THREE.PointLight(0x55ff99, 18, 14, 1.6); l.position.set(x, 6.3, 14.4); scene.add(l);
  flickers.push({ light: l, base: 18, sprite: f, sbase: 2.2, ph: R() * 10 });
});

// ---------- koridor ----------
const corridor = new THREE.Group(); scene.add(corridor);
const Z0 = 11, Z1 = -70, LEN = Z0 - Z1, ZC = (Z0 + Z1) / 2;
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.22, metalness: 0.25 });
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, LEN), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.01, ZC); corridor.add(floor);
  const wallTex = stone.clone(); wallTex.repeat.set(LEN / 6, 1); wallTex.needsUpdate = true;
  const wMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xb59a86, roughness: 0.85 });
  [-4, 4].forEach((x) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 6), wMat); w.position.set(x, 3, ZC); w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; corridor.add(w); });
  const vg = new THREE.CylinderGeometry(4, 4, LEN, 24, 1, true, Math.PI / 2, Math.PI); vg.rotateX(Math.PI / 2);
  const vTex = stone.clone(); vTex.repeat.set(2, LEN / 6); vTex.needsUpdate = true;
  const vault = new THREE.Mesh(vg, new THREE.MeshStandardMaterial({ map: vTex, color: 0x8f7a6c, roughness: 0.9, side: THREE.BackSide }));
  vault.position.set(0, 6, ZC); corridor.add(vault);
}
const candleMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, emissive: 0x402010, roughness: 0.6 });
const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2a14, metalness: 0.6, roughness: 0.4 });
let ti = 0;
for (let z = 6; z > Z1 + 2; z -= 7) {
  [-3.6, 3.6].forEach((x) => box(0.8, 6, 0.9, innerStoneMat, x, 3, z, corridor));
  const rib = new THREE.Mesh(new THREE.TorusGeometry(3.95, 0.22, 6, 24, Math.PI), innerStoneMat); rib.position.set(0, 6, z); corridor.add(rib);
  [-3.05, 3.05].forEach((x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8), candleMat); c.position.set(x, 3.6, z + 0.6); corridor.add(c);
    const f = sprite(0xffa040, 0.55); f.position.set(x, 3.92, z + 0.6); corridor.add(f);
    flickers.push({ sprite: f, sbase: 0.55, ph: R() * 10 });
  });
  // duvarlarda dövme flash'ları
  if (z < 4) [-3.95, 3.95].forEach((x) => {
    const t = TATTOOS[ti++ % TATTOOS.length];
    const fr = box(0.1, 2.9, 2.3, frameMat, x, 3.2, z - 3.5, corridor);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.4), new THREE.MeshStandardMaterial({ map: flashTex(t), roughness: 0.8, emissive: 0x2a1a10 }));
    p.position.set(x + (x < 0 ? 0.07 : -0.07), 3.2, z - 3.5); p.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; corridor.add(p);
  });
}
for (let k = 0; k < 6; k++) {
  const l = new THREE.PointLight(0xff9248, 22, 22, 1.4); l.position.set(0, 4.6, 4 - k * 14); scene.add(l);
  flickers.push({ light: l, base: 22, ph: R() * 10 });
}
// toz parçacıkları
const dust = (() => {
  const n = 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(R() - 0.5) * 7.5, R() * 8, Z0 - R() * (LEN + 22)], i * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffc890, size: 0.04, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(p); return p;
})();

// ---------- dövme odası ----------
const room = new THREE.Group(); scene.add(room);
const RZ0 = -70, RZ1 = -94, RW = 9, RH = 11, RZC = (RZ0 + RZ1) / 2;
{
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(RW * 2, RZ0 - RZ1), floorMat); rf.rotation.x = -Math.PI / 2; rf.position.set(0, 0.01, RZC); room.add(rf);
  const rt = stone.clone(); rt.repeat.set(4, 2); rt.needsUpdate = true;
  const rm = new THREE.MeshStandardMaterial({ map: rt, color: 0x7a5a50, roughness: 0.9, side: THREE.DoubleSide });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW * 2, RZ0 - RZ1), rm); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, RH, RZC); room.add(ceil);
  [-RW, RW].forEach((x) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(RZ0 - RZ1, RH), rm); w.position.set(x, RH / 2, RZC); w.rotation.y = Math.PI / 2; room.add(w); });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(RW * 2, RH), rm); back.position.set(0, RH / 2, RZ1); room.add(back);
  const fs = new THREE.Shape(); fs.moveTo(-RW, 0); fs.lineTo(RW, 0); fs.lineTo(RW, RH); fs.lineTo(-RW, RH); fs.lineTo(-RW, 0);
  const hole = new THREE.Path(); hole.moveTo(-4, 0); hole.lineTo(4, 0); hole.lineTo(4, 6); hole.absarc(0, 6, 4, 0, Math.PI, false); hole.lineTo(-4, 0);
  fs.holes.push(hole);
  const front = new THREE.Mesh(new THREE.ShapeGeometry(fs), rm); front.position.z = RZ0; room.add(front);
  // arka planda kızıl ışık
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshBasicMaterial({ map: backdropTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  bd.position.set(0, 4.6, RZ1 + 0.2); room.add(bd);
  // dövmeci ve kız (silüet)
  const sil = new THREE.Mesh(new THREE.PlaneGeometry(10, 6.25), new THREE.MeshBasicMaterial({ map: silhouetteTex(), transparent: true, alphaTest: 0.4 }));
  sil.position.set(0, 3.125, -86); room.add(sil);
  // lamba ışığı ve ışık konisi
  const spot = new THREE.SpotLight(0xffc89a, 140, 30, 0.55, 0.7, 1.3); spot.position.set(0, 9.5, -84); spot.target.position.set(0, 0, -86); room.add(spot, spot.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 6.5, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cone.position.set(-0.6, 3.6, -85.8); room.add(cone);
  const lampGlow = sprite(0xffd2a0, 2.5); lampGlow.position.set(-0.55, 4.0, -85.9); room.add(lampGlow);
  const roomLight = new THREE.PointLight(0xff5530, 30, 26, 1.4); roomLight.position.set(0, 6, -80); scene.add(roomLight);
  flickers.push({ light: roomLight, base: 30, ph: 3 });
  // yan duvarlarda büyük flash'lar
  for (let k = 0; k < 3; k++) [-RW + 0.05, RW - 0.05].forEach((x, side) => {
    const t = TATTOOS[(k * 2 + side + 3) % TATTOOS.length];
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.25), new THREE.MeshStandardMaterial({ map: flashTex(t), roughness: 0.8, emissive: 0x2a1a10 }));
    p.position.set(x, 5, -74 - k * 6); p.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; room.add(p);
  });
  // kuzgunun konacağı demir şamdan
  const iron = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, metalness: 0.8, roughness: 0.4 });
  box(0.12, 5.2, 0.12, iron, 3.0, 2.6, -85, room); box(1.6, 0.1, 0.1, iron, 3.0, 5.2, -85, room); box(1.4, 0.05, 1.4, iron, 3.0, 0.03, -85, room);
  [2.3, 3.7].forEach((x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), candleMat); c.position.set(x, 5.5, -85); room.add(c);
    const f = sprite(0xffa040, 0.7); f.position.set(x, 5.85, -85); room.add(f); flickers.push({ sprite: f, sbase: 0.7, ph: R() * 10 });
  });
}

// ---------- kuzgun ----------
const crow = new THREE.Group(); scene.add(crow);
const crowMat = new THREE.MeshStandardMaterial({ color: 0x0b0c12, roughness: 0.35, metalness: 0.45, side: THREE.DoubleSide });
const wings = [];
{
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), crowMat); body.scale.set(0.85, 0.75, 1.6); crow.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), crowMat); head.position.set(0, 0.1, -0.38); crow.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.24, 8), crowMat); beak.rotation.x = -Math.PI / 2; beak.position.set(0, 0.07, -0.6); crow.add(beak);
  [-0.07, 0.07].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb040 })); e.position.set(x, 0.14, -0.48); crow.add(e); });
  crow.scale.setScalar(0.85);
  const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0.25, -0.17, 0, 0.75, 0.17, 0, 0.75]), 3)); tg.computeVertexNormals();
  crow.add(new THREE.Mesh(tg, crowMat));
  const ws = new THREE.Shape();
  [[0, 0.15], [-0.4, 0.18], [-0.8, 0.06], [-1.05, -0.1], [-0.86, -0.18], [-0.74, -0.1], [-0.62, -0.26], [-0.48, -0.14], [-0.34, -0.3], [-0.18, -0.18], [0, -0.24]]
    .forEach(([x, y], i) => (i ? ws.lineTo(x, y) : ws.moveTo(x, y)));
  const wg = new THREE.ShapeGeometry(ws); wg.rotateX(-Math.PI / 2);
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group(); pivot.position.set(side * 0.12, 0.06, -0.05);
    const w = new THREE.Mesh(wg, crowMat); w.scale.x = side < 0 ? 1 : -1; pivot.add(w); crow.add(pivot); wings.push({ pivot, side });
  });
}
const PERCH = new THREE.Vector3(3.0, 5.42, -85);

// ---------- kamera yolu ----------
const P = [[0, 48, 280], [0, 34, 210], [0, 18, 150], [0, 10, 95], [0, 6.5, 52], [0, 4.4, 30], [0, 3.4, 18], [0, 3.1, 8], [0.4, 3.0, -12], [-0.4, 3.0, -36], [0, 3.1, -58], [0, 3.3, -67], [0, 3.6, -73]];
const L = [[0, 32, 0], [0, 22, 0], [0, 14, 0], [0, 11, 0], [0, 8, 0], [0, 5, 0], [0, 4, -2], [0, 3.2, -20], [0, 3, -40], [0, 3, -62], [0, 3, -85], [0, 3, -88], [0, 3.1, -90]];
const camPath = new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(...p)), false, "centripetal");
const lookPath = new THREE.CatmullRomCurve3(L.map((p) => new THREE.Vector3(...p)), false, "centripetal");
const SEG = P.length - 1;

// ---------- post-processing ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.78);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  camera.aspect = w / h; camera.fov = w / h < 0.9 ? 72 : 55; camera.updateProjectionMatrix();
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

const tmpF = new THREE.Vector3(), tmpR = new THREE.Vector3(), tmpU = new THREE.Vector3(), follow = new THREE.Vector3();
const clock = new THREE.Clock();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function frame() {
  const t = clock.getElapsedTime();
  if (FIXED_U === null) cur += (target - cur) * (reduce ? 1 : 0.075);
  const u = clamp(cur);

  // kamera
  const s = u * SEG * 0.9999 / SEG;
  camera.position.copy(camPath.getPoint(s));
  camera.lookAt(lookPath.getPoint(s));
  camera.position.y += Math.sin(t * 0.8) * 0.04;

  // kapı açılması ve iç mekân geçişi
  const open = smooth(4.6 / SEG, 6.3 / SEG, u);
  doorL.rotation.y = 0.06 + open * 1.45; doorR.rotation.y = -(0.06 + open * 1.45);
  doorLight.intensity = 6 + open * 50;
  const inside = smooth(6.4 / SEG, 7.4 / SEG, u);
  scene.fog.color.lerpColors(EXT_FOG, INT_FOG, inside);
  scene.fog.density = THREE.MathUtils.lerp(0.0035, 0.03, inside);
  hemi.intensity = 0.9 - inside * 0.6; moonLight.intensity = 2.2 * (1 - inside);
  castle.visible = u < 7.6 / SEG; clouds.forEach((c) => (c.visible = u < 6.6 / SEG));

  // bulutlar hafifçe süzülür
  for (const c of clouds) c.position.x += c.userData.drift * 0.02;
  dust.rotation.y = Math.sin(t * 0.05) * 0.01; dust.position.y = Math.sin(t * 0.3) * 0.2;

  // mum titremesi
  for (const f of flickers) {
    const n = 0.82 + 0.18 * Math.sin(t * 9 + f.ph) * Math.sin(t * 5.3 + f.ph * 2);
    if (f.light) f.light.intensity = f.base * n;
    if (f.sprite) f.sprite.scale.setScalar(f.sbase * (0.9 + 0.1 * n));
  }

  // kuzgun: koridorda kameraya eşlik eder, sonra şamdana konar
  const enter = smooth(6.5 / SEG, 7.3 / SEG, u), perch = smooth(10.3 / SEG, 11.6 / SEG, u);
  crow.visible = enter > 0.01;
  camera.getWorldDirection(tmpF); tmpR.crossVectors(tmpF, camera.up).normalize(); tmpU.crossVectors(tmpR, tmpF);
  follow.copy(camera.position)
    .addScaledVector(tmpF, 0.6 + 2.8 * enter)
    .addScaledVector(tmpR, -0.9 + Math.sin(t * 0.7) * 0.35)
    .addScaledVector(tmpU, -1.2 + 1.9 * enter + Math.sin(t * 2.2) * 0.12);
  crow.position.lerpVectors(follow, PERCH, perch);
  crow.quaternion.copy(camera.quaternion);
  crow.rotateZ(Math.sin(t * 1.3) * 0.18 * (1 - perch));
  crow.rotateY(Math.PI * perch * 0.85);
  crow.scale.setScalar(0.85 + perch * 0.6);
  const flap = Math.sin(t * 10) * 0.75 * (1 - perch);
  wings.forEach(({ pivot, side }) => (pivot.rotation.z = side * (flap + perch * 1.25)));

  // metin katmanları
  for (const b of beats) {
    const a = +b.dataset.in, z = +b.dataset.out, f = 0.03;
    const fin = a === 0 ? 1 : smooth(a, a + f, u);
    const o = z >= 1 ? fin : a === 0 ? 1 - smooth(z - f, z, u) : Math.min(smooth(a, a + f, u), 1 - smooth(z - f, z, u));
    b.style.opacity = o; b.style.transform = `translateY(${(1 - o) * 24}px)`;
    b.style.pointerEvents = o > 0.5 ? "auto" : "none";
  }
  const sm = smooth(0.93, 1, u);
  smoke.style.opacity = sm; smoke.style.transform = `translateY(${(1 - sm) * 40}%)`;
  hint.style.opacity = 1 - smooth(0.01, 0.05, u);

  composer.render();
  requestAnimationFrame(frame);
}
frame();

// ---------- galeri ----------
const grid = document.getElementById("gallery-grid");
grid.innerHTML = TATTOOS.map((t) => `
  <figure class="card">
    <div class="art">${svgMarkup(t, "#e9dfcb", "#0f0d10")}</div>
    <figcaption><span>${t.name}</span><em>${t.style}</em></figcaption>
  </figure>`).join("");

// kara bulutlar için doku
const dark = cloudCanvas(512, 21, "70,66,78").toDataURL();
document.querySelectorAll(".smoke-layer").forEach((el) => (el.style.backgroundImage = `url(${dark})`));
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.2 });
document.querySelectorAll(".card, .reveal").forEach((el) => io.observe(el));
const parallax = [...document.querySelectorAll("[data-speed]")];
window.addEventListener("scroll", () => {
  for (const el of parallax) { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(0, ${r.top * +el.dataset.speed}px, 0)`; }
}, { passive: true });

// test: ?goto=eserler
if (params.has("nojourney")) document.getElementById("journey").style.display = "none";
