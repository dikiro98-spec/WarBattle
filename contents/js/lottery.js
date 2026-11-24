/* ========================================= */
/* LOTTERY.JS - Логика Лотереи               */
/* ========================================= */

const lotteryScreen = document.querySelector(".lottery-screen");
const lotteryBoard = document.querySelector(".js-lottery-board");
const lotteryPlayBtn = document.querySelector(".js-lottery-play");
const lotteryCostEl = document.querySelector(".js-lottery-cost");
const lotteryCrystalsEl = document.querySelector(".js-lottery-crystals");
const lotteryNavBtn = document.querySelector(".js-open-lottery");


// Флаг, чтобы нельзя было спамить кнопку во время анимации
let isSpinning = false;

// Возможные призы
const PRIZES = [
  { type: "grayScroll", icon: "📜", name: "Серый свиток" },
  { type: "goldScroll", icon: "📜", name: "Золотой свиток" },
  { type: "potion", icon: "🧪", name: "Колба жизни" },
  { type: "gold", icon: "🪙", name: "Золото" },
  { type: "exp", icon: "⭐", name: "Опыт" }
];

function openLottery() {
  if (!openScreen("lottery")) return;
  updateLotteryUI();
  renderLotteryBoard();
}

function closeLottery() {
  closeScreen("lottery");
}

function updateLotteryUI() {
  if (typeof player === "undefined") return;

  // Проверяем, играл ли игрок раньше (флаг хранится в игроке)
  const hasPlayed = player.lotteryFirstPlayUsed === true;

  if (lotteryCrystalsEl) {
    lotteryCrystalsEl.textContent = player.crystal || 0;
  }

  if (lotteryCostEl) {
    if (!hasPlayed) {
      lotteryCostEl.textContent = "БЕСПЛАТНО";
      lotteryCostEl.style.color = "#00ff00";
      if (lotteryPlayBtn) lotteryPlayBtn.disabled = false;
    } else {
      lotteryCostEl.textContent = "💎 10";
      lotteryCostEl.style.color = "#fff";
      if (lotteryPlayBtn) lotteryPlayBtn.disabled = (player.crystal || 0) < 10;
    }
  }
}

function renderLotteryBoard() {
  if (!lotteryBoard) return;
  lotteryBoard.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "lottery-cell";
    cell.dataset.index = i;

    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    cell.innerHTML = `
      <div class="lottery-cell-count">?</div>
      <div class="lottery-cell-icon">${randomPrize.icon}</div>
    `;
    lotteryBoard.appendChild(cell);
  }
}

function getRandomReward() {
  const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
  let amount = 1;

  if (prize.type === "gold") amount = Math.floor(Math.random() * 40) + 10;
  if (prize.type === "exp") amount = Math.floor(Math.random() * 50) + 20;
  if (prize.type === "grayScroll" || prize.type === "goldScroll") amount = Math.floor(Math.random() * 3) + 1;
  if (prize.type === "potion") amount = 1;

  return { ...prize, amount };
}

if (lotteryPlayBtn) {
  lotteryPlayBtn.addEventListener("click", () => {
    if (isSpinning || typeof player === "undefined") return;

    const hasPlayed = player.lotteryFirstPlayUsed === true;

    // Проверка и списание кристаллов
    if (hasPlayed) {
      if ((player.crystal || 0) < 10) {
        alert("Недостаточно кристаллов!");
        return;
      }
      player.crystal -= 10;
    } else {
      // Запоминаем, что первый бесплатный спин использован
      player.lotteryFirstPlayUsed = true;
    }
    savePlayer(player);
    renderHUD();

    isSpinning = true;
    lotteryPlayBtn.disabled = true;

    const reward = getRandomReward();
    const winIndex = Math.floor(Math.random() * 9);

    const cells = document.querySelectorAll(".lottery-cell");
    cells.forEach(c => c.classList.remove("winner"));

    let spins = 0;
    const totalSpins = 20 + winIndex;

    const spinInterval = setInterval(() => {
      cells.forEach(c => c.style.filter = "brightness(1)");
      const currentCell = cells[spins % 9];
      if (currentCell) currentCell.style.filter = "brightness(2)";

      spins++;
if (typeof window.checkAchievement === "function") window.checkAchievement("lottery", 1);

      if (spins >= totalSpins) {
        clearInterval(spinInterval);

        cells.forEach(c => { c.style.filter = "brightness(1)"; c.classList.remove("winner"); });

        const winnerCell = cells[winIndex];
        if (winnerCell) {
          winnerCell.classList.add("winner");
          winnerCell.innerHTML = `
            <div class="lottery-cell-count">${reward.amount > 1 ? "+" + reward.amount : ""}</div>
            <div class="lottery-cell-icon">${reward.icon}</div>
          `;
        }

        giveLotteryReward(reward);

        setTimeout(() => {
          isSpinning = false;
          updateLotteryUI();
        }, 2000);
      }
    }, 100);
  });
}

function giveLotteryReward(reward) {
  if (typeof player === "undefined") return;
  if (!player.inventory) player.inventory = { grayScroll: 0, goldScroll: 0, potion: 0 };

  const message = `Вы выиграли: ${reward.name} x${reward.amount}!`;

  switch (reward.type) {
    case "grayScroll":
      player.inventory.grayScroll = (player.inventory.grayScroll || 0) + reward.amount;
      break;
    case "goldScroll":
      player.inventory.goldScroll = (player.inventory.goldScroll || 0) + reward.amount;
      break;
    case "potion":
      player.inventory.potion = (player.inventory.potion || 0) + reward.amount;
      break;
    case "gold":
      addCurrency("gold", reward.amount);
      break;
    case "exp":
      addExperience(reward.amount);
      break;
  }

  // Для расходников сохранение нужно отдельно, золото и опыт сохраняются сами
  savePlayer(player);
  renderHUD();

  setTimeout(() => {
    alert(message);
  }, 500);
}

if (lotteryNavBtn) {
  lotteryNavBtn.addEventListener("click", () => {
    if (toggleScreen("lottery")) {
      updateLotteryUI();
      renderLotteryBoard();
    }
  });
}

window.lotteryApi = {
  openLottery,
  closeLottery
};
