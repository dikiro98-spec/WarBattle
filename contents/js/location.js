/* ========================================= */
/* LOCATION.JS (ФИНАЛ v16 - Полный)          */
/* ========================================= */

/* ---------- ЭЛЕМЕНТЫ ОКНА БОССА ---------- */
const bossModal = document.querySelector(".boss-modal");
const bossFightBtn = document.querySelector(".boss-fight-btn");
const bossPreviewHpText = document.querySelector(".js-boss-preview-hp");
const bossNameEl = document.querySelector(".boss-name");
const bossSubtitleEl = document.querySelector(".boss-modal-subtitle");

/* ---------- ЭЛЕМЕНТЫ БОЯ ---------- */
const bossBattleScreen = document.querySelector(".boss-battle-screen");
const battleCloseBtn = document.querySelector(".battle-close-btn");
const battleBossName = document.querySelector(".battle-boss-name");
const battleBossArt = document.querySelector(".battle-boss-art");

const battlePlayerHpFill = document.querySelector(".battle-player-hp-fill");
const battlePlayerHpText = document.querySelector(".battle-player-hp-text");
const battlePlayerRageFill = document.querySelector(".battle-player-rage-fill");
const battlePlayerRageText = document.querySelector(".battle-player-rage-text");
const battleBossHpFill = document.querySelector(".battle-boss-hp-fill");
const battleBossHpText = document.querySelector(".battle-boss-hp-text");
const battleTimerText = document.querySelector(".battle-timer-text");
const battleLog = document.querySelector(".battle-log");
const battlePlayerName = document.querySelector(".js-battle-player-name");

const battleBasicAttackBtn = document.querySelector(".battle-basic-attack-btn");
const battleFierceBtn = document.querySelector(".battle-fierce-btn");
const battleShieldBtn = document.querySelector(".battle-shield-btn");
const battleInvisBtn = document.querySelector(".battle-invis-btn");

const battleGrayScrollBtn = document.querySelector(".battle-item-scroll-gray");
const battleGoldScrollBtn = document.querySelector(".battle-item-scroll-gold");
const battlePotionBtn = document.querySelector(".battle-item-potion");
const grayScrollCountElement = document.querySelector(".js-gray-scroll-count");
const goldScrollCountElement = document.querySelector(".js-gold-scroll-count");
const potionCountElement = document.querySelector(".js-potion-count");

const battleDeathActions = document.querySelector(".battle-death-actions");
const battleReviveBtn = document.querySelector(".battle-revive-btn");
const battleEscapeBtn = document.querySelector(".battle-escape-btn");

/* ---------- ЭЛЕМЕНТЫ ПОБЕДЫ / ПОРАЖЕНИЯ ---------- */
const victoryScreen = document.querySelector(".boss-victory-screen");
const defeatScreen = document.querySelector(".boss-defeat-screen");
const victoryRepeatBtn = document.querySelector(".boss-repeat-fight-btn");
const victoryOkBtn = document.querySelector(".boss-victory-ok-btn");
const defeatOkBtn = document.querySelector(".defeat-ok-btn");
const myDamageValueElement = document.querySelector(".boss-my-damage-value");
const defeatDamageElement = document.querySelector(".boss-defeat-damage");
const rewardGoldElement = document.querySelector(".boss-reward-gold");
const rewardExpElement = document.querySelector(".boss-reward-exp");
const rewardTailElement = document.querySelector(".boss-reward-tail");
const dailyTrophyLeftElement = document.querySelector(".daily-trophy-left");

/* ---------- ЭЛЕМЕНТЫ ДОМИКА ---------- */
const houseModal = document.querySelector(".house-modal");
const houseCloseBtn = document.querySelector(".house-close-btn");
const houseLevelEl = document.querySelector(".js-house-level");
const houseTimerEl = document.querySelector(".js-house-timer");
const houseIncomeEl = document.querySelector(".js-house-income");
const houseNextIncomeEl = document.querySelector(".js-house-next-income");
const houseUpgradeCostEl = document.querySelector(".js-house-upgrade-cost");
const houseCollectBtn = document.querySelector(".js-house-collect");
const houseUpgradeBtn = document.querySelector(".js-house-upgrade");

/* ---------- ЭЛЕМЕНТЫ БЛОКИРОВОК ---------- */
const lockedModal = document.querySelector(".level-locked-modal");
const lockedCloseBtn = document.querySelector(".js-locked-close");
const lockedReqLevelEl = document.querySelector(".js-req-level");
const mapActionsContainer = document.querySelector(".map-actions-container");
const campaignMap = document.querySelector(".campaign-map-large");

let currentBossData = null;
let currentlyOpenNode = null;
let lastHiddenNode = null;
let currentHouseInterval = null;
let currentHouseType = "tavern";
let bossWinStreak = 0;
let arenaBattleCallbacks = null;

let battleState = {
  active: false, playerHp: 100, playerMaxHp: 100, bossHp: 30, bossMaxHp: 30,
  rage: 0, timerSeconds: 3600, timerIntervalId: null, totalDamageDealt: 0,
  grayScrollUsed: false, goldScrollUsed: false, shieldActive: false,
  dead: false, rewardsCollected: false, potionUsed: false, maxHitDealt: 0,
  turnBusy: false, counterTimeoutId: null
};

function clearBossCounterTimeout() {
  if (battleState.counterTimeoutId) {
    clearTimeout(battleState.counterTimeoutId);
    battleState.counterTimeoutId = null;
  }
}

function isArenaBattle() {
  return !!(currentBossData && currentBossData.isArena);
}

function generateMap() {
  const mapContainer = document.querySelector(".campaign-map-large");
  const fog = document.querySelector(".fog-of-war");
  if (!mapContainer) return;

  mapContainer.querySelectorAll(".location-node").forEach(n => n.remove());

  LOCATIONS_DATA.forEach(loc => {
    const btn = document.createElement("button");
    btn.className = `location-node node-${loc.number}`;
    btn.dataset.id = loc.id;
    btn.style.top = `${loc.top}px`;
    btn.style.left = `${loc.left}px`;

    const playerLevel = (typeof player !== "undefined" && player.level) ? player.level : 1;
    const reqLevel = loc.reqLevel || 1;
    const isLocked = reqLevel > playerLevel;

    if (loc.id === "riverport") {
      btn.classList.add("portal-style");
      const portalImage = loc.mapIcon || "/contents/IconsGame/but.png";
      btn.innerHTML = `
        <div class="location-portal-bg" style="background-image: url('${portalImage}');"></div>
        <div class="location-badge-content">
          <span class="location-number">${loc.number}</span>
          <span class="location-name">${loc.name}</span>
        </div>
        ${isLocked ? `<div class="location-lock">🔒</div>` : ''}
      `;
    } else {
      btn.classList.add("custom-loc-bg-parent");
      const bgImage = loc.mapIcon ? `background-image: url('${loc.mapIcon}');` : '';
      btn.innerHTML = `
        <div class="location-portal-bg custom-loc-bg" style="${bgImage}"></div>
        <div class="location-badge-content">
          <span class="location-number">${loc.number}</span>
          <span class="location-name">${loc.name}</span>
        </div>
        ${isLocked ? `<div class="location-lock">🔒</div>` : ''}
      `;
    }

    if (isLocked) btn.classList.add("locked");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isLocked) {
        if (lockedReqLevelEl) lockedReqLevelEl.textContent = reqLevel;
        if (lockedModal) lockedModal.classList.remove("hidden");
        return;
      }
      showMapActions(loc, btn);
    });

    mapContainer.insertBefore(btn, fog);
  });
}

function showMapActions(loc, nodeElement) {
  if (!mapActionsContainer) return;
  if (campaignMap && campaignMap.classList.contains("blocked")) return;

  if (currentlyOpenNode === nodeElement) {
    hideMapActions();
    return;
  }

  const hasBosses = loc.bosses && loc.bosses.length > 0;
  const hasHouse = loc.hasHouse;

  if (!hasBosses && !hasHouse) {
    alert("Эта локация в разработке!");
    return;
  }

  if (currentlyOpenNode) currentlyOpenNode.style.visibility = "visible";

  mapActionsContainer.innerHTML = "";
  mapActionsContainer.classList.remove("hidden");

  const topPos = loc.actionsTop || (loc.top - 100);
  const leftPos = loc.actionsLeft || (loc.left + 150);

  mapActionsContainer.style.top = `${topPos}px`;
  mapActionsContainer.style.left = `${leftPos}px`;

  if (hasBosses) {
    loc.bosses.forEach(boss => {
      const bossBtn = document.createElement("button");
      bossBtn.className = "map-action-btn map-boss-btn";
      bossBtn.innerHTML = `<img src="/contents/IconsGame/IconsLocation/attak1.png" alt="Босс" class="map-action-img">`;
      bossBtn.title = `Босс: ${boss.name}`;
      bossBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openBossModal(boss);
      });
      mapActionsContainer.appendChild(bossBtn);
    });
  }

  if (hasHouse) {
    const houseBtn = document.createElement("button");
    houseBtn.className = "map-action-btn map-house-btn";
    houseBtn.innerHTML = `<img src="/contents/IconsGame/IconsLocation/loc1.png" alt="Домик" class="map-action-img">`;
    houseBtn.title = `Домик`;
    houseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openHouseModal(loc.houseType || "tavern");
    });
    mapActionsContainer.appendChild(houseBtn);
  }

  nodeElement.style.visibility = "hidden";
  currentlyOpenNode = nodeElement;
  lastHiddenNode = nodeElement;
}

function hideMapActions(restoreVisibility = true) {
  if (!mapActionsContainer) return;
  mapActionsContainer.innerHTML = "";
  mapActionsContainer.classList.add("hidden");

  const isModalOpen = (houseModal && !houseModal.classList.contains("hidden"))
                   || (bossModal && !bossModal.classList.contains("hidden"));

  if (restoreVisibility && currentlyOpenNode && !isModalOpen) {
    currentlyOpenNode.style.visibility = "visible";
    currentlyOpenNode = null;
    lastHiddenNode = null;
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".location-node") && !e.target.closest(".map-action-btn")) {
    hideMapActions(true);
  }
});

if (lockedCloseBtn) lockedCloseBtn.addEventListener("click", () => lockedModal.classList.add("hidden"));
/* ========================================= */
/* ИНТЕРФЕЙС БОЯ                             */
/* ========================================= */
function setBattleLog(message) { if (battleLog) battleLog.textContent = message; }

function updateBattleBars() {
  if (battlePlayerHpFill) { const percent = (battleState.playerHp / battleState.playerMaxHp) * 100; battlePlayerHpFill.style.width = `${Math.max(0, Math.min(100, percent))}%`; }
  if (battlePlayerHpText) { battlePlayerHpText.textContent = `${Math.max(0, Math.floor(battleState.playerHp))}/${battleState.playerMaxHp}`; }
  if (battlePlayerRageFill) { const ragePercent = (battleState.rage / 10) * 100; battlePlayerRageFill.style.width = `${Math.max(0, Math.min(100, ragePercent))}%`; }
  if (battlePlayerRageText) { battlePlayerRageText.textContent = `ЯРОСТЬ ${battleState.rage}/10`; }
  if (battleBossHpFill) { const bossPercent = (battleState.bossHp / battleState.bossMaxHp) * 100; battleBossHpFill.style.width = `${Math.max(0, Math.min(100, bossPercent))}%`; }
  if (battleBossHpText) { battleBossHpText.textContent = `${Math.max(0, Math.floor(battleState.bossHp))}/${battleState.bossMaxHp}`; }
}

function updateBattleConsumablesUi() {
  if (typeof player === "undefined") return;
  if (grayScrollCountElement) grayScrollCountElement.textContent = player.inventory?.grayScroll ?? 0;
  if (goldScrollCountElement) goldScrollCountElement.textContent = player.inventory?.goldScroll ?? 0;
  if (potionCountElement) potionCountElement.textContent = player.inventory?.potion ?? 0;
  if (battleGrayScrollBtn) battleGrayScrollBtn.disabled = !player.inventory?.grayScroll || battleState.grayScrollUsed || !battleState.active || battleState.dead;
  if (battleGoldScrollBtn) battleGoldScrollBtn.disabled = !player.inventory?.goldScroll || battleState.goldScrollUsed || !battleState.active || battleState.dead;
  if (battlePotionBtn) battlePotionBtn.disabled = !player.inventory?.potion || !battleState.active || battleState.dead;
}

function isBattleInputLocked() {
  return !battleState.active || battleState.dead || Boolean(battleState.turnBusy);
}


/* ========================================= */
/* АНИМАЦИИ НАВЫКОВ/ЭКРАНОВ И ПОДСКАЗКИ      */
/* ========================================= */
function ensureBattleExtrasStyle() {
  if (document.getElementById("battle-extras-v1-style")) return;
  const style = document.createElement("style");
  style.id = "battle-extras-v1-style";
  style.textContent = `
    @keyframes skillReadyPulse {
      0%, 100% {
        box-shadow: 0 0 8px rgba(255, 212, 76, 0.55), inset 0 0 6px rgba(255, 235, 150, 0.35);
        filter: brightness(1.04);
      }
      50% {
        box-shadow: 0 0 18px rgba(255, 212, 76, 0.95), inset 0 0 10px rgba(255, 245, 190, 0.55);
        filter: brightness(1.14);
      }
    }

    .skill-ready-glow {
      animation: skillReadyPulse 1.35s ease-in-out infinite;
      border-color: #ffe07d !important;
    }

    @keyframes bossSlashShake {
      0% { transform: translate(0, 0) rotate(0deg) scale(1); }
      20% { transform: translate(-10px, -4px) rotate(-4deg) scale(1.04); }
      45% { transform: translate(10px, 3px) rotate(4deg) scale(0.98); }
      70% { transform: translate(-6px, 2px) rotate(-2deg) scale(1.02); }
      100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    }

    .boss-slash-hit {
      animation: bossSlashShake 0.38s ease-out;
    }

    @keyframes slashLineSweep {
      0% { transform: translate(-50%, -50%) rotate(-28deg) scaleX(0.2); opacity: 0; }
      35% { transform: translate(-50%, -50%) rotate(-28deg) scaleX(1.15); opacity: 1; }
      100% { transform: translate(-50%, -50%) rotate(-28deg) scaleX(1.45); opacity: 0; }
    }

    .fierce-slash-fx {
      position: fixed;
      width: 170px;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, #ff6b35 25%, #fff5b8 55%, #ff3b1f 80%, transparent);
      box-shadow: 0 0 18px #ff7b29, 0 0 32px #ff3b1f;
      pointer-events: none;
      z-index: 9998;
      animation: slashLineSweep 0.42s ease-out forwards;
    }

    @keyframes shieldAuraBurst {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
      30% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.95; }
      100% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
    }

    .shield-barrier-fx {
      position: fixed;
      width: 132px;
      height: 132px;
      border-radius: 50%;
      border: 4px solid rgba(255, 222, 102, 0.92);
      background: radial-gradient(circle, rgba(255, 215, 90, 0.28) 20%, rgba(255, 180, 30, 0.08) 68%, transparent 100%);
      box-shadow: 0 0 24px rgba(255, 212, 76, 0.8), inset 0 0 18px rgba(255, 240, 160, 0.5);
      pointer-events: none;
      z-index: 9998;
      animation: shieldAuraBurst 0.65s ease-out forwards;
    }

    @keyframes stealthPuffAnim {
      0% { transform: translate(-50%, -50%) scale(0.55); opacity: 0.9; }
      100% { transform: translate(-50%, -75%) scale(1.55); opacity: 0; }
    }

    .stealth-smoke-fx {
      position: fixed;
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(190, 215, 255, 0.55) 15%, rgba(95, 120, 175, 0.25) 55%, transparent 75%);
      filter: blur(3px);
      pointer-events: none;
      z-index: 9998;
      animation: stealthPuffAnim 0.58s ease-out forwards;
    }

    @keyframes modalPopIn {
      0% { transform: scale(0.86) translateY(14px); opacity: 0; }
      70% { transform: scale(1.03) translateY(-2px); opacity: 1; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    .battle-end-pop {
      animation: modalPopIn 0.36s cubic-bezier(0.18, 0.89, 0.32, 1.15);
    }

    .battle-dmg-preview-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 4px auto 2px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(28, 19, 10, 0.82);
      border: 1px solid rgba(229, 185, 71, 0.65);
      color: #ffe599;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }
  `;
  document.head.appendChild(style);
}

function getElementCenter(el, fallbackXRatio = 0.5, fallbackYRatio = 0.5) {
  if (el) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }
  return { x: window.innerWidth * fallbackXRatio, y: window.innerHeight * fallbackYRatio };
}

function triggerFierceStrikeFx() {
  ensureBattleExtrasStyle();
  const bossEl = document.querySelector(".battle-boss-art");
  if (bossEl) {
    bossEl.classList.remove("boss-slash-hit");
    void bossEl.offsetWidth;
    bossEl.classList.add("boss-slash-hit");
    setTimeout(() => bossEl.classList.remove("boss-slash-hit"), 420);
  }
  const pos = getElementCenter(bossEl, 0.65, 0.45);
  const slash = document.createElement("div");
  slash.className = "fierce-slash-fx";
  slash.style.left = `${Math.round(pos.x)}px`;
  slash.style.top = `${Math.round(pos.y)}px`;
  document.body.appendChild(slash);
  setTimeout(() => slash.remove(), 460);
}

function triggerShieldBlockFx() {
  ensureBattleExtrasStyle();
  const playerEl = document.querySelector(".player-actor") || document.querySelector(".battle-player-hp-fill");
  const pos = getElementCenter(playerEl, 0.35, 0.56);
  const aura = document.createElement("div");
  aura.className = "shield-barrier-fx";
  aura.style.left = `${Math.round(pos.x)}px`;
  aura.style.top = `${Math.round(pos.y)}px`;
  document.body.appendChild(aura);
  setTimeout(() => aura.remove(), 700);
}

function triggerInvisibleStrikeFx() {
  ensureBattleExtrasStyle();
  const playerEl = document.querySelector(".player-actor") || document.querySelector(".battle-player-hp-fill");
  const pos = getElementCenter(playerEl, 0.35, 0.56);
  const puff = document.createElement("div");
  puff.className = "stealth-smoke-fx";
  puff.style.left = `${Math.round(pos.x)}px`;
  puff.style.top = `${Math.round(pos.y)}px`;
  document.body.appendChild(puff);
  setTimeout(() => puff.remove(), 620);
}

function triggerEndScreenAnimation(screenEl) {
  ensureBattleExtrasStyle();
  if (!screenEl) return;
  const card = screenEl.querySelector(".boss-victory-card, .boss-defeat-card, .modal-content") || screenEl;
  card.classList.remove("battle-end-pop");
  void card.offsetWidth;
  card.classList.add("battle-end-pop");
}

function computePreviewDamage(raw) {
  let mult = 1;
  if (battleState.grayScrollUsed) mult *= 1.5;
  if (battleState.goldScrollUsed) mult *= 2;
  return Math.max(1, Math.floor((Number(raw) || 0) * mult));
}

function ensureBattlePreviewUi() {
  ensureBattleExtrasStyle();

  let previewEl = document.querySelector(".js-battle-dmg-preview");
  if (!previewEl && battleLog && battleLog.parentElement) {
    previewEl = document.createElement("div");
    previewEl.className = "js-battle-dmg-preview battle-dmg-preview-badge";
    battleLog.parentElement.insertBefore(previewEl, battleLog);
  }

  updateBattleHintsAndPreview();
}

function updateBattleHintsAndPreview() {
  const locked = isBattleInputLocked();
  const rage = Number(battleState.rage) || 0;

  if (battleFierceBtn) {
    battleFierceBtn.classList.toggle("skill-ready-glow", !locked && rage >= 3);
  }
  if (battleShieldBtn) {
    battleShieldBtn.classList.toggle("skill-ready-glow", !locked && rage >= 4);
  }
  if (battleInvisBtn) {
    battleInvisBtn.classList.toggle("skill-ready-glow", !locked && rage >= 9);
  }

  const previewEl = document.querySelector(".js-battle-dmg-preview");
  if (!previewEl || typeof getTotalDamage !== "function") return;

  const baseDmg = Number(getTotalDamage()) || 0;
  const mult = getBasicAttackMultiplier();
  const basicEst = computePreviewDamage(baseDmg * mult);

  const fierceLvl = typeof getTalentLevel === "function"
    ? getTalentLevel("fierceStrike")
    : (player?.talents?.fierceStrike || 0);
  const fierceEst = computePreviewDamage(baseDmg + fierceLvl * 5);

  const invisLvl = typeof getTalentLevel === "function"
    ? getTalentLevel("invisibleStrike")
    : (player?.talents?.invisibleStrike || 0);
  const invisEst = computePreviewDamage(baseDmg + invisLvl * 7);

  const scrollTag = (battleState.grayScrollUsed || battleState.goldScrollUsed)
    ? ` • Свитки: ${battleState.grayScrollUsed ? "x1.5" : ""}${battleState.grayScrollUsed && battleState.goldScrollUsed ? "+" : ""}${battleState.goldScrollUsed ? "x2" : ""}`
    : "";

  previewEl.textContent = `Урон: x${mult} ≈ ${basicEst} | Свирепый ≈ ${fierceEst} | Невидимый ≈ ${invisEst}${scrollTag}`;
}

function updateBattleSkillButtons() {
  const locked = isBattleInputLocked();
  if (battleBasicAttackBtn) battleBasicAttackBtn.disabled = locked;
  if (battleFierceBtn) battleFierceBtn.disabled = locked || battleState.rage < 3;
  if (battleShieldBtn) battleShieldBtn.disabled = locked || battleState.rage < 4;
  if (battleInvisBtn) battleInvisBtn.disabled = locked || battleState.rage < 9;
  updateBattleHintsAndPreview();
}

function updateBattleTimerUi() {
  if (!battleTimerText) return;
  const total = Math.max(0, battleState.timerSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  battleTimerText.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateBattleDeathUi() {
  if (!battleDeathActions) return;
  if (battleState.dead && !isArenaBattle()) battleDeathActions.classList.remove("hidden");
  else battleDeathActions.classList.add("hidden");
}

function refreshBattleUi() {
  ensureBasicAttackMultiplierControl();
  ensureBattlePreviewUi();
  updateBattleBars();
  updateBattleConsumablesUi();
  updateBattleSkillButtons();
  updateBasicAttackMultiplierUi();
  updateBattleTimerUi();
  updateBattleDeathUi();
  if (battlePlayerName && typeof player !== "undefined") { battlePlayerName.textContent = player.name || "Игрок"; }
}

function createFreshBattleState(bossData) {
  if (battleState.counterTimeoutId) {
    clearTimeout(battleState.counterTimeoutId);
  }
  const totalHealth = getTotalHealth();
  battleState = {
    active: true, playerHp: totalHealth, playerMaxHp: totalHealth,
    bossHp: bossData.maxHp, bossMaxHp: bossData.maxHp,
    rage: 10, timerSeconds: 3600, timerIntervalId: null, totalDamageDealt: 0,
    grayScrollUsed: false, goldScrollUsed: false, shieldActive: false,
    dead: false, rewardsCollected: false, potionUsed: false, maxHitDealt: 0,
    turnBusy: false, counterTimeoutId: null
  };

  if (battleBossName) battleBossName.textContent = bossData.name;
  if (battleBossArt) {
    battleBossArt.innerHTML = `<img src="${bossData.battleImage || '/contents/IconsGame/boss.png'}" class="battle-boss-img" alt="${bossData.name}">`;
  }

  if (window.characterApi && window.characterApi.renderBattleHero) {
    window.characterApi.renderBattleHero();
  }
}

function stopBattleTimer() {
  if (battleState.timerIntervalId) {
    clearInterval(battleState.timerIntervalId);
    battleState.timerIntervalId = null;
  }
}

function closeBattleScreen() {
  if (isArenaBattle()) return;

  if (bossBattleScreen) bossBattleScreen.classList.add("hidden");

  const returnBtn = document.getElementById("return-to-battle-btn");
  if (returnBtn && battleState.active) {
    returnBtn.classList.remove("hidden");
  }
}

function openBattleScreen() {
  refreshBattleUi();
  if (bossBattleScreen) bossBattleScreen.classList.remove("hidden");

  const arena = isArenaBattle();
  if (battleCloseBtn) battleCloseBtn.style.display = arena ? "none" : "";
  if (battleDeathActions && arena) battleDeathActions.classList.add("hidden");

  const returnBtn = document.getElementById("return-to-battle-btn");
  if (returnBtn) returnBtn.classList.add("hidden");
}

function startBattleTimer() {
  stopBattleTimer();
  battleState.timerIntervalId = setInterval(() => {
    if (!battleState.active) return;
    battleState.timerSeconds--;
    updateBattleTimerUi();
    if (battleState.timerSeconds <= 0) handleBattleTimeout();
  }, 1000);
}

/* ========================================= */
/* БОЕВАЯ ЛОГИКА                             */
/* ========================================= */
const BASIC_ATTACK_MULTIPLIERS = [1, 5, 10, 25];
let currentBasicAttackMultiplier = 1;
let pendingCounterMultiplier = 1;

function getBasicAttackMultiplier() {
  return BASIC_ATTACK_MULTIPLIERS.includes(currentBasicAttackMultiplier)
    ? currentBasicAttackMultiplier
    : 1;
}

function setBasicAttackMultiplier(mult) {
  if (!BASIC_ATTACK_MULTIPLIERS.includes(mult)) return;
  currentBasicAttackMultiplier = mult;
  updateBasicAttackMultiplierUi();
}

function cycleBasicAttackMultiplier() {
  const idx = BASIC_ATTACK_MULTIPLIERS.indexOf(getBasicAttackMultiplier());
  const nextMult = BASIC_ATTACK_MULTIPLIERS[(idx + 1) % BASIC_ATTACK_MULTIPLIERS.length];
  setBasicAttackMultiplier(nextMult);
}

function ensureBasicAttackMultiplierControl() {
  if (!battleBasicAttackBtn) return;

  let wrapper = battleBasicAttackBtn.parentElement;
  if (!wrapper || !wrapper.classList.contains("basic-attack-control-wrap")) {
    wrapper = document.createElement("div");
    wrapper.className = "basic-attack-control-wrap";
    wrapper.style.display = "inline-flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "4px";
    battleBasicAttackBtn.parentNode.insertBefore(wrapper, battleBasicAttackBtn);
    wrapper.appendChild(battleBasicAttackBtn);
  }

  let toggleBtn = wrapper.querySelector(".js-basic-mult-btn");
  if (!toggleBtn) {
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "js-basic-mult-btn battle-mult-toggle-btn";
    toggleBtn.title = "Выбрать множитель обычной атаки (x1, x5, x10, x25)";
    toggleBtn.style.padding = "2px 8px";
    toggleBtn.style.fontSize = "11px";
    toggleBtn.style.fontWeight = "900";
    toggleBtn.style.borderRadius = "6px";
    toggleBtn.style.border = "1.5px solid #e5b947";
    toggleBtn.style.background = "rgba(25, 18, 10, 0.88)";
    toggleBtn.style.color = "#ffd76e";
    toggleBtn.style.cursor = "pointer";
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleBasicAttackMultiplier();
    });
    wrapper.appendChild(toggleBtn);
  }

  let pickerEl = wrapper.querySelector(".js-basic-mult-picker");
  if (!pickerEl) {
    pickerEl = document.createElement("div");
    pickerEl.className = "js-basic-mult-picker hidden";
    pickerEl.style.display = "none";
    pickerEl.style.gap = "3px";
    pickerEl.style.marginTop = "2px";

    BASIC_ATTACK_MULTIPLIERS.forEach((mult) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "js-basic-mult-opt";
      optBtn.dataset.mult = String(mult);
      optBtn.textContent = `x${mult}`;
      optBtn.style.padding = "2px 6px";
      optBtn.style.fontSize = "10px";
      optBtn.style.fontWeight = "800";
      optBtn.style.borderRadius = "5px";
      optBtn.style.border = "1px solid #c49a30";
      optBtn.style.background = "#fdf5e6";
      optBtn.style.color = "#3d2c1a";
      optBtn.style.cursor = "pointer";
      optBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setBasicAttackMultiplier(mult);
        pickerEl.style.display = "none";
        pickerEl.classList.add("hidden");
      });
      pickerEl.appendChild(optBtn);
    });

    toggleBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = pickerEl.classList.contains("hidden");
      pickerEl.classList.toggle("hidden", !isHidden);
      pickerEl.style.display = isHidden ? "inline-flex" : "none";
    });

    wrapper.appendChild(pickerEl);
  }

  updateBasicAttackMultiplierUi();
}

function updateBasicAttackMultiplierUi() {
  const mult = getBasicAttackMultiplier();
  const toggleBtn = document.querySelector(".js-basic-mult-btn");
  if (toggleBtn) {
    toggleBtn.textContent = `x${mult}`;
    toggleBtn.disabled = isBattleInputLocked();
  }
  document.querySelectorAll(".js-basic-mult-opt").forEach((opt) => {
    const isActive = Number(opt.dataset.mult) === mult;
    opt.style.background = isActive ? "linear-gradient(to bottom, #f7d56d, #e5b947)" : "#fdf5e6";
    opt.style.fontWeight = isActive ? "900" : "700";
  });
}

function applyBossAttack(counterMultiplier = 1) {
  battleState.counterTimeoutId = null;
  if (!battleState.active || battleState.dead || !currentBossData) {
    battleState.turnBusy = false;
    refreshBattleUi();
    return;
  }
  const activeCounterMult = Math.max(1, Number(counterMultiplier) || 1);
  let damage = (currentBossData.damage || 0) * activeCounterMult;

  if (battleState.shieldActive) {
    const shieldLevel = typeof getTalentLevel === "function"
      ? getTalentLevel("shieldBlock")
      : (player?.talents?.shieldBlock || 0);
    const reduction = Math.max(0, shieldLevel * activeCounterMult);
    damage = Math.max(0, damage - reduction);
    battleState.shieldActive = false;
    setBattleLog(`Ты заблокировал часть удара (снижение на ${reduction}). Противник нанёс ${damage} урона${activeCounterMult > 1 ? ` (x${activeCounterMult})` : ""}.`);
  } else {
    setBattleLog(`Противник атаковал тебя и нанёс ${damage} урона${activeCounterMult > 1 ? ` (x${activeCounterMult})` : ""}.`);
  }

  battleState.playerHp -= damage;
  if (typeof showFloatingDamage === "function") {
    const playerElement = document.querySelector('.player-actor') || document.querySelector('.battle-player-hp-fill');
    showFloatingDamage(playerElement, damage, true);
  }
  if (battleState.playerHp <= 0) {
    battleState.playerHp = 0;
    battleState.turnBusy = false;
    handlePlayerDeath();
    return;
  }
  battleState.turnBusy = false;
  refreshBattleUi();
}

function applyDamageToBoss(rawDamage, logText, skipCounterAttack = false, counterMultiplier = 1) {
  if (!battleState.active || battleState.dead) return;
  clearBossCounterTimeout();
  battleState.turnBusy = true;
  updateBattleSkillButtons();

  let multiplier = 1;
  if (battleState.grayScrollUsed) multiplier *= 1.5;
  if (battleState.goldScrollUsed) multiplier *= 2;

  const finalDamage = Math.max(1, Math.floor(rawDamage * multiplier));
  battleState.bossHp -= finalDamage;
  battleState.totalDamageDealt += finalDamage;
  if (finalDamage > battleState.maxHitDealt) battleState.maxHitDealt = finalDamage;
  setBattleLog(`${logText} Нанесено ${finalDamage} урона.`);
  
  if (typeof showFloatingDamage === "function") {
    const bossElement = document.querySelector('.battle-boss-art');
    showFloatingDamage(bossElement, finalDamage, false);
  }

  if (battleState.bossHp <= 0) {
    battleState.bossHp = 0;
    battleState.turnBusy = false;
    refreshBattleUi();
    handleBattleVictory();
    return;
  }
  refreshBattleUi();
  if (!skipCounterAttack) {
    pendingCounterMultiplier = Math.max(1, Number(counterMultiplier) || 1);
    battleState.counterTimeoutId = setTimeout(() => applyBossAttack(pendingCounterMultiplier), 450);
  } else {
    battleState.turnBusy = false;
    refreshBattleUi();
  }
}

function useBasicAttack() {
  if (isBattleInputLocked()) return;
  const mult = getBasicAttackMultiplier();
  const rageGain = 1 * mult;
  battleState.rage = Math.min(10, battleState.rage + rageGain);
  const totalHit = getTotalDamage() * mult;
  const logLabel = mult > 1
    ? `Ты применил обычную атаку x${mult} (+${rageGain} ярости, ответ противника тоже x${mult}).`
    : `Ты применил обычную атаку (+${rageGain} ярости).`;
  applyDamageToBoss(totalHit, logLabel, false, mult);
}

function useFierceStrike() {
  if (isBattleInputLocked() || battleState.rage < 3) return;
  battleState.rage -= 3;
  const level = typeof getTalentLevel === "function"
    ? getTalentLevel("fierceStrike")
    : (player?.talents?.fierceStrike || 0);
  const skillBonus = level * 5;
  const dmg = getTotalDamage() + skillBonus;
  triggerFierceStrikeFx();
  applyDamageToBoss(dmg, `Ты использовал Свирепый удар (+${skillBonus} от навыка).`);
}

function useShieldBlock() {
  if (isBattleInputLocked() || battleState.rage < 4) return;
  battleState.rage -= 4;
  battleState.shieldActive = true;
  triggerShieldBlockFx();
  applyDamageToBoss(getTotalDamage(), "Ты активировал Блок щитом и нанёс базовый удар.");
}

function useInvisibleStrike() {
  if (isBattleInputLocked() || battleState.rage < 9) return;
  battleState.rage -= 9;
  const level = typeof getTalentLevel === "function"
    ? getTalentLevel("invisibleStrike")
    : (player?.talents?.invisibleStrike || 0);
  const dmg = getTotalDamage() + (level * 7);
  triggerInvisibleStrikeFx();
  applyDamageToBoss(dmg, "Ты использовал Невидимый удар (противник не бьёт в ответ).", true);
}

function useGrayScroll() { if (!battleState.active || battleState.dead || !player.inventory?.grayScroll || battleState.grayScrollUsed) return; player.inventory.grayScroll--; battleState.grayScrollUsed = true; savePlayer(player); setBattleLog("Использован серый свиток. Урон увеличен на 150%."); refreshBattleUi(); }
function useGoldScroll() { if (!battleState.active || battleState.dead || !player.inventory?.goldScroll || battleState.goldScrollUsed) return; player.inventory.goldScroll--; battleState.goldScrollUsed = true; savePlayer(player); setBattleLog("Использован золотой свиток. Урон увеличен на 200%."); refreshBattleUi(); }
function usePotion() {
  if (!battleState.active || battleState.dead || !player.inventory?.potion) return;
  const healerLevel = typeof getTalentLevel === "function"
    ? getTalentLevel("masterHealer")
    : (player?.talents?.masterHealer || 0);
  const baseHeal = Math.floor(battleState.playerMaxHp * 0.35);
  const healAmount = Math.max(1, baseHeal + (healerLevel * 3));
  player.inventory.potion--;
  battleState.potionUsed = true;
  battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + healAmount);
  savePlayer(player);
  setBattleLog(`Ты использовал колбу и восстановил ${healAmount} HP.`);
  refreshBattleUi();
}
/* ========================================= */
/* СМЕРТЬ, ПОБЕГ, ПОБЕДА, ПОРАЖЕНИЕ          */
/* ========================================= */

function finishArenaDefeat() {
  stopBattleTimer();
  battleState.active = false;
  battleState.dead = true;

  if (bossBattleScreen) bossBattleScreen.classList.add("hidden");
  const returnBtn = document.getElementById("return-to-battle-btn");
  if (returnBtn) returnBtn.classList.add("hidden");
  if (battleDeathActions) battleDeathActions.classList.add("hidden");

  const cb = arenaBattleCallbacks;
  arenaBattleCallbacks = null;
  bossWinStreak = 0;
  if (cb && typeof cb.onLose === "function") cb.onLose();
}


/* ========================================= */
/* ФИКС И РАСШИРЕНИЕ ТРЕКИНГА ДОСТИЖЕНИЙ      */
/* ========================================= */
function safeCheckAchievement(type, value = 1) {
  try {
    if (typeof player !== "undefined" && player) {
      if (!player.achievementStats || typeof player.achievementStats !== "object") {
        player.achievementStats = {};
      }
      if (type === "winStreak") {
        player.achievementStats.winStreak = Math.max(player.achievementStats.winStreak || 0, Number(value) || 0);
      } else {
        player.achievementStats[type] = (player.achievementStats[type] || 0) + (Number(value) || 1);
      }
    }
    if (typeof window.checkAchievement === "function") {
      window.checkAchievement(type, value);
    } else if (typeof checkAchievement === "function") {
      checkAchievement(type, value);
    }
  } catch (err) {
    console.warn("Achievement check warning:", err);
  }
}

function handlePlayerDeath() {
  battleState.dead = true;

  if (isArenaBattle()) {
    setBattleLog("Ты пал в бою на арене...");
    refreshBattleUi();
    setTimeout(finishArenaDefeat, 600);
    return;
  }

  setBattleLog("Ты пал в бою. Можно воскреснуть или сбежать.");
  refreshBattleUi();
}

function triggerReviveGoldenEffect() {
  if (!document.getElementById("revive-golden-fx-style")) {
    const style = document.createElement("style");
    style.id = "revive-golden-fx-style";
    style.textContent = `
      @keyframes reviveRingBurst {
        0% {
          transform: translate(-50%, -50%) scale(0.35) rotate(0deg);
          opacity: 0;
          filter: drop-shadow(0 0 8px rgba(255, 215, 90, 0.5));
        }
        25% {
          transform: translate(-50%, -50%) scale(1.1) rotate(12deg);
          opacity: 1;
          filter: drop-shadow(0 0 24px rgba(255, 215, 90, 0.95));
        }
        70% {
          transform: translate(-50%, -50%) scale(1.38) rotate(22deg);
          opacity: 0.9;
          filter: drop-shadow(0 0 34px rgba(255, 195, 50, 0.85));
        }
        100% {
          transform: translate(-50%, -50%) scale(1.75) rotate(30deg);
          opacity: 0;
          filter: drop-shadow(0 0 42px rgba(255, 215, 90, 0));
        }
      }

      @keyframes reviveFlashScreen {
        0% { opacity: 0; }
        20% { opacity: 0.36; }
        100% { opacity: 0; }
      }

      @keyframes reviveSparkFly {
        0% {
          transform: translate(-50%, -50%) scale(0.4);
          opacity: 1;
        }
        100% {
          transform: translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, -80px))) scale(1.25);
          opacity: 0;
        }
      }

      .revive-fx-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }

      .revive-fx-flash {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--fx-x, 50%) var(--fx-y, 50%), rgba(255, 224, 115, 0.68), rgba(255, 175, 25, 0.16) 38%, transparent 72%);
        animation: reviveFlashScreen 0.9s ease-out forwards;
      }

      .revive-fx-emblem {
        position: absolute;
        top: var(--fx-y, 50%);
        left: var(--fx-x, 50%);
        width: 136px;
        height: 136px;
        object-fit: contain;
        border-radius: 50%;
        animation: reviveRingBurst 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .revive-fx-spark {
        position: absolute;
        top: var(--fx-y, 50%);
        left: var(--fx-x, 50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: radial-gradient(circle, #fffbe0 0%, #ffd24c 55%, rgba(255, 165, 0, 0) 100%);
        box-shadow: 0 0 11px #ffd24c;
        animation: reviveSparkFly 0.85s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }

  const targetBtn = battleReviveBtn || document.querySelector(".battle-revive-btn");
  let centerX = window.innerWidth * 0.5;
  let centerY = window.innerHeight * 0.5;

  if (targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    }
  }

  const host = (bossBattleScreen && !bossBattleScreen.classList.contains("hidden"))
    ? bossBattleScreen
    : document.body;

  const fxLayer = document.createElement("div");
  fxLayer.className = "revive-fx-overlay";
  fxLayer.style.setProperty("--fx-x", `${Math.round(centerX)}px`);
  fxLayer.style.setProperty("--fx-y", `${Math.round(centerY)}px`);

  const flash = document.createElement("div");
  flash.className = "revive-fx-flash";
  fxLayer.appendChild(flash);

  const emblem = document.createElement("img");
  emblem.className = "revive-fx-emblem";
  emblem.src = "/contents/IconsGame/revive_cross.png";
  emblem.alt = "Воскрешение";
  emblem.onerror = () => {
    emblem.remove();
  };
  fxLayer.appendChild(emblem);

  const sparkCount = 16;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 * i) / sparkCount;
    const dist = 52 + (i % 3) * 26;
    const tx = Math.round(Math.cos(angle) * dist);
    const ty = Math.round(Math.sin(angle) * dist);

    const spark = document.createElement("span");
    spark.className = "revive-fx-spark";
    spark.style.setProperty("--tx", `${tx}px`);
    spark.style.setProperty("--ty", `${ty}px`);
    spark.style.animationDelay = `${(i % 4) * 0.035}s`;
    fxLayer.appendChild(spark);
  }

  host.appendChild(fxLayer);
  setTimeout(() => fxLayer.remove(), 1100);
}

function revivePlayer() {
  if (isArenaBattle()) return;
  if (!battleState.dead) return;
  if (player.crystal < 5) { alert("Недостаточно кристаллов"); return; }
  player.crystal -= 5;
  safeCheckAchievement("revive", 1);
  battleState.dead = false;
  battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + 100);
  savePlayer(player);
  triggerReviveGoldenEffect();
  setBattleLog(`Ты воскрес и получил 100 HP.`);
  refreshBattleUi();
  if (window.gameApi?.renderHUD) window.gameApi.renderHUD();
}

function escapeBattle() {
  if (isArenaBattle()) return;
  if (!battleState.dead) return;
  if (player.crystal < 10) { alert("Недостаточно кристаллов"); return; }
  player.crystal -= 10;
  bossWinStreak = 0;
  setBattleLog("Ты сбежал из боя.");
  savePlayer(player);
  closeBattleScreen();
  clearBossCounterTimeout();
  battleState.turnBusy = false;
  battleState.active = false;
  arenaBattleCallbacks = null;
  stopBattleTimer();
  if (window.gameApi?.renderHUD) window.gameApi.renderHUD();
}

function handleBattleTimeout() {
  if (!battleState.active) return;

  if (isArenaBattle()) {
    finishArenaDefeat();
    return;
  }

  clearBossCounterTimeout();
  battleState.turnBusy = false;
  stopBattleTimer();
  battleState.active = false;
  battleState.dead = false;
  bossWinStreak = 0;
  arenaBattleCallbacks = null;

  if (bossBattleScreen) bossBattleScreen.classList.add("hidden");

  if (defeatScreen && defeatDamageElement) {
    defeatDamageElement.textContent = battleState.totalDamageDealt;
    defeatScreen.classList.remove("hidden");
    triggerEndScreenAnimation(defeatScreen);
  }

  const returnBtn = document.getElementById("return-to-battle-btn");
  if (returnBtn) returnBtn.classList.add("hidden");
}

function handleBattleVictory() {
  clearBossCounterTimeout();
  battleState.turnBusy = false;
  stopBattleTimer();
  battleState.active = false;

  if (isArenaBattle()) {
    if (bossBattleScreen) bossBattleScreen.classList.add("hidden");
    const returnBtnA = document.getElementById("return-to-battle-btn");
    if (returnBtnA) returnBtnA.classList.add("hidden");

    const cb = arenaBattleCallbacks;
    arenaBattleCallbacks = null;
    safeCheckAchievement("arenaWin", 1);
    if (cb && typeof cb.onWin === "function") cb.onWin();
    return;
  }

  collectBattleRewards();

  bossWinStreak++;
  const elapsed = 3600 - battleState.timerSeconds;
  const hpPercent = (battleState.playerHp / battleState.playerMaxHp) * 100;

  safeCheckAchievement("boss", 1);
  safeCheckAchievement("winStreak", bossWinStreak);
  if (elapsed <= 30) safeCheckAchievement("speedKill", 1);
  if (battleState.maxHitDealt >= 1000) safeCheckAchievement("bigHit", 1);
  if (!battleState.potionUsed) safeCheckAchievement("noPotion", 1);
  if (hpPercent < 10) safeCheckAchievement("lowHpWin", 1);
  if (battleState.totalDamageDealt >= 5000) safeCheckAchievement("battleDamage", 1);
  if (battleState.goldScrollUsed) safeCheckAchievement("goldScrollWin", 1);
  if (getBasicAttackMultiplier() >= 10) safeCheckAchievement("highMultWin", 1);

  if (bossBattleScreen) bossBattleScreen.classList.add("hidden");
  if (victoryScreen) {
    victoryScreen.classList.remove("hidden");
    triggerEndScreenAnimation(victoryScreen);
  }

  const returnBtn = document.getElementById("return-to-battle-btn");
  if (returnBtn) returnBtn.classList.add("hidden");
}

function collectBattleRewards() {
  if (battleState.rewardsCollected || !currentBossData) return;

  const limit = currentBossData.dailyLimit || 30;
  const remaining = getBossRemainingTails(currentBossData.id, limit);
  const isLimitReached = remaining <= 0;

  const dropsRow = document.querySelector(".boss-victory-drops-row");
  const warningBlock = document.querySelector(".js-limit-warning");

  let droppedTailAmount = 0;

  if (isLimitReached) {
    if (dropsRow) dropsRow.classList.add("hidden");
    if (warningBlock) warningBlock.classList.remove("hidden");
  } else {
    if (dropsRow) dropsRow.classList.remove("hidden");
    if (warningBlock) warningBlock.classList.add("hidden");

    const earnedGold = Number(currentBossData.rewardGold) || 0;
    const earnedExp = Number(currentBossData.rewardExp) || 0;
    addCurrency("gold", earnedGold);
    addExperience(earnedExp);
    battleState.lastVictorySummary = { gold: earnedGold, exp: earnedExp };

    if (!player.bossDaily) player.bossDaily = { counts: {}, lastUpdate: Date.now() };
    if (!player.bossDaily.counts) player.bossDaily.counts = {};
    player.bossDaily.counts[currentBossData.id] = (player.bossDaily.counts[currentBossData.id] || 0) + 1;
    const dropChance = typeof currentBossData.trophyChance === "number"
      ? currentBossData.trophyChance
      : 0.5;

    if (currentBossData.rewardTail > 0 && Math.random() < dropChance) {
      if (currentBossData.id === "spider-king") {
        droppedTailAmount = 1;
        player.poisonVials = (player.poisonVials || 0) + 1;
      } else if (currentBossData.id === "riverport-rat" || currentBossData.id === "north-black-rat") {
        droppedTailAmount = currentBossData.rewardTail;
        player.tails = (player.tails || 0) + droppedTailAmount;
      } else if (currentBossData.id === "spider-boss-1") {
        droppedTailAmount = currentBossData.rewardTail;
        player.spiderLegs = (player.spiderLegs || 0) + droppedTailAmount;
      } else if (currentBossData.id === "skeleton-warrior") {
        droppedTailAmount = currentBossData.rewardTail;
        player.bones = (player.bones || 0) + droppedTailAmount;
      } else if (currentBossData.id === "swamp-creature") {
        droppedTailAmount = currentBossData.rewardTail;
        player.swampPoison = (player.swampPoison || 0) + droppedTailAmount;
      } else if (currentBossData.id === "witch") {
        droppedTailAmount = currentBossData.rewardTail;
        player.witchRoot = (player.witchRoot || 0) + droppedTailAmount;
      } else if (currentBossData.id === "lizard-king") {
        droppedTailAmount = currentBossData.rewardTail;
        player.scales = (player.scales || 0) + droppedTailAmount;
      } else {
        droppedTailAmount = currentBossData.rewardTail;
      }
    }

    // 🔴 ДРОП КОЛЛЕКЦИЙ (части копятся и могут выпадать повторно)
    const collectionMap = {
      "riverport-rat": { id: "rat_collection", parts: ["rat_part_1", "rat_part_2", "rat_part_3", "rat_part_4", "rat_part_5"] },
      "spider-boss-1": { id: "spider_collection", parts: ["spider_part_1", "spider_part_2", "spider_part_3", "spider_part_4", "spider_part_5"] },

      // 🔴 НОВЫЕ ЭТАПЫ ГРОБНИЦЫ
      "bt_stage_1": { id: "battalion_weapon_collection", parts: ["bw_part_1"] },
      "bt_stage_2": { id: "battalion_weapon_collection", parts: ["bw_part_2"] },
      "bt_stage_3": { id: "battalion_weapon_collection", parts: ["bw_part_3"] },
      "bt_stage_4": { id: "battalion_weapon_collection", parts: ["bw_part_4"] },
      "bt_stage_5": { id: "battalion_weapon_collection", parts: ["bw_part_5"] },

      // 🔴 ЭТАПЫ ГРОБНИЦЫ ОРАКУЛА
      "oracle_stage_1": { id: "oracle_collection", parts: ["oracle_part_1"] },
      "oracle_stage_2": { id: "oracle_collection", parts: ["oracle_part_2"] },
      "oracle_stage_3": { id: "oracle_collection", parts: ["oracle_part_3"] },
      "oracle_stage_4": { id: "oracle_collection", parts: ["oracle_part_4"] },
      "oracle_stage_5": { id: "oracle_collection", parts: ["oracle_part_5"] }
    };
if (currentBossData.id.startsWith("oracle_stage_") && window.OracleTomb && typeof window.OracleTomb.onVictory === "function") {
  window.OracleTomb.onVictory();
}

    if (collectionMap[currentBossData.id]) {
      const col = collectionMap[currentBossData.id];
      if (typeof player !== "undefined") {
        if (!player.collections) player.collections = {};
        if (typeof player.collections[col.id] !== "object" || player.collections[col.id] === null) {
          player.collections[col.id] = {};
        }
        // 🔴 НАГРАДА ЗА 5-ГО БОССА (10 кристаллов)
        if (currentBossData.id === "bt_stage_5" || currentBossData.id === "oracle_stage_5") {
          addCurrency("crystal", 10);
        }
        // 🔴 ВЫДАЁМ КОНКРЕТНУЮ ЧАСТЬ (а не случайную), если это гробница
        if (currentBossData.id.startsWith("bt_stage_") || currentBossData.id.startsWith("oracle_stage_")) {
          const partId = col.parts[0];
          player.collections[col.id][partId] = (player.collections[col.id][partId] || 0) + 1;
        } else {
          // Для старых боссов (Крысюк, Паук) — случайная часть
          if (Math.random() < 0.5) {
            const randomPartId = col.parts[Math.floor(Math.random() * col.parts.length)];
            player.collections[col.id][randomPartId] = (player.collections[col.id][randomPartId] || 0) + 1;
          }
        }
      }
    }
  }

  battleState.rewardsCollected = true;
  savePlayer(player);

  const tailDropItemEl = document.querySelector(".js-drop-tail");
  if (!isLimitReached) {
    if (myDamageValueElement) myDamageValueElement.textContent = battleState.totalDamageDealt;
    if (rewardGoldElement) rewardGoldElement.textContent = currentBossData.rewardGold;
    if (rewardExpElement) rewardExpElement.textContent = currentBossData.rewardExp;

    if (droppedTailAmount > 0) {
      if (tailDropItemEl) tailDropItemEl.classList.remove("hidden");
      if (rewardTailElement) rewardTailElement.textContent = droppedTailAmount;
    } else {
      if (tailDropItemEl) tailDropItemEl.classList.add("hidden");
      if (rewardTailElement) rewardTailElement.textContent = "0";
    }
  } else if (tailDropItemEl) {
    tailDropItemEl.classList.add("hidden");
  }

  if (dailyTrophyLeftElement) dailyTrophyLeftElement.textContent = remaining;

  updateBossVictoryWarriors();

  // 🔴 ОБНОВЛЯЕМ КАРТОЧКУ ОРАКУЛА ПОСЛЕ ПОБЕДЫ
  if (currentBossData.id.startsWith("oracle_stage_") && window.OracleTomb && typeof window.OracleTomb.render === "function") {
    window.OracleTomb.render();
  }

  if (window.gameApi && window.gameApi.renderHUD) window.gameApi.renderHUD();
}


/* ========================================= */
/* ЛУЧШИЕ ВОИНЫ (ЛОКАЛЬНО + ГОТОВО К СЕТИ) */
/* ========================================= */
function renderBossTopWarriors(entries = []) {
  const bottomBlock = document.querySelector(".boss-victory-bottom");
  if (!bottomBlock) return;

  const titleHtml = `<div class="boss-victory-panel-title">ЛУЧШИЕ ВОИНЫ</div>`;
  const sorted = [...entries].sort((a, b) => (b.damage || 0) - (a.damage || 0));

  const rowsHtml = sorted
    .map((entry, idx) => {
      const safeName = String(entry.name || "Игрок");
      const safeDmg = Number(entry.damage || 0).toLocaleString("ru-RU");
      const selfClass = entry.isSelf ? " is-self" : "";
      return `<div class="boss-victory-warrior${selfClass}"><span>${idx + 1}. ${safeName}</span><strong>${safeDmg}</strong></div>`;
    })
    .join("");

  bottomBlock.innerHTML = titleHtml + rowsHtml;
}

function updateBossVictoryWarriors() {
  const myName = (typeof player !== "undefined" && player.name) ? player.name : "Игрок";
  const myDamage = battleState.totalDamageDealt || 0;

  // В будущем сюда можно подставлять массив игроков с сервера ([{ name, damage, isSelf }])
  const externalWarriors = Array.isArray(window.currentBossMultiplayerWarriors)
    ? window.currentBossMultiplayerWarriors
    : [];

  const combined = [
    ...externalWarriors.filter((w) => w && w.name !== myName),
    { name: myName, damage: myDamage, isSelf: true }
  ];

  renderBossTopWarriors(combined);
}


/* ========================================= */
/* ВСПЛЫВАЮЩИЕ ЧИСЛА ЗОЛОТА И ОПЫТА ПОБЕДЫ   */
/* ========================================= */
function ensureVictoryFloatingStyle() {
  if (document.getElementById("victory-floating-rewards-style")) return;
  const style = document.createElement("style");
  style.id = "victory-floating-rewards-style";
  style.textContent = `
    @keyframes victoryFloatUp {
      0% {
        transform: translate(-50%, 0) scale(0.75);
        opacity: 0;
      }
      18% {
        transform: translate(-50%, -14px) scale(1.08);
        opacity: 1;
      }
      75% {
        transform: translate(-50%, -56px) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -82px) scale(0.92);
        opacity: 0;
      }
    }

    .victory-float-badge {
      position: fixed;
      z-index: 10001;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.3px;
      white-space: nowrap;
      animation: victoryFloatUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .victory-float-gold {
      color: #fff3b0;
      background: linear-gradient(135deg, rgba(64, 38, 8, 0.94), rgba(132, 78, 12, 0.94));
      border: 2px solid #ffd44c;
      box-shadow: 0 4px 16px rgba(255, 196, 36, 0.55), inset 0 0 8px rgba(255, 240, 150, 0.35);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
    }

    .victory-float-exp {
      color: #dff7ff;
      background: linear-gradient(135deg, rgba(16, 42, 68, 0.94), rgba(28, 82, 128, 0.94));
      border: 2px solid #7cd4ff;
      box-shadow: 0 4px 16px rgba(82, 196, 255, 0.45), inset 0 0 8px rgba(190, 238, 255, 0.3);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
    }
  `;
  document.head.appendChild(style);
}

function spawnVictoryFloatingPill(text, iconSrc, fallbackEmoji, x, y, extraClass, delayMs = 0) {
  ensureVictoryFloatingStyle();
  const run = () => {
    const el = document.createElement("div");
    el.className = `victory-float-badge ${extraClass}`;
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;

    const imgHtml = iconSrc
      ? `<img src="${iconSrc}" alt="" style="width:18px;height:18px;object-fit:contain;" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';"><span style="display:none;">${fallbackEmoji}</span>`
      : `<span>${fallbackEmoji}</span>`;

    el.innerHTML = `${imgHtml}<span>${text}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1420);
  };

  if (delayMs > 0) setTimeout(run, delayMs);
  else run();
}

function triggerVictoryFloatingRewards(triggerEl) {
  const summary = battleState.lastVictorySummary;
  if (!summary) return;
  battleState.lastVictorySummary = null;

  const goldAmt = Number(summary.gold) || 0;
  const expAmt = Number(summary.exp) || 0;
  if (goldAmt <= 0 && expAmt <= 0) return;

  let baseX = window.innerWidth * 0.5;
  let baseY = window.innerHeight * 0.65;

  if (triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      baseX = rect.left + rect.width / 2;
      baseY = Math.max(70, rect.top - 10);
    }
  }

  const clampedX = Math.max(85, Math.min(window.innerWidth - 85, baseX));

  if (goldAmt > 0) {
    spawnVictoryFloatingPill(
      `+${goldAmt.toLocaleString("ru-RU")} золота`,
      "/contents/IconsGame/hud-right/gold-res.png",
      "🪙",
      clampedX - 48,
      baseY,
      "victory-float-gold",
      0
    );
  }

  if (expAmt > 0) {
    spawnVictoryFloatingPill(
      `+${expAmt.toLocaleString("ru-RU")} опыта`,
      null,
      "✨",
      clampedX + 54,
      baseY - 12,
      "victory-float-exp",
      110
    );
  }
}

function closeVictoryScreen() {
  if (victoryScreen) victoryScreen.classList.add("hidden");
}

function repeatBossBattle() {
  if (!spendStamina(currentBossData.staminaCost || 1)) { alert("Недостаточно выносливости"); return; }
  closeVictoryScreen();
  createFreshBattleState(currentBossData);
  openBattleScreen();
  setBattleLog("Бой начался.");
  startBattleTimer();
}

function startBossBattle() {
  if (!currentBossData) return;
  if (!spendStamina(currentBossData.staminaCost || 1)) { alert("Недостаточно выносливости"); return; }
  closeBossModal();
  createFreshBattleState(currentBossData);
  openBattleScreen();
  setBattleLog(`Бой с ${currentBossData.name} начался.`);
  startBattleTimer();
}

function closeBossModal() {
  if (bossModal) bossModal.classList.add("hidden");
  if (campaignMap) campaignMap.classList.remove("blocked");
  if (lastHiddenNode) {
    lastHiddenNode.style.visibility = "visible";
    lastHiddenNode = null;
    currentlyOpenNode = null;
  }
}

function openBossModal(bossData) {
  hideMapActions(false);
  if (campaignMap) campaignMap.classList.add("blocked");

  currentBossData = bossData;

  if (bossNameEl) bossNameEl.textContent = bossData.name.toUpperCase();
  if (bossPreviewHpText) bossPreviewHpText.textContent = `${bossData.maxHp} / ${bossData.maxHp}`;
  if (bossSubtitleEl) bossSubtitleEl.textContent = "ЛОКАЦИЯ";

  const bossImgEl = document.querySelector(".boss-image");
  if (bossImgEl) {
    bossImgEl.src = bossData.battleImage || "/contents/IconsGame/boss.png";
    bossImgEl.alt = bossData.name;
  }

  const damageEl = document.querySelector(".js-boss-damage");
  const expEl = document.querySelector(".js-boss-reward-exp");
  const tailEl = document.querySelector(".js-boss-reward-tail");
  const iconEl = document.querySelector(".js-boss-reward-icon");
  const goldEl = document.querySelector(".js-boss-reward-gold");
  const staminaCostEl = document.querySelector(".js-boss-stamina-cost");

  if (damageEl) damageEl.textContent = bossData.damage;
  if (expEl) expEl.textContent = bossData.rewardExp;
  if (goldEl) goldEl.textContent = bossData.rewardGold;
  if (staminaCostEl) staminaCostEl.textContent = bossData.staminaCost || 1;

  if (tailEl && iconEl) {
    tailEl.textContent = bossData.rewardTail;
    if (bossData.id === "spider-boss-1") iconEl.textContent = "🕷️";
    else if (bossData.id === "spider-king") iconEl.textContent = "🧪";
    else if (bossData.id === "skeleton-warrior") iconEl.textContent = "🦴";
    else if (bossData.id === "swamp-creature") iconEl.textContent = "☠️";
    else if (bossData.id === "witch") iconEl.textContent = "🌿";
    else if (bossData.id === "lizard-king") iconEl.textContent = "🐊";
    else iconEl.textContent = "🦎";
  }

  updateBossLimitUI(bossData);

  if (window.bossTimerInterval) clearInterval(window.bossTimerInterval);
  window.bossTimerInterval = setInterval(() => updateBossLimitUI(bossData), 1000);

  if (bossModal) bossModal.classList.remove("hidden");
}

function updateBossLimitUI(bossData) {
  const remainingTails = getBossRemainingTails(bossData.id, bossData.dailyLimit || 30);
  const limit = bossData.dailyLimit || 30;

  const trophyTextEls = document.querySelectorAll(".js-boss-trophy-text");
  const trophyFillEls = document.querySelectorAll(".js-boss-trophy-fill");
  const resetTimeEls = document.querySelectorAll(".js-boss-reset-time");

  trophyTextEls.forEach(el => el.textContent = `${remainingTails} / ${limit}`);
  trophyFillEls.forEach(el => el.style.width = `${(remainingTails / limit) * 100}%`);

  if (resetTimeEls.length > 0 && typeof player !== "undefined" && player.bossDaily) {
    const now = Date.now();
    const lastUpdate = player.bossDaily.lastUpdate || now;
    const oneHour = 60 * 60 * 1000;
    const nextUpdate = lastUpdate + oneHour;
    const diff = nextUpdate - now;

    resetTimeEls.forEach(el => {
      if (remainingTails >= limit) {
        el.textContent = "ЛИМИТ ПОЛНЫЙ";
        el.style.color = "#55e65a";
      } else if (diff > 0) {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        el.textContent = `+1 ПОПЫТКА ЧЕРЕЗ: ${mins} мин ${secs} сек`;
        el.style.color = "#aaa";
      } else {
        el.textContent = "ВОССТАНОВЛЕНИЕ...";
        el.style.color = "#ffd76e";
      }
    });
  }
}

/* ========================================= */
/* ЛОГИКА ДОМИКА                             */
/* ========================================= */

/* ========================================= */
/* КОНФИГ ИКОНОК И ОФОРМЛЕНИЯ ДОМИКОВ        */
/* ========================================= */
const HOUSE_UI_CONFIG = {
  tavern: {
    title: "МАГИЧЕСКАЯ ЛАВКА",
    artImage: "/contents/IconsGame/IconsLocation/Maglavka.jpg",
    rewardIcon: "/contents/IconsGame/hud-right/gold-res.png",
    nextIcon: "/contents/IconsGame/hud-right/gold-res.png",
    resourceIcon: "🦎"
  },
  hut: {
    title: "ХИЖИНА ОТШЕЛЬНИКА",
    artImage: "/contents/IconsGame/IconsLocation/loc2.jpg",
    rewardIcon: "/contents/IconsGame/HPbutel.png",
    nextIcon: "/contents/IconsGame/HPbutel.png",
    resourceIcon: "🧪"
  },
  tavern2: {
    title: "ТАВЕРНА СЕВЕРНОГО РИВЕРПОРТА",
    artImage: "/contents/IconsGame/IconsLocation/loc4.jpg",
    rewardIcon: "/contents/IconsGame/hud-right/silver-res.png",
    nextIcon: "/contents/IconsGame/hud-right/silver-res.png",
    resourceIcon: "🕷️"
  }
};

function getHouseUiConfig(houseType = "tavern") {
  const base = HOUSE_UI_CONFIG[houseType] || HOUSE_UI_CONFIG.tavern;
  const custom = (typeof window !== "undefined" && window.HOUSE_CUSTOM_ICONS && window.HOUSE_CUSTOM_ICONS[houseType]) || {};
  return { ...base, ...custom };
}

function findHouseArtElement() {
  if (!houseModal) return null;
  return (
    houseModal.querySelector(".js-house-art, .house-art-img, .house-banner-img, .house-icon-img, .house-image") ||
    houseModal.querySelector(".house-art img, .house-icon img, .house-banner img") ||
    null
  );
}

function syncHouseArtImage(houseType, artSrc) {
  if (!houseModal || !artSrc) return;

  let artEl = findHouseArtElement();
  if (artEl) {
    artEl.src = artSrc;
    artEl.style.display = "block";
    artEl.style.maxWidth = "175px";
    artEl.style.maxHeight = "155px";
    artEl.style.width = "auto";
    artEl.style.height = "auto";
    artEl.style.objectFit = "contain";
    artEl.style.margin = "0 auto";
    artEl.style.borderRadius = "12px";
    return;
  }

  const content = houseModal.querySelector(".house-window-content") || houseModal.querySelector(".modal-content") || houseModal;
  artEl = document.createElement("img");
  artEl.className = "js-house-art";
  artEl.alt = "Иконка домика";
  artEl.style.cssText = `
    display: block;
    width: 148px;
    height: 148px;
    max-width: 175px;
    max-height: 155px;
    object-fit: contain;
    margin: 6px auto 8px;
    border-radius: 14px;
    border: 2px solid #e5b947;
    background: rgba(24, 16, 9, 0.72);
    padding: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  `;
  artEl.src = artSrc;
  if (content.firstChild) {
    content.insertBefore(artEl, content.firstChild);
  } else {
    content.appendChild(artEl);
  }
}

function resetHouseModalScroll() {
  if (!houseModal) return;
  houseModal.scrollTop = 0;
  houseModal.querySelectorAll("*").forEach((el) => {
    if (el.scrollTop > 0) el.scrollTop = 0;
  });
}

function openHouseModal(houseType = "tavern") {
  currentHouseType = houseType;
  if (currentlyOpenNode) lastHiddenNode = currentlyOpenNode;
  hideMapActions(false);
  if (campaignMap) campaignMap.classList.add("blocked");

  const cfg = getHouseUiConfig(houseType);
  const titleEl = document.querySelector(".js-house-title");
  if (titleEl) {
    titleEl.textContent = cfg.title;
  }

  if (houseModal) houseModal.classList.remove("hidden");
  syncHouseArtImage(houseType, cfg.artImage);
  resetHouseModalScroll();

  refreshHouseUi();
  if (currentHouseInterval) clearInterval(currentHouseInterval);
  currentHouseInterval = setInterval(refreshHouseUi, 1000);
}

function closeHouseModal() {
  const modalEl = houseModal || document.querySelector(".house-modal");
  if (modalEl) modalEl.classList.add("hidden");
  if (currentHouseInterval) {
    clearInterval(currentHouseInterval);
    currentHouseInterval = null;
  }
  const mapEl = campaignMap || document.querySelector(".campaign-map-large");
  if (mapEl) mapEl.classList.remove("blocked");
  if (lastHiddenNode) {
    lastHiddenNode.style.visibility = "visible";
    lastHiddenNode = null;
    currentlyOpenNode = null;
  }
  document.querySelectorAll(".location-node").forEach((node) => {
    if (node.style.visibility === "hidden") {
      node.style.visibility = "visible";
    }
  });
}

function refreshHouseUi() {
  if (typeof player === "undefined") return;

  if (houseLevelEl) houseLevelEl.textContent = getHouseLevel(currentHouseType);
  if (houseIncomeEl) houseIncomeEl.textContent = `+${getHouseIncome(currentHouseType)}`;

  let incomeByLevel = currentHouseType === "hut" ? { 1: 1 } : { 1: 50, 2: 100, 3: 170, 4: 260, 5: 400, 6: 500, 7: 600, 8: 700, 9: 800, 10: 1000 };
  const nextLevel = getHouseLevel(currentHouseType) + 1;
  if (houseNextIncomeEl) houseNextIncomeEl.textContent = `+${incomeByLevel[nextLevel] || getHouseIncome(currentHouseType)}`;
  if (houseUpgradeCostEl) houseUpgradeCostEl.textContent = `${getHouseUpgradeTailCost(currentHouseType)}`;

  const cfg = getHouseUiConfig(currentHouseType);
  const rewardIconEl = document.querySelector(".js-house-reward-icon");
  const nextIconEl = document.querySelector(".js-house-next-icon");

  if (rewardIconEl && cfg.rewardIcon) rewardIconEl.src = cfg.rewardIcon;
  if (nextIconEl && cfg.nextIcon) nextIconEl.src = cfg.nextIcon;

  syncHouseArtImage(currentHouseType, cfg.artImage);

  const resourceIconEl = document.querySelector(".js-house-resource-icon");
  if (resourceIconEl && cfg.resourceIcon) {
    if (typeof cfg.resourceIcon === "string" && (cfg.resourceIcon.includes("/") || cfg.resourceIcon.endsWith(".png") || cfg.resourceIcon.endsWith(".jpg") || cfg.resourceIcon.endsWith(".webp"))) {
      resourceIconEl.innerHTML = `<img src="${cfg.resourceIcon}" alt="" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;">`;
    } else {
      resourceIconEl.textContent = cfg.resourceIcon;
    }
  }

  if (houseTimerEl) {
    if (canCollectHouseSilver(currentHouseType)) {
      houseTimerEl.textContent = "ГОТОВО";
      houseTimerEl.style.color = "#55e65a";
    } else {
      houseTimerEl.textContent = formatTimeFromMs(getTimeUntilHouseCollect(currentHouseType));
      houseTimerEl.style.color = "#d32f2f";
    }
  }

  if (houseCollectBtn) houseCollectBtn.disabled = !canCollectHouseSilver(currentHouseType);
  if (houseUpgradeBtn) houseUpgradeBtn.disabled = !canUpgradeHouse(currentHouseType);
}

/* ========================================= */
/* ПРИВЯЗКА СОБЫТИЙ И ЗАПУСК                 */
/* ========================================= */
if (bossFightBtn) bossFightBtn.addEventListener("click", startBossBattle);
if (battleCloseBtn) battleCloseBtn.addEventListener("click", closeBattleScreen);
if (battleBasicAttackBtn) battleBasicAttackBtn.addEventListener("click", useBasicAttack);
if (battleFierceBtn) battleFierceBtn.addEventListener("click", useFierceStrike);
if (battleShieldBtn) battleShieldBtn.addEventListener("click", useShieldBlock);
if (battleInvisBtn) battleInvisBtn.addEventListener("click", useInvisibleStrike);
if (battleGrayScrollBtn) battleGrayScrollBtn.addEventListener("click", useGrayScroll);
if (battleGoldScrollBtn) battleGoldScrollBtn.addEventListener("click", useGoldScroll);
if (battlePotionBtn) battlePotionBtn.addEventListener("click", usePotion);
if (battleReviveBtn) battleReviveBtn.addEventListener("click", revivePlayer);
if (battleEscapeBtn) battleEscapeBtn.addEventListener("click", escapeBattle);
if (victoryRepeatBtn) {
  victoryRepeatBtn.addEventListener("click", () => {
    triggerVictoryFloatingRewards(victoryRepeatBtn);
    repeatBossBattle();
  });
}
if (victoryOkBtn) {
  victoryOkBtn.addEventListener("click", () => {
    triggerVictoryFloatingRewards(victoryOkBtn);
    closeVictoryScreen();
  });
}

if (defeatOkBtn) {
  defeatOkBtn.addEventListener("click", () => {
    if (defeatScreen) defeatScreen.classList.add("hidden");
  });
}

const returnBtn = document.getElementById("return-to-battle-btn");
if (returnBtn) {
  returnBtn.addEventListener("click", openBattleScreen);
}

document.addEventListener("click", (e) => {
  const closeTrigger = e.target.closest(".house-close-btn, .house-close-btn-new, .house-modal-backdrop");
  if (closeTrigger) {
    e.preventDefault();
    e.stopPropagation();
    closeHouseModal();
  }
});

if (houseCollectBtn) {
  houseCollectBtn.addEventListener("click", () => {
    const income = collectHouseSilver(currentHouseType);
    if (income !== false) {
      let msg = `Вы забрали ${income} `;
      if (currentHouseType === "hut") msg += "колб!";
      else if (currentHouseType === "tavern2") msg += "серебра!";
      else msg += "золота!";

      alert(msg);
      safeCheckAchievement("houseCollect", 1);
      refreshHouseUi();
      if (window.gameApi && window.gameApi.renderHUD) window.gameApi.renderHUD();
    }
  });
}

if (houseUpgradeBtn) {
  houseUpgradeBtn.addEventListener("click", () => {
    if (canUpgradeHouse(currentHouseType)) {
      upgradeHouse(currentHouseType);
      alert("Домик улучшен!");
      refreshHouseUi();
      if (window.gameApi && window.gameApi.renderHUD) window.gameApi.renderHUD();
    }
  });
}

if (bossModal) {
  bossModal.addEventListener("click", (e) => {
    if (e.target === bossModal) closeBossModal();
  });
}
const bossModalCloseBtn = document.querySelector(".boss-modal-close");
if (bossModalCloseBtn) bossModalCloseBtn.addEventListener("click", closeBossModal);

window.addEventListener("DOMContentLoaded", () => {
  generateMap();
});

window.locationApi = {
  refreshMap: generateMap
};

console.log("Location.js успешно загружен (v16 - Полный и рабочий).");
/* ========================================= */
/* ЗАПУСК БОЯ НА АРЕНЕ                       */
/* ========================================= */
window.startArenaBattleViaBoss = function(opponent, callbacks) {
  if (typeof player === "undefined" || !opponent) return;

  // Создаем "фейкового босса" на основе противника с арены
  const bossData = {
    id: "arena_bot_" + Date.now(),
    name: opponent.name,
    maxHp: opponent.maxHp,
    damage: opponent.damage,
    rewardGold: 0, 
    rewardExp: 0,
    rewardTail: 0,
    dailyLimit: 9999,
    staminaCost: 0, 
    battleImage: "/contents/IconsGame/boss.png",
    isArena: true // 🔴 ВАЖНО: флаг, что это арена
  };

  currentBossData = bossData;
  arenaBattleCallbacks = callbacks; 
  
  document.querySelector(".arena-screen")?.classList.add("hidden");
  
  createFreshBattleState(bossData);
  openBattleScreen();
  setBattleLog(`Бой на арене с ${opponent.name} начался!`);
  startBattleTimer();
};
