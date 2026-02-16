$(window).on("load", () => {
  const lunarAudio = new Audio(
    "../assets/music/happy-new-year.mp3"
  );
  // Extend Day.js with plugins
  dayjs.extend(dayjs_plugin_utc);
  dayjs.extend(dayjs_plugin_timezone);
  dayjs.extend(dayjs_plugin_duration);
  const timestamp = "2026-02-17 00:00";
  const tz = "Asia/Ho_Chi_Minh";
  const lunar = dayjs(timestamp).tz(tz);

  // Convert the timestamp to the specified timezone
  const now = dayjs.utc().tz(tz);
  let diff = lunar.diff(now);
  diff = diff < 0 ? 0 : diff;
  setInterval(() => {
    if (diff <= 0) {
      window.location.href = "/phao-hoa";
      return;
    }
    diff -= 1000;
    const duration = dayjs.duration(diff);
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    // const countdown = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
    // $("#countdown").text(countdown);
    $("#days").text(days.toString().padStart(2, "0"));
    $("#hours").text(hours.toString().padStart(2, "0"));
    $("#mins").text(minutes.toString().padStart(2, "0"));
    $("#secs").text(seconds.toString().padStart(2, "0"));
  }, 1000);

  $(document).on("click", "#toggle-audio", () => {
    $("#toggle-audio i").toggleClass("fa-volume-up fa-volume-mute");
    if (lunarAudio.paused) lunarAudio.play();
    else lunarAudio.pause();
  });
});