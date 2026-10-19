const petals = document.getElementById("petals");

for (let i = 0; i < 24; i++) {
	const petal = document.createElement("span");
	petal.className = "petal";
	petal.style.left = Math.random() * 100 + "vw";
	petal.style.animationDuration = 7 + Math.random() * 8 + "s";
	petal.style.animationDelay = Math.random() * 6 + "s";
	petal.style.opacity = 0.35 + Math.random() * 0.45;
	petal.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
	petals.appendChild(petal);
}

const message = `Em Bé Yêu 🌸 ơi,
Nhân ngày 20/10, Tun Tun chúc Em Bé Yêu 🌸 luôn xinh đẹp, rạng rỡ và lúc nào cũng cười tươi thiệc là tươi ạaaa.
Mong rằng mỗi ngày của Em Bé Yêu 🌸 đều nhẹ nhàng, vui vẻ và luôn có thật nhiều điều tốt đẹp ghé đến bên Em Bé Yêu 🌸 ạaaaaa.
Chúc Em Bé Yêu 🌸 một ngày 20/10 thật hạnh phúc, thật đáng nhớ và nhận được thật nhiều yêu thương nhất là cụa Tun Tun ạaaaa 💗
Em Bé đợi xíu xiu món quà nhỏ đang tới ròi ạ, mấy nữa Tun về Tun tặng Em món quà lơn lớn hơn nữa nhaaaaaa 🌸🌸🌸
— From Tun Tun with love 🌷`;

const typingText = document.getElementById("typingText");
let currentIndex = 0;

function renderTyping() {
	if (currentIndex < message.length) {
		typingText.innerHTML = message.slice(0, currentIndex + 1) + '<span class="cursor"></span>';
		currentIndex++;
		setTimeout(renderTyping, 32);
	} else {
		typingText.innerHTML = message + '<span class="cursor"></span>';
	}
}

renderTyping();

const images = document.querySelectorAll(".main-photo img");
const thumbs = document.querySelectorAll(".thumb");
let current = 0;
let slideInterval = null;

function showSlide(index) {
	images.forEach((image, imageIndex) => image.classList.toggle("active", imageIndex === index));
	thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle("active", thumbIndex === index));
	current = index;
}

function startSlide() {
	slideInterval = setInterval(() => showSlide((current + 1) % images.length), 3500);
}

function resetSlide() {
	clearInterval(slideInterval);
	startSlide();
}

thumbs.forEach((thumb) => {
	thumb.addEventListener("click", () => {
		showSlide(Number(thumb.dataset.index));
		resetSlide();
	});
});

startSlide();

const hearts = document.getElementById("hearts");
const heartIcons = ["💗", "💕", "💖", "🌸"];

setInterval(() => {
	const heart = document.createElement("span");
	heart.className = "heart";
	heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
	heart.style.left = Math.random() * 84 + "%";
	heart.style.fontSize = 16 + Math.random() * 12 + "px";
	heart.style.animationDuration = 4 + Math.random() * 3 + "s";
	hearts.appendChild(heart);

	setTimeout(() => heart.remove(), 7000);
}, 650);

const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const audioStartTime = 53;
let hasStarted = false;
let playing = false;

musicBtn.addEventListener("click", async () => {
	try {
		if (!playing) {
			if (!hasStarted) {
				bgMusic.currentTime = audioStartTime;
				hasStarted = true;
			}

			await bgMusic.play();
			musicBtn.textContent = "⏸ Tắt nhạc";
			playing = true;
		} else {
			bgMusic.pause();
			musicBtn.textContent = "🎵 Bật nhạc";
			playing = false;
		}
	} catch (error) {
		alert("Trình duyệt đang chặn phát nhạc tự động, bạn bấm lại giúp nhé.");
	}
});
