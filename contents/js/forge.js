/* ========================================= */
/* FORGE.JS - Логика Кузницы                 */
/* ========================================= */

const forgeScreen = document.querySelector(".forge-screen");
const forgeNavBtn = document.querySelector(".js-open-forge");

const GOLD_ICON = "/contents/IconsGame/hud-right/gold-res.png";
const FORGE_HP_PER_STAMINA = (typeof HP_PER_STAMINA !== "undefined") ? HP_PER_STAMINA : 15;

let currentForgeCategory = null;

function openForge() {
  if (!openScreen("forge")) return;
  renderForge();
}

function closeForge() {
  closeScreen("forge");
}

// Сколько стоит улучшение
function getUpgradeCost(itemLevel) {
  return 10 + (itemLevel * 15);
}

// Бонусные статы от улучшения (10% за уровень)
function getUpgradedStat(baseStat, level) {
  const base = Number(baseStat) || 0;
  return Math.floor(base + (base * 0.1 * level));
}

function renderForge() {
  if (!forgeScreen) return;
  if (typeof player === "undefined") return;

  if (!player.forgeLevels) player.forgeLevels = {};
  if (!player.gold) player.gold = 0;

  const purchasedIds = getPurchasedItems();
  const boughtItems = SHOP_ITEMS.filter(item => purchasedIds.includes(item.id));

  // Только категории, где есть купленные вещи
  const categories = SHOP_CATEGORIES.filter(cat =>
    boughtItems.some(item => item.category === cat.id)
  );

  // Если выбранной категории нет, берём первую доступную
  if (!categories.some(cat => cat.id === currentForgeCategory)) {
    currentForgeCategory = categories.length ? categories[0].id : null;
  }

  const activeCategory = categories.find(cat => cat.id === currentForgeCategory);
  const items = boughtItems.filter(item => item.category === currentForgeCategory);

  const categoriesHtml = categories.map(cat => `
    <button class="forge-category-btn ${cat.id === currentForgeCategory ? "active" : ""}"
            data-category="${cat.id}" type="button">
      ${cat.title.toUpperCase()}
    </button>
  `).join("");

  const cardsHtml = items.length === 0
    ? `<div class="forge-empty">У вас пока нет снаряжения. Купите его в магазине!</div>`
    : items.map(item => {
        const itemLevel = player.forgeLevels[item.id] || 0;
        const cost = getUpgradeCost(itemLevel);
        const canAfford = player.gold >= cost;

        const damage = getUpgradedStat(item.damage, itemLevel);
        const stamina = getUpgradedStat(item.stamina, itemLevel);
        const hp = stamina * FORGE_HP_PER_STAMINA;
        const icon = getItemIcon(item);

        const statsHtml = `УРОН: <strong>${damage}</strong> | ВЫН: <strong>${stamina}</strong> (<strong>${hp}</strong> ХП)`;

        return `
          <div class="forge-card" data-item-id="${item.id}">
            <div class="forge-card-frame">
              <span class="forge-card-icon">${icon}</span>
              <div class="forge-card-lvl">+${itemLevel}</div>

              <div class="forge-card-price-plate">
                <img src="${GOLD_ICON}" class="forge-price-icon" alt="">
                <span class="forge-price-value">${formatNumber(cost)}</span>
              </div>

              <div class="forge-card-tooltip">
                <div class="forge-tooltip-name">${item.name}</div>
                <div class="forge-tooltip-stats">${statsHtml}</div>
              </div>
            </div>

            <div class="forge-card-stats">${statsHtml}</div>

            <button class="forge-upgrade-btn" type="button" ${canAfford ? "" : "disabled"}>
              УЛУЧШИТЬ
            </button>
          </div>
        `;
      }).join("");

  forgeScreen.innerHTML = `
    <div class="forge-window">
      <div class="forge-window-header">
        <div class="forge-window-title">КУЗНИЦА</div>
      </div>

      <div class="forge-layout">
        <aside class="forge-sidebar">
          <div class="forge-categories">${categoriesHtml}</div>
        </aside>

        <section class="forge-center">
          <div class="forge-hero-art">⚒️</div>
        </section>

        <section class="forge-items-section">
          <div class="forge-items-header">
            <div class="forge-items-title">${activeCategory ? activeCategory.title : "Кузница"}</div>
            <div class="forge-balance">
              <img src="${GOLD_ICON}" class="forge-balance-icon" alt="">
              <strong class="js-forge-gold">${formatNumber(player.gold)}</strong>
            </div>
          </div>

          <div class="forge-items-grid js-forge-items">${cardsHtml}</div>
        </section>
      </div>
    </div>
  `;

  // Вкладки категорий
  forgeScreen.querySelectorAll(".forge-category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentForgeCategory = btn.dataset.category;
      renderForge();
    });
  });

  // Карточки
  forgeScreen.querySelectorAll(".forge-card").forEach(card => {
    const itemId = card.dataset.itemId;
    const btn = card.querySelector(".forge-upgrade-btn");
    if (btn && !btn.disabled) {
      btn.addEventListener("click", () => upgradeItemInForge(itemId));
    }

    // ПК: клик по рамке открывает/закрывает описание
    const frame = card.querySelector(".forge-card-frame");
    if (frame) {
      frame.addEventListener("click", (event) => {
        event.stopPropagation();
        const wasOpen = frame.classList.contains("tooltip-open");
        forgeScreen.querySelectorAll(".forge-card-frame.tooltip-open")
          .forEach(el => el.classList.remove("tooltip-open"));
        if (!wasOpen) frame.classList.add("tooltip-open");
      });
    }
  });
}

function upgradeItemInForge(itemId) {
  if (!player.forgeLevels) player.forgeLevels = {};

  // id в data-атрибуте приходит строкой, ищем предмет, чтобы сохранить исходный тип id
  const item = SHOP_ITEMS.find(i => String(i.id) === String(itemId));
  if (!item) return;

  const currentLevel = player.forgeLevels[item.id] || 0;
  const cost = getUpgradeCost(currentLevel);

  if (player.gold < cost) {
    alert("Недостаточно золота!");
    return;
  }

  player.gold -= cost;
  player.forgeLevels[item.id] = currentLevel + 1;

  savePlayer(player);

  // renderHUD сам перерисовывает и HUD, и магазин
  if (window.gameApi && window.gameApi.renderHUD) window.gameApi.renderHUD();

  renderForge();
}

// Закрываем описание по клику в любое другое место
document.addEventListener("click", () => {
  document.querySelectorAll(".forge-card-frame.tooltip-open")
    .forEach(el => el.classList.remove("tooltip-open"));
});

if (forgeNavBtn) {
  forgeNavBtn.addEventListener("click", () => {
    if (toggleScreen("forge")) renderForge();
  });
}

window.forgeApi = {
  openForge,
  closeForge,
  renderForge
};
