// =====================
// 1) DATA (mảng ảnh + note)
// =====================
const cardData = [
  { src: "./assets/images/image_1.jpeg", note: "Bức ảnh đầu tiên ❤️✨🥺" },
  { src: "./assets/images/image_2.jpg",  note: "Zô Triiii 😘😘" },
  { src: "./assets/images/image_3.jpg", note: "Đây chắc tính là First Date em ha" },
  { src: "./assets/images/image_4.jpeg", note: "Ôm hổng có rời xa nhau được lun" },
  { src: "./assets/images/image_5.jpg", note: "Nhớ Tuna quáááááááááááá" },
  { src: "./assets/images/image_6.jpg", note: "Mừng Em Bé lên chuẩn bị đi học" },
  { src: "./assets/images/image_7.jpg",  note: "Ròi ở cùng Em Béeeee" },
  { src: "./assets/images/image_8.jpg",  note: "Chuyên mục mỗi lần đi 1 ảnh" },
  { src: "./assets/images/image_9.jpg",  note: "Tun đố Em đây là đi đâuuu ạ" },
  { src: "./assets/images/image_10.jpg",  note: "Đánh răng đi ngụ thuiii 🕴" },
  { src: "./assets/images/image_11.jpg",  note: "Lại thang máy nè 😻" },
  { src: "./assets/images/image_12.jpg",  note: "Thơm thơmmmm 😘😘" },
  { src: "./assets/images/image_13.jpg",  note: "Bình nước bị thất sủng 😭" },
  { src: "./assets/images/image_14.png",  note: "Ú oà 😲" },
  { src: "./assets/images/image_15.jpg",  note: "Con đường nghiện ngập mì RAMEN" },
  { src: "./assets/images/image_16.jpg",  note: "Cả bún hải sản ngonnnn" },
  { src: "./assets/images/image_17.jpg",  note: "Lên tận nơi dỗ Em Bé Yêu 🌸" },
  { src: "./assets/images/image_18.jpg",  note: "Tun Tun và Em Bé Yêu 🌸" },
  { src: "./assets/images/image_19.jpg",  note: "Thờm thớm thơm thơm thơmmmm" },
  { src: "./assets/images/image_20.jpg",  note: "Quàooooo" },
  { src: "./assets/images/image_21.jpg",  note: "Đi tham quan Huế thuiiii" },
  { src: "./assets/images/image_22.jpg",  note: "Quốc học Huế" },
  { src: "./assets/images/image_23.jpeg",  note: "Dậy sớm đi bỉn nàooooo" },
  { src: "./assets/images/image_24.jpg",  note: "Bún Bò Huế ngon nhất ạ" },
  { src: "./assets/images/image_26.jpg",  note: "Em Béeee ngủ gật nè" },
  { src: "./assets/images/image_27.jpg",  note: "Nhìn Em mê títtttt" },
  { src: "./assets/images/image_28.jpg",  note: "Em Bé đoán xem đây ở đâu nè" },
  { src: "./assets/images/image_29.jpg",  note: "Về HY thuii nàoooo" },
  { src: "./assets/images/image_30.jpg",  note: "Quay lại ròi về TQ thuiii" },
  { src: "./assets/images/image_31.jpg",  note: "Tun Tun nhớ Em Bé quá" },
];

// =====================
// 2) RENDER cards bằng mảng + loop
// =====================
const cardsRoot = document.querySelector("#cards");
let clearedCount = 0;
let heartStarted = false;

function createCard({ src, note }, zIndex) {
  const wrap = document.createElement("div");
  wrap.className = "Picture";
  wrap.dataset.cleared = "0";
  wrap.style.zIndex = String(zIndex);

  const img = document.createElement("img");
  img.className = "Picture-img";
  img.src = src;
  img.alt = "Ảnh kỷ niệm";

  const noteDiv = document.createElement("div");
  noteDiv.className = "Picture-note";

  const span = document.createElement("span");
  span.textContent = note;

  noteDiv.appendChild(span);
  wrap.appendChild(img);
  wrap.appendChild(noteDiv);

  return wrap;
}

// card đầu tiên ở dưới, card cuối ở trên
cardData.reverse().forEach((item, i) => {
  const z = 100 + i; // cao hơn #letter (z-index 1)
  cardsRoot.appendChild(createCard(item, z));
});

// lấy NodeList sau khi render
const pictures = document.querySelectorAll(".Picture");

// =====================
// 3) Helpers: random start + bring front + clear detection
// =====================
function randomizeStart(el) {
  const range = 100;
  const randomX = Math.random() * (range * 2) - range;
  const randomY = Math.random() * (range * 2) - range;
  const randomRotate = Math.random() * (range / 2) - range / 4;

  el.style.top = `${randomY}px`;
  el.style.left = `${randomX}px`;
  el.style.transform = `translate(-50%, -50%) rotate(${randomRotate}deg)`;
}

function bringToFront(el) {
  const maxZ = Array.from(document.querySelectorAll(".Picture"))
    .reduce((m, x) => Math.max(m, Number(x.style.zIndex || 0)), 0);
  el.style.zIndex = String(maxZ + 1);
}

function getCenterDistance(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const vx = cx - window.innerWidth / 2;
  const vy = cy - window.innerHeight / 2;
  return Math.hypot(vx, vy);
}

// Tiêu chí "đã kéo ra" => card đi xa khỏi vùng giữa màn hình
function maybeClearCard(el) {
  const threshold = Math.min(window.innerWidth, window.innerHeight) * 0.35;

  if (el.dataset.cleared === "1") return;

  if (getCenterDistance(el) > threshold) {
    el.dataset.cleared = "1";
    clearedCount += 1;

    el.style.opacity = "0.88";

    if (clearedCount === pictures.length) {
      // Khi tất cả card đã được clear, làm thẻ image Picture-img-video to hơn 95% chiều rộng màn hình
      const videoCard = document.querySelector(".Picture-video .Picture-img-video");
      videoCard.style.width = "auto";
      videoCard.style.height = "90vh";
      startRevealHearts();
    }
  }
}

// =====================
// 4) Drag bằng Pointer Events (mouse + touch)
// =====================
pictures.forEach((picture) => {
  randomizeStart(picture);

  let startX = 0;
  let startY = 0;
  let baseTop = 0;
  let baseLeft = 0;

  picture.addEventListener("pointerdown", (e) => {
    picture.setPointerCapture(e.pointerId);
    bringToFront(picture);

    startX = e.clientX;
    startY = e.clientY;

    baseTop = parseFloat(picture.style.top || "0");
    baseLeft = parseFloat(picture.style.left || "0");
  });

  picture.addEventListener("pointermove", (e) => {
    if (!picture.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    picture.style.top = `${baseTop + dy}px`;
    picture.style.left = `${baseLeft + dx}px`;
  });

  picture.addEventListener("pointerup", (e) => {
    if (!picture.hasPointerCapture(e.pointerId)) return;
    picture.releasePointerCapture(e.pointerId);
    maybeClearCard(picture);
  });

  picture.addEventListener("pointercancel", (e) => {
    if (!picture.hasPointerCapture(e.pointerId)) return;
    picture.releasePointerCapture(e.pointerId);
    maybeClearCard(picture);
  });
});

// =====================
// 5) HEART RAIN (khi lộ thư)
// =====================
let heartRainTimer = null;

function spawnOneHeart() {
  const hearts = ["❤️", "💕", "💖", "💗", "💝", "💘", "💞", "💓"];

  const el = document.createElement("div");
  el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  el.style.position = "fixed";
  el.style.left = Math.random() * 100 + "vw";
  el.style.top = "-60px";
  el.style.fontSize = (Math.random() * 28 + 18) + "px";
  el.style.zIndex = "99999";
  el.style.pointerEvents = "none";
  el.style.opacity = "1";
  el.style.willChange = "transform, top, left, opacity";

  document.body.appendChild(el);

  const duration = Math.random() * 2500 + 3000; // 3s–5.5s
  const drift = (Math.random() - 0.5) * 240;

  requestAnimationFrame(() => {
    el.style.transition =
      `transform ${duration}ms linear, top ${duration}ms linear, left ${duration}ms linear, opacity ${duration}ms linear`;
    el.style.top = "120vh";
    el.style.left = `calc(${el.style.left} + ${drift}px)`;
    el.style.opacity = "0";
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
  });

  setTimeout(() => el.remove(), duration + 120);
}

function startHeartRain(rate = 14) {
  stopHeartRain();
  const intervalMs = Math.max(20, Math.floor(1000 / rate));
  heartRainTimer = setInterval(spawnOneHeart, intervalMs);
}

function stopHeartRain() {
  if (heartRainTimer) {
    clearInterval(heartRainTimer);
    heartRainTimer = null;
  }
}

function startRevealHearts() {
  if (heartStarted) return;
  heartStarted = true;

  startHeartRain(16);
  setTimeout(stopHeartRain, 6500);
}
