// Floating 3D "data" objects in the hero: database stacks, bar charts, a donut chart,
// a graduation cap and little stars. Soft pastel materials, mouse parallax, scroll drift.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('hero-3d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
  if (!canvas || reduce) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 18);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9cb8e8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(5, 8, 10);
  scene.add(sun);

  const C = { navy: 0x1c3776, blue: 0x5b8def, sky: 0x9ccbff, butter: 0xffd97a, peach: 0xffb29a, mint: 0x9ee3c9, lilac: 0xc3b4f7, white: 0xf5f8ff };
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.05 });

  const world = new THREE.Group();
  scene.add(world);
  const floaters = [];
  const add = (obj, x, y, z, s = 1) => {
    obj.position.set(x, y, z); obj.scale.setScalar(s);
    obj.userData = { base: new THREE.Vector3(x, y, z), phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.4 };
    world.add(obj); floaters.push(obj); return obj;
  };

  // database cylinder stack
  function database(c1, c2) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.55, 40), mat(i % 2 ? c2 : c1));
      disk.position.y = i * 0.66;
      g.add(disk);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 40), mat(C.navy));
      rim.rotation.x = Math.PI / 2; rim.position.y = i * 0.66 + 0.28;
      g.add(rim);
    }
    g.rotation.set(0.35, 0, 0.12);
    return g;
  }
  // bar chart
  function bars() {
    const g = new THREE.Group();
    const hs = [1, 1.7, 1.25, 2.3];
    const cs = [C.mint, C.butter, C.peach, C.lilac];
    hs.forEach((h, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), mat(cs[i]));
      b.position.set(i * 0.68 - 1, h / 2, 0);
      g.add(b);
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1), mat(C.navy));
    base.position.y = -0.06; g.add(base);
    g.rotation.set(0.25, -0.5, 0);
    return g;
  }
  // donut chart
  function donut() {
    const g = new THREE.Group();
    const parts = [[0.42, C.blue], [0.28, C.butter], [0.18, C.peach], [0.12, C.mint]];
    let a = 0;
    parts.forEach(([f, c]) => {
      const seg = new THREE.Mesh(new THREE.TorusGeometry(1, 0.36, 18, 60, f * Math.PI * 2 - 0.05), mat(c));
      seg.rotation.z = a; a += f * Math.PI * 2;
      g.add(seg);
    });
    g.rotation.set(0.6, 0.3, 0);
    return g;
  }
  // graduation cap
  function cap() {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), mat(C.navy));
    board.rotation.y = Math.PI / 4; g.add(board);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.7, 32), mat(C.navy));
    head.position.y = -0.4; g.add(head);
    const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), mat(C.butter));
    tassel.position.set(0.9, -0.1, 0.9); g.add(tassel);
    g.rotation.set(0.35, 0, -0.2);
    return g;
  }
  function star(c) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.45 : 1; const t = (i / 10) * Math.PI * 2 - Math.PI / 2;
      i ? shape.lineTo(Math.cos(t) * r, Math.sin(t) * r) : shape.moveTo(Math.cos(t) * r, Math.sin(t) * r);
    }
    return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }), mat(c));
  }

  const objs = {
    db: add(database(C.sky, C.white), -8.4, 5.0, -4, 0.62),
    bars: add(bars(), -4.6, -5.2, -1, 0.62),
    donut: add(donut(), 8.6, 4.2, -3, 0.8),
    cap: add(cap(), 7.8, -4.6, 0, 0.75),
    db2: add(database(C.mint, C.white), 1.2, 5.9, -7, 0.5),
    s1: add(star(C.butter), -0.6, -6.0, -4, 0.38),
    s2: add(star(C.peach), 4.4, 6.4, -4, 0.32),
    s3: add(star(C.lilac), 1.4, -6.2, -5, 0.3),
  };

  let w = 0, h = 0, mobile = false;
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mobile = w < 760;
    world.scale.setScalar(mobile ? 0.55 : Math.min(1, w / 1400));
    objs.db2.visible = !mobile; objs.s3.visible = !mobile;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  // scroll drift via ScrollTrigger when available
  let scrollP = 0;
  if (window.gsap && window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => { scrollP = s.progress; } });
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    floaters.forEach((o) => {
      const d = o.userData;
      o.position.y = d.base.y + Math.sin(t * 0.9 + d.phase) * 0.35 + scrollP * (d.base.y > 0 ? 3 : -3);
      o.position.x = d.base.x + Math.cos(t * 0.6 + d.phase) * 0.15;
      o.rotation.y += d.spin * 0.01 + 0.002;
    });
    world.rotation.y += ((mouse.x * 0.25) - world.rotation.y) * 0.04;
    world.rotation.x += ((mouse.y * 0.15) - world.rotation.x) * 0.04;
    renderer.render(scene, camera);
  }
  frame();
}

init();
