/* ========================================= */
/* SCRIPT.JS — ЯДРО ИГРЫ                     */
/* ========================================= */

const STORAGE_KEY = "fantasy_game_save_v2";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value) {
  const num = toNumber(value, 0);
  return num.toLocaleString("ru-RU");
}

const DEFAULT_PLAYER = {
  name: "НОВЫЙ ИГРОК",
  power: 0,
  level: 0,
  xp: 0,
  silver: 1000,
  gold: 1000000,
  crystal: 100,
  food: 10,
  stamina: 50,
  staminaUpdatedAt: Date.now(),
  createdAt: Date.now(),

  // Достижения (ключи создаются автоматически из ACHIEVEMENTS_DATA)
  achievements: {},

  // Квесты
  quests: [
    { id: "q_kill_boss", progress: 0, target: 3, completed: false },
    { id: "q_earn_gold", progress: 0, target: 500, completed: false },
    { id: "q_upgrade_talent", progress: 0, target: 1, completed: false }
  ],

  // Рейтинг арены
  arena: {
    rating: 1000,
    lastResetTime: Date.now()
  },

  inventory: { grayScroll: 1, goldScroll: 1, potion: 10 },
  collections: {},
  tails: 0,
  houseLevel: 1,
  houseLastCollect: 0,
  bossDaily: { counts: {}, lastUpdate: Date.now(), lastTailResetDate: "", dailyTailCollected: 0 },

  forgeLevels: {},
  talents: { staminaMastery: 0, fierceStrike: 0, shieldBlock: 0, invisibleStrike: 0, masterHealer: 0 },
  shop: { purchasedItems: [], equipped: {} },
  settings: { musicEnabled: true, soundEnabled: true },
  lotteryFirstPlayUsed: false
};

function savePlayer(playerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
}

function loadPlayer() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const freshPlayer = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
    savePlayer(freshPlayer);
    return freshPlayer;
  }

  try {
    const parsed = JSON.parse(saved);
    const loadedPlayer = {
      ...DEFAULT_PLAYER,
      ...parsed,
      inventory: { ...DEFAULT_PLAYER.inventory, ...(parsed.inventory || {}) },
      bossDaily: { ...DEFAULT_PLAYER.bossDaily, ...(parsed.bossDaily || {}) },
      forgeLevels: { ...DEFAULT_PLAYER.forgeLevels, ...(parsed.forgeLevels || {}) },
      talents: { ...DEFAULT_PLAYER.talents, ...(parsed.talents || {}) },
      shop: { ...DEFAULT_PLAYER.shop, ...(parsed.shop || {}) },
      collections: { ...DEFAULT_PLAYER.collections, ...(parsed.collections || {}) },
      settings: { ...DEFAULT_PLAYER.settings, ...(parsed.settings || {}) },
      arena: { ...DEFAULT_PLAYER.arena, ...(parsed.arena || {}) },
      achievements: { ...(parsed.achievements || {}) },
      quests: parsed.quests || DEFAULT_PLAYER.quests
    };
    return loadedPlayer;
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    const freshPlayer = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
    savePlayer(freshPlayer);
    return freshPlayer;
  }
}

let player = loadPlayer();
window.player = player; // ВАЖНО: делает игрока видимым для Achievement.js
// ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
const playerLevelBadge = document.querySelector(".hud-level-new");
const hudDays = document.querySelector(".hud-days-new");
const hudHpText = document.querySelector(".hud-hp-text-new");
const hudHpFill = document.querySelector(".hud-hp-fill-new");

const staminaValue = document.querySelector(".blue-res .hud-res-val");
const silverValue = document.querySelector(".silver-res .hud-res-val");
const goldValue = document.querySelector(".gold-res .hud-res-val");
const crystalValue = document.querySelector(".crystal-res .hud-res-val");
const foodValue = document.querySelector(".food-res .hud-res-val");

const profileHud = document.querySelector(".hud-profile-new");
const talentsOverlay = document.querySelector(".talents-modal-overlay");
const talentsCloseBtn = document.querySelector(".talents-close-btn");
const talentCards = document.querySelectorAll(".talent-card");

const totalHealthValue = document.querySelector(".js-total-health");
const totalDamageValue = document.querySelector(".js-total-damage");

const campaignToggleBtn = document.querySelector(".js-campaign-toggle");

// БАЗОВЫЕ ФУНКЦИИ
function getXpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getMaxStamina(level) {
  return 50 + (level - 1);
}

function getDaysInKingdom() {
  const now = Date.now();
  const diff = now - player.createdAt;
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

function updatePower() {
  if (typeof player === "undefined") return;

  // Берём реальные статы из талантов и экипировки
  const totalDamage = typeof getTotalDamage === "function" ? getTotalDamage() : 10;
  const totalHp = typeof getTotalHealth === "function" ? getTotalHealth() : 100;

  // Формула мощи: урон ценится высоко (x15), здоровье имеет коэффициент (x0.5)
  const calculatedPower = Math.floor((totalDamage * 15) + (totalHp * 0.5));
  player.power = Math.max(0, calculatedPower);

  // Проверяем достижения (без аргументов)
  if (typeof window.checkAchievement === "function") {
    window.checkAchievement();
  }

  if (typeof renderHUD === "function") {
    renderHUD();
  }
}

function restoreOfflineStamina() {
  const now = Date.now();
  const maxStamina = getMaxStamina(player.level);
  const regenInterval = 3 * 60 * 1000;

  if (player.stamina >= maxStamina) {
    if (player.stamina === maxStamina) player.staminaUpdatedAt = now;
    return;
  }
  const passed = now - player.staminaUpdatedAt;
  if (passed < regenInterval) return;
  const gained = Math.floor(passed / regenInterval);
  if (gained > 0) {
    player.stamina = Math.min(maxStamina, player.stamina + gained);
    player.staminaUpdatedAt += gained * regenInterval;
    if (player.stamina >= maxStamina) player.staminaUpdatedAt = now;
    savePlayer(player);
  }
}

function addExperience(amount) {
  amount = toNumber(amount, 0);
  if (amount <= 0) return;

  player.xp += amount;
  let needXp = getXpForLevel(player.level);
  let leveledUp = false;

  while (player.xp >= needXp) {
    player.xp -= needXp;
    player.level += 1;
    needXp = getXpForLevel(player.level);
    leveledUp = true;
  }

  updatePower();
  savePlayer(player);
  renderHUD();

  if (leveledUp) {
    showLevelUpReward();
    if (window.locationApi && window.locationApi.refreshMap) {
      window.locationApi.refreshMap();
    }
  }
}

function showLevelUpReward() {
  const overlay = document.querySelector(".level-up-overlay");
  const levelNumberEl = document.querySelector(".js-level-number");
  const rewardGoldEl = document.querySelector(".js-reward-gold"); // исправлен селектор
  const closeBtn = document.querySelector(".js-level-up-close");

  if (!overlay) return;

  const goldReward = 200 + (player.level * 50);
  const staminaReward = 50;
  const crystalReward = 1;

  player.gold += goldReward;
  player.stamina += staminaReward;
  player.crystal += crystalReward;

  updatePower();
  savePlayer(player);
  renderHUD();

  if (levelNumberEl) levelNumberEl.textContent = player.level;
  if (rewardGoldEl) rewardGoldEl.textContent = `+${goldReward}`;

  overlay.classList.remove("hidden");

  const closeHandler = () => {
    overlay.classList.add("hidden");
    if (closeBtn) closeBtn.removeEventListener("click", closeHandler);
  };
  if (closeBtn) closeBtn.addEventListener("click", closeHandler);
}

function addCurrency(type, amount) {
  amount = toNumber(amount, 0);
  if (!(type in player)) return;
  player[type] += amount;
  if (player[type] < 0) player[type] = 0;

  updatePower();
  savePlayer(player);
  renderHUD();

  // Проверяем накопительные достижения (золото, кристаллы, мощь)
  if (typeof window.checkAchievement === "function") {
    window.checkAchievement();
  }
}

function spendStamina(amount) {
  amount = toNumber(amount, 0);
  if (amount <= 0) return false;
  restoreOfflineStamina();
  if (player.stamina < amount) return false;
  player.stamina -= amount;
  player.staminaUpdatedAt = Date.now();
  savePlayer(player);
  renderHUD();
  return true;
}
// АРЕНА: еженедельный сброс
function checkWeeklyArenaReset() {
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (!player.arena) player.arena = { rating: 1000, lastResetTime: now };
  if (!player.arena.lastResetTime) player.arena.lastResetTime = now;

  if (now - player.arena.lastResetTime >= ONE_WEEK) {
    const rewardGold = 5000;
    const rewardCrystals = 20;

    player.gold += rewardGold;
    player.crystal += rewardCrystals;

    player.arena.lastResetTime = now;
    savePlayer(player);

    alert(`Рейтинговый сезон завершен! Вы получили награду за прошлую неделю: ${rewardGold} золота и ${rewardCrystals} кристаллов.`);
  }
}

// КВЕСТЫ
function renderQuestsWidget() {
  const container = document.querySelector(".js-quests-container");
  if (!container || !player.quests) return;
  if (typeof QUESTS_POOL === "undefined") return;

  container.innerHTML = "";
  player.quests.forEach((qData, index) => {
    const questInfo = QUESTS_POOL.find(q => q.id === qData.id) || QUESTS_POOL[0];
    const isReady = qData.progress >= qData.target;

    const btn = document.createElement("div");
    btn.className = `quest-circle-btn ${isReady ? "ready" : ""}`;
    btn.innerHTML = `<span>📜</span><div class="quest-tooltip">${questInfo.title}: ${qData.progress}/${qData.target}</div>`;

    btn.addEventListener("click", () => {
      if (isReady && !qData.completed) {
        if (questInfo.reward.gold) player.gold += questInfo.reward.gold;
        if (questInfo.reward.crystal) player.crystal += questInfo.reward.crystal;

        // Заменяем квест на новый из пула
        const randomNew = QUESTS_POOL[Math.floor(Math.random() * QUESTS_POOL.length)];
        player.quests[index] = { id: randomNew.id, progress: 0, target: randomNew.target, completed: false };

        savePlayer(player);
        renderHUD();
        alert("Награда за квест получена!");
      } else {
        alert(`${questInfo.desc}\nПрогресс: ${qData.progress} / ${qData.target}`);
      }
    });
    container.appendChild(btn);
  });
}

// Прогресс квестов (прибавляет строго amount, не выше target)
function updateQuestProgress(type, amount = 1) {
  if (!player.quests) return;

  player.quests.forEach(qData => {
    const questInfo = typeof QUESTS_POOL !== "undefined" ? QUESTS_POOL.find(q => q.id === qData.id) : null;

    if (questInfo && questInfo.type === type && !qData.completed) {
      qData.progress = Math.min(questInfo.target, qData.progress + amount);

      if (qData.progress >= questInfo.target) {
        qData.completed = true;
      }
    }
  });

  savePlayer(player);
}

// ТАЛАНТЫ
function openTalentsModal() {
  if (talentsOverlay) talentsOverlay.classList.remove("hidden");
  if (totalHealthValue) totalHealthValue.textContent = formatNumber(getTotalHealth());
  if (totalDamageValue) totalDamageValue.textContent = formatNumber(getTotalDamage());
  renderTalents();
}

function closeTalentsModal() {
  if (talentsOverlay) talentsOverlay.classList.add("hidden");
}

function getTalentUpgradePopupText(talentKey) {
  const map = {
    staminaMastery: "+15 HP",
    fierceStrike: "+5 к навыку",
    shieldBlock: "Ответ -1",
    invisibleStrike: "+7 к навыку",
    masterHealer: "+3 к зелью"
  };
  return map[talentKey] || "+1 УР.";
}

function showTalentUpgradePopup(talentKey, text) {
  if (!text) return;
  const cardEl = document.querySelector(`.talent-card[data-talent="${talentKey}"]`);
  if (!cardEl) return;

  const badge = document.createElement("div");
  badge.className = "talent-pop-badge";
  badge.textContent = text;
  cardEl.appendChild(badge);
  setTimeout(() => badge.remove(), 860);
}

function getTalentCurrencyIconHtml(currency) {
  const src = currency === "gold"
    ? "/contents/IconsGame/hud-right/gold-res.png"
    : "/contents/IconsGame/hud-right/silver-res.png";
  const alt = currency === "gold" ? "Золото" : "Серебро";
  return `<img src="${src}" alt="${alt}" class="talent-currency-icon" style="width:14px;height:14px;object-fit:contain;vertical-align:-2px;margin-left:3px;">`;
}

function upgradeTalent(talentKey) {
  if (!player.talents || !(talentKey in player.talents)) return;
  const cost = getTalentCost(talentKey);
  const currency = getTalentCurrency(talentKey);

  if ((player[currency] || 0) < cost) {
    alert(`Недостаточно ${currency === "silver" ? "серебра" : "золота"}`);
    return;
  }
if (typeof window.checkAchievement === "function") window.checkAchievement("talent", 1);

  player[currency] -= cost;
  player.talents[talentKey] += 1;

  // Квест на прокачку таланта (если есть в пуле)
  updateQuestProgress("talent", 1);

  updatePower();
  savePlayer(player);
  renderHUD();
  renderTalents();
  showTalentUpgradePopup(talentKey, getTalentUpgradePopupText(talentKey));
}
function updateLoginStreak() {
  const today = new Date().toDateString();
  if (player.lastLoginDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  player.loginStreak = (player.lastLoginDate === yesterday) ? (player.loginStreak || 0) + 1 : 1;
  player.lastLoginDate = today;
  savePlayer(player);
}

function getTalentLevelSafe(key) {
  if (typeof getTalentLevel === "function") return getTalentLevel(key);
  return toNumber(player?.talents?.[key], 0);
}

function getTalentCostSafe(key, level) {
  if (typeof getTalentCost === "function") return getTalentCost(key);
  return 100 + level * 50;
}

function getTalentCurrencySafe(key) {
  if (typeof getTalentCurrency === "function") return getTalentCurrency(key);
  return key === "staminaMastery" ? "silver" : "gold";
}

function renderTalents() {
  if (talentCards.length) {
    const baseDmg = typeof getTotalDamage === "function" ? getTotalDamage() : 10;

    talentCards.forEach((card) => {
      const key = card.dataset.talent;
      const level = getTalentLevelSafe(key);
      const cost = getTalentCostSafe(key, level);
      const currency = getTalentCurrencySafe(key);
      const currencyLabel = currency === "silver" ? "серебра" : "золота";

      const levelSpan = card.querySelector(".talent-level span");
      const badgeEl = card.querySelector(".js-talent-badge");
      const descEl = card.querySelector(".talent-desc");
      const costBlock = card.querySelector(".talent-cost");
      const btn = card.querySelector(".talent-upgrade-btn");

      if (levelSpan) levelSpan.textContent = level;
      if (badgeEl) badgeEl.textContent = level;

      if (descEl) {
        if (key === "staminaMastery") {
          descEl.textContent = `+15 HP за ур. (бонус: +${level * 15} HP)`;
        } else if (key === "fierceStrike") {
          const skillBonus = level * 5;
          const totalSkillHit = baseDmg + skillBonus;
          descEl.textContent = `+5 за ур. (навык: +${skillBonus}, всего: ${totalSkillHit})`;
        } else if (key === "shieldBlock") {
          descEl.textContent = `Баз. удар ${baseDmg}, ответ -${level} ур.`;
        } else if (key === "invisibleStrike") {
          const skillBonus = level * 7;
          const totalInvisHit = baseDmg + skillBonus;
          descEl.textContent = `+7 за ур. (навык: +${skillBonus}, всего: ${totalInvisHit}, без ответа)`;
        } else if (key === "masterHealer") {
          const healBonus = level * 3;
          descEl.textContent = `+3 к зелью за ур. (бонус: +${healBonus} HP)`;
        }
      }

      if (costBlock) costBlock.innerHTML = `СТОИМОСТЬ: <span>${formatNumber(cost)}</span> ${currencyLabel}${getTalentCurrencyIconHtml(currency)}`;
      if (btn) btn.disabled = (player[currency] || 0) < cost;
    });
  }
  if (totalHealthValue && typeof getTotalHealth === "function") {
    totalHealthValue.textContent = formatNumber(getTotalHealth());
  }
  if (totalDamageValue && typeof getTotalDamage === "function") {
    totalDamageValue.textContent = formatNumber(getTotalDamage());
  }
}

// HUD
function renderHUD() {
  restoreOfflineStamina();
  renderQuestsWidget();

  const maxStamina = getMaxStamina(player.level);
  const needXp = getXpForLevel(player.level);
  const xpPercent = clamp((player.xp / needXp) * 100, 0, 100);
  const kingdomDays = getDaysInKingdom();

  if (playerLevelBadge) playerLevelBadge.textContent = player.level;
  if (hudDays) hudDays.textContent = `ДНЕЙ В КОРОЛЕВСТВЕ: ${kingdomDays}`;
  if (hudHpText) hudHpText.textContent = `${player.xp} / ${needXp}`;
  if (hudHpFill) hudHpFill.style.width = `${xpPercent}%`;

  if (staminaValue) staminaValue.textContent = `${player.stamina} / ${maxStamina}`;
  if (silverValue) silverValue.textContent = formatNumber(player.silver);
  if (goldValue) goldValue.textContent = formatNumber(player.gold);
  if (crystalValue) crystalValue.textContent = formatNumber(player.crystal);
  if (foodValue) foodValue.textContent = formatNumber(player.food);

  if (window.shopApi && typeof window.shopApi.renderShop === "function") window.shopApi.renderShop();

  // Слоты, ник и полоска здоровья героя на главном экране
  if (window.heroSlotsApi && typeof window.heroSlotsApi.renderHeroSlots === "function") {
    window.heroSlotsApi.renderHeroSlots();
  }
}


function tickStamina() {
  const before = player.stamina;
  restoreOfflineStamina();
  if (player.stamina !== before) renderHUD();
}
// ========================================= //
// ЕДИНАЯ СИСТЕМА ЭКРАНОВ                    //
// ========================================= //
const SCREENS = {
  campaign:    ".campaign-screen",
  arena:       ".arena-screen",
  forge:       ".forge-screen",
  lottery:     ".lottery-screen",
  guild:       ".guild-screen",
  collections: ".collections-screen",
  character:   ".character-screen",

};

let currentScreen = null;

function getScreenElement(name) {
  const selector = SCREENS[name];
  return selector ? document.querySelector(selector) : null;
}

function openScreen(name) {
  const target = getScreenElement(name);
  if (!target) return false;

  // Закрываем все остальные экраны
  Object.keys(SCREENS).forEach((key) => {
    if (key === name) return;
    const el = getScreenElement(key);
    if (el) el.classList.add("hidden");
  });

  // Магазин и таланты это окна поверх, их тоже закрываем
  document.querySelector(".shop-modal-overlay")?.classList.add("hidden");
  document.querySelector(".talents-modal-overlay")?.classList.add("hidden");

  target.classList.remove("hidden");
  currentScreen = name;
  return true;
}

function closeScreen(name) {
  const target = getScreenElement(name);
  if (target) target.classList.add("hidden");
  if (currentScreen === name) currentScreen = null;
}

function toggleScreen(name) {
  const target = getScreenElement(name);
  if (!target) return false;
  if (target.classList.contains("hidden")) {
    openScreen(name);
    return true;
  }
  closeScreen(name);
  return false;
}

// КАМПАНИЯ
function toggleCampaignScreen() {
  toggleScreen("campaign");
}

if (campaignToggleBtn) campaignToggleBtn.addEventListener("click", toggleCampaignScreen);

// СОБЫТИЯ
if (profileHud) profileHud.addEventListener("click", openTalentsModal);
if (talentsCloseBtn) talentsCloseBtn.addEventListener("click", closeTalentsModal);
if (talentsOverlay) talentsOverlay.addEventListener("click", (e) => { if (e.target === talentsOverlay) closeTalentsModal(); });

if (talentCards.length) {
  talentCards.forEach((card) => {
    const btn = card.querySelector(".talent-upgrade-btn");
    const key = card.dataset.talent;
    if (btn && key) btn.addEventListener("click", () => upgradeTalent(key));
  });
}

// INIT
checkWeeklyArenaReset();
updateLoginStreak();
updatePower();
renderHUD();
setInterval(tickStamina, 1000);

window.gameApi = {
  addExperience,
  addCurrency,
  spendStamina,
  openTalentsModal,
  closeTalentsModal,
  upgradeTalent,
  getPlayer: () => player,
  savePlayer: () => savePlayer(player),
  renderHUD,
  getTotalDamage: () => getTotalDamage(),
  getTotalHealth: () => getTotalHealth(),
  openScreen,
  closeScreen,
  toggleScreen,
  updateQuestProgress
};

/* ========================================= */
/* ФОНОВАЯ МУЗЫКА                            */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-toggle-btn");

  if (!bgMusic || !musicBtn) return;

  bgMusic.volume = 0.4;
  let isMusicPlaying = false;

  function updateMusicIcon() {
    musicBtn.textContent = isMusicPlaying ? "🔊" : "🔇";
  }

  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isMusicPlaying = true;
      updateMusicIcon();
    }).catch(() => {
      isMusicPlaying = false;
      updateMusicIcon();

      const playOnFirstClick = () => {
        bgMusic.play().then(() => {
          isMusicPlaying = true;
          updateMusicIcon();
        });
        document.removeEventListener("click", playOnFirstClick);
        document.removeEventListener("touchstart", playOnFirstClick);
      };
      document.addEventListener("click", playOnFirstClick);
      document.addEventListener("touchstart", playOnFirstClick);
    });
  }

  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      bgMusic.play();
      isMusicPlaying = true;
    } else {
      bgMusic.pause();
      isMusicPlaying = false;
    }
    updateMusicIcon();
  });
});

/* ========================================= */
/* СБРОС ИГРЫ                                */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-game-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const isConfirmed = confirm("Вы уверены, что хотите сбросить ВСЁ? Весь прогресс (уровни, деньги, купленные предметы) будет удалён.");
      if (isConfirmed) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }
});

/* ========================================= */
/* ПОЛНОЭКРАННЫЙ РЕЖИМ                       */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (!fullscreenBtn) return;

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.textContent = document.fullscreenElement ? "🗗" : "⛶";
  });
});

/* ========================================= */
/* ПЕРСОНАЖ НА ГЛАВНОМ ЭКРАНЕ                */
/* ========================================= */
function renderMainHero() {
  if (typeof renderAllHeroes === "function") renderAllHeroes();
}

window.addEventListener("DOMContentLoaded", () => {
  if (typeof renderAllHeroes === "function") renderAllHeroes();
});

// ПЕРСОНАЖ: открывает тот же профиль, что и рамка в HUD
document.querySelector('.js-open-character').addEventListener('click', () => {
  document.querySelector('.hud-profile-new').click();
});

// РЕЙТИНГ
const ratingScreen = document.querySelector('.rating-screen');

document.querySelector('.js-open-rating').addEventListener('click', () => {
  ratingScreen.classList.remove('hidden');
  renderRating();
});

document.querySelector('.rating-close-btn').addEventListener('click', () => {
  ratingScreen.classList.add('hidden');
});






const ratingModal = document.querySelector('.rating-modal');
const ratingList = document.querySelector('.js-rating-list');
const ratingTitle = document.querySelector('.js-rating-title');

const RATING_CATEGORIES = {
  exp:          { title: 'ОПЫТ',       field: 'exp' },
  power:        { title: 'СИЛА',       field: 'power' },
  achievements: { title: 'ДОСТИЖЕНИЯ', field: 'achievements' },
  damage:       { title: 'УРОН',       field: 'damage' }
};

// Тестовые соперники + живые данные текущего игрока
const baseRatingPlayers = [
  { name: '[BC] Dean_War', level: 87, exp: 4870916, power: 125400, achievements: 142, damage: 98200, guild: true,  friend: true  },
  { name: '[VM] Джон',     level: 81, exp: 3950120, power: 110200, achievements: 130, damage: 90100, guild: false, friend: true  },
  { name: 'Воин',          level: 75, exp: 3400802, power: 99800,  achievements: 118, damage: 85300, guild: true,  friend: false },
  { name: 'Маг',           level: 70, exp: 2900455, power: 91000,  achievements: 101, damage: 80450, guild: false, friend: false }
];

function getLivePlayerRatingEntry() {
  const p = window.player || player || {};
  const totalDmg = typeof getTotalDamage === "function" ? getTotalDamage() : 10;
  const completedAch = Array.isArray(window.achievementsData)
    ? window.achievementsData.filter(a => a && a.completed).length
    : Object.values(p.achievements || {}).filter(v => v && (v.completed || v === true)).length;

  return {
    name: p.name || 'НОВЫЙ ИГРОК',
    level: toNumber(p.level, 1),
    exp: toNumber(p.xp, 0),
    power: toNumber(p.power, 0),
    achievements: completedAch,
    damage: toNumber(totalDmg, 10),
    guild: Boolean(p.guild || p.guildId),
    friend: false,
    isSelf: true
  };
}

let ratingCat = 'exp';
let ratingScope = 'all';

function renderRating() {
  const field = RATING_CATEGORIES[ratingCat].field;
  ratingTitle.textContent = RATING_CATEGORIES[ratingCat].title;

  const allEntries = [...baseRatingPlayers, getLivePlayerRatingEntry()];
  const filtered = allEntries.filter(entry =>
    ratingScope === 'all' ||
    (ratingScope === 'guild' && entry.guild) ||
    (ratingScope === 'friends' && entry.friend) ||
    (ratingScope === 'friends' && entry.isSelf)
  );

  ratingList.innerHTML = filtered
    .sort((a, b) => toNumber(b[field], 0) - toNumber(a[field], 0))
    .map((entry, i) => `
      <div class="rating-row ${entry.isSelf ? 'is-self' : ''}">
        <span class="rating-place">${i + 1}.</span>
        <img class="rating-avatar" src="/contents/IconsGame/hero/Head/head_1.png" alt="">
        <span class="rating-name">${entry.name}${entry.isSelf ? ' (Вы)' : ''}</span>
        <span class="rating-level"><i class="rating-star">★</i>${entry.level}</span>
        <span class="rating-score">${toNumber(entry[field], 0).toLocaleString('ru-RU')}</span>
      </div>
    `)
    .join('') || '<div class="rating-empty">Пока никого нет</div>';
}

// Открытие и закрытие
document.querySelector('.js-open-rating').addEventListener('click', () => {
  ratingModal.classList.remove('hidden');
  renderRating();
});
document.querySelector('.js-rating-close').addEventListener('click', () => {
  ratingModal.classList.add('hidden');
});
document.querySelector('.rating-backdrop').addEventListener('click', () => {
  ratingModal.classList.add('hidden');
});

// Левое меню категорий
document.querySelectorAll('.rating-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rating-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ratingCat = btn.dataset.cat;
    renderRating();
  });
});

// Верхние вкладки
document.querySelectorAll('.rating-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.rating-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    ratingScope = tab.dataset.scope;
    renderRating();
  });
});
