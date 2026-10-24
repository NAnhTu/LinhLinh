const welcome = document.querySelector("#welcome");
const messages = document.querySelector("#messages");
const ending = document.querySelector("#ending");
const gift = document.querySelector("#gift");
const startButton = document.querySelector("#start-button");
const nextButton = document.querySelector("#next-button");
const giftButton = document.querySelector("#gift-button");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const replayButton = document.querySelector("#replay-button");
const messageText = document.querySelector("#message-text");
const messageImage = document.querySelector("#message-image");
const progressBar = document.querySelector("#progress-bar");
const giftResponse = document.querySelector("#gift-response");
const audio = document.querySelector("#birthday-audio");

const messagesData = [
	{ text: "Allooo Em Bé Yêu 🌸 ơiiiiii 🤭❤️", image: "assets/images/IMG_2819.jpeg" },
	{ text: "Một chút đáng yêu gửi đến Em Bé Yêu 🌸", image: "https://i.ibb.co/s9cTyc0/bunga.gif" },
	{ text: "Tun Tun chỉ muốn nói với Em Bé Yêu 🌸 một điều nè...", image: "assets/images/IMG_2640.jpeg" },
	{ text: "Có một lời chúc thật đặc biệt dành cho Em Bé đây!", image: "https://feeldreams.github.io/pusn.gif" },
	{ text: "Chúc mừng sinh nhật Em Bé Yêu 🌸! 🥳", image: "assets/images/IMG_7429.jpeg" },
	{ text: "Hôm nay nhất định phải thật vui nha!", image: "https://feeldreams.github.io/cilukba.gif" },
	{ text: "Chúc Em Bé Yêu 🌸 tuổi mới thật nhiều niềm vui và luôn rạng rỡ ạaaaaa!", image: "assets/images/IMG_7465.jpeg" },
	{ text: "Tuổi mới rồi, cười thật tươi lên nhóoooo 🥰", image: "https://feeldreams.github.io/g5.gif" },
	{ text: "Tuổi mới chúc Em Bé Yêu 🌸 thật hạnh phúc, bình an và đạt được mọi điều mong muốn nha 🥰", image: "assets/images/IMG_2819.jpeg" },
	{ text: "Mỗi khoảnh khắc bên Em Bé Yêu 🌸 đều thật đáng nhớ.", image: "assets/images/image_1.png" },
	{ text: "Luôn vui vẻ và rạng rỡ như thế này ạaaaa!", image: "https://feeldreams.github.io/mndkat.gif" },
	{ text: "Mong những ngày phía trước luôn ngập tràn niềm vui.", image: "assets/images/image_2.png" },
	{ text: "Và mong nụ cười này sẽ luôn ở bên bạn nhé! 💕", image: "assets/images/image_3.png" }
];

let currentMessage = 0;

function showSection(section) {
	[welcome, messages, ending, gift].forEach((item) => item.classList.add("is-hidden"));
	section.classList.remove("is-hidden");
}

function renderMessage() {
	const item = messagesData[currentMessage];
	messageText.textContent = item.text;
	messageImage.src = item.image;
	messageImage.alt = item.text;
	progressBar.style.width = `${((currentMessage + 1) / messagesData.length) * 100}%`;
	nextButton.innerHTML = currentMessage === messagesData.length - 1 ? "Đến lời nhắn cuối <span aria-hidden=\"true\">→</span>" : "Tiếp theo <span aria-hidden=\"true\">→</span>";
}

startButton.addEventListener("click", () => {
	currentMessage = 0;
	showSection(messages);
	renderMessage();
	audio.play().catch(() => {});
});

nextButton.addEventListener("click", () => {
	if (currentMessage < messagesData.length - 1) {
		currentMessage += 1;
		renderMessage();
		return;
	}
	showSection(ending);
});

giftButton.addEventListener("click", () => {
	showSection(gift);
});

yesButton.addEventListener("click", () => {
	giftResponse.textContent = "Nhưng mà... quà đang được giấu kỹ lắm, phải đợi Tun Tun chuẩn bị đã nha 😜❤️";
});

noButton.addEventListener("click", () => {
	giftResponse.textContent = "Yaaah, vậy Tun Tun cất quà lại nhé! Nhưng lời chúc thì vẫn nhận nha 🤭";
});

replayButton.addEventListener("click", () => {
	giftResponse.textContent = "";
	showSection(welcome);
});

document.querySelector("#today").textContent = new Intl.DateTimeFormat("vi-VN", {
	day: "numeric",
	month: "long",
	year: "numeric"
}).format(new Date());
