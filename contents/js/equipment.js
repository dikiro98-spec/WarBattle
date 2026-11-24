/* ========================================= */
/* EQUIPMENT.JS - Слоты и кукла героя        */
/* ========================================= */

// Слоты экипировки. order - порядок слоя на кукле (больше = выше).
// category - какая категория магазина подходит в этот слот.
const EQUIPMENT_SLOTS = [
  { id: "boots",     title: "Ботинки",     category: "boots",     order: 1, visible: true },
  { id: "pants",     title: "Штаны",       category: "pants",     order: 2, visible: true },
  { id: "armor",     title: "Броня",       category: "armor",     order: 3, visible: true },
  { id: "pauldrons", title: "Наплечники",  category: "pauldrons", order: 4, visible: true },
  { id: "gloves",    title: "Перчатки",    category: "gloves",    order: 5, visible: true },
  { id: "bracers",   title: "Наручи",      category: "bracers",   order: 6, visible: true },
  { id: "helmets",   title: "Шлем",        category: "helmets",   order: 7, visible: true },
  { id: "shields",   title: "Щит",         category: "shields",   order: 8, visible: true },
  { id: "weapons",   title: "Оружие",      category: "weapons",   order: 9, visible: true },
  { id: "jewelry1",  title: "Украшение 1", category: "jewelry",   order: 0, visible: false },
  { id: "jewelry2",  title: "Украшение 2", category: "jewelry",   order: 0, visible: false }
];

// Базовое изображение героя (сама кукла)
const HERO_BASE_IMAGE = "/contents/IconsGame/hero/hero_base.png";

// Найти слот по id
function getSlot(slotId) {
  return EQUIPMENT_SLOTS.find((s) => s.id === slotId) || null;
}

// Слоты, подходящие для категории предмета
function getSlotsForCategory(category) {
  return EQUIPMENT_SLOTS.filter((s) => s.category === category);
}

// Что надето: { slotId: itemObject }
function getEquippedItems() {
  if (typeof player === "undefined") return {};
  const equipped = (player.shop && player.shop.equipped) ? player.shop.equipped : {};
  const result = {};
  EQUIPMENT_SLOTS.forEach((slot) => {
    const itemId = equipped[slot.id];
    if (!itemId) return;
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (item) result[slot.id] = item;
  });
  return result;
}

// Иконка предмета для магазина и кузницы: поле icon, иначе эмодзи по умолчанию
function getItemIcon(item) {
  return (item && item.icon) ? item.icon : "📦";
}

/* ---------- КУКЛА ГЕРОЯ ---------- */

// Рисует только базовое тело героя. Слои экипировки не добавляются.
function renderHeroDoll(container) {
  if (!container) return;
  container.innerHTML = `<img src="${HERO_BASE_IMAGE}" class="battle-hero-body" alt="Герой">`;
}

// Шлем в круглой «камере» HUD: картинка не используется, элемент скрывается
function renderHudHelmet() {
  const hudHelmet = document.querySelector(".js-hud-helmet");
  if (!hudHelmet) return;
  hudHelmet.removeAttribute("src");
  hudHelmet.style.display = "none";
}

// Одна функция обновляет героя везде, где он есть
function renderAllHeroes() {
  document.querySelectorAll(".js-hero-doll").forEach(renderHeroDoll);
  renderHudHelmet();
}

window.equipmentApi = {
  EQUIPMENT_SLOTS,
  getSlot,
  getSlotsForCategory,
  getEquippedItems,
  getItemIcon,
  renderHeroDoll,
  renderAllHeroes
};
