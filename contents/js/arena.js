/* ========================================= */
/* ARENA.JS — АРЕНА (бой через систему боссов) */
/* ========================================= */

const ARENA_NAMES_POOL = [
  "Новичок Оруженосец", "Наемник Шторма", "Ветеран Кровавой Луны",
  "Элитный Страж Бездны", "Рыцарь Пепельных Земель", "Чемпион Арены", "Повелитель Теней"
];

let currentArenaOpponent = null;

function generateArenaOpponent(isReroll = false) {
  if (typeof player === "undefined") return;
  if (!player.arena) player.arena = { rating: 1000, lastResetTime: Date.now() };

  const playerRating = player.arena.rating;
  const ratingFactor = Math.max(0.5, playerRating / 1000);

  const multiplier = isReroll ?
    ratingFactor * (0.7 + Math.random() * 0.4) :
    ratingFactor * (0.9 + Math.random() * 0.3);

  const baseHp = 100 + (player.level * 20);
  const baseDamage = 10 + (player.level * 3);

  const oppHp = Math.floor(baseHp * multiplier);
  const oppDamage = Math.floor(baseDamage * multiplier);
  const oppPower = Math.floor((oppDamage * 15) + (oppHp * 0.5));

  const randomName = ARENA_NAMES_POOL[Math.floor(Math.random() * ARENA_NAMES_POOL.length)];

  currentArenaOpponent = {
    name: randomName,
    hp: oppHp,
    maxHp: oppHp,
    damage: oppDamage,
    power: oppPower,
    rewardGold: Math.floor(150 * multiplier),
    rewardRating: Math.floor(20 * multiplier)
  };
}

function renderArenaScreen() {
  const container = document.querySelector(".js-arena-opponents");
  if (!container || typeof player === "undefined") return;

  if (!player.arena) player.arena = { rating: 1000, lastResetTime: Date.now() };
  if (!currentArenaOpponent) generateArenaOpponent(false);

  container.innerHTML = `
    <div class="arena-header-info">
      <h3>ВАШ РЕЙТИНГ: <span style="color: #d4af37;">${player.arena.rating}</span></h3>
      <p>Сражайтесь с противниками в реальном бою, поднимайте рейтинг и получайте награды!</p>
    </div>

    <div class="arena-single-opponent-card">
      <div class="opponent-avatar-box">🛡️</div>
      <div class="opponent-details">
        <div class="opponent-name">${currentArenaOpponent.name}</div>
        <div class="opponent-power">⚔️ Мощь: ${formatNumber(currentArenaOpponent.power)}</div>
        <div class="opponent-stats-row">
          <span>❤️ HP: ${formatNumber(currentArenaOpponent.maxHp)}</span>
          <span>🗡️ Урон: ${formatNumber(currentArenaOpponent.damage)}</span>
        </div>
        <div class="opponent-reward">
          <span>Награда:</span>
          <span class="arena-coin-wrap">
            <img class="arena-coin-icon" src="/contents/IconsGame/hud-right/gold-res.png" alt="Золото">
            ${currentArenaOpponent.rewardGold}
          </span>
          <span class="arena-reward-sep">|</span>
          <span>+${currentArenaOpponent.rewardRating} рейтинг</span>
        </div>
      </div>
    </div>

    <div class="arena-actions-row">
      <button class="btn-fight arena-attack-btn" type="button">В БОЙ</button>
      <button class="btn-reroll arena-reroll-btn" type="button">СМЕНИТЬ ПРОТИВНИКА</button>
    </div>
  `;

  const attackBtn = container.querySelector(".arena-attack-btn");
  if (attackBtn) {
    attackBtn.addEventListener("click", () => startArenaInteractiveBattle(currentArenaOpponent));
  }

  const rerollBtn = container.querySelector(".arena-reroll-btn");
  if (rerollBtn) {
    rerollBtn.addEventListener("click", () => {
      generateArenaOpponent(true);
      renderArenaScreen();
    });
  }
}

function startArenaInteractiveBattle(opponent) {
  if (typeof player === "undefined" || !opponent) return;

  if (typeof spendStamina === "function" && !spendStamina(2)) {
    alert("Недостаточно выносливости для боя на арене!");
    return;
  }

  if (typeof window.startArenaBattleViaBoss !== "function") {
    alert("Боевая система не загружена");
    return;
  }

  // Закрываем экран арены
  document.querySelector(".arena-screen")?.classList.add("hidden");

  // Запускаем бой
  window.startArenaBattleViaBoss(opponent, {
    onWin: () => handleArenaWin(opponent)
  });
}

/* ========================================= */
/* ОКНО ПОБЕДЫ                               */
/* ========================================= */
function showArenaWinModal(opponent, onClose) {
  const overlay = document.querySelector(".arena-win-overlay");

  // Запасной вариант, если окна нет в HTML
  if (!overlay) {
    alert(`Победа на арене! Получено: ${opponent.rewardGold} золота и +${opponent.rewardRating} рейтинга.`);
    if (onClose) onClose();
    return;
  }

  overlay.querySelector(".js-arena-win-subtitle").textContent = `Вы победили: ${opponent.name}`;
  overlay.querySelector(".js-arena-win-gold").textContent = `+${formatNumber(opponent.rewardGold)}`;
  overlay.querySelector(".js-arena-win-rating").textContent = `+${opponent.rewardRating}`;

  overlay.classList.remove("hidden");

  const closeBtn = overlay.querySelector(".js-arena-win-close");
  closeBtn.onclick = () => {
    overlay.classList.add("hidden");
    if (onClose) onClose();
  };
}

function handleArenaWin(opponent) {
  if (!player.arena) player.arena = { rating: 1000, lastResetTime: Date.now() };

  // Начисляем награды
  if (typeof addCurrency === "function") addCurrency("gold", opponent.rewardGold);
  else player.gold += opponent.rewardGold;

  player.arena.rating += opponent.rewardRating;
  player.arenaWins = (player.arenaWins || 0) + 1;

  if (typeof savePlayer === "function") savePlayer(player);
  if (typeof renderHUD === "function") renderHUD();

  // Красивое окно, после закрытия возвращаемся на арену
  showArenaWinModal(opponent, () => {
    generateArenaOpponent(false);
    document.querySelector(".arena-screen")?.classList.remove("hidden");
    renderArenaScreen();
  });
}

// 🔴 ПРИВЯЗКА КНОПКИ ИЗ НИЖНЕГО МЕНЮ
document.addEventListener("DOMContentLoaded", () => {
  const arenaOpenBtn = document.querySelector(".js-open-arena");
  if (arenaOpenBtn) {
    arenaOpenBtn.addEventListener("click", () => {
      // Скрываем другие экраны
      document.querySelector(".campaign-screen")?.classList.add("hidden");
      document.querySelector(".forge-screen")?.classList.add("hidden");
      document.querySelector(".lottery-screen")?.classList.add("hidden");
      document.querySelector(".guild-screen")?.classList.add("hidden");
      document.querySelector(".collections-screen")?.classList.add("hidden");
      document.querySelector(".shop-modal-overlay")?.classList.add("hidden");

      // Показываем арену
      document.querySelector(".arena-screen")?.classList.remove("hidden");
      renderArenaScreen();
    });
  }
});
