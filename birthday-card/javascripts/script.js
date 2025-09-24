var card = document.getElementById("card"),
  openB = document.getElementById("open"),
  closeB = document.getElementById("close"),
  timer = null;

console.log("wat", card);

openB.addEventListener("click", function () {
  card.setAttribute("class", "open-half");
  if (timer) clearTimeout(timer);
  timer = setTimeout(function () {
    card.setAttribute("class", "open-fully");
    timer = null;
  }, 1000);
});

closeB.addEventListener("click", function () {
  card.setAttribute("class", "close-half");
  if (timer) clearTimeout(timer); // sửa lỗi "clearTimerout" thành "clearTimeout"
  timer = setTimeout(function () {
    card.setAttribute("class", "");
    timer = null;
  }, 1000);
});
