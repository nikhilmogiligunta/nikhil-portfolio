/* Nikhil 3D Portfolio
   Uses Three.js + GSAP from CDN.
*/

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* Mobile navigation */
const toggle = $(".nav-toggle");
const nav = $(".nav-links");
toggle?.addEventListener("click", () => nav.classList.toggle("open"));
$$(".nav-links a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

/* Year */
$("#year").textContent = new Date().getFullYear();

/* Reveal + animated skill meters */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
$$(".reveal").forEach(el => observer.observe(el));

/* Cursor */
const dot = $("#cursor-dot");
const ring = $("#cursor-ring");
let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

window.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";
});
function cursorLoop() {
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;
  ring.style.left = ringX + "px";
  ring.style.top = ringY + "px";
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

$$("a, button, .tilt").forEach(el => {
  el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
});

/* 3D tilt cards */
$$(".tilt").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(4px)`;
  });
  card.addEventListener("mouseleave", () => card.style.transform = "");
});

/* Magnetic buttons */
$$(".magnetic").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * .14}px,${y * .14}px)`;
  });
  el.addEventListener("mouseleave", () => el.style.transform = "");
});

/* Hero core follows mouse */
const coreWrap = $("#core-wrap");
window.addEventListener("mousemove", e => {
  if (!coreWrap) return;
  const x = (e.clientX / innerWidth - .5);
  const y = (e.clientY / innerHeight - .5);
  coreWrap.style.transform = `rotateX(${-y * 9}deg) rotateY(${x * 12}deg)`;
});

/* Timeline progress */
const timeline = $(".timeline");
const progress = $(".timeline-progress");
function updateTimeline() {
  if (!timeline || !progress) return;
  const rect = timeline.getBoundingClientRect();
  const viewport = innerHeight;
  const total = rect.height;
  const passed = Math.min(total, Math.max(0, viewport * .62 - rect.top));
  progress.style.height = (passed / total * 100) + "%";
}
window.addEventListener("scroll", updateTimeline, { passive: true });
updateTimeline();

/* Project architecture interaction */
const detail = $("#arch-detail");
$$(".arch-node").forEach(node => {
  node.addEventListener("click", () => {
    $$(".arch-node").forEach(n => n.classList.remove("active"));
    node.classList.add("active");
    detail.textContent = node.dataset.detail;
  });
});

/* Three.js background */
const canvas = $("#scene");

if (window.THREE && canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 100);
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 10 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const cyan = Math.random() > .5;
    colors[i * 3] = cyan ? .15 : .45;
    colors[i * 3 + 1] = cyan ? .75 : .30;
    colors[i * 3 + 2] = cyan ? 1 : .95;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: .035,
    transparent: true,
    opacity: .62,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  group.add(particles);

  /* Faint wireframe globe */
  const globe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.8, 2),
    new THREE.MeshBasicMaterial({
      color: 0x6d5dfc,
      wireframe: true,
      transparent: true,
      opacity: .035
    })
  );
  group.add(globe);

  let targetX = 0, targetY = 0;
  window.addEventListener("mousemove", e => {
    targetX = (e.clientX / innerWidth - .5) * .8;
    targetY = (e.clientY / innerHeight - .5) * .5;
  });

  function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += .00035;
    particles.rotation.x += .00012;
    globe.rotation.y -= .00025;
    globe.rotation.x += .0001;

    group.rotation.y += (targetX - group.rotation.y) * .008;
    group.rotation.x += (-targetY - group.rotation.x) * .008;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* GSAP hero entrance if available */
if (window.gsap) {
  gsap.from(".hero-copy .eyebrow", { y: 20, opacity: 0, duration: .7, delay: .15 });
  gsap.from(".hero h1", { y: 45, opacity: 0, duration: 1, delay: .25, ease: "power3.out" });
  gsap.from(".hero-lead", { y: 25, opacity: 0, duration: .8, delay: .55 });
  gsap.from(".hero-actions", { y: 20, opacity: 0, duration: .7, delay: .75 });
  gsap.from(".mini-stats", { y: 20, opacity: 0, duration: .7, delay: .9 });
  gsap.from(".hero-stage", { scale: .8, opacity: 0, duration: 1.2, delay: .25, ease: "power3.out" });
}

/* Smooth active navigation */
const sections = $$("section[id]");
const navItems = $$(".nav-links a");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(s => sectionObserver.observe(s));