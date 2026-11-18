// Eserler galerisi — 21st.dev "3D Curved Lens Carousel" bileşeninin düz JS uyarlaması.
// Kartlar tek bir WebGL tuvalinde çizilir; merkez düz, kenarlar eğri ve renk kaymalı.
// Sürükle, fırlat, ok tuşları veya butonlar; yaylanarak durur ve döngü yapar.
import { svgMarkup } from "./tattoos.js";

// ---------- hareket yardımcıları ----------
const wrap = (i, n) => (n > 0 ? ((i % n) + n) % n : 0);
const offsetOf = (i, pos, n) => (n <= 0 ? 0 : wrap(i - pos + n / 2, n) - n / 2);
const restFor = (pos, velocity, max = 3) => Math.round(pos + Math.max(-max, Math.min(max, velocity * 0.18)));
function springStep(pos, vel, target, dt, omega = 11) {
  const a = (target - pos) * omega * omega - vel * 2 * omega;
  const v = vel + a * dt;
  return [pos + v * dt, v];
}
function cardSize(w, h) {
  const cw = Math.min(w < 640 ? w * 0.56 : w * 0.22, h * 0.34);
  return [Math.round(cw), Math.round(cw * 1.25)];
}
const pad2 = (n) => (n < 10 ? "0" + n : String(n));

// ---------- shader ----------
const VERT =
  "attribute vec2 aPos;" +
  "uniform vec2 uRes;uniform vec2 uSize;uniform float uX;uniform float uBend;uniform float uVel;uniform float uIntro;uniform float uLift;" +
  "varying vec2 vUv;varying float vX;" +
  "void main(){" +
  "vec2 p=vec2(uX+(aPos.x-.5)*uSize.x,(aPos.y-.5)*uSize.y);" +
  "p.y-=(1.-uIntro)*uSize.y*.9;" +
  "vec2 n=p/(uRes*.5);" +
  "float x=clamp(n.x,-1.4,1.4);" +
  "n.y*=1.+uBend*x*x;" +
  "n.y+=uVel*.05*sin(aPos.x*3.14159)*(aPos.y-.5);" +
  "n.x*=1.-.06*uBend*x*x;n.y+=uLift;" +
  "vUv=aPos;vX=x;" +
  "gl_Position=vec4(n,0.,1.);}";
const FRAG =
  "precision highp float;" +
  "uniform sampler2D uTex;uniform vec2 uSize;uniform float uAspect;uniform float uVel;uniform float uIntro;uniform float uShift;uniform float uReady;" +
  "varying vec2 vUv;varying float vX;" +
  "float box(vec2 q,vec2 b,float r){vec2 d=abs(q)-b+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}" +
  "void main(){" +
  "float a=uSize.x/uSize.y;vec2 uv=vUv-.5;" +
  "if(uAspect>a)uv.x*=a/uAspect;else uv.y*=uAspect/a;" +
  "uv=uv/1.12+.5;uv.x+=uShift;" +
  "float ca=(.0012+.0045*vX*vX)*(1.+abs(uVel)*1.2);" +
  "vec3 c=vec3(texture2D(uTex,uv+vec2(ca,0.)).r,texture2D(uTex,uv).g,texture2D(uTex,uv-vec2(ca,0.)).b);" +
  "c=mix(vec3(.11,.11,.12),c,uReady);" +
  "c*=1.-.42*min(1.,vX*vX);" +
  "float d=box((vUv-.5)*uSize,uSize*.5,14.);" +
  "float rim=smoothstep(-5.,0.,d);" +
  "c+=rim*.10;" +
  "c+=.07*smoothstep(.55,1.,vUv.y)*(1.-abs(vX));" +
  "float al=smoothstep(.75,-.75,d)*uIntro;" +
  "gl_FragColor=vec4(c*al,al);}";

function grid(segX, segY) {
  const out = [];
  for (let y = 0; y < segY; y++)
    for (let x = 0; x < segX; x++) {
      const x0 = x / segX, x1 = (x + 1) / segX, y0 = y / segY, y1 = (y + 1) / segY;
      out.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
    }
  return new Float32Array(out);
}

// ---------- dövme çizimini 4:5 "kart görseli"ne çevir ----------
const INK = "#e9dfcb", PAPER = "#0f0d10";
const TW = 800, TH = 1000;
function renderCard(t) {
  const canvas = document.createElement("canvas");
  canvas.width = TW; canvas.height = TH;
  const g = canvas.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, TH);
  bg.addColorStop(0, "#17131a"); bg.addColorStop(1, "#0a090b");
  g.fillStyle = bg; g.fillRect(0, 0, TW, TH);
  const glow = g.createRadialGradient(TW / 2, TH * 0.46, 0, TW / 2, TH * 0.46, TW * 0.55);
  glow.addColorStop(0, "rgba(179,38,30,.28)"); glow.addColorStop(1, "rgba(179,38,30,0)");
  g.fillStyle = glow; g.fillRect(0, 0, TW, TH);
  g.strokeStyle = "rgba(233,223,203,.16)"; g.lineWidth = 2;
  g.strokeRect(46, 46, TW - 92, TH - 92);
  const ready = new Promise((resolve) => {
    const img = new Image();
    const svg = svgMarkup(t, INK, PAPER, 2.6).replace("<svg ", '<svg width="640" height="640" ');
    img.onload = () => { g.drawImage(img, (TW - 600) / 2, (TH - 600) / 2 - 10, 600, 600); resolve(); };
    img.onerror = resolve;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
  return { canvas, ready };
}

const CSS = `
.clc-root{position:relative;width:100%;height:var(--clc-h,min(86svh,820px));overflow:hidden;isolation:isolate;outline:none;user-select:none;-webkit-user-select:none;color:var(--ink)}
.clc-root:focus-visible{box-shadow:inset 0 0 0 1px rgba(233,223,203,.4)}
.clc-glow,.clc-canvas,.clc-grain{-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(180deg,transparent,#000 10%,#000 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(180deg,transparent,#000 10%,#000 100%);mask-composite:intersect}
.clc-glow{position:absolute;inset:-20%;background:radial-gradient(50% 40% at 50% 46%,rgba(179,38,30,.10),transparent 70%);pointer-events:none}
.clc-grain{position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.clc-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y}
.clc-canvas:active{cursor:grabbing}
.clc-top{position:absolute;left:clamp(8px,2vw,24px);right:clamp(8px,2vw,24px);top:6px;display:flex;justify-content:space-between;align-items:center;font-family:var(--head);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);pointer-events:none}
.clc-copy{position:absolute;left:clamp(8px,2vw,24px);bottom:clamp(8px,2vw,24px);max-width:min(560px,70%);pointer-events:none}
.clc-kicker{display:block;font-family:var(--head);font-size:12px;letter-spacing:.36em;text-transform:uppercase;color:var(--blood);margin-bottom:10px}
.clc-title{font-family:var(--display);font-weight:400;font-size:clamp(52px,8vw,112px);line-height:.95;margin:0;display:block;text-shadow:0 2px 30px rgba(0,0,0,.9)}
.clc-line{display:block;overflow:hidden;padding:.06em .04em .1em}
.clc-ch{display:inline-block;transform:translateY(105%) rotate(6deg);opacity:0;transition:transform .9s cubic-bezier(.2,.9,.1,1),opacity .6s ease}
.clc-in .clc-ch{transform:none;opacity:1}
.clc-ctl{position:absolute;right:clamp(8px,2vw,24px);bottom:clamp(8px,2vw,24px);display:flex;flex-direction:column;align-items:flex-end;gap:16px}
.clc-count{font-family:var(--head);font-size:13px;letter-spacing:.2em;font-variant-numeric:tabular-nums}
.clc-count i{font-style:normal;opacity:.45}
.clc-bar{width:132px;height:2px;background:rgba(233,223,203,.16);overflow:hidden}
.clc-bar>span{display:block;height:100%;width:100%;background:var(--ember);transform-origin:0 50%;transition:transform .7s cubic-bezier(.2,.9,.1,1)}
.clc-btns{display:flex;gap:10px}
.clc-btn{width:46px;height:46px;border-radius:999px;display:grid;place-items:center;color:var(--ink);cursor:pointer;background:rgba(0,0,0,.35);border:1px solid rgba(233,223,203,.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:transform .35s cubic-bezier(.3,1.6,.5,1),background .3s,color .3s}
.clc-btn:hover{transform:translateY(-2px) scale(1.06);background:var(--ink);color:#000}
.clc-btn:active{transform:scale(.94)}
.clc-btn:focus-visible{outline:2px solid var(--ember);outline-offset:3px}
.clc-btn svg{width:18px;height:18px}
.clc-fallback{position:absolute;left:50%;top:50%;width:min(62vw,360px);aspect-ratio:4/5;transform:translate(-50%,-50%);object-fit:cover;border-radius:14px}
@media (max-width:640px){.clc-copy{max-width:calc(100% - 16px);bottom:76px}.clc-ctl{flex-direction:row;align-items:center;left:8px;justify-content:space-between}.clc-bar{width:96px}}
@media (prefers-reduced-motion:reduce){.clc-ch,.clc-bar>span,.clc-btn{transition:opacity .2s}.clc-ch{transform:none}}
`;

/**
 * @param {HTMLElement} host   Galerinin kurulacağı boş kutu
 * @param {{name:string, style:string, svg:string}[]} tattoos
 * @param {{bend?:number,label?:string,hint?:string}} opts
 */
export function mountLens(host, tattoos, { bend = 0.55, label = "Yaga Tattoo", hint = "Sürükle" } = {}) {
  const n = tattoos.length;
  if (!n) return;
  if (!document.getElementById("clc-style")) {
    const st = document.createElement("style");
    st.id = "clc-style"; st.textContent = CSS; document.head.appendChild(st);
  }
  host.innerHTML = `
    <div class="clc-root" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Eserler">
      <div class="clc-glow" aria-hidden="true"></div>
      <canvas class="clc-canvas" aria-hidden="true"></canvas>
      <div class="clc-grain" aria-hidden="true"></div>
      <div class="clc-top"><b style="font-weight:600">${label}</b><span>${hint}</span></div>
      <div class="clc-copy" aria-live="polite"></div>
      <div class="clc-ctl">
        <span class="clc-count"></span>
        <span class="clc-bar" aria-hidden="true"><span></span></span>
        <div class="clc-btns">
          <button type="button" class="clc-btn" data-d="-1" aria-label="Önceki"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button type="button" class="clc-btn" data-d="1" aria-label="Sonraki"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>`;
  const root = host.querySelector(".clc-root");
  const canvas = host.querySelector(".clc-canvas");
  const copy = host.querySelector(".clc-copy");
  const count = host.querySelector(".clc-count");
  const barFill = host.querySelector(".clc-bar > span");

  // ---- metin bloğu ----
  let shown = false, copyRaf = 0;
  function setCopy(i) {
    const t = tattoos[i];
    const words = t.name.split(" ");
    let off = 0;
    const chars = words.map((w) => {
      const html = `<span style="display:inline-block;white-space:nowrap">${[...w].map((c, k) =>
        `<span class="clc-ch" style="transition-delay:${60 + (off + k) * 24}ms">${c}</span>`).join("")}</span>`;
      off += w.length + 1;
      return html;
    }).join(" ");
    copy.className = "clc-copy";
    copy.innerHTML = `<span class="clc-kicker">${t.style}</span><h3 class="clc-title"><span class="clc-line">${chars}</span></h3>`;
    count.innerHTML = `${pad2(i + 1)} <i>/ ${pad2(n)}</i>`;
    barFill.style.transform = `scaleX(${(i + 1) / n})`;
    cancelAnimationFrame(copyRaf);
    if (shown) copyRaf = requestAnimationFrame(() => requestAnimationFrame(() => copy.classList.add("clc-in")));
  }
  setCopy(0);

  const cards = tattoos.map(renderCard);
  const api = { go: () => {} };
  host.querySelectorAll(".clc-btn").forEach((b) => b.addEventListener("click", () => api.go(+b.dataset.d)));

  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl && gl.createProgram();
  if (gl) {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
  }
  if (!gl || !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    // WebGL yok: ortadaki kartı düz resim olarak göster, butonlarla gez
    let cur = 0;
    const img = document.createElement("img");
    img.className = "clc-fallback"; img.alt = tattoos[0].name;
    root.insertBefore(img, root.querySelector(".clc-grain"));
    const show = () => { img.src = cards[cur].canvas.toDataURL(); img.alt = tattoos[cur].name; };
    Promise.all(cards.map((c) => c.ready)).then(show);
    shown = true; setCopy(0); copy.classList.add("clc-in");
    api.go = (d) => { cur = wrap(cur + d, n); show(); setCopy(cur); copy.classList.add("clc-in"); };
    return;
  }

  gl.useProgram(prog);
  const mesh = grid(36, 12);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = {};
  for (const k of ["uRes", "uSize", "uX", "uBend", "uVel", "uIntro", "uTex", "uAspect", "uShift", "uReady", "uLift"]) u[k] = gl.getUniformLocation(prog, k);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tex = cards.map((c) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([28, 28, 30, 255]));
    for (const [p, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_2D, p, v);
    const entry = { t, aspect: TW / TH, ready: false };
    c.ready.then(() => {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c.canvas);
      entry.ready = true;
      kick();
    });
    return entry;
  });

  let W = 1, H = 1, cw = 1, ch = 1, gap = 1;
  let pos = 0, vel = 0, target = 0;
  let intro = reduced.matches ? 1 : 0, introStart = -1;
  let dragging = false, dragX = 0, dragPos = 0, lastX = 0, lastT = 0, flick = 0;
  let raf = 0, last = 0, visible = false, current = 0;

  function resize(w, h) {
    W = Math.max(1, w); H = Math.max(1, h);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    [cw, ch] = cardSize(W, H);
    gap = cw * 0.14;
    gl.viewport(0, 0, canvas.width, canvas.height);
    kick();
  }
  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform2f(u.uSize, cw, ch);
    gl.uniform1f(u.uBend, bend);
    gl.uniform1f(u.uVel, reduced.matches ? 0 : Math.max(-1, Math.min(1, vel * 0.12)));
    gl.uniform1f(u.uLift, W < 640 ? 0.3 : 0.15);
    const step = cw + gap;
    for (let i = 0; i < n; i++) {
      const d = offsetOf(i, pos, n);
      const x = d * step;
      if (Math.abs(x) > W * 0.5 + step * 1.5) continue;
      const t = Math.max(0, Math.min(1, (intro - Math.abs(d) * 0.12) / 0.6));
      gl.bindTexture(gl.TEXTURE_2D, tex[i].t);
      gl.uniform1f(u.uX, x);
      gl.uniform1f(u.uIntro, 1 - Math.pow(1 - t, 3));
      gl.uniform1f(u.uAspect, tex[i].aspect);
      gl.uniform1f(u.uReady, tex[i].ready ? 1 : 0);
      gl.uniform1f(u.uShift, Math.max(-0.05, Math.min(0.05, -d * 0.035)));
      gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 2);
    }
  }
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    if (intro < 1) {
      if (introStart < 0) introStart = now;
      intro = Math.min(1.5, (now - introStart) / 1100);
      if (intro >= 1.5) intro = 1;
    }
    if (!dragging) {
      if (reduced.matches) { pos = target; vel = 0; }
      else [pos, vel] = springStep(pos, vel, target, dt);
    }
    const idx = wrap(Math.round(pos), n);
    if (idx !== current) { current = idx; setCopy(idx); }
    draw();
    const settled = !dragging && Math.abs(target - pos) < 0.0005 && Math.abs(vel) < 0.001 && (intro >= 1 || reduced.matches);
    if (settled) { pos = target; draw(); last = 0; }
    else if (visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  api.go = (dir) => { target = Math.round(target) + dir; kick(); };
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true; dragX = lastX = e.clientX; lastT = e.timeStamp; dragPos = pos; flick = 0;
    canvas.setPointerCapture(e.pointerId); kick();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const step = cw + gap;
    const dts = Math.max(1, e.timeStamp - lastT) / 1000;
    flick = flick * 0.6 + (-(e.clientX - lastX) / step / dts) * 0.4;
    vel = flick; lastX = e.clientX; lastT = e.timeStamp;
    pos = dragPos - (e.clientX - dragX) / step; kick();
  });
  const up = () => { if (!dragging) return; dragging = false; target = restFor(pos, flick); vel = flick; kick(); };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") api.go(1);
    else if (e.key === "ArrowLeft") api.go(-1);
    else return;
    e.preventDefault();
  });
  reduced.addEventListener("change", kick);

  new ResizeObserver((es) => { const r = es[0].contentRect; resize(r.width, r.height); }).observe(root);
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) {
      if (!shown) { shown = true; setCopy(current); }
      kick();
    }
  }).observe(root);
}
