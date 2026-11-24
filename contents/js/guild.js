/* ========================================= */
/* GUILD.JS - Логика Гильдии                 */
/* ========================================= */

const guildScreen = document.querySelector(".guild-screen");
const guildNavBtn = document.querySelector(".js-open-guild");

let currentGuildTab = "info";

const MOCK_GUILDS = [
  { id: 1, name: "Воины Света", level: 5, members: 15, maxMembers: 30, reqLevel: 10, type: "open" },
  { id: 2, name: "Тёмное Братство", level: 8, members: 30, maxMembers: 30, reqLevel: 15, type: "closed" },
  { id: 3, name: "Стражи Леса", level: 3, members: 5, maxMembers: 30, reqLevel: 5, type: "open" },
  { id: 4, name: "Клинки Империи", level: 10, members: 18, maxMembers: 30, reqLevel: 20, type: "closed" }
];

function renderGuildScreen() {
  if (!guildScreen) return;

  guildScreen.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-header">
        <div class="screen-header-title">ГИЛЬДИЯ</div>
      </div>

      <div class="screen-body">
        <div class="guild-subtitle js-guild-status">ВЫ НЕ СОСТОИТЕ В ГИЛЬДИИ</div>

        <div class="guild-tabs">
          <button class="guild-tab ${currentGuildTab === 'info' ? 'active' : ''}" data-tab="info">ИНФОРМАЦИЯ</button>
          <button class="guild-tab ${currentGuildTab === 'members' ? 'active' : ''}" data-tab="members">УЧАСТНИКИ</button>
          <button class="guild-tab ${currentGuildTab === 'search' ? 'active' : ''}" data-tab="search">ПОИСК</button>
          <button class="guild-tab ${currentGuildTab === 'create' ? 'active' : ''}" data-tab="create">СОЗДАТЬ</button>
        </div>

        <div class="guild-content" id="guild-content"></div>
      </div>
    </div>
  `;

  const tabs = guildScreen.querySelectorAll(".guild-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      currentGuildTab = tab.dataset.tab;
      renderGuildScreen();
    });
  });

  renderTabContent();
  updateGuildStatus();
}

function renderTabContent() {
  const contentContainer = document.getElementById("guild-content");
  if (!contentContainer) return;

  if (currentGuildTab === "info") {
    contentContainer.innerHTML = `
      <div class="guild-info-card">
        <div class="guild-emblem">🛡️</div>
        <div class="guild-details">
          <h3 class="js-guild-name">Название гильдии</h3>
          <p>Уровень гильдии: <strong class="js-guild-level">1</strong></p>
          <p>Участников: <strong class="js-guild-members">1/30</strong></p>
          <p>Глава: <strong class="js-guild-leader">Игрок</strong></p>
        </div>
      </div>

      <div class="guild-buffs">
        <h4>БОНУСЫ ГИЛЬДИИ</h4>
        <div class="buff-item">⚔️ Атака: <span>+5%</span> <button class="upgrade-buff-btn">Улучшить</button></div>
        <div class="buff-item">🛡️ Здоровье: <span>+5%</span> <button class="upgrade-buff-btn">Улучшить</button></div>
        <div class="buff-item">💰 Доход: <span>+5%</span> <button class="upgrade-buff-btn">Улучшить</button></div>
      </div>
    `;
    updateGuildInfo();

  } else if (currentGuildTab === "members") {
    contentContainer.innerHTML = `
      <div class="members-list">
        <div class="member-item">
          <div class="member-rank">👑</div>
          <div class="member-name">${(typeof player !== "undefined" && player.name) ? player.name : "Игрок"}</div>
          <div class="member-level">${(typeof player !== "undefined" && player.level) ? player.level : 1} УР.</div>
        </div>
      </div>
    `;

  } else if (currentGuildTab === "search") {
    contentContainer.innerHTML = `
      <div class="search-bar">
        <input type="text" placeholder="Введите название гильдии..." class="js-search-input">
        <button class="search-btn">НАЙТИ</button>
      </div>
      <div class="search-results js-search-results"></div>
    `;
    renderGuildList();
    bindSearchEvents();

  } else if (currentGuildTab === "create") {
    contentContainer.innerHTML = `
      <div class="create-form">
        <p>Создание гильдии стоит <strong>5 000 серебра</strong></p>
        <input type="text" placeholder="Название гильдии" class="js-create-input">
        <button class="create-btn js-create-guild">СОЗДАТЬ ГИЛЬДИЮ</button>
      </div>
    `;
    bindCreateEvents();
  }
}

function updateGuildStatus() {
  const statusText = guildScreen.querySelector(".js-guild-status");
  if (!statusText) return;

  const guildData = (typeof player !== "undefined" && player.guild) ? player.guild : null;
  if (guildData) {
    statusText.textContent = `ГИЛЬДИЯ: ${guildData.name}`;
    statusText.classList.add("in-guild");
  } else {
    statusText.textContent = "ВЫ НЕ СОСТОИТЕ В ГИЛЬДИИ";
    statusText.classList.remove("in-guild");
  }
}

function updateGuildInfo() {
  const guildData = (typeof player !== "undefined" && player.guild) ? player.guild : null;
  if (guildData) {
    const nameEl = guildScreen.querySelector(".js-guild-name");
    const levelEl = guildScreen.querySelector(".js-guild-level");
    const membersEl = guildScreen.querySelector(".js-guild-members");
    const leaderEl = guildScreen.querySelector(".js-guild-leader");

    if (nameEl) nameEl.textContent = guildData.name;
    if (levelEl) levelEl.textContent = guildData.level || 1;
    if (membersEl) membersEl.textContent = `${guildData.members || 1}/${guildData.maxMembers || 30}`;
    if (leaderEl) leaderEl.textContent = player.name || "Игрок";
  }
}

function renderGuildList(filterText = "") {
  const resultsContainer = guildScreen.querySelector(".js-search-results");
  if (!resultsContainer) return;

  const filteredGuilds = MOCK_GUILDS.filter(g =>
    g.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filteredGuilds.length === 0) {
    resultsContainer.innerHTML = `<p class="guild-empty">Гильдии не найдены</p>`;
    return;
  }

  resultsContainer.innerHTML = filteredGuilds.map(guild => {
    const isFull = guild.members >= guild.maxMembers;
    const playerLevel = (typeof player !== "undefined" && player.level) ? player.level : 1;
    const canJoin = playerLevel >= guild.reqLevel;

    let statusText = "";
    let statusClass = "";

    if (isFull) {
      statusText = "МЕСТ НЕТ"; statusClass = "status-full";
    } else if (guild.type === "open") {
      statusText = "ОТКРЫТА"; statusClass = "status-open";
    } else {
      statusText = "ПО ЗАЯВКЕ"; statusClass = "status-closed";
    }

    return `
      <div class="search-item">
        <div class="search-info">
          <div class="search-title-row">
            <strong>${guild.name}</strong>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          <span>Ур. гильдии: ${guild.level} | Участники: ${guild.members}/${guild.maxMembers}</span><br>
          <span class="search-req">Требуемый уровень: ${guild.reqLevel}</span>
        </div>
        <button class="join-btn" data-guild-id="${guild.id}"
          ${isFull || !canJoin ? 'disabled' : ''}>
          ${isFull ? 'ПЕРЕПОЛНЕНА' : (!canJoin ? 'МАЛ УРОВЕНЬ' : 'ВСТУПИТЬ')}
        </button>
      </div>
    `;
  }).join("");

  // Привязываем кнопки "ВСТУПИТЬ"
  resultsContainer.querySelectorAll(".join-btn").forEach(btn => {
    btn.addEventListener("click", () => tryJoinGuild(Number(btn.dataset.guildId)));
  });
}

function tryJoinGuild(guildId) {
  const guild = MOCK_GUILDS.find(g => g.id === guildId);
  if (!guild) return;

  if (guild.type === "closed") {
    alert(`Вы подали заявку на вступление в гильдию "${guild.name}". Ожидайте ответа!`);
  } else {
    alert(`Вы успешно вступили в гильдию "${guild.name}"!`);
    player.guild = { name: guild.name, level: guild.level, members: guild.members, maxMembers: 30 };
    savePlayer(player);
    currentGuildTab = "info";
    renderGuildScreen();
  }
}

function bindSearchEvents() {
  const searchBtn = guildScreen.querySelector(".search-btn");
  const searchInput = guildScreen.querySelector(".js-search-input");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => renderGuildList(searchInput.value.trim()));
    searchInput.addEventListener("input", () => renderGuildList(searchInput.value.trim()));
  }
}

function bindCreateEvents() {
  const createBtn = guildScreen.querySelector(".js-create-guild");
  const createInput = guildScreen.querySelector(".js-create-input");

  if (createBtn && createInput) {
    createBtn.addEventListener("click", () => {
      const name = createInput.value.trim();
      if (!name) { alert("Введите название гильдии!"); return; }

      const cost = 5000;
      if ((player.silver || 0) < cost) {
        alert("Недостаточно серебра! Нужно 5000.");
        return;
      }

      addCurrency("silver", -cost);

      player.guild = { name: name, level: 1, members: 1, maxMembers: 30 };
      savePlayer(player);

      alert(`Гильдия "${name}" успешно создана!`);
      currentGuildTab = "info";
      renderGuildScreen();
    });
  }
}

function openGuild() {
  if (!openScreen("guild")) return;
  renderGuildScreen();
}

function closeGuild() {
  closeScreen("guild");
}

if (guildNavBtn) {
  guildNavBtn.addEventListener("click", () => {
    if (toggleScreen("guild")) renderGuildScreen();
  });
}

window.guildApi = { openGuild, closeGuild };
