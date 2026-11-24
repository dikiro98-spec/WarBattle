/* ========================================= */
/* COLLECTIONS.JS (ФИНАЛ v4 - Ресурсы)       */
/* ========================================= */

const collectionsScreen = document.querySelector(".collections-screen");
const collectionsNavBtn = document.querySelector(".js-open-collections");

function renderCollectionsScreen() {
  if (!collectionsScreen) return;

  if (typeof player !== "undefined" && !player.collections) {
    player.collections = {};
  }
  const progress = (typeof player !== "undefined" && player.collections) ? player.collections : {};

  collectionsScreen.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-header">
        <div class="screen-header-title">КОЛЛЕКЦИИ</div>
        <button class="collections-close-btn">✕</button>
      </div>
      
      <div class="screen-body">
        <div class="collections-grid">
          ${COLLECTIONS_DATA.map(collection => {
            // Получаем прогресс (объект с количествами)
            let collProgress = progress[collection.id];
            if (typeof collProgress !== "object" || collProgress === null) collProgress = {};

            // Проверяем, можно ли собрать (есть ли хотя бы по 1 штуке каждой части)
            let canClaim = true;
            let totalCollected = 0;
            
            const partsHtml = collection.parts.map(part => {
              const count = collProgress[part.id] || 0;
              totalCollected += count;
              if (count < 1) canClaim = false;

              return `
                <div class="collection-slot ${count > 0 ? 'collected' : ''}" title="${part.name}">
                  <span class="part-icon">${part.icon}</span>
                  <span class="part-count">${count > 0 ? "x" + count : ""}</span>
                </div>
              `;
            }).join("");

            // Считаем процент (сколько уникальных частей собрано для визуала)
            const uniqueCollected = collection.parts.filter(p => (collProgress[p.id] || 0) > 0).length;
            const percent = (uniqueCollected / collection.parts.length) * 100;

            return `
              <div class="collection-card ${canClaim ? 'complete' : ''}">
                <div class="collection-title">${collection.name}</div>
                
                <div class="collection-parts">
                  ${partsHtml}
                </div>

                <div class="collection-progress-bar">
                  <div class="collection-progress-fill" style="width: ${percent}%;"></div>
                </div>
                <div class="collection-status">Уникальных частей: ${uniqueCollected} / ${collection.parts.length}</div>

                <button class="collection-claim-btn js-claim-collection" 
                  data-collection-id="${collection.id}"
                  ${!canClaim ? 'disabled' : ''}>
                  ${canClaim ? 'СОБРАТЬ' : 'НЕ ХВАТАТ ЧАСТЕЙ'}
                </button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;

  const claimButtons = collectionsScreen.querySelectorAll(".js-claim-collection");
  claimButtons.forEach(btn => {
    btn.addEventListener("click", () => claimCollection(btn.dataset.collectionId));
  });

  const closeBtn = collectionsScreen.querySelector(".collections-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeCollections);
}

function claimCollection(collectionId) {
  const collection = COLLECTIONS_DATA.find(c => c.id === collectionId);
  if (!collection) return;

  if (!player.collections) player.collections = {};
  let collProgress = player.collections[collectionId];
  if (typeof collProgress !== "object" || collProgress === null) collProgress = {};

  // Проверяем, есть ли по 1 штуке каждой части
  for (let part of collection.parts) {
    if ((collProgress[part.id] || 0) < 1) {
      alert("Недостаточно частей для сбора!");
      return;
    }
  }

  // Забираем части (вычитаем по 1)
  for (let part of collection.parts) {
    collProgress[part.id] -= 1;
  }
  collProgress._claimed = true; // 🔴 фиксируем: коллекция собрана — снимает замок с оружия
  player.collections[collectionId] = collProgress;

  // Выдаем награды
  if (typeof addCurrency === "function") addCurrency("silver", collection.rewardSilver);
  if (typeof addExperience === "function") addExperience(collection.rewardExp);

  if (typeof savePlayer === "function") savePlayer(player);

  // Своё сообщение для коллекций, открывающих оружие (награда 0/0)
  if (collection.rewardSilver > 0 || collection.rewardExp > 0) {
    alert(`Коллекция "${collection.name}" собрана! Вы получили ${collection.rewardSilver} серебра и ${collection.rewardExp} опыта!`);
  } else {
    alert(`Коллекция "${collection.name}" собрана! В магазине открылось новое оружие!`);
  }

  renderCollectionsScreen();
}


function openCollections() {
  document.querySelector(".campaign-screen")?.classList.add("hidden");
  document.querySelector(".arena-screen")?.classList.add("hidden");
  document.querySelector(".forge-screen")?.classList.add("hidden");
  document.querySelector(".lottery-screen")?.classList.add("hidden");
  document.querySelector(".guild-screen")?.classList.add("hidden");
  document.querySelector(".adventures-screen")?.classList.add("hidden");

  if (collectionsScreen) collectionsScreen.classList.remove("hidden");
  renderCollectionsScreen();
}

function closeCollections() {
  if (collectionsScreen) collectionsScreen.classList.add("hidden");
}

if (collectionsNavBtn) {
  collectionsNavBtn.addEventListener("click", () => {
    if (!collectionsScreen.classList.contains("hidden")) {
      closeCollections();
    } else {
      openCollections();
    }
  });
}

window.collectionsApi = {
  openCollections,
  closeCollections,
  renderCollectionsScreen
};