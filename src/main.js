/* ============================================
   BIO VISIT — Main JavaScript v4.0
   3D Nav, Particles, Shader, Glitch, Shadow, Handwriting
   ============================================ */

import * as THREE from 'three';

// ============================================
// GLOBAL STATE
// ============================================
const state = {
  mouse: { x: -1000, y: -1000 },
  scrollY: 0,
  isMobile: /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent),
  activeSection: 'hero',
  sectionsList: ['hero', 'about', 'tech', 'games', 'vices', 'interests', 'setup', 'contact'],
};

// ============================================
// 1. SCROLL PROGRESS BAR
// ============================================
class ScrollProgress {
  constructor() {
    this.bar = document.getElementById('scrollProgress');
    if (!this.bar) return;
    this.init();
  }
  init() {
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      this.bar.style.width = `${Math.min(100, progress)}%`;
    });
  }
}

// ============================================
// 2. CUSTOM CURSOR
// ============================================
class CustomCursor {
  constructor() {
    if (state.isMobile) return;
    this.cursor = document.getElementById('cursor');
    this.follower = document.getElementById('cursorFollower');
    this.pos = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };
    this.init();
  }
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
      if (this.cursor) this.cursor.style.opacity = '0';
      if (this.follower) this.follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (this.cursor) this.cursor.style.opacity = '1';
      if (this.follower) this.follower.style.opacity = '1';
    });
    document.querySelectorAll('a, button, [data-tilt], .tech-card, .game-card, .contact-link, .vice-item')
      .forEach(el => {
        el.addEventListener('mouseenter', () => this.follower?.classList.add('hover'));
        el.addEventListener('mouseleave', () => this.follower?.classList.remove('hover'));
      });
    document.addEventListener('mousedown', () => this.follower?.classList.add('click'));
    document.addEventListener('mouseup', () => this.follower?.classList.remove('click'));
    this.animate();
  }
  animate() {
    this.pos.x += (this.mouse.x - this.pos.x) * 0.15;
    this.pos.y += (this.mouse.y - this.pos.y) * 0.15;
    if (this.cursor) {
      this.cursor.style.left = `${this.mouse.x}px`;
      this.cursor.style.top = `${this.mouse.y}px`;
    }
    if (this.follower) {
      this.follower.style.left = `${this.pos.x}px`;
      this.follower.style.top = `${this.pos.y}px`;
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 3. MOUSE TRAIL
// ============================================
class MouseTrail {
  constructor() {
    if (state.isMobile) return;
    this.canvas = document.getElementById('mouseTrailCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.points = [];
    this.maxPoints = 40;
    this.init();
  }
  init() {
    this.resize();
    this.bindEvents();
    this.animate();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => {
      this.points.push({ x: e.clientX, y: e.clientY, age: 0, maxAge: 0.6 + Math.random() * 0.3 });
      if (this.points.length > this.maxPoints) this.points.shift();
    });
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const dt = 0.016;
    for (let i = this.points.length - 1; i >= 0; i--) {
      const p = this.points[i];
      p.age += dt;
      if (p.age > p.maxAge) { this.points.splice(i, 1); continue; }
      const life = 1 - p.age / p.maxAge;
      const size = 3 + life * 2;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(167, 139, 250, ${life * 0.4})`;
      this.ctx.shadowColor = `rgba(167, 139, 250, ${life * 0.6})`;
      this.ctx.shadowBlur = 10 + life * 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      if (i > 0) {
        const prev = this.points[i - 1];
        const dx = p.x - prev.x, dy = p.y - prev.y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
          this.ctx.beginPath();
          this.ctx.moveTo(prev.x, prev.y);
          this.ctx.lineTo(p.x, p.y);
          this.ctx.strokeStyle = `rgba(167, 139, 250, ${life * 0.3})`;
          this.ctx.lineWidth = life * 1.5;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 4. MOUSE SHADOW SPOTLIGHT
// ============================================
class MouseShadow {
  constructor() {
    if (state.isMobile) return;
    this.el = document.getElementById('mouseShadow');
    if (!this.el) return;
    this.init();
  }
  init() {
    document.addEventListener('mousemove', (e) => {
      this.el.style.left = `${e.clientX}px`;
      this.el.style.top = `${e.clientY}px`;
    });
  }
}

// ============================================
// 5. LOADING SCREEN
// ============================================
class LoadingScreen {
  constructor() {
    this.screen = document.getElementById('loadingScreen');
    this.init();
  }
  init() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.screen.classList.add('hidden');
        if (!state.isMobile) document.body.style.cursor = 'none';
      }, 2500);
    });
  }
}

// ============================================
// 6. PARTICLE SYSTEM (2D Canvas)
// ============================================
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseRadius = 150;
    this.init();
  }
  init() { this.resize(); this.createParticles(); this.bindEvents(); this.animate(); }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  createParticles() {
    const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 10000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.7 ? 260 + Math.random() * 40 : 0,
      });
    }
  }
  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.createParticles(); });
    document.addEventListener('mousemove', (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; });
    document.addEventListener('touchmove', (e) => { state.mouse.x = e.touches[0].clientX; state.mouse.y = e.touches[0].clientY; }, { passive: true });
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      const dx = state.mouse.x - p.x, dy = state.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouseRadius) {
        const force = (this.mouseRadius - dist) / this.mouseRadius;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.5; p.vy -= Math.sin(angle) * force * 0.5;
      }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98;
      if (p.x < 0) p.x = this.canvas.width; if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height; if (p.y > this.canvas.height) p.y = 0;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.hue > 0 ? `hsla(${p.hue}, 60%, 80%, ${p.alpha})` : `rgba(255, 255, 255, ${p.alpha})`;
      this.ctx.fill();
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx2 = p.x - p2.x, dy2 = p.y - p2.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2), maxDist = 100;
        if (dist2 < maxDist) {
          this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(p2.x, p2.y);
          const alpha = 0.08 * (1 - dist2 / maxDist);
          this.ctx.strokeStyle = (p.hue > 0 || p2.hue > 0) ? `rgba(167, 139, 250, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
          this.ctx.lineWidth = 0.5; this.ctx.stroke();
        }
      }
    });
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 7. 3D NAVIGATION SCENE
// ============================================
class Navigation3D {
  constructor() {
    this.container = document.getElementById('nav3d-container');
    if (!this.container) return;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.menuItems = []; this.backgroundShapes = []; this.clickableObjects = [];
    this.targetRotation = { x: 0, y: 0 }; this.currentRotation = { x: 0, y: 0 };
    this.isDragging = false; this.prevMouse = { x: 0, y: 0 };
    this.autoRotate = true; this.autoRotateSpeed = 0.003;
    this.activeSection = 'hero';
    this.sections = ['hero', 'about', 'tech', 'games', 'vices', 'interests', 'setup', 'contact'];
    this.isNavOpen = true; this.targetOpacity = 1; this.currentOpacity = 1;
    this.raycaster = new THREE.Raycaster(); this.raycasterMouse = new THREE.Vector2();
    this.baseCameraZ = 8; this.targetCameraZ = 8;
    this.init();
  }
  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.opacity = '1';
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 0, this.baseCameraZ);
    this.createNavigationRing(); this.createBackgroundGeometry(); this.addLightAccents();
    this.bindEvents(); this.animate();
  }
  addLightAccents() {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6 }));
    this.scene.add(this.centerSphere = c);
    const g = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.3 }));
    this.scene.add(this.glowRing = g);
  }
  createNavigationRing() {
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.02, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 }));
    this.ring.rotation.x = Math.PI / 3; this.scene.add(this.ring);
    this.innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.01, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.25 }));
    this.innerRing.rotation.x = Math.PI / 3; this.innerRing.rotation.z = 0.2; this.scene.add(this.innerRing);
    this.outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.01, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.15 }));
    this.outerRing.rotation.x = Math.PI / 3; this.outerRing.rotation.z = -0.1; this.scene.add(this.outerRing);

    const labels = this.sections.slice(0, 6);
    const radius = 2.5;
    this.textTextures = {};
    labels.forEach(l => {
      this.textTextures[l] = this.createTextTexture(l, false);
      this.textTextures[l + '_active'] = this.createTextTexture(l, true);
    });
    labels.forEach((label, i) => {
      const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius * 0.7, z = Math.sin(angle) * radius * 0.3;
      const isActive = label === this.activeSection;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({ color: isActive ? 0xa78bfa : 0x555555, transparent: true, opacity: isActive ? 1 : 0.6 }));
      sphere.position.set(x, y, z);
      sphere.userData = { label, angle, isActive, isClickable: true };
      this.scene.add(sphere); this.clickableObjects.push(sphere);

      const tex = this.textTextures[isActive ? label + '_active' : label];
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: isActive ? 1 : 0.7, depthWrite: false }));
      sprite.scale.set(isActive ? 1.8 : 1.5, isActive ? 0.5 : 0.4, 1);
      sprite.position.set(x, y - 0.35, z); sprite.userData = { label, angle };
      this.scene.add(sprite);

      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x * 0.7, y * 0.7, z * 0.7), new THREE.Vector3(x, y, z)];
      const curve = new THREE.CatmullRomCurve3(pts);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: isActive ? 0xa78bfa : 0x333333, transparent: true, opacity: isActive ? 0.5 : 0.25 }));
      line.userData = { label }; this.scene.add(line);
      this.menuItems.push({ sphere, textSprite: sprite, line, label, angle, isActive });
    });
  }
  createTextTexture(text, isActive) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = '24px "Major Mono Display", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = isActive ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.1)';
    ctx.shadowBlur = isActive ? 15 : 10;
    ctx.fillStyle = isActive ? '#a78bfa' : '#666666';
    ctx.fillText(text.toUpperCase(), 128, 32);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; return tex;
  }
  createBackgroundGeometry() {
    const shapes = [
      { geo: new THREE.IcosahedronGeometry(0.3, 0), pos: [-4, 2, -3], color: 0xa78bfa },
      { geo: new THREE.OctahedronGeometry(0.2, 0), pos: [3.5, -1.5, -4], color: 0x67e8f9 },
      { geo: new THREE.TetrahedronGeometry(0.25, 0), pos: [-3, -2, -5], color: 0xf472b6 },
      { geo: new THREE.BoxGeometry(0.2, 0.2, 0.2), pos: [4, 1.5, -3.5], color: 0x555555 },
      { geo: new THREE.DodecahedronGeometry(0.2, 0), pos: [-2, 3, -4], color: 0x34d399 },
      { geo: new THREE.TorusGeometry(0.15, 0.05, 4, 8), pos: [2, -2.5, -3], color: 0x444444 },
    ];
    shapes.forEach(({ geo, pos, color }) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.25 }));
      m.position.set(pos[0], pos[1], pos[2]);
      m.userData = { rotSpeed: 0.003 + Math.random() * 0.008, initialPos: [...pos], floatAmp: 0.3 + Math.random() * 0.5, floatSpeed: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2 };
      this.scene.add(m); this.backgroundShapes.push(m);
    });
    const gh = new THREE.GridHelper(12, 20, 0x222222, 0x111111);
    gh.position.y = -3; gh.material.transparent = true; gh.material.opacity = 0.2; this.scene.add(gh);
  }
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.addEventListener('mousemove', (e) => {
      if (this.isNavOpen) { this.raycasterMouse.x = (e.clientX / window.innerWidth) * 2 - 1; this.raycasterMouse.y = -(e.clientY / window.innerHeight) * 2 + 1; }
      if (this.isDragging) {
        const dx = e.clientX - this.prevMouse.x, dy = e.clientY - this.prevMouse.y;
        this.targetRotation.y += dx * 0.005; this.targetRotation.x += dy * 0.003;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.6, this.targetRotation.x));
        this.autoRotate = false; this.prevMouse = { x: e.clientX, y: e.clientY };
      }
    });
    document.addEventListener('mousedown', (e) => {
      if (this.isNavOpen && (e.target === this.renderer.domElement || e.target.closest('#nav3d-container'))) {
        this.isDragging = true; this.prevMouse = { x: e.clientX, y: e.clientY };
      }
    });
    document.addEventListener('mouseup', () => { if (this.isDragging) { this.isDragging = false; setTimeout(() => { this.autoRotate = true; }, 3000); } });
    document.addEventListener('click', (e) => {
      if (this.isDragging || !this.isNavOpen) return;
      this.raycaster.setFromCamera(this.raycasterMouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.clickableObjects);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.isClickable && obj.userData.label) {
          const el = document.getElementById(`section-${obj.userData.label}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
    document.addEventListener('scroll', () => {
      state.scrollY = window.scrollY; this.updateActiveSection();
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      this.targetCameraZ = 8 - (docH > 0 ? window.scrollY / docH : 0) * 3;
    });
  }
  updateActiveSection() {
    const wh = window.innerHeight;
    this.sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) { const r = el.getBoundingClientRect(); if (r.top < wh / 2 && r.bottom > wh / 2) this.setActiveSection(s); }
    });
  }
  setActiveSection(section) {
    if (this.activeSection === section) return;
    this.activeSection = section; state.activeSection = section;
    this.updateMenuItems();
    document.querySelectorAll('.fab-dot').forEach(d => d.classList.toggle('active', d.dataset.target === section));
  }
  updateMenuItems() {
    this.menuItems.forEach(item => {
      const isActive = item.label === this.activeSection;
      item.isActive = isActive;
      item.sphere.material.color.setHex(isActive ? 0xa78bfa : 0x555555);
      item.sphere.material.opacity = isActive ? 1 : 0.6;
      item.line.material.color.setHex(isActive ? 0xa78bfa : 0x333333);
      item.line.material.opacity = isActive ? 0.5 : 0.25;
      item.textSprite.material.map = this.textTextures[isActive ? item.label + '_active' : item.label];
      item.textSprite.material.opacity = isActive ? 1 : 0.7;
      item.textSprite.scale.set(isActive ? 1.8 : 1.5, isActive ? 0.5 : 0.4, 1);
    });
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;
    if (this.autoRotate) this.targetRotation.y += this.autoRotateSpeed;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.03;
    if (this.ring) { this.ring.rotation.y = this.currentRotation.y; this.innerRing.rotation.y = this.currentRotation.y * 1.3; this.outerRing.rotation.y = this.currentRotation.y * 0.7; }
    this.menuItems.forEach(item => {
      const angle = item.angle + this.currentRotation.y, r = 2.5;
      const x = Math.cos(angle) * r, y = Math.sin(angle) * r * 0.7, z = Math.sin(angle) * r * 0.3;
      item.sphere.position.set(x, y, z); item.textSprite.position.set(x, y - 0.35, z);
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x * 0.7, y * 0.7, z * 0.7), new THREE.Vector3(x, y, z)];
      item.line.geometry.dispose();
      item.line.geometry = new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(20));
    });
    this.backgroundShapes.forEach(s => { s.rotation.x += s.userData.rotSpeed; s.rotation.y += s.userData.rotSpeed * 1.5; const ud = s.userData; s.position.y = ud.initialPos[1] + Math.sin(time * ud.floatSpeed + ud.phase) * ud.floatAmp; });
    if (this.centerSphere) {
      const pulse = 1 + Math.sin(time * 2) * 0.3;
      this.centerSphere.scale.setScalar(pulse); this.centerSphere.material.opacity = 0.4 + Math.sin(time * 2) * 0.2;
      this.glowRing.rotation.z += 0.01; this.glowRing.scale.setScalar(1 + Math.sin(time * 1.5) * 0.2);
    }
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.05;
    this.renderer.domElement.style.opacity = this.currentOpacity;
    if (!this.isDragging) {
      const mx = (state.mouse.x / window.innerWidth) * 2 - 1, my = -(state.mouse.y / window.innerHeight) * 2 + 1;
      this.camera.position.x += (mx * 0.3 - this.camera.position.x) * 0.02;
      this.camera.position.y += (my * 0.15 - this.camera.position.y) * 0.02;
    }
    this.camera.lookAt(0, 0, 0); this.renderer.render(this.scene, this.camera);
  }
  setOpen(open) {
    this.isNavOpen = open; this.targetOpacity = open ? 1 : 0.35;
    this.renderer.domElement.style.pointerEvents = open ? 'auto' : 'none';
    this.container.style.pointerEvents = open ? 'auto' : 'none';
  }
}

// ============================================
// 8. BACKGROUND 3D OBJECTS
// ============================================
class Background3D {
  constructor() {
    this.canvas = document.getElementById('bgCanvas');
    if (!this.canvas) return;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.objects = [];
    this.init();
  }
  init() { this.renderer.setSize(window.innerWidth, window.innerHeight); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); this.renderer.setClearColor(0x000000, 0); this.camera.position.z = 15; this.createObjects(); this.bindEvents(); this.animate(); }
  createObjects() {
    const geos = [new THREE.SphereGeometry(0.5, 16, 16), new THREE.TorusGeometry(0.4, 0.1, 8, 16), new THREE.OctahedronGeometry(0.4, 0), new THREE.IcosahedronGeometry(0.3, 0), new THREE.TorusKnotGeometry(0.3, 0.1, 32, 8)];
    const cols = [0x222222, 0x333333, 0x2a2a3a, 0x1a1a2e, 0x252530];
    for (let i = 0; i < 20; i++) {
      const m = new THREE.Mesh(geos[Math.floor(Math.random() * geos.length)],
        new THREE.MeshBasicMaterial({ color: cols[Math.floor(Math.random() * cols.length)], wireframe: Math.random() > 0.5, transparent: true, opacity: 0.1 + Math.random() * 0.2 }));
      const ix = (Math.random() - 0.5) * 20, iy = (Math.random() - 0.5) * 20, iz = (Math.random() - 0.5) * 10 - 5;
      m.position.set(ix, iy, iz); m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.userData = { rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008 }, floatSpeed: 0.002 + Math.random() * 0.004, floatAmp: 0.3 + Math.random() * 0.5, initialPos: { x: ix, y: iy, z: iz }, parallaxFactor: 0.1 + Math.random() * 0.2, phase: Math.random() * Math.PI * 2 };
      this.scene.add(m); this.objects.push(m);
    }
  }
  bindEvents() { window.addEventListener('resize', () => { this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(window.innerWidth, window.innerHeight); }); }
  animate() {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001, mx = (state.mouse.x / window.innerWidth) * 2 - 1, my = -(state.mouse.y / window.innerHeight) * 2 + 1;
    this.objects.forEach(o => {
      const ud = o.userData; o.rotation.x += ud.rotSpeed.x; o.rotation.y += ud.rotSpeed.y;
      o.position.y = ud.initialPos.y + Math.sin(time * ud.floatSpeed + ud.initialPos.x + ud.phase) * ud.floatAmp;
      o.position.x += (ud.initialPos.x + mx * ud.parallaxFactor * 2 - o.position.x) * 0.02;
      o.position.z = ud.initialPos.z + my * ud.parallaxFactor * 3;
    });
    this.camera.position.y = -state.scrollY * 0.001; this.camera.position.x = mx * 0.3;
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================
// 9. CONNECTOR LINES
// ============================================
class ConnectorLines {
  constructor() {
    this.canvas = document.getElementById('connectorCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d'); this.sections = [];
    this.init();
  }
  init() { this.resize(); this.getSections(); this.bindEvents(); this.animate(); }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  getSections() { this.sections = document.querySelectorAll('.section'); }
  bindEvents() { window.addEventListener('resize', () => { this.resize(); this.getSections(); }); }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const wh = window.innerHeight;
    for (let i = 0; i < this.sections.length - 1; i++) {
      const r = this.sections[i].getBoundingClientRect(), nr = this.sections[i + 1].getBoundingClientRect();
      if (r.bottom > 0 && r.top < wh + 300) {
        const p = Math.max(0, Math.min(1, (wh - r.bottom) / 300));
        this.ctx.beginPath();
        this.ctx.moveTo(r.left + r.width / 2, r.bottom);
        this.ctx.quadraticCurveTo((r.left + r.width / 2 + nr.left + nr.width / 2) / 2, (r.bottom + nr.top) / 2, nr.left + nr.width / 2, nr.top);
        this.ctx.strokeStyle = `rgba(167,139,250,${0.03 + p * 0.05})`;
        this.ctx.lineWidth = 1; this.ctx.setLineDash([4, 8]); this.ctx.lineDashOffset = -state.scrollY * 0.1;
        this.ctx.stroke(); this.ctx.setLineDash([]);
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 10. GLARE TRACKING
// ============================================
class GlareTracker {
  constructor() {
    if (state.isMobile) return;
    this.cards = document.querySelectorAll('.tech-card, .game-card, .contact-link, .interest-card, .setup-card');
    this.init();
  }
  init() {
    this.cards.forEach(c => {
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--glare-x', `${((e.clientX - r.left) / r.width) * 100}%`);
        c.style.setProperty('--glare-y', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
      c.addEventListener('mouseleave', () => { c.style.setProperty('--glare-x', '50%'); c.style.setProperty('--glare-y', '50%'); });
    });
  }
}

// ============================================
// 11. TILT EFFECT
// ============================================
class TiltEffect {
  constructor() {
    if (state.isMobile) return;
    this.cards = document.querySelectorAll('[data-tilt]');
    this.init();
  }
  init() {
    this.cards.forEach(c => {
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.transform = `perspective(1000px) rotateX(${(y - r.height / 2) / (r.height / 2) * -8}deg) rotateY(${(x - r.width / 2) / (r.width / 2) * 8}deg) scale3d(1.03,1.03,1.03)`;
        c.style.transition = 'transform 0.1s ease-out';
      });
      c.addEventListener('mouseleave', () => { c.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'; c.style.transition = 'transform 0.5s var(--transition-smooth)'; });
    });
  }
}

// ============================================
// 12. ANIMATED COUNTERS
// ============================================
class AnimatedCounters {
  constructor() { this.counters = document.querySelectorAll('.stat-number, .game-stat-value'); this.observed = new Set(); this.init(); }
  init() {
    const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting && !this.observed.has(e.target)) { this.observed.add(e.target); this.animateCounter(e.target); } }); }, { threshold: 0.5 });
    this.counters.forEach(c => obs.observe(c));
  }
  animateCounter(el) {
    const target = parseInt(el.dataset.target), start = Date.now();
    const upd = () => {
      const p = Math.min((Date.now() - start) / 2000, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(upd); else el.textContent = target.toLocaleString();
    }; upd();
  }
}

// ============================================
// 13. SECTION VISIBILITY OBSERVER
// ============================================
class SectionObserver {
  constructor() { this.sections = document.querySelectorAll('.section'); this.init(); }
  init() { const o = new IntersectionObserver((e) => { e.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); }); }, { threshold: 0.1 }); this.sections.forEach(s => o.observe(s)); }
}

// ============================================
// 14. TYPED TEXT EFFECT
// ============================================
class TypedText {
  constructor() { this.el = document.querySelector('.typed-text'); if (!this.el) return; this.texts = ['crafting digital experiences', 'code. create. compete.', 'developer & gamer', 'building the future']; this.ti = 0; this.ci = 0; this.del = false; this.init(); }
  init() { setTimeout(() => this.type(), 2500); }
  type() {
    const t = this.texts[this.ti];
    this.del ? this.ci-- : this.ci++;
    this.el.textContent = t.substring(0, this.ci);
    if (!this.del && this.ci === t.length) { setTimeout(() => { this.del = true; this.type(); }, 2000); return; }
    if (this.del && this.ci === 0) { this.del = false; this.ti = (this.ti + 1) % this.texts.length; setTimeout(() => this.type(), 500); return; }
    setTimeout(() => this.type(), this.del ? 30 : 60);
  }
}

// ============================================
// 15. NAV TOGGLE
// ============================================
class NavToggle {
  constructor(nav3d) { this.toggle = document.getElementById('navToggle'); this.nav3d = nav3d; this.isOpen = true; this.init(); }
  init() { if (!this.toggle) return; this.toggle.classList.add('active'); if (this.nav3d) this.nav3d.setOpen(true); this.toggle.addEventListener('click', () => { this.isOpen = !this.isOpen; this.toggle.classList.toggle('active'); if (this.nav3d) this.nav3d.setOpen(this.isOpen); }); }
}

// ============================================
// 16. FAB COMPASS
// ============================================
class FabCompass {
  constructor() { this.fab = document.getElementById('fabCompass'); if (!this.fab) return; this.init(); }
  init() {
    this.fab.querySelectorAll('.fab-dot').forEach(d => { d.addEventListener('click', (e) => { e.stopPropagation(); const el = document.getElementById(`section-${d.dataset.target}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    window.addEventListener('scroll', () => this.updateActiveDot());
  }
  updateActiveDot() {
    const wh = window.innerHeight; let active = state.activeSection;
    state.sectionsList.forEach(s => { const el = document.getElementById(`section-${s}`); if (el) { const r = el.getBoundingClientRect(); if (r.top < wh / 2 && r.bottom > wh / 2) active = s; } });
    this.fab.querySelectorAll('.fab-dot').forEach(d => d.classList.toggle('active', d.dataset.target === active));
  }
}

// ============================================
// 17. PARALLAX SCROLL EFFECTS
// ============================================
class ScrollEffects {
  constructor() { this.init(); }
  init() {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY, wh = window.innerHeight;
      const av = document.querySelector('.about-visual');
      if (av) { const r = av.getBoundingClientRect(); if (r.top < wh && r.bottom > 0) { av.style.transform = `translateY(${(r.top + r.height / 2 - wh / 2) * 0.1}px)`; av.style.transition = 'transform 0.2s ease-out'; } }
      const hc = document.querySelector('.hero-content'), si = document.querySelector('.hero-scroll-indicator');
      if (hc && sy < wh) { hc.style.opacity = Math.max(0.3, 1 - sy / (wh * 0.6)); if (si) si.style.opacity = Math.max(0, 1 - sy / 300); }
    });
  }
}

// ============================================
// 18. MOBILE NAV
// ============================================
class MobileNav {
  constructor() { if (!state.isMobile) return; this.init(); }
  init() {
    let lt = 0;
    document.getElementById('nav3d-container')?.addEventListener('touchend', () => {
      const now = Date.now(); if (now - lt < 300) { const idx = state.sectionsList.indexOf(state.activeSection); const next = document.querySelectorAll('.section')[Math.min(idx + 1, state.sectionsList.length - 1)]; if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' }); } lt = now;
    });
  }
}

// ============================================
// 19. GLITCH TEXT ON HERO TITLE
// ============================================
class GlitchText {
  constructor() {
    this.titles = document.querySelectorAll('.title-line');
    if (!this.titles.length) return;
    this.chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.intervals = new Map();
    this.init();
  }
  init() {
    this.titles.forEach(el => {
      const original = el.textContent;
      el.addEventListener('mouseenter', () => {
        let iterations = 0;
        const maxIter = 12;
        const interval = setInterval(() => {
          el.textContent = original.split('').map((ch, idx) => {
            if (idx < iterations) return original[idx];
            return this.chars[Math.floor(Math.random() * this.chars.length)];
          }).join('');
          iterations += 0.5;
          if (iterations >= maxIter) {
            clearInterval(interval);
            el.textContent = original;
            this.intervals.delete(el);
          }
        }, 40);
        this.intervals.set(el, interval);
      });
      el.addEventListener('mouseleave', () => {
        if (this.intervals.has(el)) { clearInterval(this.intervals.get(el)); this.intervals.delete(el); }
        el.textContent = original;
      });
    });
  }
}

// ============================================
// 20. NOISE OVERLAY
// ============================================
class NoiseOverlay {
  constructor() { const d = document.createElement('div'); d.classList.add('body-noise-overlay'); document.body.appendChild(d); }
}

// ============================================
// 21. CRT SCANLINES OVERLAY
// ============================================
class CRTOverlay {
  constructor() { const d = document.createElement('div'); d.classList.add('crt-overlay'); document.body.appendChild(d); }
}

// ============================================
// 22. PAGE TRANSITIONS
// ============================================
class PageTransitions {
  constructor() { this.veil = document.createElement('div'); this.veil.classList.add('page-transition-veil'); document.body.appendChild(this.veil); this.init(); }
  init() {
    document.addEventListener('click', (e) => { if (e.target.closest('.fab-dot')) this.playTransition(); });
    document.getElementById('nav3d-container')?.addEventListener('click', () => { setTimeout(() => { if (window.scrollY !== state.scrollY) { this.playTransition(); state.scrollY = window.scrollY; } }, 100); });
  }
  playTransition() { this.veil.classList.add('active'); setTimeout(() => this.veil.classList.remove('active'), 600); }
}

// ============================================
// 23. 3D ASCII ART OBJECT
// ============================================
class ASCIIArt3D {
  constructor() {
    if (!window.__nav3dScene) { setTimeout(() => this.addArt(), 100); return; }
    this.addArt();
  }
  addArt() {
    if (!window.__nav3dScene) return;
    const scene = window.__nav3dScene;
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.35 })));
    grp.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0x67e8f9, wireframe: true, transparent: true, opacity: 0.25 })));
    const dg = new THREE.Group(), dgeo = new THREE.SphereGeometry(0.03, 4, 4);
    for (let i = 0; i < 60; i++) {
      const dot = new THREE.Mesh(dgeo, new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xa78bfa : 0x67e8f9, transparent: true, opacity: 0.4 + Math.random() * 0.4 }));
      const phi = Math.random() * Math.PI * 2, th = Math.random() * Math.PI, r = 1.5 + Math.random() * 0.5;
      dot.position.set(r * Math.sin(th) * Math.cos(phi), r * Math.sin(th) * Math.sin(phi), r * Math.cos(th));
      dot.userData = { basePos: dot.position.clone(), speed: 0.5 + Math.random() * 1.5, amp: 0.1 + Math.random() * 0.2, phase: Math.random() * Math.PI * 2 };
      dg.add(dot);
    }
    grp.add(dg); grp.position.set(0, 1.5, 0); grp.userData = { dotsGroup: dg };
    scene.add(grp); this.group = grp; this.animate();
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.group) return;
    const time = Date.now() * 0.001;
    this.group.rotation.y += 0.003; this.group.rotation.x += 0.001;
    const dg = this.group.userData.dotsGroup;
    if (dg) dg.children.forEach(d => { const u = d.userData; if (u?.basePos) d.position.y = u.basePos.y + Math.sin(time * u.speed + u.phase) * u.amp; });
  }
}

// ============================================
// 24. ANIMATED GRADIENT BACKGROUND (Canvas)
// ============================================
class GradientBackground {
  constructor() {
    this.canvas = document.getElementById('gradientBgCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.time = 0;
    this.init();
  }
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  animate() {
    this.time += 0.003;
    const w = this.canvas.width, h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Deep dark gradient with subtle color shifts
    const g1 = this.ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.5, h * 0.5, Math.max(w, h));
    g1.addColorStop(0, `rgba(10, 5, 20, 0.8)`);
    g1.addColorStop(0.3, `rgba(5, 2, 15, 0.6)`);
    g1.addColorStop(0.6, `rgba(0, 0, 0, 0.4)`);
    g1.addColorStop(1, `rgba(0, 0, 0, 0.8)`);
    this.ctx.fillStyle = g1;
    this.ctx.fillRect(0, 0, w, h);

    // Moving color orbs
    const orbs = [
      { x: w * 0.2 + Math.sin(this.time * 0.3) * w * 0.1, y: h * 0.3 + Math.cos(this.time * 0.4) * h * 0.1, r: 300, color: 'rgba(167,139,250,0.06)' },
      { x: w * 0.7 + Math.cos(this.time * 0.35) * w * 0.1, y: h * 0.6 + Math.sin(this.time * 0.45) * h * 0.1, r: 250, color: 'rgba(103,232,249,0.04)' },
      { x: w * 0.5 + Math.sin(this.time * 0.25) * w * 0.15, y: h * 0.2 + Math.cos(this.time * 0.5) * h * 0.1, r: 200, color: 'rgba(244,114,182,0.03)' },
    ];

    orbs.forEach(orb => {
      const g = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      g.addColorStop(0, orb.color);
      g.addColorStop(1, 'transparent');
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, w, h);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 25. WebGL FRAGMENT SHADER (fluid-like waves)
// ============================================
class WebGLShader {
  constructor() {
    this.canvas = document.getElementById('shaderCanvas');
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) return;
    this.time = 0;
    this.init();
  }
  init() {
    const gl = this.gl;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}');
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 mx = u_mouse / u_res;
        // Flowing waves
        float d1 = sin(uv.x * 6.0 + u_time * 0.4) * cos(uv.y * 5.0 + u_time * 0.3) * 0.5 + 0.5;
        float d2 = sin(uv.y * 7.0 - u_time * 0.5) * cos(uv.x * 4.0 + u_time * 0.2) * 0.5 + 0.5;
        // Mouse influence
        float dist = length(uv - mx) * 2.0;
        float mouseGlow = exp(-dist * 3.0) * 0.15;
        // Colors
        vec3 c1 = vec3(0.04, 0.02, 0.08); // deep purple
        vec3 c2 = vec3(0.01, 0.04, 0.06); // deep cyan
        vec3 c3 = vec3(0.06, 0.01, 0.04); // deep pink
        vec3 col = mix(c1, c2, d1);
        col = mix(col, c3, d2 * 0.4);
        col += mouseGlow * vec3(0.5, 0.3, 0.8);
        gl_FragColor = vec4(col, 0.15);
      }
    `);
    gl.compileShader(fs);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    this.prog = prog;
    this.uRes = gl.getUniformLocation(prog, 'u_res');
    this.uTime = gl.getUniformLocation(prog, 'u_time');
    this.uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = window.innerHeight - e.clientY;
    });
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;

    this.animate();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); }
  animate() {
    this.time += 0.01;
    const gl = this.gl;
    gl.useProgram(this.prog);
    gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uTime, this.time);
    gl.uniform2f(this.uMouse, this.mouseX, this.mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// 26. HANDWRITING SVG LINE
// ============================================
class HandwritingLine {
  constructor() {
    const hero = document.querySelector('.hero-subtitle');
    if (!hero) return;
    const wrapper = document.createElement('div');
    wrapper.classList.add('handwriting-line');
    wrapper.innerHTML = `<svg viewBox="0 0 200 30"><path class="handwriting-path" d="M10,20 Q60,5 100,15 T190,10"/></svg>`;
    hero.parentNode.insertBefore(wrapper, hero.nextSibling);
  }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new ScrollProgress();
  const nav3d = new Navigation3D();
  window.__nav3dScene = nav3d.scene;

  new GradientBackground();
  new WebGLShader();
  new CustomCursor();
  new MouseShadow();
  new MouseTrail();
  new LoadingScreen();
  new ParticleSystem();
  new Background3D();
  new ConnectorLines();
  new GlareTracker();
  new TiltEffect();
  new AnimatedCounters();
  new SectionObserver();
  new TypedText();
  new NavToggle(nav3d);
  new FabCompass();
  new ScrollEffects();
  new MobileNav();
  new GlitchText();
  new NoiseOverlay();
  new CRTOverlay();
  new PageTransitions();
  new ASCIIArt3D();
  new HandwritingLine();
});