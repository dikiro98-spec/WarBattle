/* ========================================= */
/* ЛОГИКА ПРИКЛЮЧЕНИЙ                        */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const advScreen = document.querySelector(".adventures-screen");
  const advCloseBtn = document.querySelector(".adv-close-btn");
  const advNavBtn = document.querySelector(".js-open-adventures"); // 🔴 Нужен класс на кнопке

  // Открытие
  if (advNavBtn) {
    advNavBtn.addEventListener("click", () => {
      // Скрываем другие экраны
      document.querySelector(".campaign-screen")?.classList.add("hidden");
      document.querySelector(".arena-screen")?.classList.add("hidden");
      document.querySelector(".forge-screen")?.classList.add("hidden");
      document.querySelector(".lottery-screen")?.classList.add("hidden");
      document.querySelector(".guild-screen")?.classList.add("hidden");
      document.querySelector(".collections-screen")?.classList.add("hidden");
      document.querySelector(".shop-modal-overlay")?.classList.add("hidden");
      document.querySelector(".main-screen-hero")?.classList.add("hidden");

      if (advScreen) advScreen.classList.remove("hidden");
    });
  }

  // Закрытие
  if (advCloseBtn) {
    advCloseBtn.addEventListener("click", () => {
      if (advScreen) advScreen.classList.add("hidden");
      document.querySelector(".main-screen-hero")?.classList.remove("hidden");
    });
  }
});