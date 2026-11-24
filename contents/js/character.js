/* ========================================= */
/* CHARACTER.JS - Экран персонажа            */
/* ========================================= */

const characterScreen = document.querySelector(".character-screen");
const charCloseBtn = document.querySelector(".char-close-btn");

function openCharacter() {
  if (!openScreen("character")) return;
  renderCharacter();
}

function closeCharacter() {
  closeScreen("character");
}

function renderCharacter() {
  if (typeof player === "undefined") return;

  const equipped = getEquippedItems();

  // Кукла
  document.querySelectorAll(".character-screen .js-hero-doll").forEach(renderHeroDoll);

  // Имя
  const nameText = document.querySelector(".js-char-name");
  if (nameText) nameText.textContent = player.name || "НОВЫЙ ИГРОК";

  // Текст в слотах: ищем элементы вида .js-equipped-<slotId>
  EQUIPMENT_SLOTS.forEach((slot) => {
    const el = document.querySelector(`.js-equipped-${slot.id}`);
    if (el) el.textContent = equipped[slot.id] ? equipped[slot.id].name : "Пусто";
  });
}

function renderBattleHero() {
  if (typeof renderAllHeroes === "function") renderAllHeroes();
}

if (charCloseBtn) {
  charCloseBtn.addEventListener("click", closeCharacter);
}

const charNavBtn = document.querySelector(".js-open-character");
if (charNavBtn) {
  charNavBtn.addEventListener("click", () => {
    if (toggleScreen("character")) renderCharacter();
  });
}

window.characterApi = {
  openCharacter,
  closeCharacter,
  renderCharacter,
  renderBattleHero
};
