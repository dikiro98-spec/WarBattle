/* ========================================= */
/* HERO-SLOTS.JS - Слоты вокруг куклы + ник  */
/* ========================================= */

// 12 ячеек: 6 слева + 6 справа. category - категория магазина.
// Пустая ячейка (category: null) остаётся заглушкой на будущее.
const HERO_SLOT_LAYOUT = {
  left: [
    { category: "helmets", title: "Шлем", emoji: "×" },
    { category: "armor", title: "Броня", emoji: "×" },
    { category: "pauldrons", title: "Наплечники", emoji: "×" },
    { category: "pants", title: "Штаны", emoji: "×" },
    { category: "boots", title: "Ботинки", emoji: "×" }
  ],
  right: [
    { category: "weapons", title: "Оружие", emoji: "×" },
    { category: "shields", title: "Щит", emoji: "×" },
    { category: "gloves", title: "Перчатки", emoji: "×" },
    { category: "bracers", title: "Наручи", emoji: "×" },
    { category: "jewelry", title: "Украшение", emoji: "×" }
    
    //  { category: "pets",      title: "Питомец",    emoji: "🐾" },
    // { category: null,        title: "Пусто",      emoji: "" }
  ]
};

// ---------- СЛОТЫ ----------

// Какие слоты экипировки относятся к категории (jewelry -> jewelry1, jewelry2)
function getEquippedItemForCategory(category) {
  if (typeof player === "undefined" || !player.shop || !player.shop.equipped) return null;
  if (typeof SHOP_ITEMS === "undefined") return null;
  
  const equipped = player.shop.equipped;
  
  const keys = Object.keys(equipped).filter((key) => {
    if (key === category) return true;
    if (category === "jewelry" && key.indexOf("jewelry") === 0) return true;
    return false;
  });
  
  for (let i = 0; i < keys.length; i++) {
    const itemId = equipped[keys[i]];
    const item = SHOP_ITEMS.find((it) => it.id === itemId);
    if (item) return item;
  }
  return null;
}

function createHeroSlot(config) {
  const slot = document.createElement("div");
  slot.className = "hero-slot";
  
  if (!config.category) {
    slot.classList.add("locked");
    return slot;
  }
  
  const item = getEquippedItemForCategory(config.category);
  
  if (item) {
    slot.classList.add("filled");
    const icon = (typeof getItemIcon === "function") ? getItemIcon(item) : "📦";
    slot.innerHTML = `<div class="hero-slot-icon">${icon}</div>`;
    slot.title = item.name || config.title;
  } else {
    slot.innerHTML = `
      <div class="hero-slot-icon" style="opacity:0.45;">${config.emoji}</div>
      <div class="hero-slot-empty-label">${config.title}</div>
    `;
    slot.title = config.title;
  }
  
  slot.addEventListener("click", () => {
    openShopOnCategory(config.category);
  });
  
  return slot;
}

function openShopOnCategory(category) {
  if (typeof SHOP_CATEGORIES !== "undefined") {
    const exists = SHOP_CATEGORIES.some((c) => c.id === category);
    if (!exists) return;
  }
  
  currentShopCategory = category;
  
  if (window.shopApi && window.shopApi.openShopModal) {
    window.shopApi.openShopModal();
  }
}

function renderHeroSlots() {
  const leftColumn = document.querySelector(".js-slots-left");
  const rightColumn = document.querySelector(".js-slots-right");
  if (!leftColumn || !rightColumn) return;
  
  leftColumn.innerHTML = "";
  rightColumn.innerHTML = "";
  
  HERO_SLOT_LAYOUT.left.forEach((config) => leftColumn.appendChild(createHeroSlot(config)));
  HERO_SLOT_LAYOUT.right.forEach((config) => rightColumn.appendChild(createHeroSlot(config)));
  
  renderHeroNickname();
}

// ---------- НИК ----------

const NICK_MIN_LEN = 2;
const NICK_MAX_LEN = 14;

function getHeroNickname() {
  return (typeof player !== "undefined" && player.name) ? player.name : "НОВЫЙ ИГРОК";
}

// Ник над головой героя + любые элементы с data-nickname
function renderHeroNickname() {
  const name = getHeroNickname();
  
  document.querySelectorAll(".js-hero-nickname, [data-nickname]").forEach((el) => {
    el.textContent = name;
  });
}

function setHeroNickname(value) {
  if (typeof player === "undefined") return;
  player.name = value;
  if (typeof savePlayer === "function") savePlayer(player);
  renderHeroNickname();
}

function validateNickname(value) {
  const v = value.trim();
  if (v.length < NICK_MIN_LEN) return "Минимум " + NICK_MIN_LEN + " символа";
  if (v.length > NICK_MAX_LEN) return "Максимум " + NICK_MAX_LEN + " символов";
  if (!/^[A-Za-zА-Яа-яЁё0-9 _-]+$/.test(v)) return "Только буквы, цифры, пробел, _ и -";
  return "";
}

// Окно смены ника: создаётся один раз при первом открытии
function getNickModal() {
  let modal = document.getElementById("nickModal");
  
  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="nick-modal-overlay hidden" id="nickModal">
        <div class="nick-modal">
          <div class="nick-modal-title">Изменить ник</div>
          <input type="text" class="nick-modal-input" id="nickInput" maxlength="${NICK_MAX_LEN}" placeholder="Введите ник" autocomplete="off">
          <div class="nick-modal-error" id="nickError"></div>
          <div class="nick-modal-buttons">
            <button type="button" class="nick-btn nick-btn-save" id="nickSave">Сохранить</button>
            <button type="button" class="nick-btn nick-btn-cancel" id="nickCancel">Отмена</button>
          </div>
        </div>
      </div>
    `);
    modal = document.getElementById("nickModal");
  }
  
  if (!modal.dataset.bound) {
    const input = modal.querySelector("#nickInput");
    modal.querySelector("#nickSave").addEventListener("click", saveNickModal);
    modal.querySelector("#nickCancel").addEventListener("click", closeNickModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeNickModal(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveNickModal();
      if (e.key === "Escape") closeNickModal();
    });
    modal.dataset.bound = "1";
  }
  
  return modal;
}

function openNickModal() {
  const modal = getNickModal();
  const input = modal.querySelector("#nickInput");
  modal.querySelector("#nickError").textContent = "";
  input.value = getHeroNickname();
  modal.classList.remove("hidden");
  setTimeout(() => { input.focus();
    input.select(); }, 50);
}

function closeNickModal() {
  const modal = document.getElementById("nickModal");
  if (modal) modal.classList.add("hidden");
}

function saveNickModal() {
  const modal = getNickModal();
  const input = modal.querySelector("#nickInput");
  const error = modal.querySelector("#nickError");
  
  const msg = validateNickname(input.value);
  if (msg) {
    error.textContent = msg;
    return;
  }
  
  setHeroNickname(input.value.trim());
  closeNickModal();
}

// Клик по карандашу — через делегирование, кнопка может быть перерисована
document.addEventListener("click", (e) => {
  if (e.target.closest(".hero-nickname-edit")) {
    e.preventDefault();
    e.stopPropagation();
    openNickModal();
  }
}, true);

// ---------- ЗДОРОВЬЕ ----------

// Вне боя здоровье всегда полное: берём максимум из getTotalHealth().
function getHeroHealthValues() {
  let max = 100;

  if (typeof getTotalHealth === "function") {
    const value = Number(getTotalHealth());
    if (!isNaN(value) && value > 0) max = value;
  }

  return { current: max, max: max };
}

function renderHeroHealth() {
  const fill = document.querySelector(".js-hero-hp-fill");
  const text = document.querySelector(".js-hero-hp-text");
  if (!fill || !text) return;

  const hp = getHeroHealthValues();
  const percent = Math.max(0, Math.min(100, (hp.current / hp.max) * 100));

  fill.style.width = percent + "%";
  fill.classList.remove("hp-mid", "hp-low");
  if (percent <= 25) fill.classList.add("hp-low");
  else if (percent <= 50) fill.classList.add("hp-mid");

  const fmt = (typeof formatNumber === "function") ? formatNumber : (n) => n;
  text.textContent = fmt(Math.round(hp.current)) + "/" + fmt(Math.round(hp.max));
}

// Полное обновление главного экрана: слоты + ник + здоровье
function refreshHeroScreen() {
  renderHeroSlots();
  renderHeroHealth();
}

// Любое сохранение игрока (покупка, экипировка, таланты, уровень) обновляет героя
if (typeof savePlayer === "function" && !savePlayer.__heroPatched) {
  const originalSavePlayer = savePlayer;
  savePlayer = function (data) {
    originalSavePlayer(data);
    renderHeroHealth();
    renderHeroNickname();
  };
  savePlayer.__heroPatched = true;
}

// ---------- API ----------

window.heroSlotsApi = {
  renderHeroSlots,
  renderHeroNickname,
  renderHeroHealth,
  refreshHeroScreen,
  openNickModal
};

// Первый показ после загрузки страницы
document.addEventListener("DOMContentLoaded", refreshHeroScreen);
