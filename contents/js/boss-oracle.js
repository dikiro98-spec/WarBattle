/* ============================================================
   BOSS-ORACLE.JS — Гробница оракула (v6 — светлая тема)
   Изолированный модуль: не трогает locations-data.js
   Требует: utils.js (getTotalDamage, getTotalHealth,
   getBossRemainingTails), location.js (openBossModal, spendStamina)
   Подключение: <script src="js/boss-oracle.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     1. ДАННЫЕ ГРОБНИЦЫ
     ============================================================ */
  const ORACLE_TOMB = {
    id: "oracle-tomb",
    name: "Гробница оракула",
    reqLevel: 12,
    collectionId: "oracle_collection",
    stages: [
      {
        id: "oracle_stage_1", name: "Служитель Оракула",
        maxHp: 500, damage: 18,
        rewardGold: 150, rewardExp: 120, rewardCrystal: 0, rewardTail: 0,
        dailyLimit: 10, staminaCost: 2,
        battleImage: "/contents/IconsGame/boss.png",
        isOracle: true
      },
      {
        id: "oracle_stage_2", name: "Страж Видений",
        maxHp: 1500, damage: 30,
        rewardGold: 300, rewardExp: 240, rewardCrystal: 0, rewardTail: 0,
        dailyLimit: 10, staminaCost: 3,
        battleImage: "/contents/IconsGame/boss.png",
        isOracle: true
      },
      {
        id: "oracle_stage_3", name: "Хранитель Пророчеств",
        maxHp: 4000, damage: 50,
        rewardGold: 600, rewardExp: 480, rewardCrystal: 0, rewardTail: 0,
        dailyLimit: 8, staminaCost: 4,
        battleImage: "/contents/IconsGame/boss.png",
        isOracle: true
      },
      {
        id: "oracle_stage_4", name: "Жрец Тумана",
        maxHp: 10000, damage: 80,
        rewardGold: 1200, rewardExp: 900, rewardCrystal: 0, rewardTail: 0,
        dailyLimit: 5, staminaCost: 5,
        battleImage: "/contents/IconsGame/boss.png",
        isOracle: true
      },
      {
        id: "oracle_stage_5", name: "Оракул",
        maxHp: 25000, damage: 130,
        rewardGold: 5000, rewardExp: 1800, rewardCrystal: 10, rewardTail: 0,
        dailyLimit: 1, staminaCost: 6,
        battleImage: "/contents/IconsGame/boss.png",
        isOracle: true
      }
    ]
  };

  /* Кулдаун между стражами: 3 часа */
  const ORACLE_COOLDOWN_MS = 3 * 60 * 60 * 1000;

  /* ============================================================
     2. МОСТ К ИГРЕ
     ============================================================ */
  function getPlayer() {
    return (typeof player !== "undefined") ? player : (window.player || null);
  }

  function save() {
    try {
      if (typeof savePlayer === "function" && getPlayer()) savePlayer(getPlayer());
    } catch (e) {}
  }

  /* ---------- ВИДИМЫЙ ТОСТ (светлая тема) ---------- */
  function toast(msg) {
    try {
      if (typeof showToast === "function") { showToast(msg); return; }
    } catch (e) {}

    let t = document.getElementById("oracle-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "oracle-toast";
      t.style.cssText =
        "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:10001;" +
        "padding:10px 18px;border:2px solid #e5b947;border-radius:10px;" +
        "background:#f4ead5;color:#5a4a3a;font-size:14px;font-weight:600;" +
        "box-shadow:0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 2px #fff;opacity:0;transition:opacity .2s;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, 2500);
  }

  /* ---------- ВЫНОСЛИВОСТЬ ---------- */
  function oracleSpendStamina(n) {
    const p = getPlayer(); if (!p) return true;
    try {
      if (typeof spendStamina === "function") return spendStamina(n) !== false;
    } catch (e) {}
    if ((p.stamina || 0) < n) { toast("Не хватает выносливости: нужно " + n); return false; }
    p.stamina -= n; save();
    return true;
  }

  /* ============================================================
     3. ПРОГРЕСС ЭТАПОВ — живёт в player.oracleTomb
     ============================================================ */
  function getTombState() {
    const p = getPlayer();
    if (!p) return { stage: 1, nextAttackTime: 0 };

    if (!p.oracleTomb) {
      /* Разовая миграция: если игрок уже собрал части по старой системе —
         начинаем с соответствующего этапа, а не с первого */
      let stage = 1;
      try {
        const col = p.collections && p.collections[ORACLE_TOMB.collectionId];
        if (col) {
          let done = 0;
          for (let i = 1; i <= ORACLE_TOMB.stages.length; i++) {
            if (col["oracle_part_" + i] > 0) done++;
            else break;
          }
          stage = Math.min(done + 1, ORACLE_TOMB.stages.length);
        }
      } catch (e) {}
      p.oracleTomb = { stage: stage, nextAttackTime: 0 };
      save();
    }
    return p.oracleTomb;
  }

  function getProgress() {
    return Math.max(0, getTombState().stage - 1);
  }

  /* Кулдаун */
  function isOracleAttackReady() {
    return Date.now() >= (getTombState().nextAttackTime || 0);
  }

  function oracleTimeLeft() {
    const left = (getTombState().nextAttackTime || 0) - Date.now();
    if (left <= 0) return "";
    const total = Math.floor(left / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  /* Вызывается ПОСЛЕ ПОБЕДЫ над текущим стражем:
     следующий этап + кулдаун 3 часа. При поражении НЕ вызывается. */
  function advanceOracleStage() {
    const st = getTombState();
    st.stage = st.stage >= ORACLE_TOMB.stages.length ? 1 : st.stage + 1;
    st.nextAttackTime = Date.now() + ORACLE_COOLDOWN_MS;
    save();
    try { renderOracleCard(); } catch (e) {}
  }

  function grantStagePart(stageNumber) {
    // Нужно только для запасной боёвки: в основном пути часть выдаёт
    // collectBattleRewards в location.js (oracle_stage_N в collectionMap)
    const p = getPlayer(); if (!p) return;
    if (!p.collections) p.collections = {};
    if (!p.collections[ORACLE_TOMB.collectionId]) p.collections[ORACLE_TOMB.collectionId] = {};
    p.collections[ORACLE_TOMB.collectionId]["oracle_part_" + stageNumber] =
      (p.collections[ORACLE_TOMB.collectionId]["oracle_part_" + stageNumber] || 0) + 1;
    save();
  }

  /* ---------- ЛИМИТЫ ПОБЕД (только счётчик, без хвостов!) ---------- */
  function getRemaining(stage) {
    try {
      if (typeof getBossRemainingTails === "function") {
        return getBossRemainingTails(stage.id, stage.dailyLimit);
      }
    } catch (e) {}
    return stage.dailyLimit;
  }

  function registerKill(stage) {
    const p = getPlayer(); if (!p) return;
    if (!p.bossDaily) p.bossDaily = { counts: {}, lastUpdate: Date.now() };
    if (!p.bossDaily.counts) p.bossDaily.counts = {};
    p.bossDaily.counts[stage.id] = (p.bossDaily.counts[stage.id] || 0) + 1;
    save();
  }

  /* ============================================================
     4. ОКНО: ПОКАЗЫВАЕМ ТОЛЬКО ТЕКУЩЕГО СТРАЖА
     ============================================================ */
  let overlay = null;

  function buildOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "oracle-overlay";
    overlay.className = "oracle-overlay hidden";

    overlay.innerHTML = `
      <div class="oracle-window">
        <div class="oracle-header">
          <div class="oracle-title">🔮 Гробница оракула</div>
          <button class="oracle-close" type="button">✕</button>
        </div>

        <div class="oracle-banner">
          <div class="oracle-sub">Стражи открываются по одному. Следующий будет готов через 3 часа после победы</div>
        </div>

        <div class="oracle-progress"><span class="oracle-progress-text">Этап 1 / 5</span></div>

        <div class="oracle-stages"></div>

        <div class="oracle-footer">
          <div class="oracle-final-hint hidden">За победу над Оракулом: 💎 10 кристаллов</div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector(".oracle-close").addEventListener("click", closeOracleTomb);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeOracleTomb(); });

    return overlay;
  }

  /* Обновление кнопки: текст/доступность по кулдауну и лимиту */
  function updateOracleButton(btn, stage, levelOk, limitOver, ready) {
    if (!btn) return;
    if (limitOver) {
      btn.disabled = true;
      btn.textContent = "Лимит";
    } else if (!ready) {
      btn.disabled = true;
      btn.textContent = "ЧЕРЕЗ " + oracleTimeLeft();
    } else if (!levelOk) {
      btn.disabled = true;
      btn.textContent = "Ур. " + ORACLE_TOMB.reqLevel;
    } else {
      btn.disabled = false;
      btn.textContent = "В БОЙ";
    }
  }

  /* Секундный таймер кнопки: тикает, пока окно открыто */
  let stageBtnTimer = null;
  function startButtonTimer() {
    stopButtonTimer();
    stageBtnTimer = setInterval(function () {
      if (!overlay || overlay.classList.contains("hidden")) return;
      const btn = overlay.querySelector(".oracle-stages .oracle-fight-btn");
      if (!btn) return;
      if (isOracleAttackReady()) {
        stopButtonTimer();
        renderStages();
        return;
      }
      btn.textContent = "ЧЕРЕЗ " + oracleTimeLeft();
    }, 1000);
  }
  function stopButtonTimer() {
    if (stageBtnTimer) { clearInterval(stageBtnTimer); stageBtnTimer = null; }
  }

  function renderStages() {
    const p = getPlayer();
    const st = getTombState();
    const stageNumber = st.stage;
    const stage = ORACLE_TOMB.stages[stageNumber - 1];
    if (!stage) return;

    const box = overlay.querySelector(".oracle-stages");
    box.innerHTML = "";

    const levelOk = (p && (p.level || 1) >= ORACLE_TOMB.reqLevel);
    const remaining = getRemaining(stage);
    const limitOver = remaining <= 0;
    const ready = isOracleAttackReady();

    const row = document.createElement("div");
    row.className = "oracle-stage current";

    row.innerHTML = `
      <div class="oracle-stage-img" style="background-image: url('${stage.battleImage}')"></div>
      <div class="oracle-stage-body">
        <div class="oracle-stage-name">${stageNumber === 5 ? "👑 " : ""}${stage.name}</div>
        <div class="oracle-stage-stats">
          ❤️ ${stage.maxHp} · ⚔️ ${stage.damage} · 💰 ${stage.rewardGold} · ✨ ${stage.rewardExp}${stage.rewardCrystal ? " · 💎 " + stage.rewardCrystal : ""}
        </div>
        <div class="oracle-stage-req">Выносливость: ${stage.staminaCost} · Осталось побед сегодня: ${remaining}</div>
      </div>
      <button class="oracle-fight-btn" type="button"></button>`;

    const fightBtn = row.querySelector(".oracle-fight-btn");
    updateOracleButton(fightBtn, stage, levelOk, limitOver, ready);

    if (ready && levelOk && !limitOver) {
      fightBtn.addEventListener("click", function () {
        startOracleBattle(stageNumber);
      });
    }

    box.appendChild(row);

    overlay.querySelector(".oracle-progress-text").textContent = "Этап " + stageNumber + " / 5";
    overlay.querySelector(".oracle-final-hint").classList.toggle("hidden", stageNumber !== 5);

    if (!ready) startButtonTimer(); else stopButtonTimer();
  }

  /* ============================================================
     5. ЗАПУСК БОЯ — через родной движок игры
     ============================================================ */
  function startOracleBattle(stageNumber) {
    const st = getTombState();

    /* Биться можно только с ТЕКУЩИМ стражем */
    if (stageNumber !== st.stage) { renderStages(); return; }

    const stage = ORACLE_TOMB.stages[stageNumber - 1];
    if (!stage) return;

    const p = getPlayer();
    if (!p || (p.level || 1) < ORACLE_TOMB.reqLevel) {
      toast("Гробница оракула откроется на " + ORACLE_TOMB.reqLevel + "-м уровне");
      return;
    }

    if (!isOracleAttackReady()) {
      toast("Силы стража восстанавливаются: " + oracleTimeLeft());
      return;
    }

    if (getRemaining(stage) <= 0) { toast("Лимит побед над этим стражем исчерпан"); return; }

    // ОСНОВНОЙ ПУТЬ: родная модалка босса → «В БОЙ» → бой → победа →
    // collectBattleRewards (золото, опыт, счётчик лимита, часть коллекции)
    // и window.OracleTomb.onVictory() — смена стража + кулдаун.
    // Выносливость здесь НЕ списываем: её спишет startBossBattle.
    if (typeof openBossModal === "function") {
      openBossModal(stage);
      closeOracleTomb();
      return;
    }

    console.warn("[Оракул] location.js не загрузился — включаю запасную боевку");

    // ЗАПАСНОЙ ПУТЬ: своя мини-боёвка
    if (!oracleSpendStamina(stage.staminaCost)) return;
    openOracleBattle(stageNumber);
  }

  /* ============================================================
     5а. ЗАПАСНАЯ МИНИ-БОЁВКА
     ============================================================ */
  let battleOverlay = null;
  let ob = null;

  function calcPlayerDamage() {
    try { return Math.max(1, Math.round(getTotalDamage())); } catch (e) { return 10; }
  }
  function calcPlayerMaxHp() {
    try { return Math.max(1, Math.round(getTotalHealth())); } catch (e) { return 100; }
  }

  function buildBattleOverlay() {
    if (battleOverlay) return battleOverlay;

    battleOverlay = document.createElement("div");
    battleOverlay.id = "oracle-battle-overlay";
    battleOverlay.className = "oracle-overlay hidden";

    battleOverlay.innerHTML = `
      <div class="oracle-window oracle-battle-window">
        <div class="oracle-header">
          <div class="oracle-title" id="ob-boss-name">Бой</div>
        </div>

        <div class="ob-fighters">
          <div class="ob-fighter">
            <div class="ob-fighter-label">Вы (ур. <span id="ob-player-level">1</span>)</div>
            <div class="ob-hp-bar">
              <div class="ob-hp-fill player" id="ob-player-hp"></div>
              <span class="ob-hp-text" id="ob-player-hp-text"></span>
            </div>
          </div>
          <div class="ob-vs">⚔️</div>
          <div class="ob-fighter">
            <div class="ob-fighter-label" id="ob-boss-label">Босс</div>
            <div class="ob-hp-bar">
              <div class="ob-hp-fill boss" id="ob-boss-hp"></div>
              <span class="ob-hp-text" id="ob-boss-hp-text"></span>
            </div>
          </div>
        </div>

        <div class="ob-log" id="ob-log"></div>

        <div class="ob-actions">
          <button class="oracle-fight-btn ob-attack" id="ob-attack-btn" type="button">УДАРИТЬ</button>
          <button class="ob-retreat" id="ob-retreat-btn" type="button">Отступить</button>
        </div>
      </div>`;

    document.body.appendChild(battleOverlay);

    battleOverlay.querySelector("#ob-retreat-btn").addEventListener("click", obEndBattle);

    return battleOverlay;
  }

  function obLog(text) {
    const log = battleOverlay.querySelector("#ob-log");
    const line = document.createElement("div");
    line.className = "ob-log-line";
    line.textContent = text;
    log.prepend(line);
    while (log.children.length > 8) log.removeChild(log.lastChild);
  }

  function openOracleBattle(stageNumber) {
    const stage = ORACLE_TOMB.stages[stageNumber - 1];
    if (!stage) return;

    ob = {
      stage: stage,
      stageNumber: stageNumber,
      bossHp: stage.maxHp,
      playerMaxHp: calcPlayerMaxHp(),
      playerHp: calcPlayerMaxHp(),
      playerDamage: calcPlayerDamage(),
      over: false
    };

    buildBattleOverlay().classList.remove("hidden");
    overlay.classList.add("hidden");

    battleOverlay.querySelector("#ob-boss-name").textContent = stage.name;
    battleOverlay.querySelector("#ob-boss-label").textContent = stage.name;
    battleOverlay.querySelector("#ob-player-level").textContent =
      (getPlayer() && getPlayer().level) || 1;
    battleOverlay.querySelector("#ob-log").innerHTML = "";

    const btn = battleOverlay.querySelector("#ob-attack-btn");
    btn.disabled = false;
    btn.textContent = "УДАРИТЬ";
    btn.onclick = obPlayerTurn;

    obRenderBars();
    obLog(stage.name + " преграждает путь! Бейте первым.");
  }

  function obRenderBars() {
    battleOverlay.querySelector("#ob-player-hp").style.width =
      Math.max(0, (ob.playerHp / ob.playerMaxHp) * 100) + "%";
    battleOverlay.querySelector("#ob-boss-hp").style.width =
      Math.max(0, (ob.bossHp / ob.stage.maxHp) * 100) + "%";
    battleOverlay.querySelector("#ob-player-hp-text").textContent =
      Math.max(0, ob.playerHp) + " / " + ob.playerMaxHp;
    battleOverlay.querySelector("#ob-boss-hp-text").textContent =
      Math.max(0, ob.bossHp) + " / " + ob.stage.maxHp;
  }

  function obPlayerTurn() {
    if (ob.over) return;

    const miss = Math.random() < 0.10;
    if (miss) {
      obLog("Вы промахнулись!");
    } else {
      let dmg = Math.round(ob.playerDamage * (0.8 + Math.random() * 0.4));
      const crit = Math.random() < 0.15;
      if (crit) dmg = Math.round(dmg * 2);
      ob.bossHp -= dmg;
      obLog((crit ? "КРИТ! " : "") + "Вы нанесли " + dmg + " урона");
      try { if (typeof showFloatingDamage === "function") {
        showFloatingDamage(battleOverlay.querySelector("#ob-boss-hp"), dmg, false);
      } } catch (e) {}
    }

    obRenderBars();
    if (ob.bossHp <= 0) { obFinish(true); return; }

    setTimeout(function () {
      if (ob.over) return;
      const bd = Math.round(ob.stage.damage * (0.8 + Math.random() * 0.4));
      ob.playerHp -= bd;
      obLog(ob.stage.name + " бьёт вас на " + bd);
      obRenderBars();
      try { if (typeof showFloatingDamage === "function") {
        showFloatingDamage(battleOverlay.querySelector("#ob-player-hp"), bd, true);
      } } catch (e) {}
      if (ob.playerHp <= 0) { obFinish(false); return; }
    }, 450);
  }

  function obFinish(won) {
    ob.over = true;
    const stage = ob.stage;

    const btn = battleOverlay.querySelector("#ob-attack-btn");
    btn.onclick = obEndBattle;

    if (won) {
      const p = getPlayer();
      if (p) {
        p.gold = (p.gold || 0) + stage.rewardGold;
        p.experience = (p.experience || 0) + stage.rewardExp;
        if (stage.rewardCrystal) p.crystal = (p.crystal || 0) + stage.rewardCrystal;
      }
      grantStagePart(ob.stageNumber);
      registerKill(stage);
      /* ПОБЕДА = следующий страж + кулдаун 3 часа */
      advanceOracleStage();

      const crystalPart = stage.rewardCrystal ? " и 💎 " + stage.rewardCrystal + " кристаллов" : "";
      obLog("🏆 Победа! Награда: 💰 " + stage.rewardGold + ", ✨ " + stage.rewardExp + crystalPart);
      btn.textContent = "ЗАБРАТЬ НАГРАДУ";
    } else {
      obLog("💀 Вы пали. Страж восстановил силы — усильте персонажа и попробуйте снова.");
      btn.textContent = "ЗАКРЫТЬ";
    }
    save();
  }

  function obEndBattle() {
    if (battleOverlay) battleOverlay.classList.add("hidden");
    ob = null;
    overlay.classList.remove("hidden");
    renderStages();
    renderOracleCard();
    save();
  }

  /* ============================================================
     6. КАРТОЧКА НА ЭКРАНЕ ПРИКЛЮЧЕНИЙ (по текущему этапу)
     ============================================================ */
  function renderOracleCard() {
    const card = document.querySelector('[data-location="oracle-tomb"]');
    if (!card) return;

    const p = getPlayer();
    const st = getTombState();
    const levelOk = (p && (p.level || 1) >= ORACLE_TOMB.reqLevel);

    for (let i = 1; i <= 5; i++) {
      const stageEl = card.querySelector('[data-stage="' + i + '"]');
      if (!stageEl) continue;

      stageEl.classList.remove("done", "current", "needed");
      if (i < st.stage) {
        stageEl.classList.add("done");
      } else if (i === st.stage) {
        stageEl.classList.add("current");
      } else {
        stageEl.classList.add("needed");
      }
    }

    const valueEl = card.querySelector(".adv-reward-value");
    if (valueEl) valueEl.textContent = "Этап " + st.stage + " / 5";

    const reqEl = card.querySelector(".adv-req-level");
    if (reqEl) reqEl.textContent = ORACLE_TOMB.reqLevel;

    const btn = card.querySelector(".adv-enter-btn");
    if (btn) {
      if (!levelOk) {
        btn.textContent = "Нужен " + ORACLE_TOMB.reqLevel + "-й уровень";
      } else {
        btn.textContent = "Войти: этап " + st.stage;
      }
    }
  }

  /* ============================================================
     7. ОТКРЫТИЕ / ЗАКРЫТИЕ ОКНА
     ============================================================ */
  function openOracleTomb() {
    const p = getPlayer();
    if (!p || (p.level || 1) < ORACLE_TOMB.reqLevel) {
      toast("Гробница оракула откроется на " + ORACLE_TOMB.reqLevel + "-м уровне");
      return;
    }
    buildOverlay().classList.remove("hidden");
    renderStages();
    renderOracleCard();
  }

  function closeOracleTomb() {
    if (overlay) overlay.classList.add("hidden");
    stopButtonTimer();
  }

  /* ============================================================
     8. СТИЛИ (светлая тема — как кузница и гильдия)
     ============================================================ */
  const style = document.createElement("style");
  style.textContent = `
    /* --- Окно гробницы: светлая тема --- */
    .oracle-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .oracle-overlay.hidden { display: none; }

    .oracle-window {
      width: 100%; max-width: 420px; max-height: 85vh;
      overflow-y: auto;
      background: #f4ead5;
      border: 4px solid #e5b947;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 2px #fff;
      color: #5a4a3a;
      font-family: inherit;
      position: relative;
      box-sizing: border-box;
    }
    .oracle-window::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#d4c4a8 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
      pointer-events: none;
    }

    .oracle-header {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: center;
      padding-top: 8px;
    }
    .oracle-title {
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      padding: 5px 36px;
      border-radius: 0 0 20px 20px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
      font-size: 18px;
      color: #fff;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
      text-transform: uppercase;
    }
    .oracle-close {
      position: absolute;
      right: 10px;
      top: 12px;
      background: #d32f2f;
      border: 2px solid #f44336;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      padding: 2px 10px;
      cursor: pointer;
      box-shadow: 0 3px 0 #8b1e1e;
      transition: all 0.1s;
    }
    .oracle-close:active { transform: translateY(3px); box-shadow: none; }

    .oracle-banner { position: relative; z-index: 1; padding: 12px 14px 4px; text-align: center; }
    .oracle-sub { font-size: 12px; color: #8a7a6a; font-weight: 600; }

    .oracle-progress {
      position: relative; z-index: 1;
      margin: 10px 14px; padding: 8px;
      background: #fdf5e6;
      border: 1px solid #c8b08a;
      border-radius: 8px; text-align: center;
      font-weight: bold; font-size: 14px; color: #5a4a3a;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
    }

    .oracle-stages {
      position: relative; z-index: 1;
      padding: 0 14px 10px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .oracle-stage {
      display: flex; align-items: center; gap: 10px;
      background: #fdf5e6;
      border: 2px solid #c8b08a; border-radius: 10px;
      padding: 10px;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
    }
    .oracle-stage.current {
      border-color: #e5b947;
      box-shadow: 0 3px 0 #b08825, inset 0 0 10px rgba(0, 0, 0, 0.03);
    }
    .oracle-stage.locked { opacity: 0.5; }

    .oracle-stage-img {
      width: 56px; height: 56px; flex-shrink: 0;
      border-radius: 8px;
      background-size: cover; background-position: center;
      background-color: #fff9ed;
      border: 1px solid #c8b08a;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
    }
    .oracle-stage-body { flex: 1; min-width: 0; }
    .oracle-stage-name { font-weight: 600; font-size: 14px; color: #5a4a3a; text-transform: uppercase; letter-spacing: 0.5px; }
    .oracle-stage-stats { font-size: 12px; color: #8a7a6a; margin-top: 2px; }
    .oracle-stage-req { font-size: 11px; color: #8a7a6a; margin-top: 2px; }

    .oracle-fight-btn {
      padding: 8px 14px;
      background: linear-gradient(to bottom, #f7d56d, #e5b947);
      border: 2px solid #c49a30; border-radius: 8px;
      color: #5a4a3a; font-weight: bold; font-size: 12px;
      text-transform: uppercase; cursor: pointer;
      box-shadow: 0 3px 0 #b08825, inset 0 2px 0 rgba(255, 255, 255, 0.5);
      transition: all 0.1s;
      white-space: nowrap;
    }
    .oracle-fight-btn:active {
      transform: translateY(3px);
      box-shadow: 0 0 0 #b08825, inset 0 2px 0 rgba(255, 255, 255, 0.5);
    }
    .oracle-fight-btn:disabled {
      background: #ccc; color: #888; border-color: #aaa;
      box-shadow: none; cursor: not-allowed;
      transform: none;
    }

    .oracle-footer { position: relative; z-index: 1; padding: 6px 14px 14px; text-align: center; }
    .oracle-final-hint { font-size: 13px; color: #b8860b; font-weight: 600; }
    .oracle-footer .hidden { display: none; }

    /* --- Запасной боевой экран (светлая тема) --- */
    .oracle-battle-window { max-width: 460px; }

    .ob-fighters { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; padding: 16px 14px 4px; }
    .ob-fighter { flex: 1; min-width: 0; }
    .ob-fighter-label { font-size: 12px; color: #8a7a6a; font-weight: 600; margin-bottom: 4px; }
    .ob-vs { font-size: 18px; }

    .ob-hp-bar {
      position: relative;
      height: 18px; border-radius: 9px;
      background: rgba(0,0,0,0.35);
      overflow: hidden;
      border: 1px solid #c8b08a;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    .ob-hp-fill { height: 100%; width: 100%; border-radius: 8px; transition: width 0.25s ease; }
    .ob-hp-fill.player { background: linear-gradient(90deg, #3d8b3d, #56c856); }
    .ob-hp-fill.boss   { background: linear-gradient(90deg, #8b2a2a, #d05050); }
    .ob-hp-text {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; color: #fff;
      text-shadow: 0 1px 2px #000;
    }

    .ob-log {
      position: relative; z-index: 1;
      height: 110px; overflow-y: auto;
      margin: 10px 14px; padding: 8px;
      background: #fdf5e6;
      border: 1px solid #c8b08a; border-radius: 8px;
      font-size: 12px; line-height: 1.5;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
    }
    .ob-log-line { color: #8a7a6a; }
    .ob-log-line:first-child { color: #5a4a3a; font-weight: bold; }

    .ob-actions { position: relative; z-index: 1; display: flex; gap: 10px; align-items: center; padding: 4px 14px 14px; }
    .ob-attack { flex: 1; font-size: 14px; }
    .ob-retreat {
      padding: 8px 14px;
      background: #fff9ed;
      border: 2px solid #c8b08a; border-radius: 8px;
      color: #8a7a6a; font-weight: 600; font-size: 12px;
      text-transform: uppercase; cursor: pointer;
      box-shadow: 0 3px 0 #c8b08a;
      transition: all 0.1s;
    }
    .ob-retreat:active { transform: translateY(3px); box-shadow: none; }
  `;
  document.head.appendChild(style);

  /* ============================================================
     9. ЗАПУСК: делегирование кликов + живая карточка
     ============================================================ */
  function refreshCard() { try { renderOracleCard(); } catch (e) {} }

  document.addEventListener("click", function (e) {
    const inCard = e.target.closest('[data-location="oracle-tomb"]');
    if (!inCard) return;
    const advScreen = document.querySelector(".adventures-screen");
    if (advScreen && advScreen.classList.contains("hidden")) return;
    e.preventDefault();
    openOracleTomb();
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshCard);
  } else {
    refreshCard();
  }
  setInterval(refreshCard, 1000);

  /* Наружу: collectBattleRewards вызывает onVictory() после победы,
     консоль — open/close/состояние */
  window.OracleTomb = {
    open: openOracleTomb,
    close: closeOracleTomb,
    getProgress: getProgress,
    render: renderOracleCard,
    /* Хук для основного пути боя: вызывается из collectBattleRewards */
    onVictory: function () {
      advanceOracleStage();
      try { if (overlay && !overlay.classList.contains("hidden")) renderStages(); } catch (e) {}
    }
  };
})();
