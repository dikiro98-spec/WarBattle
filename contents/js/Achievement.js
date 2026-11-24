/* ========================================= */
/* СИСТЕМА ДОСТИЖЕНИЙ v2.1 (ФИКС + НОВЫЕ)   */
/* ========================================= */

const ACHIEVEMENTS_DATA = {
  // ---------- ЗОЛОТО ----------
  gold_1: { cat: "wealth", title: "Медный кошелек", desc: "Накопите 1 000 золота", target: 1000, type: "gold", reward: { gold: 200 } },
  gold_2: { cat: "wealth", title: "Звонкая монета", desc: "Накопите 10 000 золота", target: 10000, type: "gold", reward: { gold: 1000, crystal: 3 } },
  gold_3: { cat: "wealth", title: "Тугой мешок", desc: "Накопите 50 000 золота", target: 50000, type: "gold", reward: { gold: 5000, crystal: 8 } },
  gold_4: { cat: "wealth", title: "Карманы лопаются", desc: "Накопите 100 000 золота", target: 100000, type: "gold", reward: { crystal: 15 } },
  gold_5: { cat: "wealth", title: "Золотой запас", desc: "Накопите 250 000 золота", target: 250000, type: "gold", reward: { crystal: 25 } },
  gold_6: { cat: "wealth", title: "Казна короля", desc: "Накопите 1 000 000 золота", target: 1000000, type: "gold", reward: { crystal: 50 } },

  // ---------- КРИСТАЛЛЫ ----------
  crystal_1: { cat: "wealth", title: "Искрящийся камень", desc: "Накопите 10 кристаллов", target: 10, type: "crystal", reward: { gold: 1000 } },
  crystal_2: { cat: "wealth", title: "Горсть самоцветов", desc: "Накопите 50 кристаллов", target: 50, type: "crystal", reward: { gold: 5000, crystal: 5 } },
  crystal_3: { cat: "wealth", title: "Сияющий тайник", desc: "Накопите 200 кристаллов", target: 200, type: "crystal", reward: { crystal: 20 } },
  crystal_4: { cat: "wealth", title: "Драгоценная россыпь", desc: "Накопите 500 кристаллов", target: 500, type: "crystal", reward: { crystal: 40 } },
  crystal_5: { cat: "wealth", title: "Кристальный магнат", desc: "Накопите 1 000 кристаллов", target: 1000, type: "crystal", reward: { gold: 20000, crystal: 80 } },

  // ---------- БОССЫ ----------
  boss_1: { cat: "combat", title: "Истребитель крыс", desc: "Победите босса 1 раз", target: 1, type: "boss", reward: { gold: 500, crystal: 2 } },
  boss_2: { cat: "combat", title: "Гроза подземелий", desc: "Победите боссов 10 раз", target: 10, type: "boss", reward: { gold: 1500, crystal: 5 } },
  boss_3: { cat: "combat", title: "Охотник на гоблинов", desc: "Победите боссов 50 раз", target: 50, type: "boss", reward: { gold: 5000, crystal: 12 } },
  boss_4: { cat: "combat", title: "Герой форта", desc: "Победите боссов 150 раз", target: 150, type: "boss", reward: { crystal: 30 } },
  boss_5: { cat: "combat", title: "Страх подземелий", desc: "Победите боссов 300 раз", target: 300, type: "boss", reward: { crystal: 50 } },
  boss_6: { cat: "combat", title: "Легенда арены", desc: "Победите боссов 1 000 раз", target: 1000, type: "boss", reward: { gold: 50000, crystal: 150 } },

  // ---------- МОЩЬ ----------
  power_1: { cat: "growth", title: "Первые шаги", desc: "Достигните 500 мощи", target: 500, type: "power", reward: { gold: 500 } },
  power_2: { cat: "growth", title: "Закаленный в боях", desc: "Достигните 2 500 мощи", target: 2500, type: "power", reward: { gold: 2000, crystal: 5 } },
  power_3: { cat: "growth", title: "Элитный воин", desc: "Достигните 10 000 мощи", target: 10000, type: "power", reward: { crystal: 25 } },
  power_4: { cat: "growth", title: "Гроза королевства", desc: "Достигните 25 000 мощи", target: 25000, type: "power", reward: { crystal: 40 } },
  power_5: { cat: "growth", title: "Непобедимый", desc: "Достигните 100 000 мощи", target: 100000, type: "power", reward: { gold: 30000, crystal: 100 } },

  // ---------- УРОВЕНЬ ----------
  level_1: { cat: "growth", title: "Новичок", desc: "Достигните 5 уровня", target: 5, type: "level", reward: { gold: 500 } },
  level_2: { cat: "growth", title: "Ветеран", desc: "Достигните 20 уровня", target: 20, type: "level", reward: { gold: 3000, crystal: 10 } },
  level_3: { cat: "growth", title: "Мастер", desc: "Достигните 50 уровня", target: 50, type: "level", reward: { gold: 15000, crystal: 40 } },

  // ---------- ТАЛАНТЫ ----------
  talent_1: { cat: "growth", title: "Ученик", desc: "Прокачайте любой талант", target: 1, type: "talent", reward: { gold: 300 } },
  talent_2: { cat: "growth", title: "Мастер талантов", desc: "Прокачайте таланты 50 раз", target: 50, type: "talent", reward: { gold: 5000, crystal: 20 } },

  // ---------- АРЕНА ----------
  arena_1: { cat: "combat", title: "Гладиатор", desc: "Выиграйте 10 боёв на арене", target: 10, type: "arenaWin", reward: { gold: 2000, crystal: 5 } },
  arena_2: { cat: "combat", title: "Чемпион", desc: "Достигните рейтинга 1500", target: 1500, type: "arenaRating", reward: { gold: 5000, crystal: 20 } },
  arena_3: { cat: "combat", title: "Покоритель арены", desc: "Выиграйте 50 боёв на арене", target: 50, type: "arenaWin", reward: { gold: 12000, crystal: 35 } },

  // ---------- ДОМ ----------
  house_1: { cat: "world", title: "Домовладелец", desc: "Улучшите домик до 5 уровня", target: 5, type: "house", reward: { gold: 2000, crystal: 5 } },
  house_2: { cat: "world", title: "Хозяин таверны", desc: "Улучшите домик до 10 уровня", target: 10, type: "house", reward: { gold: 10000, crystal: 25 } },
  house_3: { cat: "world", title: "Сборщик податей", desc: "Соберите доход с домиков 25 раз", target: 25, type: "houseCollect", reward: { gold: 4000, crystal: 10 } },

  // ---------- ЛОТЕРЕЯ ----------
  lottery_1: { cat: "world", title: "Азартный игрок", desc: "Сыграйте в лотерею 10 раз", target: 10, type: "lottery", reward: { gold: 1000, crystal: 3 } },
  lottery_2: { cat: "world", title: "Везунчик", desc: "Сыграйте в лотерею 100 раз", target: 100, type: "lottery", reward: { gold: 10000, crystal: 30 } },

  // ---------- КУЗНИЦА ----------
  forge_1: { cat: "world", title: "Подмастерье", desc: "Улучшите предметы в кузнице 10 раз", target: 10, type: "forge", reward: { gold: 2000, crystal: 5 } },
  forge_2: { cat: "world", title: "Мастер кузни", desc: "Улучшите предметы в кузнице 50 раз", target: 50, type: "forge", reward: { gold: 10000, crystal: 25 } },

  // ---------- КОЛЛЕКЦИИ ----------
  collection_1: { cat: "world", title: "Собиратель", desc: "Соберите 1 коллекцию целиком", target: 1, type: "collection", reward: { gold: 3000, crystal: 10 } },
  collection_2: { cat: "world", title: "Хранитель", desc: "Соберите 2 коллекции целиком", target: 2, type: "collection", reward: { gold: 10000, crystal: 30 } },

  // ---------- МАГАЗИН ----------
  shop_1: { cat: "world", title: "Первая покупка", desc: "Купите предмет в магазине", target: 1, type: "shop", reward: { gold: 300 } },
  shop_2: { cat: "world", title: "Шопоголик", desc: "Купите 20 предметов", target: 20, type: "shop", reward: { gold: 5000, crystal: 15 } },

  // ---------- РЕСУРСЫ БОССОВ ----------
  res_1: { cat: "world", title: "Крысолов", desc: "Соберите 50 хвостов", target: 50, type: "tails", reward: { gold: 2000, crystal: 5 } },
  res_2: { cat: "world", title: "Охотник на пауков", desc: "Соберите 50 лапок", target: 50, type: "spiderLegs", reward: { gold: 3000, crystal: 8 } },
  res_3: { cat: "world", title: "Костолом", desc: "Соберите 50 костей", target: 50, type: "bones", reward: { gold: 3000, crystal: 8 } },

  // ---------- ОСОБЫЕ ----------
  special_1: { cat: "special", title: "Воскресший", desc: "Воскреснуть 5 раз", target: 5, type: "revive", reward: { gold: 2000, crystal: 8 } },
  special_2: { cat: "special", title: "Серия побед", desc: "Победите 5 боссов подряд без поражений", target: 5, type: "winStreak", reward: { gold: 3000, crystal: 10 } },
  special_3: { cat: "special", title: "Молниеносный", desc: "Победите босса менее чем за 30 секунд", target: 1, type: "speedKill", reward: { gold: 3000, crystal: 10 } },
  special_4: { cat: "special", title: "Мощный удар", desc: "Нанесите за один удар 1 000 урона", target: 1, type: "bigHit", reward: { gold: 3000, crystal: 10 } },
  special_5: { cat: "special", title: "Без потерь", desc: "Победите босса, не используя зелье", target: 1, type: "noPotion", reward: { gold: 3000, crystal: 10 } },
  special_6: { cat: "special", hidden: true, title: "Тот самый случай", desc: "Победите босса, имея менее 10% здоровья", target: 1, type: "lowHpWin", reward: { gold: 5000, crystal: 20 } },
  special_7: { cat: "special", title: "Ежедневный игрок", desc: "Заходите в игру 7 дней подряд", target: 7, type: "loginStreak", reward: { gold: 5000, crystal: 15 } },
  special_8: { cat: "special", title: "Свиток удачи", desc: "Победите босса с золотым свитком", target: 1, type: "goldScrollWin", reward: { gold: 2500, crystal: 8 } },
  special_9: { cat: "special", title: "Сокрушительный натиск", desc: "Победите босса при множителе атаки x10+", target: 1, type: "highMultWin", reward: { gold: 3500, crystal: 12 } },
  special_10: { cat: "special", title: "Лавина урона", desc: "Нанесите 5 000+ урона за один бой", target: 1, type: "battleDamage", reward: { gold: 4000, crystal: 15 } }
};

const ACHIEVEMENT_CATEGORIES = {
  all: "ВСЕ",
  wealth: "БОГАТСТВО",
  combat: "БОИ",
  growth: "РАЗВИТИЕ",
  world: "МИР",
  special: "ОСОБЫЕ"
};

let currentAchievementFilter = "all";

function getMaxHouseLevelSafe() {
  if (typeof getHouseLevel !== "function") return player.houseLevel || 1;
  return Math.max(
    Number(getHouseLevel("tavern")) || 1,
    Number(getHouseLevel("hut")) || 1,
    Number(getHouseLevel("tavern2")) || 1
  );
}

// Текущее значение для накопительных типов (читаются прямо из player)
function getLiveProgress(type) {
  switch (type) {
    case "gold": return player.gold || 0;
    case "crystal": return player.crystal || 0;
    case "power": return player.power || 0;
    case "level": return player.level || 1;
    case "arenaRating": return player.arena?.rating || 0;
    case "house": return getMaxHouseLevelSafe();
    case "tails": return player.tails || 0;
    case "spiderLegs": return player.spiderLegs || 0;
    case "bones": return player.bones || 0;
    case "collection": {
      let done = 0;
      for (const v of Object.values(player.collections || {})) {
        if (v === "completed" || (v && typeof v === "object" && (v.completed || v.isCompleted))) {
          done++;
        }
      }
      return done;
    }
    case "loginStreak": return player.loginStreak || 0;
    default: return null; // событийный тип
  }
}

// achievementType: тип события ("boss", "talent" и т.д.). Без аргументов: проверка накопительных
function checkAchievement(achievementType = "", amountToAdd = 1) {
  if (typeof player === "undefined" || !player) return;
  if (!player.achievements || typeof player.achievements !== "object") {
    player.achievements = {};
  }

  const addNum = Number(amountToAdd);
  const delta = Number.isFinite(addNum) ? addNum : 1;
  let unlockedAny = false;

  for (const [key, data] of Object.entries(ACHIEVEMENTS_DATA)) {
    if (!player.achievements[key] || typeof player.achievements[key] !== "object") {
      player.achievements[key] = { progress: 0, completed: false };
    }
    const ach = player.achievements[key];
    if (ach.completed) {
      ach.progress = data.target;
      continue;
    }

    const live = getLiveProgress(data.type);

    if (live !== null) {
      ach.progress = Math.max(Number(ach.progress) || 0, Number(live) || 0);
    } else if (achievementType && data.type === achievementType) {
      if (data.type === "winStreak") {
        ach.progress = Math.max(Number(ach.progress) || 0, delta);
      } else {
        ach.progress = (Number(ach.progress) || 0) + delta;
      }
    }

    if (ach.progress >= data.target) {
      ach.progress = data.target;
      if (unlockAchievement(key, false)) {
        unlockedAny = true;
      }
    }
  }

  if (unlockedAny && window.gameApi && window.gameApi.renderHUD) {
    window.gameApi.renderHUD();
  }

  if (typeof savePlayer === "function") savePlayer(player);
}

function unlockAchievement(key, shouldSave = true) {
  if (typeof player === "undefined" || !player) return false;
  if (!player.achievements || typeof player.achievements !== "object") {
    player.achievements = {};
  }
  const data = ACHIEVEMENTS_DATA[key];
  if (!data) return false;
  if (!player.achievements[key]) {
    player.achievements[key] = { progress: data.target || 1, completed: false };
  }
  const ach = player.achievements[key];
  if (ach.completed) return false;

  ach.completed = true;
  ach.progress = data.target || 1;

  if (data.reward?.gold) {
    if (typeof addCurrency === "function") addCurrency("gold", data.reward.gold);
    else player.gold = (player.gold || 0) + data.reward.gold;
  }
  if (data.reward?.crystal) {
    if (typeof addCurrency === "function") addCurrency("crystal", data.reward.crystal);
    else player.crystal = (player.crystal || 0) + data.reward.crystal;
  }

  showAchievementPopup(data.title, data.desc);

  if (shouldSave) {
    if (window.gameApi && window.gameApi.renderHUD) {
      window.gameApi.renderHUD();
    }
    if (typeof savePlayer === "function") savePlayer(player);
  }
  return true;
}

function showAchievementPopup(title, desc) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerHTML = `
    <div class="ach-icon">🏆</div>
    <div class="ach-text">
      <div class="ach-title">ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!</div>
      <div class="ach-name">${title}</div>
      <div class="ach-desc">${desc}</div>
    </div>
  `;
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 100);
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 4000);
}

function renderAchievementTabs() {
  const modalContent = document.querySelector("#achievements-modal .house-window-content");
  if (!modalContent) return;

  let tabs = modalContent.querySelector(".js-achievements-tabs");
  if (!tabs) {
    tabs = document.createElement("div");
    tabs.className = "js-achievements-tabs";
    tabs.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;";
    modalContent.insertBefore(tabs, modalContent.firstChild);
  }

  tabs.innerHTML = "";
  for (const [catKey, catName] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
    const btn = document.createElement("button");
    const active = currentAchievementFilter === catKey;
    btn.textContent = catName;
    btn.style.cssText = `
      padding: 6px 12px; font-size: 12px; font-weight: bold; cursor: pointer;
      border: 2px solid ${active ? "#e5b947" : "#cbb894"};
      background: ${active ? "#fff8e1" : "#e8dcc5"};
      color: ${active ? "#b8860b" : "#5c4938"};
      border-radius: 6px;
    `;
    btn.addEventListener("click", () => {
      currentAchievementFilter = catKey;
      renderAchievementsList();
    });
    tabs.appendChild(btn);
  }
}

function renderAchievementsList() {
  const listContainer = document.querySelector(".js-achievements-list");
  if (!listContainer || typeof player === "undefined" || !player) return;

  checkAchievement(); // актуализируем накопительные перед показом
  renderAchievementTabs();
  listContainer.innerHTML = "";

  // Счётчик выполненных
  const total = Object.keys(ACHIEVEMENTS_DATA).length;
  const doneCount = Object.keys(ACHIEVEMENTS_DATA).filter(k => player.achievements?.[k]?.completed).length;
  const counter = document.createElement("div");
  counter.style.cssText = "text-align: center; font-weight: bold; color: #4a3b2c; margin-bottom: 4px;";
  counter.textContent = `Выполнено: ${doneCount} / ${total}`;
  listContainer.appendChild(counter);

  for (const [key, data] of Object.entries(ACHIEVEMENTS_DATA)) {
    if (currentAchievementFilter !== "all" && data.cat !== currentAchievementFilter) continue;

    const playerAch = player.achievements?.[key] || { progress: 0, completed: false };
    const target = data.target || 1;
    const displayProgress = playerAch.completed ? target : Math.min(target, Number(playerAch.progress) || 0);
    const progressPercent = Math.min(100, Math.floor((displayProgress / target) * 100));
    const isSecret = data.hidden && !playerAch.completed;

    const rewardParts = [];
    if (data.reward?.gold) rewardParts.push(`${data.reward.gold} золота`);
    if (data.reward?.crystal) rewardParts.push(`${data.reward.crystal} кристаллов`);
    const rewardText = rewardParts.join(" + ");

    const itemEl = document.createElement("div");
    itemEl.style.cssText = `
      background: ${playerAch.completed ? "#fff8e1" : "#e8dcc5"};
      border: 2px solid ${playerAch.completed ? "#e5b947" : "#cbb894"};
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    `;

    itemEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: ${playerAch.completed ? "#b8860b" : "#4a3b2c"}; font-size: 16px;">
          ${playerAch.completed ? "🏆 " : "🔒 "} ${isSecret ? "???" : data.title}
        </span>
        <span style="font-size: 12px; font-weight: bold; color: ${playerAch.completed ? "#2e7d32" : "#7a6652"};">
          ${playerAch.completed ? "ВЫПОЛНЕНО" : (isSecret ? "СКРЫТО" : `${displayProgress} / ${target}`)}
        </span>
      </div>
      <div style="font-size: 13px; color: #5c4938;">${isSecret ? "Тайное достижение. Условие скрыто." : data.desc}</div>
      ${isSecret ? "" : `<div style="font-size: 12px; color: #7a6652;">Награда: ${rewardText}</div>`}
      <div style="background: #d3c4a8; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px; border: 1px solid #bba988;">
        <div style="background: ${playerAch.completed ? "#4caf50" : "#e5b947"}; width: ${progressPercent}%; height: 100%; transition: width 0.3s;"></div>
      </div>
    `;

    listContainer.appendChild(itemEl);
  }
}

let achievementsUiInitialized = false;

function initAchievementsUI() {
  if (achievementsUiInitialized) return;
  const achBtn = document.getElementById("achievements-btn");
  const achModal = document.getElementById("achievements-modal");
  const closeBtn = document.querySelector(".js-achievements-close");
  const backdrop = document.querySelector(".achievements-backdrop");

  if (!achBtn && !achModal) return;
  achievementsUiInitialized = true;

  if (achBtn && achModal) {
    achBtn.addEventListener("click", () => {
      renderAchievementsList();
      achModal.classList.remove("hidden");
      achModal.style.display = "flex";
    });
  }

  const closeAchievements = () => {
    if (achModal) {
      achModal.classList.add("hidden");
      achModal.style.display = "none";
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeAchievements);
  if (backdrop) backdrop.addEventListener("click", closeAchievements);
}

window.checkAchievement = checkAchievement;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAchievementsUI);
} else {
  initAchievementsUI();
}
