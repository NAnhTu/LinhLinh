onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
  }, 1500);
  const a = setTimeout(() => {
    document.querySelectorAll('.flower-paper').forEach(el => el.classList.add('flower-paper--visible'));
    clearTimeout(a);
  }, 2500);
};

// Runner GIF flow: after flowers visible + 5s, run GIF left->right, then swap to clickable heart GIF
const RUNNER_GIF = 'https://media.tenor.com/YE4d6BrNbGoAAAAj/boo-dudu-run.gif';
const HEART_GIF = 'https://gifdb.com/images/high/cute-heart-love-letter-d26tsq2ec139od5o.gif';
const EXPLOSION_GIF = 'https://media.tenor.com/QfIOnqI2cIMAAAAj/boom-explosion.gif';

function startRunnerSequence() {
  const runner = document.getElementById('runner-gif');
  const container = document.getElementById('runner-container');
  if (!runner || !container) return;

  // ensure hidden and reset
  container.style.display = 'block';
  runner.src = RUNNER_GIF;
  runner.style.animation = 'none';
  // trigger move after small tick
  requestAnimationFrame(() => requestAnimationFrame(() => {
    runner.style.pointerEvents = 'none';
    runner.style.animation = `runner-move 4s linear forwards`;
  }));

  // when animation finishes (4s), stop at ~95% and play explosion then letter
  runner.addEventListener('animationend', function onEnd() {
    runner.removeEventListener('animationend', onEnd);
  // freeze at the final keyframe position (start left is -5vw; translateX(100vw) => 95vw)
  runner.style.animation = 'none';
  runner.style.transform = 'translateX(95vw) translateY(0) rotate(0deg)';
  runner.style.opacity = '1';
    // switch to explosion briefly
    runner.src = EXPLOSION_GIF;
    // runner.style.width = '14vmin';
    // after short delay, swap to letter gif and make clickable
    setTimeout(() => {
      runner.src = HEART_GIF;
      // runner.style.width = '14vmin';
      runner.style.pointerEvents = 'auto';
      runner.style.cursor = 'pointer';
      // allow opening modal multiple times: remove any previous listener then add a persistent one
      try { runner.removeEventListener('click', openCardModal); } catch (e) {}
      runner.addEventListener('click', openCardModal);
    }, 800); // 0.8s explosion
  });
}

// Open modal and start typewriter
function openCardModal() {
  const modal = document.getElementById('card-modal');
  const overlay = modal.querySelector('.card-overlay');
  const close = modal.querySelector('.card-close');
  const messageEl = document.getElementById('card-message');
  const cardImg = document.getElementById('card-image');
  modal.setAttribute('aria-hidden', 'false');

  // set card image (left) to the heart GIF for now — user can replace later
  cardImg.src = HEART_GIF;

  // Typewriter text (Vietnamese 20/10 message)
  const text = "Chúc mừng ngày 20/10!\nChúc bạn luôn xinh đẹp, hạnh phúc và tràn đầy yêu thương.❤️";
  messageEl.textContent = '';
  messageEl.classList.add('typing');

  // simple typewriter
  let i = 0;
  function typeNext() {
    if (i <= text.length) {
      messageEl.textContent = text.slice(0, i);
      i++;
      setTimeout(typeNext, 40 + Math.random() * 40);
    } else {
      messageEl.classList.remove('typing');
    }
  }
  typeNext();

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    close.removeEventListener('click', closeModal);
    overlay.removeEventListener('click', closeModal);
  }
  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

// Kick off runner sequence 5s after flower-paper visible (script earlier adds flower-paper--visible at ~2.5s)
setTimeout(() => {
  // ensure flower-paper visible first
  if (document.querySelector('.flower-paper.flower-paper--visible')) {
    setTimeout(startRunnerSequence, 5000);
  } else {
    // fallback: start after 7s
    setTimeout(startRunnerSequence, 7000);
  }
}, 3000);
