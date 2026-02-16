const envelopeContents = [
  "Chúc Em Bé Yêu 🌸 có một năm mới Bính Ngọ 2026 Mã Đáo Thành Công thành công, mọi sự đều thuận lợi. Nếu năm qua có bất kỳ khó khăn nào thì Bé cũng đừng nản chí nha. Tun tin rằng những điều tốt đẹp sẽ đến với Bé Yêu 🌸 trong năm nay. Tun vẫn luôn ở bên Bé mỗi khi Bé cần ạ.",
  // "Vậy là đã thêm một năm 2 đứa yêu xa ròi Em Béee nhỉ 🌸🌸, mọi thứ đã dần dần quen ròi, hai đứa không còn cãi nhau nhiều nữa, yêu thương nhau hơn và Tun Tun cũng yêu Em Béeee nhiều hơn ạ.",
  "Một năm yêu xa thực sự Tun cảm ơn Em Béeee nhiều ạ, năm qua Em Béee đã giúp đỡ Tun nhiều, mỗi lầm Tun buồn Tun chán, Tun a nhô với Em là Tun lại hớt buồn mất tiu. Em Béee đúng là động lực lớn để Tun cố gắng hơn nữa ạ. Yêu Em Béeee 🌸 nhiều ạ.",
  "Năm vừa rồi Tun hơm ở nhà quả thực là để Em chịu thiệt thòi nhiều ròi, hơm đưa được Em đi ăn Ramen, ăn Bún Bò Huế, ăn Cơm Tấm Sà Bì Chưởng, ăn bún Hải Sản ngon ngon ngon. Tun hứa khi về nhà mình sẽ đi chơi nhiều, đi ăn thật nhiều thứ ngon nhaaaaaaa",
  "Hi vọng sang năm tới thì Tun về sẽ lên nhà Em, ròi mời Em về nhà Tun thêm lần nữa. Hi vọng sẽ không để bố mẹ Em phải lo quá nhiều, để bố còn tặng Tun bình rượu mơ Em Bé Yêu 🌸 cụa bố cho Tun để Tun nâng niu chăm sóc ạaaaa",
  "Chúc Em Bé Yêu 🌸 và bố mẹ và Tri một năm mới an lành, gia đình có nhiều sức khoẻ, vui vẻ, may mắn và thành công trên mọi mặt. Chúc cả nhà luôn luôn yêu thương nhau nhiều hơn ạ",
  // "Em Bé Yêu 🌸 của Tun thúi ơiiii, Hi vọng sang năm mới Tun luôn được đồng hành ở bên em Bé cũng như luôn có Em Bé ở bên để làm động lực cho Tun nhìu hơn ạ. Tun yêu Em Bé Yêu 🌸 nhiềuuuuuu",
  "Năm mới mong Em Béee cụa Tun luôn cười thật tươi, mỗi ngày trôi qua đều thật nhẹ nhàng với Em ạ. Buồn hay vui sẽ đều có Tun ở bên Em. Tun muốn cùng Em đi qua thêm nhiều Tết hơn nữa. Em Béee đồng hành cùng Tun nhaaaa. Tun yêu Em Bé Yêu 🌸 nhiềuuuuuu.",
  // "Năm qua là một năm đặc biệt của chúng mình, Bé Yêu 🌸 nhỉ? Tun hi vọng rằng những ký ức vui vẻ như vậy sẽ tiếp tục theo Bé và Tun trong năm nay và những năm tháng sau này. Yêu Em Bé Yêu 🌸 của Tun thúiiii.",
  // "Chúc mừng năm mới, Em Bé Yêu 🌸 của Tun thúi. Tun vs Em Bé đã ở bên cạnh nhau được một thời gian rồi. Một năm qua thật với Tun. Tun rất vui vì mỗi khi Tun buồn Tun nhụt chí thì luôn có Em Bé ở bên an ủi và động viên Tun.",
  // "Vậy là lại một năm đã qua. Tun rất vui vì năm qua Tun vs Bé đã gặp nhau ròi. Hi vọng những tháng năm sau này Tun vs Em Béeee luôn có nhau tại thời điểm giao thừa đặc biệt thiêng liêng này ạ. Tun thúi yêu Em Bé Yêu 🌸 của Tun nhiều lắm lắm lắm.",
  // "Chúc Em Bé Yêu 🌸 có một năm mới ấm áp, đầy ắp niềm vui và hạnh phúc bên gia đình và cả bên Tun thúi nhà Em Bé nứa nhaaaaaa.",
  // "Em Bé Yêu 🌸 của Tun thúi ơiiii, Cảm ơn vì Bé luôn bên Tun trong năm qua. Mong rằng con đường phía trước của hai đứa mình luôn tràn ngập niềm vui và những kỷ niệm khó quên ạ",
  // "Một năm nữa đã qua và năm nay Tun đã có Bé vào khoảnh khắc giao thừa. Cảm ơn vì Bé vẫn luôn ở bên và quan tâm Tun. Tun tin rằng tương lai sẽ càng có nhiều điều tốt đẹp hơn nữa đến với hai đứa mình. ",
  // "Gặp được Bé trong năm qua là một điều rất may mắn đối với Tun ạ. Gặp được Bé Tun hiểu ra được nhiều điều hơn, Tun biết cố gắng nhiều hơn. Tun biết mình cần cố gắng để vì tương lai sau này của hai đứa ạ. ",
];

$(document).ready(() => {
  const mobileMedia = window.matchMedia("(max-width: 767px)");

  if (mobileMedia.matches) {
    window.location.href = "/2026";
    return;
  }

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  const envelopeImages = [1,4,3,2,5,6];

  for (var i = 0; i < 6; i++) {
    $(`#envelope-${i + 1} img`).attr(
      "src",
      `../assets/images/card-2026/${envelopeImages[i]}.png`
    );
  }
  for (var i = 0; i < 8; i++) {
    $(`#envelope-${i + 1}`).click(function () {
      if ($(BUTTON_PAUSE_AUDIO_SELECTOR).hasClass("hidden")) {
        play();
      }

      $(this).removeClass(
        "transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
      );

      $(this).addClass("bg-[#ffefe0] transition duration-300 delay-200");
      $(this).css("transform", "rotateY(180deg)");
      $(this).children().addClass("transition-invisible delay-300 invisible");

      const messages = envelopeContents.shift();

      setTimeout(() => {
        $(this).css("transform", "rotateY(360deg)");
        $(this).append(
          `<div class="absolute inset-0 p-1 sm:inset-4 text-[#562903]">
            <p class="h-[80%] overflow-hidden">${messages}</p> 
            <div class="pt-2 text-right hidden">
              <button onclick="window.location.href='../2026/index.html'" type="button" class="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700">
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
                <span class="sr-only">Icon description</span>
              </button>
            </div>
          </div>`
        );
      }, 350);

      $(this).off("click");
    });
  }
});
