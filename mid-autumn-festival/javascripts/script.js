var card = document.getElementById("card"),
  openB = document.getElementById("open"),
  closeB = document.getElementById("close"),
  timer = null;

// Audio objects
var normalMusic = new Audio("assets/audios/piano-aloha.mp3");
var royalMusic = new Audio("assets/audios/piano-nnca.mp3");
var currentMusic = null;

// Set audio properties
normalMusic.loop = true;
royalMusic.loop = true;

// Mode tracking
var isRoyalMode = false;

console.log("wat", card);

// Function to play the appropriate music based on current mode
function playCurrentMusic() {
  // Stop any currently playing music
  stopAllMusic();
  
  // Play music based on current mode
  if (isRoyalMode && royalMusic) {
    currentMusic = royalMusic;
    royalMusic.currentTime = 0;
    royalMusic.play().catch(function(error) {
      console.log("Could not play royal music:", error);
    });
  } else if (normalMusic) {
    currentMusic = normalMusic;
    normalMusic.currentTime = 0;
    normalMusic.play().catch(function(error) {
      console.log("Could not play normal music:", error);
    });
  }
}

// Function to stop all music
function stopAllMusic() {
  if (normalMusic) {
    normalMusic.pause();
    normalMusic.currentTime = 0;
  }
  if (royalMusic) {
    royalMusic.pause();
    royalMusic.currentTime = 0;
  }
  currentMusic = null;
}

// Function to switch music when mode changes
function switchMusic() {
  if (currentMusic) {
    // If music is currently playing, switch to the appropriate track
    playCurrentMusic();
  }
}

openB.addEventListener("click", function () {
  card.setAttribute("class", "open-half");
  if (timer) clearTimeout(timer);
  timer = setTimeout(function () {
    card.setAttribute("class", "open-fully");
    timer = null;
  }, 1000);
  
  // Start playing music when card opens
  setTimeout(function() {
    playCurrentMusic();
    startTypingCurrentContent();
  }, 500); // Small delay to let the card opening animation start
});

closeB.addEventListener("click", function () {
  card.setAttribute("class", "close-half");
  if (timer) clearTimeout(timer); // sửa lỗi "clearTimerout" thành "clearTimeout"
  timer = setTimeout(function () {
    card.setAttribute("class", "");
    timer = null;
  }, 1000);
  
  // Stop music when card closes
  stopAllMusic();
  // Stop typing when card closes
  clearTyping();
  if (contentDiv) {
    contentDiv.textContent = "";
  }
});

// Formality Toggle Functionality
var formalityToggle = document.getElementById("formalityToggle");
var titleP= document.querySelector(".title");
var contentDiv = document.querySelector(".content");
var signedP = document.querySelector(".signed");

// Normal and royal signatures
var normalTitle = '<b><u>Happy Birthday Bé Yêu 🌸!</u></b>';
var royalTitle = '<b><u>Chúc Mừng Sinh Nhật Công Nương Bé Yêu 🌸!</u></b>';

// Original content
var normalContent = `Chúc mừng sinh nhật 🎂 Em Bé Yêu 🌸 của Tun Tun ạaaa
Tun chúc Em Bé nhà mình tuổi mới luôn có nhiều sức khoẻ 💪 nèeee, luôn có nhiều may mắn 🍀 nè, luôn có
nhiều sự xinh đẹp 🥰 nứa nèeee. Mọi thứ nhiều rồi thì bớt buồn và bớt khóc 😭 lại nhaaaaa.
Tun chúc Em đạt được nhiều những dự định trong tương lai của Em nè và mong rằng Tun cũng có trong dự định
của Em Bé nhó.
Chúc Em Béee ngày càng yêu Tun hơn hông mắng Tun nứa nhaa, Dù công việc có nặng nề với Em như nào thì Tun
vẫn sẽ nhẹ nhàng và yêu Em Béee ạ. Em Béee luôn là sự động viên rất lớn dành cho Tun Tun ạ
Chúc Em Béee nhà mình có tất cả trừ vất vả nhaaa
Tun Tun yêu Em Bé Yêu Công Chúa 🌸🌸 lắm lắm ạaaaa ❤️❤️❤️❤️❤️❤️`;

// Royal content
var royalContent = `Trong ngày trọng đại đầy hoa và ánh sáng này, Bá Tước Tun xin được dâng lời chúc tốt đẹp nhất đến Công Nương đáng kính của lòng ta. 🌹
Nguyện cho Công Nương luôn sở hữu sức khỏe dồi dào 💪, may mắn nối dài 🍀, và vẻ đẹp tinh khôi vĩnh cửu 🥰. Xin cho những u sầu, giọt lệ không còn ghé thăm, để nụ cười luôn rạng rỡ trên môi Công Nương.
Bá Tước cầu chúc cho mọi dự định và hoài bão cao quý của Công Nương sớm thành tựu. Và trong từng viễn cảnh tương lai huy hoàng ấy, mong rằng vẫn còn một vị trí cho kẻ trung thành là Bá Tước Tun này.
Xin cho tình yêu giữa chúng ta ngày một thêm nồng thắm, để Công Nương không còn quở trách Bá Tước, mà chỉ mỉm cười khoan dung. Dẫu công việc có chất chứa bao nhọc nhằn, Bá Tước vẫn nguyện là nguồn an ủi nhẹ nhàng, là bờ vai vững chãi cho Công Nương Bé Yêu 🌸.
Cầu mong Công Nương được ban tặng tất cả phúc lành trên thế gian, ngoại trừ sự vất vả.
Bá Tước Tun xin cúi mình, dâng trọn con tim và lòng chung thủy đến Công Nương Bé Yêu Công Chúa 🌸🌸 của đời ta. ❤️❤️❤️❤️❤️`;

// Normal and royal signatures
var normalSigned = '<u>From Tun Tun with </u><b> ❤️</b>';
var royalSigned = '<u>Từ Bá Tước Tun với tình yêu vĩnh cửu</u><b> 👑❤️</b>';

// Typing effect utilities for the letter content
var typingTimer = null;
var typingIndex = 0;
var typingSpeedMs = 24; // lower is faster

function clearTyping() {
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
}

function typeInto(element, fullText) {
  clearTyping();
  typingIndex = 0;
  element.textContent = "";

  (function step() {
    // Append next character
    element.textContent = fullText.slice(0, typingIndex);
    typingIndex += 1;
    if (typingIndex <= fullText.length) {
      typingTimer = setTimeout(step, typingSpeedMs);
    } else {
      typingTimer = null;
    }
  })();
}

function startTypingCurrentContent() {
  var textToType = isRoyalMode ? royalContent : normalContent;
  if (contentDiv) {
    typeInto(contentDiv, textToType);
  }
}

formalityToggle.addEventListener("click", function () {
  isRoyalMode = !isRoyalMode;
  
  if (isRoyalMode) {
    // Switch to Royal Mode
    document.body.classList.add("royal-mode");
    formalityToggle.classList.add("active");
    formalityToggle.querySelector(".toggle-text").textContent = "Normal Mode";
    titleP.innerHTML = royalTitle;
    startTypingCurrentContent();
    signedP.innerHTML = royalSigned;
  } else {
    // Switch to Normal Mode
    document.body.classList.remove("royal-mode");
    formalityToggle.classList.remove("active");
    formalityToggle.querySelector(".toggle-text").textContent = "Royal Mode";
    titleP.innerHTML = normalTitle;
    startTypingCurrentContent();
    signedP.innerHTML = normalSigned;
  }
  
  // Switch music if card is currently open and music is playing
  switchMusic();
});
