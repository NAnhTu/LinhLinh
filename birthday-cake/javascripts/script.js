/* =========================
   Happy Birthday - script.js
   ========================= */

let audioContext;
let mediaStream;
let flameCount = 3;
let flamesBlownOut = 0;
let microphoneStopped = false; // track microphone status
const bdMsgEl = document.getElementById("bdMsg");

/* ========= Helpers cho flame ========= */
function getFlameEl(i) {
  return document.getElementById("flame" + i);
}
function isFlameOff(el) {
  return el?.classList.contains("flame-off");
}
function setFlameOff(el) {
  if (el && !isFlameOff(el)) {
    el.classList.add("flame-off");
    flamesBlownOut++;
    updateAmbient();
  }
}
function setFlameOn(el) {
  if (el && isFlameOff(el)) {
    el.classList.remove("flame-off");
    flamesBlownOut = Math.max(0, flamesBlownOut - 1);
    // (tuỳ chọn) reset animation để lửa rung lại
    el.style.animation = "none";
    // force reflow
    void el.offsetHeight;
    el.style.animation = "";
    updateAmbient();
  }
}
function countVisibleFlames() {
  let visible = 0;
  for (let i = 1; i <= flameCount; i++) {
    const f = getFlameEl(i);
    if (f && !isFlameOff(f)) visible++;
  }
  return visible;
}

/* ========= Nền sáng/tối theo số nến còn lại ========= */
function updateAmbient() {
  const remain = countVisibleFlames();
  if (remain > 0) {
    document.body.classList.add("bright");
    document.body.classList.remove("dark");
  } else {
    document.body.classList.remove("bright");
    document.body.classList.add("dark");
  }
}

/* ========= Audio / Micro (thổi nến) ========= */
function setupAudio() {
  if (window.AudioContext || window.webkitAudioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        mediaStream = stream;
        const source = audioContext.createMediaStreamSource(stream);
        const scriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);

        scriptNode.onaudioprocess = function (event) {
          if (microphoneStopped) return;
          const inputData = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < inputData.length; i++)
            sum += Math.abs(inputData[i]);
          const average = sum / inputData.length;
          const amp = Math.round(average * 10000);

          if (amp > 850) {
            // Chỉ chọn trong các nến còn sáng
            const onFlames = [];
            for (let i = 1; i <= flameCount; i++) {
              const f = getFlameEl(i);
              if (f && !isFlameOff(f)) onFlames.push(f);
            }
            if (onFlames.length) {
              const flame =
                onFlames[Math.floor(Math.random() * onFlames.length)];
              setFlameOff(flame);

              if (flamesBlownOut === flameCount) {
                // Tất cả nến đã tắt
                bdMsgEl.innerHTML = `Happy Birthday <br> Be Yeu 🌸`;
                bdMsgEl.classList.add("changeColor");
                bdMsgEl.style.fontFamily = "birthday";

                const hbdaudio = new Audio("assets/audios/hbd.mp3");
                const cheeraudio = new Audio("assets/audios/cheering.mp3");
                cheeraudio.play();
                hbdaudio.play();

                stopMicrophone();

                confetti({
                  particleCount: 500,
                  startVelocity: 30,
                  spread: 360,
                  origin: { x: 0.5, y: 0 },
                });

                function frame() {
                  confetti({
                    colors: ["#ff00ff", "#ff0000"],
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                  });
                  confetti({
                    colors: ["#ff00ff", "#ff0000"],
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                  });
                }
                setInterval(frame, 100);
                createBalloons(10);

                updateAmbient(); // đảm bảo nền “dark”
              }
            }
          }
        };
      })
      .catch(function (err) {
        console.error("Error accessing microphone:", err);
      });
  } else {
    console.error("AudioContext is not supported in this browser.");
  }
}

function stopMicrophone() {
  if (mediaStream) {
    mediaStream.getTracks()[0].stop();
    microphoneStopped = true;
    console.log("Microphone access revoked.");
  }
}

/* ========= UI khởi tạo ========= */
document.getElementById("mainContainer").style.opacity = 0.5;
document.getElementById("micAccessBtn").style.opacity = 1;
document.getElementById("micAccessBtn").addEventListener("click", function () {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().then(function () {
      console.log("AudioContext is resumed.");
      setupAudio();
    });
  } else {
    setupAudio();
  }
  document.getElementById("micAccessBtn").style.display = "none";
  document.getElementById("mainContainer").style.opacity = 1;
  updateAmbient();
});

/* ========= Bóng bay ========= */
const balloonContainer = document.getElementById("balloon-container");

function random(num) {
  return Math.floor(Math.random() * num);
}

function getRandomStyles() {
  var r = random(255);
  var g = random(255);
  var b = random(255);
  var mt = random(200);
  var ml = random(50);
  var dur = random(5) + 5;
  return `
  background-color: rgba(${r},${g},${b},0.7);
  color: rgba(${r},${g},${b},0.7); 
  box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7);
  margin: ${mt}px 0 0 ${ml}px;
  animation: float ${dur}s ease-in infinite
  `;
}

function createBalloons(num) {
  for (var i = num; i > 0; i--) {
    var balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.cssText = getRandomStyles();
    balloonContainer.append(balloon);
  }
}

function removeBalloons() {
  balloonContainer.style.opacity = 0;
  setTimeout(() => {
    balloonContainer.remove();
  }, 500);
}

/* ========= Que diêm theo chuột/chạm ========= */
const matchEl = document.getElementById("matchstick");
let isHolding = false;

function positionMatch(e) {
  const x = (e.touches && e.touches[0]?.clientX) ?? e.clientX;
  const y = (e.touches && e.touches[0]?.clientY) ?? e.clientY;
  if (x == null || y == null || !matchEl) return;
  matchEl.style.left = x + "px";
  matchEl.style.top = y + "px";
}

function startHolding(e) {
  isHolding = true;
  if (matchEl) {
    matchEl.style.display = "block";
    matchEl.classList.add("lit"); // hiện ngọn lửa nhỏ
    positionMatch(e);
  }
}

function stopHolding() {
  isHolding = false;
  if (matchEl) {
    matchEl.style.display = "none";
    matchEl.classList.remove("lit");
  }
}

function moveWhileHolding(e) {
  if (!isHolding) return;
  positionMatch(e);
}

/* Mouse */
document.addEventListener("mousedown", startHolding);
document.addEventListener("mouseup", stopHolding);
document.addEventListener("mousemove", moveWhileHolding);
/* Touch (mobile) */
document.addEventListener("touchstart", startHolding, { passive: true });
document.addEventListener("touchend", stopHolding, { passive: true });
document.addEventListener("touchcancel", stopHolding, { passive: true });
document.addEventListener("touchmove", moveWhileHolding, { passive: true });

/* ========= Di que diêm qua flame để thắp lại ========= */
function relightFlame(id) {
  const flame = document.getElementById(id);
  if (flame && isFlameOff(flame) && isHolding) {
    setFlameOn(flame);
  }
}

// Gắn sự kiện cho từng nến
["flame1", "flame2", "flame3"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("mouseenter", () => relightFlame(id));
  el.addEventListener("touchstart", () => relightFlame(id), { passive: true });
});

/* Đồng bộ nền khi tải trang */
updateAmbient();
