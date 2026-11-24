/* ========================================= */
/* SHOP.JS - Логика Магазина                 */
/* ========================================= */

const shopModalOverlay = document.querySelector(".shop-modal-overlay");
const shopCloseBtn = document.querySelector(".shop-close-btn");
const openShopBtn = document.querySelector(".js-open-shop");
const shopSaveBtn = document.querySelector(".shop-save-btn");

const shopCategoriesContainer = document.querySelector(".js-shop-categories");
const shopItemsContainer = document.querySelector(".js-shop-items");
const shopCategoryTitle = document.querySelector(".js-shop-category-title");

const shopSilverElement = document.querySelector(".js-shop-silver");
const shopGoldElement = document.querySelector(".js-shop-gold");

let currentShopCategory = "weapons";

function openShopModal() {
  if (shopModalOverlay) shopModalOverlay.classList.remove("hidden");
  renderShop();
}

function closeShopModal() {
  if (shopModalOverlay) shopModalOverlay.classList.add("hidden");
}

function renderShopCategories() {
  if (!shopCategoriesContainer) return;
  shopCategoriesContainer.innerHTML = "";

  SHOP_CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.className = "shop-category-btn";
    button.textContent = category.title.toUpperCase();

    if (category.id === currentShopCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentShopCategory = category.id;
      renderShop();
    });

    shopCategoriesContainer.appendChild(button);
  });
}

function renderShopItems() {
  if (!shopItemsContainer) return;

  const items = SHOP_ITEMS.filter((item) => {
    if (item.category !== currentShopCategory) return false;

    // Скрытые предметы (Клинок Батальона): показываем, только если
    // все 5 частей на руках или коллекция уже собиралась
    if (item.isHidden) {
      const col = (player.collections && player.collections["battalion_weapon_collection"]) || {};
      const isCollected =
        col._claimed === true ||
        (col["bw_part_1"] > 0 && col["bw_part_2"] > 0 && col["bw_part_3"] > 0 &&
         col["bw_part_4"] > 0 && col["bw_part_5"] > 0);
      if (!isCollected) return false;
    }
    return true;
  });

  const purchasedItems = getPurchasedItems();
  const equippedItems = (player && player.shop && player.shop.equipped) ? player.shop.equipped : {};
  const playerLevel = (player && player.level) ? player.level : 1;

  shopItemsContainer.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "shop-item-card";

    const alreadyBought = purchasedItems.includes(item.id);
    const isEquipped = Object.values(equippedItems).includes(item.id);
    const levelLocked = playerLevel < (item.reqLevel || 1);

    // 🔒 Замок: открыт только если привязанная коллекция уже собирали (флаг _claimed)
    const isLocked = !!item.lockCollection &&
      !(player.collections && player.collections[item.lockCollection] &&
        player.collections[item.lockCollection]._claimed === true);

    const icon = getItemIcon(item);

    // Иконка валюты в плашке цены
    const currencyIcon = item.currency === "silver"
      ? "/contents/IconsGame/hud-right/silver-res.png"
      : "/contents/IconsGame/hud-right/gold-res.png";

    // Выносливость и ХП: 1 выносливость = 15 ХП
    const stamina = item.stamina || 0;
    const hpFromStamina = stamina * HP_PER_STAMINA;
    const damage = item.damage || 0;

    const statsHtml = `УРОН: <strong>${damage}</strong> | ВЫН: <strong>${stamina}</strong> (<strong>${hpFromStamina}</strong> ХП)`;

    let btnText = "КУПИТЬ";
    let btnClass = "shop-buy-btn";
    if (typeof window.checkAchievement === "function") window.checkAchievement("shop", 1);

    let disabled = false;

    if (isLocked) {
      btnText = "🔒 ЗАКРЫТО";
      btnClass = "shop-buy-btn locked-btn";
    } else if (isEquipped) {
      btnText = "СНЯТЬ";
      btnClass = "shop-buy-btn equipped-btn";
    } else if (alreadyBought) {
      btnText = "НАДЕТЬ";
      btnClass = "shop-buy-btn bought-btn";
    } else if (levelLocked) {
      btnText = `НУЖЕН УР. ${item.reqLevel}`;
      disabled = true;
    }

    card.innerHTML = `
      <div class="shop-item-icon-box ${isEquipped ? 'equipped-border' : ''} ${isLocked ? 'locked-border' : ''}">
        <span class="shop-item-icon">${isLocked ? "🔒" : icon}</span>

        <div class="shop-item-price-plate">
          <img src="${currencyIcon}" class="shop-price-icon" alt="">
          <span class="shop-price-value">${formatNumber(item.price)}</span>
        </div>

        <div class="shop-item-tooltip">
          <div class="shop-tooltip-name">${item.name}</div>
          <div class="shop-tooltip-stats">${statsHtml}</div>
        </div>
      </div>

      <div class="shop-item-info">${statsHtml}</div>

      <button class="${btnClass}" ${disabled ? "disabled" : ""}>
        ${btnText}
      </button>
    `;

    // На ПК: по клику на рамку открываем/закрываем окошко (кроме наведения)
    const iconBox = card.querySelector(".shop-item-icon-box");
    if (iconBox) {
      iconBox.addEventListener("click", (event) => {
        event.stopPropagation();
        const wasOpen = iconBox.classList.contains("tooltip-open");
        document.querySelectorAll(".shop-item-icon-box.tooltip-open").forEach((el) => el.classList.remove("tooltip-open"));
        if (!wasOpen) iconBox.classList.add("tooltip-open");
      });
    }

    const buyButton = card.querySelector(".shop-buy-btn");

    if (buyButton) {
      buyButton.addEventListener("click", () => {
        // 🔒 Замок: показываем уведомление, покупка недоступна
        if (isLocked) {
          alert(item.lockMessage || "Соберите коллекцию, чтобы открыть это оружие!");
          return;
        }

        if (isEquipped) {
          unequipItem(item.category, item.id);
        } else if (alreadyBought) {
          equipItem(item.id, item.category);
        } else {
          const result = buyShopItem(item.id);
          if (!result.success) {
            alert(result.message);
            return;
          }
          equipItem(item.id, item.category);
        }

        renderShop();
        renderAllHeroes();

        if (window.gameApi && window.gameApi.renderHUD) window.gameApi.renderHUD();
      });
    }

    shopItemsContainer.appendChild(card);
  });
}


function renderShopHeader() {
  if (typeof player === "undefined") return;

  if (shopSilverElement) shopSilverElement.textContent = formatNumber(player.silver || 0);
  if (shopGoldElement) shopGoldElement.textContent = formatNumber(player.gold || 0);

  const activeCategory = SHOP_CATEGORIES.find((category) => category.id === currentShopCategory);
  if (shopCategoryTitle && activeCategory) shopCategoryTitle.textContent = activeCategory.title;
}

function renderShop() {
  renderShopHeader();
  renderShopCategories();
  renderShopItems();
}

// --- ОБРАБОТЧИКИ ---
if (openShopBtn) openShopBtn.addEventListener("click", openShopModal);
if (shopCloseBtn) shopCloseBtn.addEventListener("click", closeShopModal);
if (shopSaveBtn) shopSaveBtn.addEventListener("click", closeShopModal);

if (shopModalOverlay) {
  shopModalOverlay.addEventListener("click", (event) => {
    if (event.target === shopModalOverlay) closeShopModal();
  });
}

window.shopApi = {
  renderShop,
  openShopModal,
  closeShopModal
};
// Закрываем окошко с описанием по клику в любое другое место
document.addEventListener("click", () => {
  document.querySelectorAll(".shop-item-icon-box.tooltip-open").forEach((el) => el.classList.remove("tooltip-open"));
});
