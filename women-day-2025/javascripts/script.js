// ====== APP (Merged + jQuery) ======
// Sources merged from: modal.js and script.js

// ====== CẤU HÌNH THỜI GIAN & TÀI NGUYÊN ======
const RUNNER_GIF    = 'https://media.tenor.com/YE4d6BrNbGoAAAAj/boo-dudu-run.gif';
const HEART_GIF     = 'https://gifdb.com/images/high/cute-heart-love-letter-d26tsq2ec139od5o.gif';
const EXPLOSION_GIF = 'https://media.tenor.com/QfIOnqI2cIMAAAAj/boom-explosion.gif';

const DUR = {
  removeNotLoaded: 1500,   // bỏ class "not-loaded"
  showFlowers: 2500,       // thêm class hiển thị hoa
  delayAfterFlowers: 5000, // đợi sau khi hoa hiện để runner chạy
  fallbackRunner: 7000,    // fallback nếu không bắt được class hoa
  runnerMove: 4000,        // thời lượng animation CSS 'runner-move'
  explosion: 800           // thời lượng gif nổ trước khi đổi sang trái tim
};

// ====== TIỆN ÍCH ======
const sleep = ms => new Promise(r => setTimeout(r, ms));
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

// ====== Modal & Typing Effect Controller (jQuery) ======
const ModalController = {
  config: {
    titleText: "Gửi Em Bé Yêu 🌸!",
    contentText: "Chúc Em Bé của Tun có một ngày 20/10 thật ý nghĩa. \nChúc Em Bé luôn xinh đẹp, hạnh phúc và gặp nhiều may mắn trong cuộc sống 😘 \nLuôn bên cạnh và yêu thương Tun thúi nhiều hơn em nhé 🥰 \nMong rằng những điều tốt đẹp nhất sẽ đến với Em Bé Yêu 🌸 nhà mình ạaaaa. ❤️ \nTun Tun yêu Em Bé Yêu Công Chúa 🌸🌸 nhìu lắmmm ạaaa ❤️❤️❤️❤️❤️❤️",
    titleSpeed: 200, // ms per character
    contentSpeed: 50, // ms per character
    delayBeforeContent: 500 // ms delay after title
  },

  init() {
    this.setupCloseButton();
  },

  open() {
    $(".wrapperLetterForm").fadeIn();
    this.startTypingAnimation();
  },

  close() {
    $('.wrapperLetterForm').fadeOut();
  },

  setupCloseButton() {
    $('.fa-xmark').on('click', () => {
      this.close();
    });
  },

  startTypingAnimation() {
    const titleElement = $('.wrapperLetterForm .textLetter h2');
    const contentElement = $('.wrapperLetterForm .contentLetter');

    // Reset text
    titleElement.text('');
    contentElement.text('');

    // Start typing title
    this.typeText(
      titleElement,
      this.config.titleText,
      this.config.titleSpeed,
      () => {
        // After title completes, type content
        setTimeout(() => {
          this.typeText(
            contentElement,
            this.config.contentText,
            this.config.contentSpeed
          );
        }, this.config.delayBeforeContent);
      }
    );
  },

  typeText($element, text, speed, callback) {
    let index = 0;

    function type() {
      if (index < text.length) {
        $element.text($element.text() + text[index]);
        index++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    }

    type();
  }
};

// ====== LỊCH CHẠY RUNNER ======
function scheduleRunnerKickoff() {
  const hasVisibleFlower = $('.flower-paper.flower-paper--visible').length > 0;

  if (hasVisibleFlower) {
    setTimeout(startRunnerSequence, DUR.delayAfterFlowers);
    return;
  }

  // Quan sát khi hoa thêm class visible
  const observer = new MutationObserver((mutations, obs) => {
    for (const m of mutations) {
      if (
        m.type === 'attributes' &&
        m.attributeName === 'class' &&
        $(m.target).hasClass('flower-paper--visible')
      ) {
        obs.disconnect();
        setTimeout(startRunnerSequence, DUR.delayAfterFlowers);
        return;
      }
    }
  });

  const $flowers = $('.flower-paper');
  if ($flowers.length) {
    $flowers.each((_, el) => observer.observe(el, { attributes: true }));
    setTimeout(() => {
      observer.disconnect();
      startRunnerSequence();
    }, DUR.fallbackRunner);
  } else {
    setTimeout(startRunnerSequence, DUR.fallbackRunner);
  }
}

// ====== RUNNER FLOW (jQuery) ======
async function startRunnerSequence() {
  const $runner    = $('#runner-gif');
  const $container = $('#runner-container');
  if ($runner.length === 0 || $container.length === 0) return;

  // Ngăn chạy trùng lặp
  if ($container.data('started') === 1) return;
  $container.data('started', 1);

  $container.css('display', 'block');
  $runner
    .attr('src', RUNNER_GIF)
    .css({
      pointerEvents: 'none',
      cursor: 'default',
      opacity: '1',
      animation: 'none',
      transform: ''
    })
    .off('click'); // clear any old handlers

  if (prefersReducedMotion()) {
    $runner.attr('src', HEART_GIF).css('transform','translateX(95vw)');
    $runner.on('click', () => ModalController.open());
    return;
  }

  await nextFrame();
  $runner.css('animation', `runner-move ${DUR.runnerMove}ms linear forwards`);

  await new Promise(resolve => {
    $runner.one('animationend', resolve);
  });

  $runner.css({
    animation: 'none',
    transform: 'translateX(95vw) translateY(0) rotate(0deg)'
  });

  $runner.attr('src', EXPLOSION_GIF);
  await sleep(DUR.explosion);

  $runner
    .attr('src', HEART_GIF)
    .css({ pointerEvents: 'auto', cursor: 'pointer' })
    .on('click', () => ModalController.open());
}

// ====== CHẠY KHI DOCUMENT SẴN SÀNG ======
$(function() {
  setTimeout(() => {
    $('body').removeClass('not-loaded');
  }, DUR.removeNotLoaded);

  setTimeout(() => {
    $('.flower-paper').addClass('flower-paper--visible');
  }, DUR.showFlowers);

  scheduleRunnerKickoff();
  ModalController.init();
});

// ====== GỢI Ý SỬ DỤNG ======
// 1) Đảm bảo đã import jQuery trước app.js
// 2) HTML cần có:
//    - #runner-container (display: none ban đầu) và <img id="runner-gif">
//    - .flower-paper các phần tử hoa (sẽ thêm class --visible)
//    - .wrapperLetterForm modal với .textLetter h2, .contentLetter, và nút .fa-xmark
