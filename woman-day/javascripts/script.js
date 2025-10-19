onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    document.querySelector('.ramo').classList.add('ramo--visible');
    clearTimeout(c);
  }, 1000);
};
