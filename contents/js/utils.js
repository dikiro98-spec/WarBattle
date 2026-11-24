/* ========================================= */
/* UTILS.JS                                  */
/* ========================================= */

function getTalentLevel(talentKey) {
  if (typeof player !== "undefined" && player.talents && player.talents[talentKey] !== undefined) {
    return Number(player.talents[talentKey]);
  }
  return 0;
}

function getTalentCost(talentKey) {
  const config = DEFAULT_PLAYER_DATA.talents[talentKey];
  if (!config) return 999999;
  const level = getTalentLevel(talentKey);
  return config.baseCost + level * 40;
}

function getTalentCurrency(talentKey) {
  const config = DEFAULT_PLAYER_DATA.talents[talentKey];
  return config ? config.currency : "silver";
}

function getPurchasedItems() {
  if (typeof player !== "undefined" && player.shop && player.shop.purchasedItems) {
    return player.shop.purchasedItems;
  }
  return [];
}

// Считаем статы от ВСЕХ купленных вещей
function getPurchasedItemsData() {
  if (typeof SHOP_ITEMS === "undefined") return [];
  if (typeof player === "undefined") return [];

  const purchased = player.shop && player.shop.purchasedItems ? player.shop.purchasedItems : [];
  return SHOP_ITEMS.filter((item) => purchased.includes(item.id));
}

function getItemsBonusDamage() {
  return getPurchasedItemsData().reduce((sum, item) => {
    const level = (typeof player !== "undefined" && player.forgeLevels && player.forgeLevels[item.id]) ?
      player.forgeLevels[item.id] : 0;
    const baseDmg = item.damage || 0;
    const bonus = Math.floor(baseDmg * 0.1 * level);
    return sum + baseDmg + bonus;
  }, 0);
}

function getItemsBonusHealth() {
  return getPurchasedItemsData().reduce((sum, item) => {
    const level = (typeof player !== "undefined" && player.forgeLevels && player.forgeLevels[item.id]) ?
      player.forgeLevels[item.id] : 0;
    const baseHp = (item.stamina || 0) * HP_PER_STAMINA;
    const bonus = Math.floor(baseHp * 0.1 * level);
    return sum + baseHp + bonus;
  }, 0);
}


function getTotalHealth() {
  const staminaLevel = getTalentLevel("staminaMastery");
  const staminaBonus = staminaLevel * 15;
  const itemsBonus = getItemsBonusHealth();
  return 100 + staminaBonus + itemsBonus;
}

function getTotalDamage() {
  const itemsBonus = getItemsBonusDamage();
  return 10 + itemsBonus;
}

// ========================================= //
// ЛИМИТЫ БОССОВ (ВОССТАНОВЛЕНИЕ КАЖДЫЙ ЧАС) //
// ========================================= //
function resetBossDailyLimitIfNeeded() {
  if (typeof player === "undefined") return;
  if (!player.bossDaily) player.bossDaily = { counts: {}, lastUpdate: Date.now() };
  if (!player.bossDaily.counts) player.bossDaily.counts = {};

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!player.bossDaily.lastUpdate) {
    player.bossDaily.lastUpdate = now;
    return;
  }

  const timePassed = now - player.bossDaily.lastUpdate;
  const hoursPassed = Math.floor(timePassed / oneHour);

  if (hoursPassed > 0) {
    for (const bossId in player.bossDaily.counts) {
      player.bossDaily.counts[bossId] = Math.max(0, player.bossDaily.counts[bossId] - hoursPassed);
    }
    player.bossDaily.lastUpdate += hoursPassed * oneHour;
    savePlayer(player);
  }
}

function getBossRemainingTails(bossId = "riverport-rat", limit = 30) {
  resetBossDailyLimitIfNeeded();
  if (typeof player === "undefined") return limit;
  if (!player.bossDaily.counts) player.bossDaily.counts = {};

  const collected = player.bossDaily.counts[bossId] || 0;
  return Math.max(0, limit - collected);
}

function addBossTailReward(bossId, amount, limit) {
  resetBossDailyLimitIfNeeded();
  if (!player.bossDaily.counts) player.bossDaily.counts = {};

  const available = getBossRemainingTails(bossId, limit);
  const toAdd = Math.min(amount, available);

  if (toAdd > 0) {
    player.tails = (player.tails || 0) + toAdd;
    player.bossDaily.counts[bossId] = (player.bossDaily.counts[bossId] || 0) + toAdd;
    savePlayer(player);
  }
  return toAdd;
}

// ========================================= //
// ЛОГИКА ДОМИКОВ                            //
// ========================================= //
function getHouseLevel(houseType = "tavern") {
  if (typeof player === "undefined") return 1;
  if (houseType === "hut") return player.hutLevel || 0;
  if (houseType === "tavern2") return player.houseLevel2 || 1;
  return player.houseLevel || 1;
}

function getHouseIncome(houseType = "tavern") {
  const level = getHouseLevel(houseType);
  if (houseType === "hut") return 1;
  const incomeByLevel = { 1: 50, 2: 100, 3: 170, 4: 260, 5: 400, 6: 500, 7: 600, 8: 700, 9: 800, 10: 1000 };
  return incomeByLevel[level] || 50;
}

function getHouseUpgradeTailCost(houseType = "tavern") {
  const level = getHouseLevel(houseType);
  if (houseType === "hut") return level >= 1 ? 0 : 100;
  const costByLevel = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60, 9: 80 };
  return costByLevel[level] || 0;
}

function canUpgradeHouse(houseType = "tavern") {
  const level = getHouseLevel(houseType);

  if (houseType === "hut") return level < 1 && (player.poisonVials || 0) >= 100;
  if (level >= 10) return false;

  if (houseType === "tavern2") return (player.spiderLegs || 0) >= getHouseUpgradeTailCost("tavern2");
  return (player.tails || 0) >= getHouseUpgradeTailCost("tavern");
}

function upgradeHouse(houseType = "tavern") {
  if (!canUpgradeHouse(houseType)) return false;

  if (houseType === "hut") {
    player.poisonVials -= 100;
    player.hutLevel = 1;
  } else if (houseType === "tavern2") {
    player.spiderLegs -= getHouseUpgradeTailCost("tavern2");
    player.houseLevel2 = getHouseLevel("tavern2") + 1;
  } else {
    player.tails -= getHouseUpgradeTailCost("tavern");
    player.houseLevel = getHouseLevel("tavern") + 1;
  }

  savePlayer(player);
  return true;
}

function canCollectHouseSilver(houseType = "tavern") {
  const now = Date.now();
  const lastCollectKey = `${houseType}LastCollect`;
  const lastCollect = (typeof player !== "undefined" && player[lastCollectKey]) ? player[lastCollectKey] : 0;
  const threeHours = 3 * 60 * 60 * 1000;
  return now - lastCollect >= threeHours;
}

function collectHouseSilver(houseType = "tavern") {
  if (!canCollectHouseSilver(houseType)) return false;
  const income = getHouseIncome(houseType);

  if (houseType === "hut") {
    player.inventory.potion = (player.inventory.potion || 0) + income;
  } else if (houseType === "tavern2") {
    addCurrency("silver", income);
  } else {
    addCurrency("gold", income);
  }

  const lastCollectKey = `${houseType}LastCollect`;
  player[lastCollectKey] = Date.now();
  savePlayer(player);
  return income;
}

function getTimeUntilHouseCollect(houseType = "tavern") {
  const now = Date.now();
  const lastCollectKey = `${houseType}LastCollect`;
  const lastCollect = (typeof player !== "undefined" && player[lastCollectKey]) ? player[lastCollectKey] : 0;
  const threeHours = 3 * 60 * 60 * 1000;
  const diff = threeHours - (now - lastCollect);
  return Math.max(0, diff);
}

function formatTimeFromMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [String(hours).padStart(2, "0"), String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")].join(":");
}

// ========================================= //
// ПОКУПКА И ЭКИПИРОВКА                      //
// ========================================= //
function buyShopItem(itemId) {
  if (typeof SHOP_ITEMS === "undefined") return { success: false, message: "Ошибка данных" };
  const item = SHOP_ITEMS.find((shopItem) => shopItem.id === itemId);
  if (!item) return { success: false, message: "Предмет не найден" };

  const purchased = getPurchasedItems();
  if (purchased.includes(item.id)) return { success: false, message: "Предмет уже куплен" };

  if (typeof player === "undefined") return { success: false, message: "Игрок не найден" };

  if ((player.level || 1) < (item.reqLevel || 1)) {
    return { success: false, message: `Нужен уровень ${item.reqLevel}` };
  }

  const currentAmount = player[item.currency] || 0;
  if (currentAmount < item.price) return { success: false, message: "Недостаточно ресурсов" };

  player[item.currency] -= item.price;
  if (!player.shop) player.shop = { purchasedItems: [], equipped: {} };
  player.shop.purchasedItems.push(item.id);

  savePlayer(player);
  return { success: true, message: "Покупка успешна" };
}

function equipItem(itemId, category) {
  if (!player.shop) player.shop = { purchasedItems: [], equipped: {} };
  if (!player.shop.equipped) player.shop.equipped = {};

  const slots = getSlotsForCategory(category);
  if (slots.length === 0) return;

  // Если предмет уже надет в одном из слотов, ничего не делаем
  if (slots.some((s) => player.shop.equipped[s.id] === itemId)) return;

  // Ищем свободный слот, иначе заменяем первый
  const freeSlot = slots.find((s) => !player.shop.equipped[s.id]) || slots[0];
  player.shop.equipped[freeSlot.id] = itemId;
  savePlayer(player);
}

function unequipItem(category, itemId) {
  if (!player.shop || !player.shop.equipped) return;

  const slots = getSlotsForCategory(category);
  const slot = slots.find((s) => player.shop.equipped[s.id] === itemId) || slots[0];
  if (slot) delete player.shop.equipped[slot.id];
  savePlayer(player);
}

function showFloatingDamage(targetElement, damage, isPlayerTarget = false) {
  const popup = document.createElement('div');
  popup.className = `damage-popup ${isPlayerTarget ? 'player-damage' : ''}`;
  popup.textContent = `-${damage}`;

  // Случайное смещение по X
  const randomOffsetX = (Math.random() - 0.5) * 40;

  if (targetElement) {
    // Если элемент передан и найден на странице — привязываемся к нему
    const rect = targetElement.getBoundingClientRect();
    popup.style.position = 'absolute';
    popup.style.left = `${rect.left + rect.width / 2 + randomOffsetX}px`;
    popup.style.top = `${rect.top + rect.height / 3}px`;
    popup.style.zIndex = '1000';
  } else {
    // Страховка: если элемент не найден, выводим по центру экрана
    popup.style.position = 'fixed';
    popup.style.left = `calc(50% + ${randomOffsetX}px)`;
    popup.style.top = '45%';
    popup.style.zIndex = '99999';
  }

  document.body.appendChild(popup);

  // Удаляем элемент после завершения анимации (800мс)
  setTimeout(() => {
    popup.remove();
  }, 800);
}

// Делаем глобальной, чтобы location.js её видел
window.showFloatingDamage = showFloatingDamage;
