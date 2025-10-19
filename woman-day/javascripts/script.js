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
