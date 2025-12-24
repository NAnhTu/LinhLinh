import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

// --- 核心配置 ---
const CONFIG = {
  colors: {
    bg: 0x050d1a,
    fog: 0x050d1a,
    champagneGold: 0xffd966,
    deepGreen: 0x03180a,
    accentRed: 0x990000,
  },
  particles: {
    count: 1900,
    dustCount: 2000,
    snowCount: 1000,
    treeHeight: 25,
    treeRadius: 9,
  },
  camera: { z: 50 },
  preload: {
    autoScanLocal: false, // Disabled
    useCloudImages: true,

    // --- 【在这里自定义您的云端图片链接】 ---
    cloudImageUrls: [
      "./assets/images/linhlinh.jpg",
      "./assets/images/linhlinh1.jpg",
      "./assets/images/tuntun.jpg",
      "./assets/images/tuonggo.jpg",
      "./assets/images/christmas.jpg",
      "./assets/images/christmas1.jpg",
      "./assets/images/christmas2.gif",
      "./assets/images/christmasletter.jpg",
      "./assets/images/gift1.png",
      "./assets/images/gift2.png",
      "./assets/images/gift3.png",
      "./assets/images/gift4.png",
    ],
    scanCount: 0,
  },
};

const STATE = {
  mode: "TREE",
  focusIndex: -1,
  focusTarget: null,
  hand: { detected: false, x: 0, y: 0 },
  rotation: { x: 0, y: 0 },
  touch: { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0 },
};

let scene, camera, renderer, composer;
let mainGroup;
let clock = new THREE.Clock();
let particleSystem = [];
let photoMeshGroup = new THREE.Group();
let handLandmarker, video;
let caneTexture;
let giftTexture;
let greenGiftTexture;
let snowSystem;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const debugInfo = document.getElementById("debug-info");
const camBtn = document.getElementById("cam-btn");
let isCameraRunning = false;

// Gán hàm vào window để gọi được từ HTML (onclick)
window.setMode = (mode) => {
  if (mode === "FOCUS_LETTER") {
    STATE.mode = "FOCUS";
    const photos = particleSystem.filter((p) => p.subType === "LETTER");
    console.log(photos);
    if (photos.length)
      STATE.focusTarget =
        photos[Math.floor(Math.random() * photos.length)].mesh;
  } else if (mode === "FOCUS_PRESENT") {
    STATE.mode = "FOCUS";
    const photos = particleSystem.filter((p) => p.subType === "PRESENT");
    console.log(photos);
    if (photos.length)
      STATE.focusTarget =
        photos[Math.floor(Math.random() * photos.length)].mesh;
  } else if (mode === "FOCUS_RANDOM") {
    STATE.mode = "FOCUS";
    const photos = particleSystem.filter((p) => p.type === "PHOTO" && p.subType === "IMAGE" );
    if (photos.length)
      STATE.focusTarget =
        photos[Math.floor(Math.random() * photos.length)].mesh;
  } else {
    STATE.mode = mode;
    if (mode === "TREE") STATE.focusTarget = null;
  }
};

async function init() {
  initThree();
  setupEnvironment();
  setupLights();
  createTextures();
  createParticles();
  createDust();
  createSnow();
  loadPredefinedImages();
  setupPostProcessing();
  setupEvents();
  setupTouchAndClick();

  const loader = document.getElementById("loader");
  loader.style.opacity = 0;
  setTimeout(() => loader.remove(), 800);

  animate();
}

// --- 触屏与点击逻辑 (Raycaster) ---
function setupTouchAndClick() {
  const container = document.getElementById("canvas-container");

  container.addEventListener("pointerdown", (e) => {
    STATE.touch.active = true;
    STATE.touch.startX = e.clientX;
    STATE.touch.startY = e.clientY;
    STATE.touch.lastX = e.clientX;
    STATE.touch.lastY = e.clientY;
  });

  window.addEventListener("pointermove", (e) => {
    if (!STATE.touch.active) return;
    const deltaX = e.clientX - STATE.touch.lastX;
    const deltaY = e.clientY - STATE.touch.lastY;
    STATE.rotation.y += deltaX * 0.005;
    STATE.rotation.x += deltaY * 0.002;
    STATE.rotation.x = Math.max(-0.5, Math.min(0.5, STATE.rotation.x));
    STATE.touch.lastX = e.clientX;
    STATE.touch.lastY = e.clientY;
  });

  window.addEventListener("pointerup", (e) => {
    STATE.touch.active = false;
  });

  container.addEventListener("click", (e) => {
    const moveDist = Math.hypot(
      e.clientX - STATE.touch.startX,
      e.clientY - STATE.touch.startY
    );
    if (moveDist > 10) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(mainGroup.children, true);

    let clickedPhoto = null;
    for (let hit of intersects) {
      let obj = hit.object;
      while (
        obj.parent &&
        obj.parent !== mainGroup &&
        obj.parent !== photoMeshGroup
      ) {
        obj = obj.parent;
      }
      const particle = particleSystem.find(
        (p) => p.mesh === obj && p.type === "PHOTO"
      );
      if (particle) {
        clickedPhoto = particle;
        break;
      }
    }

    if (clickedPhoto) {
      STATE.mode = "FOCUS";
      STATE.focusTarget = clickedPhoto.mesh;
    } else {
      if (STATE.mode === "FOCUS") {
        STATE.mode = "TREE";
        STATE.focusTarget = null;
      }
    }
  });

  let lastTap = 0;
  container.addEventListener("touchend", (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      STATE.mode = STATE.mode === "SCATTER" ? "TREE" : "SCATTER";
      e.preventDefault();
    }
    lastTap = currentTime;
  });
}

// --- 核心 Three.js 逻辑 ---
function initThree() {
  const container = document.getElementById("canvas-container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.bg);
  scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.015);

  camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, CONFIG.camera.z);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.2;
  container.appendChild(renderer.domElement);

  mainGroup = new THREE.Group();
  scene.add(mainGroup);
}

function setupEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;
}

function setupLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const innerLight = new THREE.PointLight(0xffaa00, 2, 20);
  innerLight.position.set(0, 5, 0);
  mainGroup.add(innerLight);
  const spotGold = new THREE.SpotLight(0xffcc66, 1200);
  spotGold.position.set(30, 40, 40);
  spotGold.angle = 0.5;
  spotGold.penumbra = 0.5;
  scene.add(spotGold);
  const spotBlue = new THREE.SpotLight(0x6688ff, 800);
  spotBlue.position.set(-30, 20, -30);
  scene.add(spotBlue);
  const fill = new THREE.DirectionalLight(0xffeebb, 0.8);
  fill.position.set(0, 0, 50);
  scene.add(fill);
}

function setupPostProcessing() {
  const renderScene = new RenderPass(scene, camera);
  // --- FIX: Tăng ngưỡng threshold lên 0.85 để tránh cháy ảnh ---
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 1; // Cũ: 0.65 -> Cháy ảnh. Mới: 0.85 -> Ảnh rõ.
  bloomPass.strength = 0.4;
  bloomPass.radius = 0.4;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
}

function createTextures() {
  // 1. Texture Kẹo Gậy (Giữ nguyên)
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#880000";
  ctx.beginPath();
  for (let i = -128; i < 256; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 128);
    ctx.lineTo(i + 16, 128);
    ctx.lineTo(i - 16, 0);
  }
  ctx.fill();
  caneTexture = new THREE.CanvasTexture(canvas);
  caneTexture.wrapS = THREE.RepeatWrapping;
  caneTexture.wrapT = THREE.RepeatWrapping;
  caneTexture.repeat.set(3, 3);
  caneTexture.colorSpace = THREE.SRGBColorSpace;

  // 2. Texture Hộp Quà Đỏ + Nơ Vàng (Giữ nguyên)
  const gCanvas = document.createElement("canvas");
  gCanvas.width = 128;
  gCanvas.height = 128;
  const gCtx = gCanvas.getContext("2d");

  gCtx.fillStyle = "#8a0a0a"; // Đỏ đậm
  gCtx.fillRect(0, 0, 128, 128);

  gCtx.fillStyle = "#ffd700"; // Vàng
  const ribW = 5;
  gCtx.fillRect(64 - ribW / 2, 0, ribW, 128);
  gCtx.fillRect(0, 64 - ribW / 2, 128, ribW);

  gCtx.strokeStyle = "rgba(0,0,0,0.2)";
  gCtx.lineWidth = 2;
  gCtx.strokeRect(64 - ribW / 2, 0, ribW, 128);
  gCtx.strokeRect(0, 64 - ribW / 2, 128, ribW);

  giftTexture = new THREE.CanvasTexture(gCanvas);
  giftTexture.colorSpace = THREE.SRGBColorSpace;

  // 3. [MỚI] Texture Hộp Quà Xanh + Nơ Đỏ
  const ggCanvas = document.createElement("canvas");
  ggCanvas.width = 128;
  ggCanvas.height = 128;
  const ggCtx = ggCanvas.getContext("2d");

  // Nền Xanh lá đậm
  ggCtx.fillStyle = "#1b4d3e";
  ggCtx.fillRect(0, 0, 128, 128);

  // Dây ruy băng Đỏ tươi
  ggCtx.fillStyle = "#d9381e";
  ggCtx.fillRect(64 - ribW / 2, 0, ribW, 128); // Dọc
  ggCtx.fillRect(0, 64 - ribW / 2, 128, ribW); // Ngang

  // Viền tối tạo khối
  ggCtx.strokeStyle = "rgba(0,0,0,0.2)";
  ggCtx.lineWidth = 2;
  ggCtx.strokeRect(64 - ribW / 2, 0, ribW, 128);
  ggCtx.strokeRect(0, 64 - ribW / 2, 128, ribW);

  greenGiftTexture = new THREE.CanvasTexture(ggCanvas);
  greenGiftTexture.colorSpace = THREE.SRGBColorSpace;
}

// --- 粒子与图片系统 ---
function createSnow() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const velocities = [];
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.beginPath();
  context.arc(16, 16, 16, 0, Math.PI * 2);
  context.fill();
  const snowTexture = new THREE.CanvasTexture(canvas);

  for (let i = 0; i < CONFIG.particles.snowCount; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(60),
      THREE.MathUtils.randFloatSpread(60)
    );
    velocities.push(Math.random() * 0.2 + 0.1, Math.random() * 0.05);
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    "userData",
    new THREE.Float32BufferAttribute(velocities, 2)
  );
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.4,
    map: snowTexture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  snowSystem = new THREE.Points(geometry, material);
  scene.add(snowSystem);
}

function updateSnow() {
  if (!snowSystem) return;
  const positions = snowSystem.geometry.attributes.position.array;
  const userData = snowSystem.geometry.attributes.userData.array;
  for (let i = 0; i < CONFIG.particles.snowCount; i++) {
    const fallSpeed = userData[i * 2];
    positions[i * 3 + 1] -= fallSpeed;
    const swaySpeed = userData[i * 2 + 1];
    positions[i * 3] += Math.sin(clock.elapsedTime * 2 + i) * swaySpeed * 0.1;
    if (positions[i * 3 + 1] < -30) {
      positions[i * 3 + 1] = 30;
      positions[i * 3] = THREE.MathUtils.randFloatSpread(100);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(60);
    }
  }
  snowSystem.geometry.attributes.position.needsUpdate = true;
}

class Particle {
  constructor(mesh, type, isDust = false, subType = null) {
    this.mesh = mesh;
    this.type = type;
    this.subType = subType;
    this.isDust = isDust;
    this.posTree = new THREE.Vector3();
    this.posScatter = new THREE.Vector3();
    this.baseScale = mesh.scale.x;
    const speedMult = type === "PHOTO" ? 0.3 : 2.0;
    this.spinSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * speedMult,
      (Math.random() - 0.5) * speedMult,
      (Math.random() - 0.5) * speedMult
    );
    this.calculatePositions();
  }
  calculatePositions() {
    if (this.type === "PHOTO") {
      this.posTree.set(0, 0, 0);
      const rScatter = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      this.posScatter.set(
        rScatter * Math.sin(phi) * Math.cos(theta),
        rScatter * Math.sin(phi) * Math.sin(theta),
        rScatter * Math.cos(phi)
      );
      return;
    }
    const h = CONFIG.particles.treeHeight;
    let t = Math.pow(Math.random(), 0.8);
    const y = t * h - h / 2;
    let rMax = Math.max(0.5, CONFIG.particles.treeRadius * (1.0 - t));
    const angle = t * 50 * Math.PI + Math.random() * Math.PI;
    const r = rMax * (0.8 + Math.random() * 0.4);
    this.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    let rScatter = this.isDust
      ? 12 + Math.random() * 20
      : 8 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    this.posScatter.set(
      rScatter * Math.sin(phi) * Math.cos(theta),
      rScatter * Math.sin(phi) * Math.sin(theta),
      rScatter * Math.cos(phi)
    );
  }
  update(dt, mode, focusTargetMesh) {
    let target = mode === "SCATTER" ? this.posScatter : this.posTree;
    if (mode === "FOCUS") {
      if (this.mesh === focusTargetMesh) {
        const desiredWorldPos = new THREE.Vector3(0, 2, 35);
        const invMatrix = new THREE.Matrix4()
          .copy(mainGroup.matrixWorld)
          .invert();
        target = desiredWorldPos.applyMatrix4(invMatrix);
      } else target = this.posScatter;
    }
    const lerpSpeed =
      mode === "FOCUS" && this.mesh === focusTargetMesh ? 5.0 : 2.0;
    this.mesh.position.lerp(target, lerpSpeed * dt);

    if (mode === "SCATTER") {
      this.mesh.rotation.x += this.spinSpeed.x * dt;
      this.mesh.rotation.y += this.spinSpeed.y * dt;
      this.mesh.rotation.z += this.spinSpeed.z * dt;
    } else if (mode === "TREE") {
      if (this.type === "PHOTO") {
        this.mesh.lookAt(0, this.mesh.position.y, 0);
        this.mesh.rotateY(Math.PI);
      } else {
        this.mesh.rotation.x = THREE.MathUtils.lerp(
          this.mesh.rotation.x,
          0,
          dt
        );
        this.mesh.rotation.z = THREE.MathUtils.lerp(
          this.mesh.rotation.z,
          0,
          dt
        );
        this.mesh.rotation.y += 0.5 * dt;
      }
    }
    if (mode === "FOCUS" && this.mesh === focusTargetMesh)
      this.mesh.lookAt(camera.position);

    let s = this.baseScale;
    if (this.isDust) {
      s =
        this.baseScale *
        (0.8 + 0.4 * Math.sin(clock.elapsedTime * 4 + this.mesh.id));
      if (mode === "TREE") s = 0;
    } else if (mode === "SCATTER" && this.type === "PHOTO")
      s = this.baseScale * 2.5;
    else if (mode === "FOCUS") {
      if (this.mesh === focusTargetMesh) s = 4.5;
      else s = this.baseScale * 0.8;
    }
    this.mesh.scale.lerp(new THREE.Vector3(s, s, s), 4 * dt);
  }
}

function updatePhotoLayout() {
  const photos = particleSystem.filter((p) => p.type === "PHOTO");
  const count = photos.length;
  if (count === 0) return;
  const h = CONFIG.particles.treeHeight * 0.9;
  const bottomY = -h / 2;
  const stepY = h / count;
  const loops = 3;
  photos.forEach((p, i) => {
    const y = bottomY + stepY * i + stepY / 2;
    const normalizedH = (y + h / 2) / CONFIG.particles.treeHeight;
    const r =
      Math.max(1.0, CONFIG.particles.treeRadius * (1.0 - normalizedH)) + 3.0;
    const angle = normalizedH * Math.PI * 2 * loops + Math.PI / 4;
    p.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
  });
}

function createParticles() {
  // 1. Các hình khối (Geometry)
  const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32); // Bóng to
  const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55); // Hộp quà

  // [MỚI] Hình khối cho đốm sáng nhỏ (Low poly cho nhẹ)
  const tinyGeo = new THREE.SphereGeometry(0.05, 8, 8);

  // Kẹo gậy
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0, 0.3, 0),
    new THREE.Vector3(0.1, 0.5, 0),
    new THREE.Vector3(0.3, 0.4, 0),
  ]);
  const candyGeo = new THREE.TubeGeometry(curve, 16, 0.08, 8, false);

  // 2. Các chất liệu (Material)
  const goldMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.champagneGold,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 2.0,
  });
  const redMat = new THREE.MeshPhysicalMaterial({
    color: CONFIG.colors.accentRed,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const candyMat = new THREE.MeshStandardMaterial({
    map: caneTexture,
    roughness: 0.4,
  });
  const giftMat = new THREE.MeshStandardMaterial({
    map: giftTexture,
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const greenGiftMat = new THREE.MeshStandardMaterial({
    map: greenGiftTexture,
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });

  // [MỚI] Chất liệu phát sáng cho đốm nhỏ
  // Dùng MeshBasicMaterial + AdditiveBlending để tạo hiệu ứng như đèn LED
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xffd966, // Màu gốc: Vàng Champagne (giống bóng to)
    emissive: 0xffaa00, // Màu phát sáng: Vàng cam ấm
    emissiveIntensity: 2.0, // Cường độ sáng (càng cao càng rực rỡ)
    metalness: 1.0, // Độ kim loại: 100% (giống bóng to)
    roughness: 0.1, // Độ bóng: Rất bóng
    envMapIntensity: 1.0, // Phản chiếu môi trường
  });

  for (let i = 0; i < CONFIG.particles.count; i++) {
    const rand = Math.random();
    let mesh, type;

    // --- CẤU HÌNH TỶ LỆ MỚI ---

    // 1. Đốm sáng nhỏ (Chiếm 60% - Đa số)
    if (rand < 0.6) {
      mesh = new THREE.Mesh(tinyGeo, glowMat);
      type = "GLOW"; // Loại hạt mới
    }
    // 2. Hộp quà Đỏ (10%)
    else if (rand < 0.7) {
      mesh = new THREE.Mesh(boxGeo, giftMat);
      type = "GIFT_BOX";
    }
    // 3. Hộp quà Xanh (10%)
    else if (rand < 0.8) {
      mesh = new THREE.Mesh(boxGeo, greenGiftMat);
      type = "GREEN_GIFT";
    }
    // 4. Bóng vàng to (10% - Giảm mạnh)
    else if (rand < 0.9) {
      mesh = new THREE.Mesh(sphereGeo, goldMat);
      type = "GOLD_SPHERE";
    }
    // 5. Bóng đỏ to (5% - Điểm nhấn)
    else if (rand < 0.95) {
      mesh = new THREE.Mesh(sphereGeo, redMat);
      type = "RED";
    }
    // 6. Kẹo gậy (5%)
    else {
      mesh = new THREE.Mesh(candyGeo, candyMat);
      type = "CANE";
    }

    // Random kích thước nhẹ để tự nhiên hơn
    let s = 1.0;
    if (type === "GLOW") {
      s = 0.8 + Math.random() * 0.4; // Đốm sáng nhỏ
    } else {
      s = 0.4 + Math.random() * 0.5; // Các vật thể to
    }

    mesh.scale.set(s, s, s);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    mainGroup.add(mesh);

    // Đẩy vào hệ thống quản lý
    particleSystem.push(new Particle(mesh, type, false));
  }
  // Star
  const starShape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points + Math.PI / 2;
    const r = i % 2 === 0 ? 1.5 : 0.7;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
  });
  starGeo.center();
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xffaa00,
    emissiveIntensity: 1.0,
    metalness: 1.0,
    roughness: 0,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, CONFIG.particles.treeHeight / 2 + 1.2, 0);
  mainGroup.add(star);
  mainGroup.add(photoMeshGroup);
}

function createDust() {
  const geo = new THREE.TetrahedronGeometry(0.08, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffeebb,
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < CONFIG.particles.dustCount; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(0.5 + Math.random());
    mainGroup.add(mesh);
    particleSystem.push(new Particle(mesh, "DUST", true));
  }
}

function addPhotoToScene(texture, url) {
  const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);
  const frameMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.champagneGold,
    metalness: 1.0,
    roughness: 0.1,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  let width = 1.2;
  let height = 1.2;
  if (texture.image) {
    const aspect = texture.image.width / texture.image.height;
    if (aspect > 1) height = width / aspect;
    else width = height * aspect;
  }
  const photoGeo = new THREE.PlaneGeometry(width, height);
  const photoMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const photo = new THREE.Mesh(photoGeo, photoMat);
  photo.position.z = 0.04;
  const group = new THREE.Group();
  group.add(frame);
  group.add(photo);
  frame.scale.set(width / 1.2, height / 1.2, 1);
  const s = 0.8;
  group.scale.set(s, s, s);
  photoMeshGroup.add(group);
  particleSystem.push(new Particle(group, "PHOTO", false, url.includes("letter") ? "LETTER" : url.includes("gift") ?"PRESENT" : "IMAGE"));
  updatePhotoLayout();
}

function loadPredefinedImages() {
  const loader = new THREE.TextureLoader();

  // Only load Cloud Images
  if (
    CONFIG.preload.useCloudImages &&
    CONFIG.preload.cloudImageUrls.length > 0
  ) {
    CONFIG.preload.cloudImageUrls.forEach((url) => {
      loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          addPhotoToScene(t, url);
        },
        undefined,
        (err) => {
          console.warn("Failed to load cloud image:", url);
        }
      );
    });
  }
}

// --- MEDIAPIPE ---
function showMsg(txt) {
  const box = document.getElementById("msg-box");
  box.innerText = txt;
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}

async function initMediaPipe() {
  if (isCameraRunning) return;
  camBtn.innerText = "Initializing...";
  debugInfo.innerText = "Loading AI models...";
  video = document.getElementById("webcam");
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
    });
    const constraints = {
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
    document.getElementById("webcam-wrapper").style.opacity = 1;
    debugInfo.innerText = "Gesture Active: Show Hand";
    camBtn.innerText = "Gesture Active";
    camBtn.classList.add("active");
    isCameraRunning = true;
  } catch (e) {
    console.warn("Camera error:", e);
    let msg = "Camera Error: " + e.name;
    if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError")
      msg = "Please allow camera access!";
    else if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    )
      msg = "HTTPS required for camera!";
    debugInfo.innerText = msg;
    showMsg(msg);
    camBtn.innerText = "Retry Camera";
  }
}

let lastVideoTime = -1;
async function predictWebcam() {
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    if (handLandmarker) {
      const result = handLandmarker.detectForVideo(video, performance.now());
      processGestures(result);
    }
  }
  requestAnimationFrame(predictWebcam);
}

function processGestures(result) {
  if (result.landmarks && result.landmarks.length > 0) {
    STATE.hand.detected = true;
    const lm = result.landmarks[0];
    STATE.hand.x = (lm[9].x - 0.5) * 2;
    STATE.hand.y = (lm[9].y - 0.5) * 2;
    const wrist = lm[0];
    const middleMCP = lm[9];
    const handSize = Math.hypot(middleMCP.x - wrist.x, middleMCP.y - wrist.y);
    if (handSize < 0.02) return;
    const tips = [lm[8], lm[12], lm[16], lm[20]];
    let avgTipDist = 0;
    tips.forEach(
      (t) => (avgTipDist += Math.hypot(t.x - wrist.x, t.y - wrist.y))
    );
    avgTipDist /= 4;
    const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
    const extensionRatio = avgTipDist / handSize;
    const pinchRatio = pinchDist / handSize;

    debugInfo.innerText = `Gesture Detected: ${STATE.mode}`;

    if (extensionRatio < 1.5) {
      STATE.mode = "TREE";
      STATE.focusTarget = null;
    } else if (pinchRatio < 0.35) {
      if (STATE.mode !== "FOCUS") {
        STATE.mode = "FOCUS";
        const photos = particleSystem.filter((p) => p.type === "PHOTO");
        if (photos.length)
          STATE.focusTarget =
            photos[Math.floor(Math.random() * photos.length)].mesh;
      }
    } else if (extensionRatio > 1.7) {
      STATE.mode = "SCATTER";
      STATE.focusTarget = null;
    }
  } else {
    STATE.hand.detected = false;
  }
}

function setupEvents() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
  // REMOVED: File Input Event Listeners
  camBtn.addEventListener("click", () => {
    initMediaPipe();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      const controls = document.querySelector(".controls-wrapper");
      if (controls) controls.classList.toggle("ui-hidden");
      const webcam = document.getElementById("webcam-wrapper");
      if (webcam) webcam.classList.toggle("ui-hidden");
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // 交互逻辑核心：手势优先 > 触摸 > 自动旋转
  if (STATE.hand.detected) {
    // 手势控制
    if (STATE.mode === "SCATTER") {
      const targetRotY = STATE.hand.x * Math.PI * 0.9;
      const targetRotX = STATE.hand.y * Math.PI * 0.25;
      STATE.rotation.y += (targetRotY - STATE.rotation.y) * 3.0 * dt;
      STATE.rotation.x += (targetRotX - STATE.rotation.x) * 3.0 * dt;
    } else {
      STATE.rotation.y += 0.3 * dt;
    }
  } else if (STATE.touch.active) {
    // 触摸/鼠标拖动控制
  } else {
    // 自动闲置动画
    if (STATE.mode === "TREE") {
      STATE.rotation.y += 0.3 * dt;
      STATE.rotation.x += (0 - STATE.rotation.x) * 2.0 * dt;
    } else {
      STATE.rotation.y += 0.1 * dt;
    }
  }

  mainGroup.rotation.y = STATE.rotation.y;
  mainGroup.rotation.x = STATE.rotation.x;

  particleSystem.forEach((p) => p.update(dt, STATE.mode, STATE.focusTarget));
  updateSnow();
  composer.render();
}

init();
