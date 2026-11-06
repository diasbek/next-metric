
/** Adapted motion runtime from metric-site.zip for React-mounted DOM. */
export function createProtoMotion(root) {
  const D = document;
  const H = D.documentElement;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) H.classList.add('fine');
  const EO = 'cubic-bezier(.16,1,.3,1)';
  const EIO = 'cubic-bezier(.76,0,.24,1)';
  const eOut = (t) => 1 - Math.pow(1 - t, 4);
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eIn = (t) => t * t * t;
  const ss = (a, b, v) => {
    const t = clamp((v - a) / Math.max(1e-6, b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const play = (el, kf, o) => el && el.animate ? el.animate(kf, Object.assign({ fill: 'backwards', easing: EO }, o)) : null;
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const IM = (n) => {
    const s = String(n);
    if (s.startsWith('/') || /^https?:\/\//i.test(s)) return s;
    return `/images/metric/proto/${s}.webp`;
  };
  const CATS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'];
  let VW = innerWidth, VH = innerHeight, PX = -1e4, PY = -1e4, vel = 0, sy = window.scrollY || 0;
  const mob = () => VW < 700;
  const loadImg = (src) => new Promise((res, rej) => {
    const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  const rrect = (c, x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  };

/* ---------------- WebGL helpers ---------------- */
const VSQ = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FS_SPLAT = [
  'precision highp float;varying vec2 v;uniform sampler2D u_prev;uniform vec2 u_g;uniform float u_r,u_amp,u_dec,u_asp,u_k;',
  'void main(){vec4 pr=texture2D(u_prev,v);vec2 d=(v-u_g)*vec2(u_asp,1.);float e=exp(-dot(d,d)/(u_r*u_r));',
  'float f=max(0.,pr.r*u_dec-.003*u_k)+e*u_amp;',
  'float s=max(0.,pr.g*(1.-.0012*u_k)-.0022*u_k)+e*u_amp*.4;',
  'gl_FragColor=vec4(clamp(f,0.,1.),clamp(s,0.,1.),0.,1.);}'
].join('\n');
const FS_SHOW = [
  'precision highp float;varying vec2 v;uniform sampler2D u_atlas,u_heat;uniform vec2 u_g;uniform float u_asp,u_lens,u_lift;',
  'vec3 ramp(float h){vec3 a=mix(vec3(.22,.02,.18),vec3(.78,.07,.40),smoothstep(0.,.35,h));',
  'a=mix(a,vec3(1.,.235,.51),smoothstep(.3,.6,h));a=mix(a,vec3(1.,.55,.27),smoothstep(.56,.82,h));',
  'return mix(a,vec3(1.,.93,.6),smoothstep(.8,1.,h));}',
  'void main(){vec2 d=(v-u_g)*vec2(u_asp,1.);float ln=exp(-dot(d,d)/.035)*u_lens;',
  'vec2 uv=v-(v-u_g)*.3*ln;vec3 b=texture2D(u_atlas,uv).rgb;vec2 hh=texture2D(u_heat,v).rg;',
  'float h=max(hh.r,hh.g*.6);float l=dot(b,vec3(.299,.587,.114));',
  'vec3 dim=mix(vec3(l),b,.14)*(.15+u_lift);float k=max(smoothstep(.05,.55,h),ln*.9);',
  'vec3 c=mix(dim,b,k);c+=ramp(h)*smoothstep(.012,.6,h)*(.78-.5*k);',
  'c+=vec3(1.,.24,.51)*ln*.05;',
  'gl_FragColor=vec4(c,1.);}'
].join('\n');
const GL = {
  make(cv) { const o = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }; try { return cv.getContext('webgl', o) || cv.getContext('experimental-webgl', o); } catch (e) { return null; } },
  sh(gl, ty, src) { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; },
  prog(gl, fs) {
    const p = gl.createProgram(); gl.attachShader(p, GL.sh(gl, gl.VERTEX_SHADER, VSQ)); gl.attachShader(p, GL.sh(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  },
  tex(gl, w, h) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  },
  fbo(gl, t) { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null); return ok ? f : null; }
};

/* ---------------- hero: eye-tracking heat over an Amazon results grid ---------------- */

const Heat = {
  ok: false, vis: true, ready: false, imgs: [], tiles: [], fix: [], dwell: {}, g: { x: -1, y: -1 }, tg: { x: 0, y: 0 }, last: -10, auto: true, sim: null, lit: 0,
  init() {
    this.cv = D.createElement('canvas'); this.cv.className = 'hero-cv'; this.cv.setAttribute('aria-hidden', 'true');
    const gl = GL.make(this.cv);
    if (gl) {
      try {
        this.sp = GL.prog(gl, FS_SPLAT); this.sh = GL.prog(gl, FS_SHOW);
        this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        this.ta = GL.tex(gl); this.gl = gl; this.ok = true;
        this.cv.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost(); });
      } catch (e) { console.warn('heat', e); this.ok = false; }
    }
    if (!this.ok) this.toFallback();
    this.atlas = D.createElement('canvas');
  },
  toFallback() { this.ok = false; this.gl = null; const c = D.createElement('canvas'); c.className = 'hero-cv'; c.setAttribute('aria-hidden', 'true'); if (this.cv && this.cv.parentNode) this.cv.replaceWith(c); this.cv = c; this.c2 = c.getContext('2d'); this.W = 0; },
  lost() { this.toFallback(); if (this.el) this.bindEl(); this.size(true); },
  attach(el) {
    this.el = $('.hero', el); if (!this.el) return;
    const h = $('.hero-cvh', this.el); if (h) h.replaceWith(this.cv);
    this.spc = $('.hero-sp', this.el); this.sc = this.spc.getContext('2d');
    this.rows = $$('.att-r', this.el); this.mode = $('.att-h b', this.el);
    this.bindEl(); this.W = 0; this.fix = []; this.dwell = {};
    if ('IntersectionObserver' in window) { if (this.io) this.io.disconnect(); this.io = new IntersectionObserver(es => es.forEach(e => { this.vis = e.isIntersecting; }), { rootMargin: '60px' }); this.io.observe(this.el); }
  },
  bindEl() {
    if (this.el.__hb) return; this.el.__hb = 1;
    const mv = e => { const r = this.el.getBoundingClientRect(); this.tg.x = e.clientX - r.left; this.tg.y = e.clientY - r.top; if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'pen' || e.type === 'pointerdown') { this.auto = false; this.last = performance.now(); } };
    this.el.addEventListener('pointermove', mv, { passive: true });
    this.el.addEventListener('pointerdown', mv, { passive: true });
    this.el.addEventListener('pointerleave', () => { this.last = performance.now() - 1800; });
  },
  load() { if (this.lp) return this.lp; this.lp = Promise.all(CATS.map(n => loadImg(IM(n)))).then(a => { this.imgs = a; }); return this.lp; },
  layout(W, Hh) {
    const m = W < 700, t = [];
    const cols = m ? 3 : W < 1100 ? 4 : 5, gap = m ? 10 : Math.max(14, W * .012);
    const x0 = m ? 16 : W * (W < 1100 ? .30 : .36), x1 = m ? W - 16 : W + W * .06;
    const cw = (x1 - x0 - gap * (cols - 1)) / cols, ih = cw * 4 / 3, ch = ih + cw * .42;
    const y0 = m ? 84 : 92 - ch * .18, rows = Math.ceil((Hh - y0) / (ch + gap)) + 1;
    const order = [0, 3, 6, 1, 4, 7, 2, 5, 8];
    let n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * (cw + gap) + (r % 2 ? 0 : 0), y = y0 + r * (ch + gap) + (c % 2 ? ch * .14 : 0);
      if (y > Hh) continue;
      t.push({ x, y, w: cw, h: ch, ih, im: order[(n + r * 2) % 9], id: n }); n++;
    }
    this.tiles = t;
  },
  paintAtlas(W, Hh, d) {
    const a = this.atlas; a.width = Math.round(W * d); a.height = Math.round(Hh * d);
    const c = a.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = '#0D0C10'; c.fillRect(0, 0, W, Hh);
    const star = (x, y, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.closePath(); c.fill(); };
    this.tiles.forEach(tl => {
      const { x, y, w, h, ih } = tl, rad = Math.max(8, w * .05);
      c.fillStyle = '#FFFFFF'; rrect(c, x, y, w, h, rad); c.fill();
      const im = this.imgs[tl.im];
      if (im) { c.save(); rrect(c, x, y, w, ih, rad); c.clip(); c.drawImage(im, x, y, w, ih); c.restore(); }
      const p = w * .07, ly = y + ih + w * .07;
      c.fillStyle = '#D6D6DC'; rrect(c, x + p, ly, w * .8, w * .035, 2); c.fill(); rrect(c, x + p, ly + w * .06, w * .55, w * .035, 2); c.fill();
      c.fillStyle = '#FFA41C'; for (let i = 0; i < 5; i++) star(x + p + w * .03 + i * w * .07, ly + w * .15, w * .028);
      c.fillStyle = '#C9C9D0'; rrect(c, x + p + w * .38, ly + w * .135, w * .16, w * .03, 2); c.fill();
      c.fillStyle = '#0B0B0D'; rrect(c, x + p, ly + w * .2, w * .3, w * .055, 3); c.fill();
      c.fillStyle = '#FF3C82'; rrect(c, x + p + w * .34, ly + w * .212, w * .14, w * .032, 2); c.fill();
    });
  },
  size(force) {
    if (!this.el) return;
    const r = this.el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const W = Math.round(r.width), Hh = Math.round(r.height);
    if (!force && W === this.W && Hh === this.H) return;
    this.W = W; this.H = Hh; const d = this.d = Math.min(window.devicePixelRatio || 1, 1.5);
    this.cv.width = Math.round(W * d); this.cv.height = Math.round(Hh * d);
    this.spc.width = Math.round(W * d); this.spc.height = Math.round(Hh * d);
    this.layout(W, Hh); this.paintAtlas(W, Hh, d); this.dwell = {}; this.fix = []; this.frozen = false; this.cf = null; this.sim = null;
    if (this.g.x < 0) { this.g.x = W * .66; this.g.y = Hh * .4; this.tg.x = this.g.x; this.tg.y = this.g.y; }
    if (this.ok) {
      const gl = this.gl, hw = Math.max(2, Math.round(W / 2)), hh = Math.max(2, Math.round(Hh / 2));
      gl.bindTexture(gl.TEXTURE_2D, this.ta); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      [this.hA, this.hB].forEach(t => t && gl.deleteTexture(t)); [this.fA, this.fB].forEach(f => f && gl.deleteFramebuffer(f));
      this.hA = GL.tex(gl, hw, hh); this.hB = GL.tex(gl, hw, hh); this.fA = GL.fbo(gl, this.hA); this.fB = GL.fbo(gl, this.hB);
      if (!this.fA || !this.fB) { this.toFallback(); this.el && this.size(true); return; }
      [this.fA, this.fB].forEach(f => { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); this.hw = hw; this.hh = hh;
    }
    this.ready = true;
  },
  tileAt(x, y) { for (const t of this.tiles) if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) return t; return null; },
  pickTarget() {
    const vis = this.tiles.filter(t => t.y + t.ih * .3 > 70 && t.y + t.ih * .6 < this.H - 40 && t.x + t.w * .5 < this.W - 10 && t.x > -10);
    if (!vis.length) return { x: this.W * .6, y: this.H * .4 };
    if (!this.fav || !vis.includes(this.fav)) this.fav = vis[Math.floor(Math.random() * vis.length)];
    const t = Math.random() < .42 ? this.fav : vis[Math.floor(Math.random() * vis.length)];
    return { x: t.x + t.w * (.25 + Math.random() * .5), y: t.y + t.ih * (.22 + Math.random() * .55) };
  },
  simStep(dt) {
    let s = this.sim; const now = performance.now();
    if (!s) { const p = this.pickTarget(); s = this.sim = { ph: 'fix', t: 0, dur: 400, fx: p.x, fy: p.y, sx: p.x, sy: p.y }; this.g.x = p.x; this.g.y = p.y; this.fixStart(p.x, p.y); }
    s.t += dt * 1000;
    if (s.ph === 'sac') {
      const q = eIO(clamp(s.t / s.dur, 0, 1)); this.g.x = lerp(s.sx, s.fx, q); this.g.y = lerp(s.sy, s.fy, q);
      if (s.t >= s.dur) { s.ph = 'fix'; s.t = 0; s.dur = 1000 + Math.random() * 1100; this.fixStart(s.fx, s.fy); }
    } else {
      this.g.x = s.fx + Math.sin(now * .031) * 1.6; this.g.y = s.fy + Math.cos(now * .027) * 1.6;
      if (s.t >= s.dur) { this.fixEnd(); const p = this.pickTarget(); s.ph = 'sac'; s.t = 0; s.sx = s.fx; s.sy = s.fy; s.fx = p.x; s.fy = p.y; s.dur = 700 + Math.hypot(p.x - s.sx, p.y - s.sy) * .9; }
    }
    return s.ph === 'fix';
  },
  fixStart(x, y) { this.cf = { x, y, t0: performance.now(), dur: 0, n: (this.fn = (this.fn || 0) + 1) }; this.fix.push(this.cf); if (this.fix.length > 9) this.fix.shift(); },
  fixEnd() { this.cf = null; },
  frame(dt) {
    if (!this.ready || !this.vis || !this.el) return;
    const now = performance.now();
    if (now - this.last > 2600) this.auto = true;
    if (this.modeShown !== this.auto && this.mode) { this.modeShown = this.auto; this.mode.textContent = this.auto ? (reduce ? 'still frame' : 'simulated') : 'your cursor'; }
    if (!this.auto && this.hold) { this.hold = false; this.fix.forEach(f => { f.keep = false; f.t0 = now - f.dur; }); }
    if (reduce && this.auto) {
      if (!this.frozen) this.freeze();
      if (this.ok) this.drawGL(0, this.hold ? 1 : Math.pow(.986, dt * 60), this.hold ? 0 : dt * 60); else this.draw2D();
      this.drawPath(now); if (now - (this.ra || 0) > 260) { this.ra = now; this.readout(); }
      return;
    }
    let fixing;
    if (this.auto) fixing = this.simStep(dt);
    else {
      if (this.sim) { this.sim = null; this.fixEnd(); }
      const k = 1 - Math.pow(1 - .3, dt * 60); const ox = this.g.x, oy = this.g.y;
      this.g.x = lerp(this.g.x, this.tg.x, k); this.g.y = lerp(this.g.y, this.tg.y, k);
      const sp = Math.hypot(this.g.x - ox, this.g.y - oy) / Math.max(dt, .001);
      this.slow = sp < 70 ? (this.slow || 0) + dt : 0;
      if (this.slow > .16 && !this.cf) this.fixStart(this.g.x, this.g.y);
      if (sp > 260 && this.cf) this.fixEnd();
      fixing = !!this.cf;
    }
    if (this.cf) this.cf.dur = now - this.cf.t0;
    const tl = this.tileAt(this.g.x, this.g.y); if (tl) this.dwell[tl.id] = (this.dwell[tl.id] || 0) + dt;
    this.lit = lerp(this.lit, 1, .02);
    if (this.ok) this.drawGL((fixing ? .05 : .018) * dt * 60, Math.pow(.986, dt * 60), dt * 60); else this.draw2D();
    this.drawPath(now);
    if (now - (this.ra || 0) > 260) { this.ra = now; this.readout(); }
  },
  freeze() {
    this.frozen = true; this.hold = true; this.fix = []; this.dwell = {}; this.lit = 1;
    if (this.ok) { const gl = this.gl; [this.fA, this.fB].forEach(f => { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    const now = performance.now();
    for (let i = 0; i < 6; i++) {
      const p = this.pickTarget(), f = { x: p.x, y: p.y, t0: now, dur: 300 + (i * 173) % 620, n: i + 1, keep: true };
      this.fix.push(f); const tl = this.tileAt(p.x, p.y); if (tl) this.dwell[tl.id] = (this.dwell[tl.id] || 0) + f.dur / 1000;
      this.g.x = p.x; this.g.y = p.y; if (this.ok) for (let k = 0; k < 4; k++) this.splat(.26, 1, 0);
    }
    this.fn = 6;
  },
  splat(amp, dec, k) {
    const gl = this.gl, W = this.W, Hh = this.H;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(this.sp.p); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fB); gl.viewport(0, 0, this.hw, this.hh);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.hA); gl.uniform1i(this.sp.u.u_prev, 0);
    gl.uniform2f(this.sp.u.u_g, this.g.x / W, 1 - this.g.y / Hh); gl.uniform1f(this.sp.u.u_asp, W / Hh); gl.uniform1f(this.sp.u.u_r, (mob() ? .1 : .09));
    gl.uniform1f(this.sp.u.u_amp, amp); gl.uniform1f(this.sp.u.u_dec, dec); gl.uniform1f(this.sp.u.u_k, k);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    [this.hA, this.hB] = [this.hB, this.hA]; [this.fA, this.fB] = [this.fB, this.fA];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },
  drawGL(amp, dec, k) {
    const gl = this.gl, W = this.W, Hh = this.H;
    this.splat(amp, dec, k);
    gl.viewport(0, 0, this.cv.width, this.cv.height);
    gl.useProgram(this.sh.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.ta); gl.uniform1i(this.sh.u.u_atlas, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.hA); gl.uniform1i(this.sh.u.u_heat, 1);
    gl.uniform2f(this.sh.u.u_g, this.g.x / W, 1 - this.g.y / Hh); gl.uniform1f(this.sh.u.u_asp, W / Hh); gl.uniform1f(this.sh.u.u_lens, this.auto ? (reduce ? 0 : .55) : 1); gl.uniform1f(this.sh.u.u_lift, .06 * (1 - this.lit));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  },
  draw2D() {
    const c = this.c2; if (!c) return; const d = this.d, W = this.W, Hh = this.H;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.drawImage(this.atlas, 0, 0); c.fillStyle = 'rgba(13,12,16,.72)'; c.fillRect(0, 0, this.cv.width, this.cv.height);
    const R = (mob() ? 90 : 130) * d, x = this.g.x * d, y = this.g.y * d;
    c.save(); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.clip(); c.drawImage(this.atlas, 0, 0); c.restore();
    const gr = c.createRadialGradient(x, y, 0, x, y, R * 1.25); gr.addColorStop(0, 'rgba(255,200,120,.32)'); gr.addColorStop(.45, 'rgba(255,60,130,.26)'); gr.addColorStop(1, 'rgba(255,60,130,0)');
    c.globalCompositeOperation = 'lighter'; c.fillStyle = gr; c.fillRect(x - R * 1.3, y - R * 1.3, R * 2.6, R * 2.6); c.globalCompositeOperation = 'source-over';
  },
  drawPath(now) {
    const c = this.sc, d = this.d; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, this.W, this.H);
    const F = this.fix.filter(f => f.keep || now - f.t0 - f.dur < 6000); this.fix = F;
    c.lineWidth = 1;
    for (let i = 1; i < F.length; i++) { const a = F[i - 1], b = F[i], al = .42 * (b.keep ? 1 : 1 - clamp((now - b.t0 - b.dur) / 6000, 0, 1)); c.strokeStyle = 'rgba(244,243,241,' + al.toFixed(3) + ')'; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    c.font = '500 10px "Archivo", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    F.forEach(f => {
      const age = f.keep ? 0 : clamp((now - f.t0 - f.dur) / 6000, 0, 1), al = 1 - age, r = 7 + Math.min(24, f.dur / 45);
      c.fillStyle = 'rgba(255,60,130,' + (.2 * al).toFixed(3) + ')'; c.beginPath(); c.arc(f.x, f.y, r, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,60,130,' + (.95 * al).toFixed(3) + ')'; c.lineWidth = 1.4; c.stroke(); c.lineWidth = 1;
      c.fillStyle = 'rgba(255,255,255,' + al.toFixed(3) + ')'; c.fillText(String(f.n), f.x, f.y + .5);
      if (f === this.cf) { c.fillStyle = 'rgba(244,243,241,.85)'; c.textAlign = 'left'; c.fillText(Math.round(f.dur) + ' ms', f.x + r + 6, f.y - r * .6); c.textAlign = 'center'; }
    });
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(this.g.x, this.g.y, 3, 0, Math.PI * 2); c.stroke();
  },
  readout() {
    if (!this.rows || !this.rows.length) return;
    const ent = Object.entries(this.dwell), sum = ent.reduce((a, e) => a + e[1], 0);
    ent.sort((a, b) => b[1] - a[1]);
    this.rows.forEach((r, i) => {
      const e = ent[i], nm = r.children[0], bar = r.querySelector('i b'), pc = r.children[2];
      if (!e || sum < .05) { nm.textContent = 'Listing —'; bar.style.width = '0%'; pc.textContent = '—'; return; }
      const v = e[1] / sum * 100; nm.textContent = 'Listing ' + pad(+e[0] + 1); bar.style.width = v.toFixed(1) + '%'; pc.textContent = v.toFixed(0) + '%';
    });
  },
  start() { this.lit = 0; this.sim = null; this.auto = true; this.last = -1e4; this.modeShown = null; this.frozen = false; }
}
function splitLines(n) {
  const toks = []; let sp = false;
  Array.from(n.childNodes).forEach(c => {
    if (c.nodeType === 3) c.textContent.split(/([ \t\n\r]+)/).forEach(p => { if (!p) return; if (/^[ \t\n\r]+$/.test(p)) { sp = true; return; } toks.push({ node: D.createTextNode(p), sp }); sp = false; });
    else if (c.nodeType === 1) { toks.push({ node: c.cloneNode(true), sp }); sp = false; }
  });
  n.textContent = '';
  toks.forEach((tk, i) => { if (i && tk.sp) n.appendChild(D.createTextNode(' ')); const s = D.createElement('span'); s.appendChild(tk.node); n.appendChild(s); tk.s = s; });
  const lines = []; let top = null, line = null;
  toks.forEach(tk => { const tp = tk.s.offsetTop; if (top === null || Math.abs(tp - top) > 3) { line = []; lines.push(line); top = tp; } line.push(tk); });
  n.textContent = '';
  return lines.map(l => { const ln = D.createElement('span'); ln.className = 'ln'; const li = D.createElement('span'); li.className = 'li'; l.forEach((tk, i) => { if (i && tk.sp) li.appendChild(D.createTextNode(' ')); li.appendChild(tk.node); }); ln.appendChild(li); n.appendChild(ln); return li; });
}
function splitLC(n) {
  if (n.__lc) return n.__lc;
  const parts = []; Array.from(n.childNodes).forEach(c => { const it = c.nodeType === 1 && /^(EM|I)$/.test(c.tagName); c.textContent.split(/[ \t\n\r]+/).forEach(w => { if (w) parts.push({ w, it }); }); });
  n.setAttribute('aria-label', parts.map(p => p.w).join(' '));
  n.innerHTML = parts.map(p => '<span class="hw" aria-hidden="true">' + (p.it ? '<em>' : '') + Array.from(p.w).map(c => '<span class="hc">' + esc(c) + '</span>').join('') + (p.it ? '</em>' : '') + '</span>').join(' ');
  const ws = $$('.hw', n), lines = []; let top = null, line = null;
  const cw = n.clientWidth, wmax = ws.reduce((m, w) => Math.max(m, w.getBoundingClientRect().width), 0);
  if (cw > 0 && wmax > cw) { const fs = parseFloat(getComputedStyle(n).fontSize) || 0; if (fs) n.style.fontSize = (fs * cw / wmax * .97).toFixed(2) + 'px'; }
  ws.forEach(w => { const tp = w.offsetTop; if (top === null || Math.abs(tp - top) > 3) { line = []; lines.push(line); top = tp; } line.push(w); });
  n.textContent = '';
  lines.forEach(l => { const s = D.createElement('span'); s.className = 'hl'; l.forEach((w, i) => { if (i) s.appendChild(D.createTextNode(' ')); s.appendChild(w); }); n.appendChild(s); });
  n.__lc = $$('.hc', n); return n.__lc;
}
function countTo(b, to, dec, d) {
  const t0 = performance.now() + d, f = v => dec ? v.toFixed(dec) : String(Math.round(v));
  b.textContent = f(0);
  const step = now => { const p = clamp((now - t0) / 1600, 0, 1); b.textContent = f(to * eOut(p)); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function reveal(n, d = 0, type) {
  type = type || n.dataset.reveal || n.dataset.in; d += +n.dataset.d || 0;
  n.classList.add('rv-on');
  if (reduce) return;
  if (type === 'up') play(n, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: d });
  else if (type === 'fade') play(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: d, easing: 'ease' });
  else if (type === 'stagger') Array.from(n.children).forEach((c, i) => play(c, [{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }], { duration: 1050, delay: d + i * 80 }));
  else if (type === 'chars') splitLC(n).forEach((c, i) => play(c, [{ transform: 'translateY(115%) skewX(-12deg)' }, { transform: 'none' }], { duration: 1050, delay: d + i * 16 }));
  else if (type === 'lines') {
    if (n.__orig == null) n.__orig = n.innerHTML;
    n.innerHTML = n.__orig;
    splitLines(n).forEach((li, i) => play(li, [{ transform: 'translateY(108%)' }, { transform: 'none' }], { duration: 1100, delay: d + i * 85 }));
    const done = () => { n.innerHTML = n.__orig; };
    Promise.all(n.getAnimations({ subtree: true }).map(a => a.finished)).then(done, done);
  }
  else if (type === 'pic') {
    const im = $('img', n);
    play(n, [{ clipPath: 'polygon(0 100%,100% 100%,100% 100%,0 100%)' }, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }], { duration: 1300, delay: d, easing: EIO });
    if (im) play(im, [{ transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 1800, delay: d });
  }
  else if (type === 'count') { $$('[data-n]', n).forEach((b, i) => countTo(b, +b.dataset.n, +b.dataset.dec || 0, d + i * 120)); play(n, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: d }); }
}
/* ---------------- transition: slanted double wipe (the M mark's cut) ---------------- */
const Tr = {
  active: true,
  init() {
    this.el = $('#tr'); this.cv = $('.tr-cv', this.el); this.c = this.cv.getContext('2d'); this.k = $('.tr-k', this.el); this.h = $('.tr-h', this.el); this.ld = $('.tr-ld', this.el); this.nb = $('.tr-n b', this.el);
    this.size(); { const o = Array.from({ length: this.n }, () => 1); this.paint({ pk: o, ik: o }); }
  },
  size() { const d = Math.min(window.devicePixelRatio || 1, 1.5); this.d = d; this.W = innerWidth; this.H = innerHeight; this.cv.width = Math.round(this.W * d); this.cv.height = Math.round(this.H * d); this.s = this.H * .4663; this.n = this.W < 700 ? 5 : 8; },
  bars(hs, col, top) { const c = this.c, s = this.s, Hh = this.H, n = hs.length, bw = (this.W + s) / n; c.fillStyle = col; hs.forEach((h, i) => { if (h <= 0) return; const x = i * bw - s - 1, w = bw + 2; c.beginPath(); if (!top) { c.moveTo(x + s * h, Hh * (1 - h)); c.lineTo(x + w + s * h, Hh * (1 - h)); c.lineTo(x + w, Hh); c.lineTo(x, Hh); } else { c.moveTo(x + s, 0); c.lineTo(x + w + s, 0); c.lineTo(x + w + s * (1 - h), Hh * h); c.lineTo(x + s * (1 - h), Hh * h); } c.closePath(); c.fill(); }); },
  paint(st) { const c = this.c; c.setTransform(this.d, 0, 0, this.d, 0, 0); c.clearRect(0, 0, this.W, this.H); if (st.pk) this.bars(st.pk, '#FF3C82', st.top); if (st.ik) this.bars(st.ik, '#0D0C10', st.top); },
  run(dur, fn) { return new Promise(res => { const t0 = performance.now(); const f = now => { const p = clamp((now - t0) / dur, 0, 1); fn(p); if (p < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); },
  async cover(title, kick) {
    this.size(); this.active = true; this.el.classList.add('on'); this.ld.hidden = true;
    this.h.textContent = ''; this.k.textContent = kick || ''; [this.h, this.k].forEach(e => e.getAnimations().forEach(a => a.cancel())); this.k.style.opacity = 0;
    const W = this.W, s = this.s, far = W + 20, end = -s - 20;
    await this.run(1100, p => { const n = this.n, st = .38 / n, k = p * 1.16, f = (q, i) => eIO(clamp((q - i * st) / .62, 0, 1)); this.paint({ pk: Array.from({ length: n }, (_, i) => f(k, i)), ik: Array.from({ length: n }, (_, i) => f(k - .16, i)) }); });
    this.k.style.opacity = ''; play(this.k, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
    this.title(title);
  },
  title(tx) { this.h.textContent = tx; delete this.h.__lc; if (!tx) return; splitLC(this.h).forEach((c, i) => play(c, [{ transform: 'translateY(115%) skewX(-12deg)' }, { transform: 'none' }], { duration: 900, delay: i * 18 })); },
  async reveal() {
    [this.h, this.k, this.ld].forEach(e => { if (e && !e.hidden) e.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-20px)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' }); });
    await wait(140);
    const W = this.W, s = this.s, far = W + s + 20, end = -s - 20;
    await this.run(1100, p => { const n = this.n, st = .38 / n, k = p * 1.16, f = (q, i) => 1 - eIO(clamp((q - i * st) / .62, 0, 1)); this.paint({ top: true, ik: Array.from({ length: n }, (_, i) => f(k, i)), pk: Array.from({ length: n }, (_, i) => f(k - .16, i)) }); });
    this.off();
  },
  off() {
    this.active = false; this.el.classList.remove('on');
    this.c.setTransform(1, 0, 0, 1, 0, 0); this.c.clearRect(0, 0, this.cv.width, this.cv.height);
    [this.h, this.k, this.ld].forEach(e => e && e.getAnimations().forEach(a => a.cancel())); this.h.textContent = ''; this.ld.hidden = true;
  }
};

/* ---------------- cursor, magnets ---------------- */
const Cur = {
  x: -1e4, y: -1e4, txt: '',
  init() {
    addEventListener('pointermove', e => { PX = e.clientX; PY = e.clientY; }, { passive: true });
    D.addEventListener('pointerleave', () => { PX = PY = -1e4; });
    if (!fine) return;
    this.el = $('.cur'); this.lb = $('.curl'); this.ls = $('.curl span');
    D.addEventListener('mouseover', e => {
      const tg = e.target.closest ? e.target : null; if (!tg) return;
      const lt = tg.closest('[data-cur]'), txt = lt ? lt.dataset.cur : '';
      if (txt !== this.txt) { this.txt = txt; if (txt) this.ls.textContent = txt; this.lb.classList.toggle('on', !!txt); this.el.classList.toggle('lab', !!txt); }
      const a = tg.closest('a,button,label,input,select,textarea'); this.el.classList.toggle('hov', !!a && !txt);
    });
    D.addEventListener('mouseleave', () => { this.txt = ''; this.lb.classList.remove('on'); this.el.classList.remove('lab'); });
  },
  frame() {
    if (!fine || !this.el) return;
    this.x = lerp(this.x, PX, .2); this.y = lerp(this.y, PY, .2);
    this.el.style.transform = 'translate3d(' + PX + 'px,' + PY + 'px,0)';
    this.lb.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px,0)';
  }
};
const Mag = {
  items: [],
  scan(root) { if (!fine || reduce) return; $$('.mag', root).forEach(el => { if (el.__mag) return; const o = { el, x: 0, y: 0, tx: 0, ty: 0 }; el.__mag = o; el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); o.tx = (e.clientX - r.left - r.width / 2) * .22; o.ty = (e.clientY - r.top - r.height / 2) * .3; }); el.addEventListener('mouseleave', () => { o.tx = 0; o.ty = 0; }); this.items.push(o); }); },
  frame() { this.items = this.items.filter(o => o.el.isConnected); this.items.forEach(o => { const nx = lerp(o.x, o.tx, .16), ny = lerp(o.y, o.ty, .16); if (Math.abs(nx - o.x) + Math.abs(ny - o.y) < .01 && !o.tx && !o.ty) return; o.x = nx; o.y = ny; o.el.style.translate = o.x.toFixed(2) + 'px ' + o.y.toFixed(2) + 'px'; }); }
};

/* ---------------- home: bestsellers ring ---------------- */
const Ring = {
  init(root) {
    this.w = $('.ring-w', root); this.el = this.w ? $('.ring', this.w) : null; if (!this.el) return;
    this.cards = $$('.rc', this.el); this.n = this.cards.length; this.rot = 0; this.v = 0; this.drag = null; this.layout();
    const w = this.w;
    w.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') { this.tx = e.clientX; this.ty = e.clientY; this.drag = { x: e.clientX, id: e.pointerId, touch: true, armed: false }; return; } this.drag = { x: e.clientX, id: e.pointerId }; try { w.setPointerCapture(e.pointerId); } catch (_) {} w.classList.add('grab'); });
    w.addEventListener('pointermove', e => { const d = this.drag; if (!d || d.id !== e.pointerId) return; if (d.touch && !d.armed) { if (Math.abs(e.clientY - this.ty) > Math.abs(e.clientX - this.tx) + 4) { this.drag = null; return; } d.armed = true; } const dx = e.clientX - d.x; d.x = e.clientX; this.rot += dx * .22; this.v = dx * .22; });
    const up = () => { this.drag = null; w.classList.remove('grab'); };
    w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up); w.addEventListener('lostpointercapture', up);
  },
  layout() { if (!this.el) return; const cw = this.el.offsetWidth || 220; this.R = cw / (2 * Math.tan(Math.PI / this.n)) * (VW < 700 ? 1.3 : 1.75); this.cards.forEach((c, i) => { c.style.transform = 'rotateY(' + (i * 360 / this.n).toFixed(3) + 'deg) translateZ(' + this.R.toFixed(1) + 'px)'; }); },
  frame(dt) {
    if (!this.el || !this.el.isConnected) return; const r = this.w.getBoundingClientRect(); if (r.bottom < -50 || r.top > VH + 50) return;
    if (!this.drag || this.drag.touch && !this.drag.armed) { this.v = lerp(this.v, 0, 1 - Math.pow(.94, dt * 60)); this.rot += (reduce ? 0 : 7 * dt) + this.v + clamp(vel, -4000, 4000) * dt * .035; }
    this.el.style.transform = 'translateZ(' + (-this.R).toFixed(1) + 'px) rotateX(-7deg) rotateY(' + this.rot.toFixed(2) + 'deg)';
    this.cards.forEach((c, i) => { const a = ((i * 360 / this.n + this.rot) % 360 + 360) % 360, f = (1 - Math.cos(a * Math.PI / 180)) / 2; c.style.setProperty('--dim', (f * .78).toFixed(3)); });
  }
};

/* ---------------- home: case stack, services pin, CTR bars, band, process ---------------- */
const Stack = {
  init(root) { this.cards = $$('.sc', root).map(sc => ({ sc, in: $('.sc-in', sc) })); },
  frame() {
    if (!this.cards || !this.cards.length) return;
    const on = VW > 900 && !reduce;
    for (let i = 0; i < this.cards.length; i++) {
      const cur = this.cards[i], nx = this.cards[i + 1];
      if (!on || !nx) { if (cur.p) { cur.in.style.transform = ''; cur.in.style.setProperty('--dim', 0); cur.p = 0; } continue; }
      const top = nx.sc.getBoundingClientRect().top, st = 96 + (i + 1) * 14;
      const p = clamp((VH - top) / Math.max(1, VH - st), 0, 1);
      if (Math.abs(p - (cur.p || 0)) < .001) continue; cur.p = p;
      cur.in.style.transform = 'scale(' + (1 - .055 * p).toFixed(4) + ')'; cur.in.style.setProperty('--dim', (p * .5).toFixed(3));
    }
  }
};
const Pin = {
  init(root) { this.sec = $('.svc-pin', root); if (!this.sec) return; this.tk = $('.svc-tk', this.sec); this.br = $$('.br i', this.sec); this.measure(); },
  measure() {
    if (!this.sec || !this.sec.isConnected) return;
    if (VW <= 900 || reduce) { this.sec.style.height = ''; this.tk.style.transform = ''; this.off = true; this.br.forEach(b => { b.style.transform = ''; }); return; }
    this.off = false; this.tk.style.transform = 'none';
    const last = this.tk.lastElementChild, gut = parseFloat(getComputedStyle(this.tk).paddingLeft) || 32;
    this.dist = Math.max(0, last.offsetLeft + last.offsetWidth + gut - VW);
    this.sec.style.height = (VH + this.dist) + 'px';
  },
  frame() {
    if (!this.sec || this.off || !this.sec.isConnected) return;
    const r = this.sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
    const p = clamp(-r.top / Math.max(1, this.dist), 0, 1);
    this.tk.style.transform = 'translate3d(' + (-p * this.dist).toFixed(1) + 'px,0,0)';
    const q = ss(0, .22, p), o = (1 - q) * 2.2;
    if (this.br.length === 2) { this.br[0].style.transform = 'translateX(' + o.toFixed(3) + 'em)'; this.br[1].style.transform = 'translateX(' + (-o).toFixed(3) + 'em)'; this.br.forEach(b => { b.style.opacity = q.toFixed(3); }); }
  }
};
const Ctr = {
  init(root) { this.el = $('[data-ctr]', root); if (!this.el) return; this.b = $$('.bar', this.el); this.v = $$('.bv', this.el); this.up = $('.ctr-up', this.el); this.last = -1; },
  frame() {
    if (!this.el || !this.el.isConnected) return;
    const r = this.el.getBoundingClientRect(); if (r.bottom < -50 || r.top > VH + 50) return;
    const p = reduce ? 1 : eOut(clamp((VH - r.top) / (VH * .78), 0, 1)); if (Math.abs(p - this.last) < .0005) return; this.last = p;
    const h = this.b[0].clientHeight;
    [[9.5 / 22, 9.5], [1, 22]].forEach(([s, val], i) => { this.b[i].style.setProperty('--p', (s * p).toFixed(4)); this.b[i].style.setProperty('--h', h + 'px'); this.v[i].textContent = (i ? Math.round(val * p) : (val * p).toFixed(1)) + '%'; });
    this.el.style.setProperty('--q', ss(.82, 1, p).toFixed(3));
  }
};
const Band = {
  init(root) { this.el = null; this.n = 0; this.rows = $$('.b2-row', root).map(r => ({ el: $('.b2-t', r), box: r, dir: +r.dataset.dir || 1, sp: +r.dataset.sp || 1, x: 0, w: 1 })); this.rows.forEach(o => { o.w = o.el.scrollWidth / 3 || 1; o.x = -o.w; }); },
  frame2(dt) {
    const v = clamp(vel / 1600, -1.6, 1.6); this.n++;
    this.rows.forEach(o => {
      if (!o.el.isConnected) return; const r = o.box.getBoundingClientRect(); if (r.bottom < -40 || r.top > VH + 40) return;
      if (this.n % 20 === 0) o.w = o.el.scrollWidth / 3 || 1;
      if (!reduce) o.x -= (o.sp * 46 + Math.abs(v) * 300 * o.sp) * dt * o.dir * (v < -.05 ? -1 : 1);
      while (o.x <= -2 * o.w) o.x += o.w; while (o.x > 0) o.x -= o.w;
      o.el.style.transform = 'translate3d(' + o.x.toFixed(1) + 'px,0,0)';
    });
  },
  frame(dt) {
    if (this.rows) return this.frame2(dt); if (!this.el || !this.el.isConnected) return; const r = this.el.getBoundingClientRect(); if (r.bottom < -40 || r.top > VH + 40) return;
    const v = clamp(vel / 1600, -1.6, 1.6), dir = v < -.05 ? -1 : 1;
    const st = reduce ? 100 : Math.round((100 + Math.min(25, Math.abs(v) * 22)) / 2.5) * 2.5;
    if (st !== this.st) { this.st = st; this.el.style.fontStretch = st + '%'; this.n = 0; }
    if (this.n++ % 10 === 0) this.w = this.el.scrollWidth / 2 || 1;
    if (!reduce) this.x -= (55 + Math.abs(v) * 340) * dt * dir;
    if (this.x <= -this.w) this.x += this.w; if (this.x > 0) this.x -= this.w;
    this.el.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px,0,0) skewX(' + (-v * 7).toFixed(2) + 'deg)';
  }
};
/* Locale comes from Next.js routes / <html lang> — never mutate React DOM for i18n. */
const LANG = (H.lang || '').toLowerCase().startsWith('de') ? 'de' : 'en';
document.addEventListener('click', e => {
  const bk = e.target.closest('[data-back]');
  if (bk) { e.preventDefault(); if (history.length > 1) history.back(); else location.hash = '#work'; return; }
  const c = e.target.closest('.sc, .wk'); if (!c || e.target.closest('a:not(.sc-m), button')) return;
  const a = c.querySelector('a[href*="/works/"], a[href^="#case-"]');
  if (a) {
    const href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    if (href.startsWith('#')) location.hash = href;
    else location.assign(href);
  }
});
const Proc = {
  init(root) { this.el = $('.proc-l', root); this.ps = this.el ? $$('.ps', this.el) : []; if (this.el) { this.el.insertAdjacentHTML('beforeend', '<i class="mv" aria-hidden="true"></i>'); const hd = $('.proc-hd', root); if (hd && !$('.proc-day', hd)) hd.insertAdjacentHTML('beforeend', '<div class="proc-day" aria-hidden="true"><b>00</b><span>' + (LANG === 'de' ? 'Tage' : 'days') + '</span></div>'); this.day = $('.proc-day b', root); } },
  frame() {
    if (!this.el || !this.el.isConnected) return; const r = this.el.getBoundingClientRect(); if (r.bottom < -50 || r.top > VH + 50) return;
    const p = reduce ? 1 : clamp((VH * .82 - r.top) / (VH * .5), 0, 1); this.el.style.setProperty('--p', p.toFixed(3));
    const n = this.ps.length; this.ps.forEach((s, i) => s.classList.toggle('on', p >= i / (n - 1) - .02)); if (this.day) { const dv = pad(Math.round(p * 7)); if (this.day.textContent !== dv) this.day.textContent = dv; }
  }
};
const Talk = {
  init() {
    this.ls = Array.from(D.querySelectorAll('#ft .talk-h span'));
    this.on = false;
    this._measured = false;
    this._measure();
  },
  _measure() {
    if (!this.ls || !this.ls.length) return;
    // Reset to rest metrics before sampling — live stretched rects feedback into k.
    this.ls.forEach((l) => {
      l.style.fontVariationSettings = '"wdth" 78, "wght" 800';
      l.style.fontStretch = '78%';
      l.style.fontWeight = '800';
      l.__st = 78;
      l.__wg = 800;
    });
    if (this.ls[0]) void this.ls[0].offsetWidth;
    const sy = window.scrollY || 0;
    this.ls.forEach((l) => {
      const r = l.getBoundingClientRect();
      l.__cx0 = r.left + r.width / 2;
      l.__cy0 = r.top + r.height / 2 + sy;
    });
    this._measured = true;
  },
  frame() {
    if (!fine || reduce || !this.ls || !this.ls.length) return;
    const r0 = this.ls[0].getBoundingClientRect();
    if (r0.top > VH || r0.bottom < 0) return;
    if (!this._measured) this._measure();
    const sy = window.scrollY || 0;
    this.ls.forEach((l) => {
      if (l.__cx0 == null) return;
      const cx = l.__cx0;
      const cy = l.__cy0 - sy;
      const k = PX < -1e3 ? 0 : ss(320, 30, Math.hypot(PX - cx, (PY - cy) * 1.4));
      const st = Math.round(78 + 47 * k);
      const wg = Math.round(560 + 340 * k);
      if (l.__st === st && l.__wg === wg) return;
      l.__st = st;
      l.__wg = wg;
      l.style.fontVariationSettings = '"wdth" ' + st + ', "wght" ' + wg;
      l.style.fontStretch = st + '%';
      l.style.fontWeight = String(wg);
    });
  }
};
const Gal = {
  init(root) { this.el = $('.gal', root); if (!this.el) return; this.s = $$('.gs', this.el); this.n = $('.gal-c b', this.el); this.bar = $('.gal-c .bar2', this.el); this.cur = -1; },
  frame() {
    if (!this.el || !this.el.isConnected) return; const r = this.el.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
    let best = 0, bd = 1e9; this.s.forEach((s, i) => { const q = s.getBoundingClientRect(), d = Math.abs(q.top + q.height / 2 - VH / 2); if (d < bd) { bd = d; best = i; } });
    if (best !== this.cur && this.n) { this.cur = best; this.n.textContent = pad(best + 1); }
    if (this.bar) this.bar.style.setProperty('--p', clamp((VH * .5 - r.top) / Math.max(1, r.height - VH * .3), 0, 1).toFixed(3));
  }
};
/* hover slideshow on case covers */
const Peek = {
  bind(root) {
    if (!fine || reduce) return;
    $$('[data-peek]', root).forEach(m => {
      if (m.__pk) return; m.__pk = 1; let tm = 0, i = 0, ims = null;
      m.addEventListener('mouseenter', () => {
        if (!ims) { ims = m.dataset.peek.split(',').map(n => { const im = D.createElement('img'); im.src = IM(n); im.alt = ''; im.className = 'sl'; im.decoding = 'async'; m.appendChild(im); return im; }); }
        clearInterval(tm); i = 0; ims[0].classList.add('on');
        tm = setInterval(() => { ims[i].classList.remove('on'); i = (i + 1) % ims.length; ims[i].classList.add('on'); }, 850);
      });
      m.addEventListener('mouseleave', () => { clearInterval(tm); if (ims) ims.forEach(x => x.classList.remove('on')); });
    });
  }
};

  let RIO = null;
  if ('IntersectionObserver' in window) {
    RIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const n = e.target;
        RIO.unobserve(n);
        reveal(n, +(n.dataset.d || 0), n.dataset.reveal || 'up');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  }

  function startReveals() {
    $$('[data-in]', root).forEach((n) => reveal(n, +(n.dataset.d || 0), n.dataset.in || 'fade'));
    $$('[data-reveal]', root).forEach((n) => {
      if (RIO) RIO.observe(n);
      else reveal(n, 0, n.dataset.reveal || 'up');
    });
  }

  Heat.init();
  Cur.init();
  Heat.attach(root);
  Ring.init(root);
  Stack.init(root);
  Pin.init(root);
  Ctr.init(root);
  Band.init(root);
  Proc.init(root);
  Gal.init(root);
  Mag.scan(root);
  Talk.init();
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => Talk._measure()).catch(() => {});
  Peek.bind(root);

  Heat.load().then(() => Heat.size(true)).catch(() => {});
  Ring.layout();
  Pin.measure();
  Band.init(root);
  startReveals();

  let last = performance.now();
  let navLast = window.scrollY;
  const NAV = D.querySelector('.nav, .site-header.proto-nav');
  const DARK = $$('[data-dark]', root).concat(Array.from(D.querySelectorAll('footer.ft, .ft.dk')));

  function fx(y) {
    if (NAV) {
      NAV.classList.toggle('sol', y > 30);
      if (!H.classList.contains('menu-open')) {
        if (y > 480 && y > navLast + 4) NAV.classList.add('hide');
        else if (y < navLast - 4 || y < 480) NAV.classList.remove('hide');
      }
      navLast = y;
      let dk = false;
      for (const el of DARK) {
        const r = el.getBoundingClientRect();
        if (r.top <= 38 && r.bottom >= 38) { dk = true; break; }
      }
      NAV.classList.toggle('dkn', dk);
    }
    Stack.frame();
    Pin.frame();
    Ctr.frame();
    Proc.frame();
    Gal.frame();
  }

  let raf = 0;
  let alive = true;
  function loop(now) {
    if (!alive) return;
    const dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    const y = window.scrollY;
    vel = lerp(vel, (y - sy) / Math.max(dt, 0.001), 0.15);
    sy = y;
    fx(y);
    Heat.frame(dt);
    Ring.frame(dt);
    Band.frame(dt);
    Talk.frame();
    Cur.frame();
    Mag.frame();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      VW = innerWidth; VH = innerHeight;
      Heat.size();
      Ring.layout();
      Pin.measure();
      Band.init(root);
      Talk._measure();
    }, 180);
  };
  window.addEventListener('resize', onResize);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    if (RIO) RIO.disconnect();
  };
}
