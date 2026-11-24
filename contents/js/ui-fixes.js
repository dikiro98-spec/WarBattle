/* =========================================================
   UI-FIXES.JS — Патч закрытия окон, тогла и навигации.
   Подключается в index.html ПОСЛЕ всех остальных скриптов:
   <script src="js/ui-fixes.js" defer></script>
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. ЕДИНЫЙ СПИСОК ВСЕХ ЭКРАНОВ И МОДАЛОК
     --------------------------------------------------------- */
  const SCREEN_SELECTORS = [
    ".campaign-screen",
    ".arena-screen",
    ".forge-screen",
    ".lottery-screen",
    ".guild-screen",
    ".collections-screen",
    ".character-screen",
    ".adventures-screen",
    ".rating-screen"
  ];

  const MODAL_SELECTORS = [
    ".shop-modal-overlay",
    ".talents-modal-overlay",
    "#achievements-modal",
    ".rating-modal",
    ".boss-modal",
    ".house-modal",
    ".level-locked-modal",
    ".arena-win-overlay",
    "#oracle-overlay",
    "#nickModal"
  ];

  function hideElement(el) {
    if (!el) return;
    el.classList.add("hidden");
    if (el.id === "achievements-modal") {
      el.style.display = "none";
    }
  }

  function showElement(el, displayFlex = false) {
    if (!el) return;
    el.classList.remove("hidden");
    if (displayFlex) {
      el.style.display = "flex";
    }
  }

  function closeAllScreens(exceptSelector = null) {
    SCREEN_SELECTORS.forEach((sel) => {
      if (sel === exceptSelector) return;
      document.querySelectorAll(sel).forEach(hideElement);
    });
  }

  function closeAllModals(exceptSelector = null) {
    MODAL_SELECTORS.forEach((sel) => {
      if (sel === exceptSelector) return;
      document.querySelectorAll(sel).forEach(hideElement);
    });

    // Снимаем блокировку с карты кампании, если закрыли модалку босса/домика
    const campaignMap = document.querySelector(".campaign-map-large");
    if (campaignMap) campaignMap.classList.remove("blocked");
  }

  /* ---------------------------------------------------------
     2. СТИЛИ ДЛЯ АВТОМАТИЧЕСКИХ КНОПОК ЗАКРЫТИЯ (✕)
     --------------------------------------------------------- */
  function injectCloseStyles() {
    if (document.getElementById("ui-fixes-styles")) return;
    const style = document.createElement("style");
    style.id = "ui-fixes-styles";
    style.textContent = `
      .ui-auto-close-btn {
        position: absolute;
        top: 10px;
        right: 12px;
        z-index: 50;
        background: #d32f2f;
        border: 2px solid #f44336;
        border-radius: 8px;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        padding: 4px 10px;
        cursor: pointer;
        box-shadow: 0 3px 0 #8b1e1e;
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      .ui-auto-close-btn:active {
        transform: translateY(3px);
        box-shadow: none;
      }
      .forge-window-header,
      .guild-screen .screen-header,
      .arena-screen .screen-header,
      .lottery-screen .screen-header,
      .campaign-screen .screen-header,
      .adventures-screen .screen-header {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------------------------------------------------------
     3. ДОБАВЛЕНИЕ КНОПКИ «✕» В ЭКРАНЫ, ГДЕ ЕЁ НЕТ
     --------------------------------------------------------- */
  function ensureCloseButton(container, headerSelector, onClose) {
    if (!container) return;
    const header = headerSelector ? container.querySelector(headerSelector) : container;
    if (!header) return;

    // Если уже есть любая кнопка закрытия — не дублируем
    const existingClose = header.querySelector(
      ".ui-auto-close-btn, .collections-close-btn, .char-close-btn, .adv-close-btn, " +
      ".rating-close-btn, .js-rating-close, .shop-close-btn, .talents-close-btn, " +
      ".oracle-close, .js-achievements-close, .boss-modal-close, .house-close-btn, [data-close]"
    );
    if (existingClose) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ui-auto-close-btn";
    btn.title = "Закрыть";
    btn.textContent = "✕";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClose();
    });
    header.appendChild(btn);
  }

  function injectMissingCloseButtons() {
    // Кузница (перерисовывается при каждом renderForge)
    const forgeScreen = document.querySelector(".forge-screen");
    ensureCloseButton(forgeScreen, ".forge-window-header", () => {
      hideElement(forgeScreen);
    });

    // Гильдия (перерисовывается при каждом renderGuildScreen)
    const guildScreen = document.querySelector(".guild-screen");
    ensureCloseButton(guildScreen, ".screen-header", () => {
      hideElement(guildScreen);
    });

    // Арена
    const arenaScreen = document.querySelector(".arena-screen");
    ensureCloseButton(arenaScreen, ".screen-header", () => {
      hideElement(arenaScreen);
    });

    // Лотерея
    const lotteryScreen = document.querySelector(".lottery-screen");
    ensureCloseButton(lotteryScreen, ".screen-header", () => {
      hideElement(lotteryScreen);
    });

    // Кампания
    const campaignScreen = document.querySelector(".campaign-screen");
    ensureCloseButton(campaignScreen, ".screen-header", () => {
      hideElement(campaignScreen);
    });

    // Приключения
    const advScreen = document.querySelector(".adventures-screen");
    ensureCloseButton(advScreen, ".screen-header", () => {
      hideElement(advScreen);
      document.querySelector(".main-screen-hero")?.classList.remove("hidden");
    });
  }

  /* ---------------------------------------------------------
     4. ТОГЛ ДЛЯ АРЕНЫ И ДРУГИХ КНОПОК МЕНЮ (ОТКРЫТЬ / ЗАКРЫТЬ)
     --------------------------------------------------------- */
  function bindSmartToggle(btnSelector, screenSelector, onOpen) {
    const oldBtn = document.querySelector(btnSelector);
    if (!oldBtn) return;

    // Клонируем кнопку, чтобы снять старые конфликтующие обработчики
    const btn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(btn, oldBtn);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const screen = document.querySelector(screenSelector);
      if (!screen) return;

      const isCurrentlyOpen = !screen.classList.contains("hidden");

      if (isCurrentlyOpen) {
        // Повторное нажатие -> закрываем
        hideElement(screen);
        if (screenSelector === ".adventures-screen") {
          document.querySelector(".main-screen-hero")?.classList.remove("hidden");
        }
      } else {
        // Открываем этот экран, закрывая остальные экраны и модалки
        closeAllModals();
        closeAllScreens(screenSelector);
        if (screenSelector === ".adventures-screen") {
          document.querySelector(".main-screen-hero")?.classList.add("hidden");
        }
        showElement(screen);
        if (typeof onOpen === "function") onOpen();
        injectMissingCloseButtons();
      }
    });
  }

  /* ---------------------------------------------------------
     5. ЗАКРЫТИЕ ПО ESC И ПО КЛИКУ НА ФОН МОДАЛОК
     --------------------------------------------------------- */
  function bindGlobalCloseShortcuts() {
    // Закрытие по клавише Escape
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      // Сначала закрываем открытые модальные окна поверх экранов
      let closedAnyModal = false;
      MODAL_SELECTORS.forEach((sel) => {
        document.querySelectorAll(sel).forEach((modal) => {
          if (!modal.classList.contains("hidden") && modal.style.display !== "none") {
            hideElement(modal);
            closedAnyModal = true;
          }
        });
      });

      const campaignMap = document.querySelector(".campaign-map-large");
      if (campaignMap) campaignMap.classList.remove("blocked");

      if (closedAnyModal) return;

      // Если модалок не было — закрываем открытые экраны (кроме активного боя)
      SCREEN_SELECTORS.forEach((sel) => {
        document.querySelectorAll(sel).forEach((scr) => {
          if (!scr.classList.contains("hidden")) {
            hideElement(scr);
            if (sel === ".adventures-screen") {
              document.querySelector(".main-screen-hero")?.classList.remove("hidden");
            }
          }
        });
      });
    });

    // Закрытие модалок по клику на оверлей (если ещё не привязано)
    [
      ".shop-modal-overlay",
      ".talents-modal-overlay",
      ".rating-modal",
      ".boss-modal",
      ".house-modal",
      ".level-locked-modal"
    ].forEach((sel) => {
      const overlay = document.querySelector(sel);
      if (!overlay || overlay.dataset.uiOverlayBound) return;
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          hideElement(overlay);
          const campaignMap = document.querySelector(".campaign-map-large");
          if (campaignMap) campaignMap.classList.remove("blocked");
        }
      });
      overlay.dataset.uiOverlayBound = "1";
    });
  }

  /* ---------------------------------------------------------
     6. ИНИЦИАЛИЗАЦИЯ И НАБЛЮДАТЕЛЬ ЗА ПЕРЕРИСОВКОЙ DOM
     --------------------------------------------------------- */
  function initUiFixes() {
    injectCloseStyles();

    // Арена: открыть по первому клику, закрыть по второму
    bindSmartToggle(".js-open-arena", ".arena-screen", () => {
      if (typeof renderArenaScreen === "function") renderArenaScreen();
    });

    // Кузница: тогл + авто-кнопка закрытия
    bindSmartToggle(".js-open-forge", ".forge-screen", () => {
      if (typeof renderForge === "function") renderForge();
    });

    // Гильдия: тогл + авто-кнопка закрытия
    bindSmartToggle(".js-open-guild", ".guild-screen", () => {
      if (typeof renderGuildScreen === "function") renderGuildScreen();
    });

    // Лотерея: тогл
    bindSmartToggle(".js-open-lottery", ".lottery-screen", () => {
      if (typeof updateLotteryUI === "function") updateLotteryUI();
      if (typeof renderLotteryBoard === "function") renderLotteryBoard();
    });

    // Коллекции: тогл
    bindSmartToggle(".js-open-collections", ".collections-screen", () => {
      if (typeof renderCollectionsScreen === "function") renderCollectionsScreen();
    });

    // Кампания: тогл
    bindSmartToggle(".js-campaign-toggle", ".campaign-screen");

    // Приключения: тогл
    bindSmartToggle(".js-open-adventures", ".adventures-screen");

    // Первично ставим недостающие кнопки закрытия
    injectMissingCloseButtons();

    // Следим за перерисовкой innerHTML (например, при переключении вкладок в Кузнице или Гильдии),
    // чтобы кнопка ✕ не пропадала после смены вкладки
    const observer = new MutationObserver(() => {
      injectMissingCloseButtons();
    });

    [".forge-screen", ".guild-screen", ".arena-screen", ".lottery-screen", ".campaign-screen"].forEach(
      (sel) => {
        const el = document.querySelector(sel);
        if (el) observer.observe(el, { childList: true });
      }
    );

    bindGlobalCloseShortcuts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUiFixes);
  } else {
    initUiFixes();
  }
})();
