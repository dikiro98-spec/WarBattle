// ====== ЭКРАН ЗАГРУЗКИ WARBATTLE ======

// Версия игры (меняй здесь, на экране подставится сама)
const GAME_VERSION = 'v1.0.0';

// Этапы: до какого процента показывать какой текст
const LOADING_STAGES = [
  { upTo: 25,  text: 'ЗАГРУЗКА РЕСУРСОВ...' },
  { upTo: 50,  text: 'ПОДГОТОВКА АРЕНЫ...' },
  { upTo: 75,  text: 'ПРИЗЫВ БОССОВ...' },
  { upTo: 99,  text: 'ТОЧИМ МЕЧИ...' },
  { upTo: 100, text: 'ВСЁ ГОТОВО!' },
];

const PRELOAD_IMAGES = [
  // Заставка
  '/contents/IconsGame/testfon.jpg',

  // HUD и ресурсы
  '/contents/IconsGame/hero/hero_base.png',
  '/contents/IconsGame/hero/Head/head_1.png',
  '/contents/IconsGame/hud-right/silver-res.png',
  '/contents/IconsGame/hud-right/gold-res.png',
  '/contents/IconsGame/hud-right/blue-res.png',
  '/contents/IconsGame/hud-right/crystal-res.png',
  '/contents/IconsGame/hud-right/food-res.png',
  '/contents/IconsGame/hud-right/Ex.png',

  // Босс и бой
  '/contents/IconsGame/boss.png',
  '/contents/IconsGame/gray.sweater.png',
  '/contents/IconsGame/goldsweater.png',
  '/contents/IconsGame/HPbutel.png',
  '/contents/IconsGame/resurrection.png',
  '/contents/IconsGame/running.png',
  '/contents/IconsGame/talent.png',
  '/contents/IconsGame/talent 1.png',
  '/contents/IconsGame/talent2.png',
  '/contents/IconsGame/talent3.png',

  // Домик
  '/contents/IconsGame/house-icon.png',

  // Нижняя панель (пути как в HTML)
  'IconsGame/mg.jpg',
  'IconsGame/collection.jpg',
  'IconsGame/arena.jpg',
  'IconsGame/company.jpg',
  'IconsGame/forge.jpg',
  'IconsGame/guild.jpg',
  'IconsGame/adventures.jpg',
  'IconsGame/lottery.jpg',
];

const PRELOAD_AUDIO = [
  '/contents/fonmusic.mp3',
];

// Минимальное время показа заставки (мс)
const MIN_LOADING_TIME = 1500;
// Максимальное время ожидания (мс): если что-то зависло, игра всё равно запустится
const MAX_LOADING_TIME = 15000;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // ошибка не должна ломать загрузку
    img.src = src;
  });
}

function preloadAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', resolve, { once: true });
    audio.addEventListener('error', resolve, { once: true });
    audio.src = src;
    setTimeout(resolve, 5000); // страховка
  });
}

function setLoadingProgress(done, total) {
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);
  const fill = document.getElementById('loading-bar-fill');
  const text = document.getElementById('loading-text');

  if (fill) fill.style.width = percent + '%';

  if (text) {
    const stage =
      LOADING_STAGES.find((s) => percent <= s.upTo) ||
      LOADING_STAGES[LOADING_STAGES.length - 1];
    text.textContent = stage.text + ' ' + percent + '%';
  }
}

function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  screen.classList.add('fade-out');
  setTimeout(() => screen.remove(), 900);
}

async function runLoadingScreen() {
  const startTime = Date.now();

  // Ждём полной загрузки страницы (все скрипты и стили)
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  const tasks = [
    pageLoaded,
    ...PRELOAD_IMAGES.map(preloadImage),
    ...PRELOAD_AUDIO.map(preloadAudio),
  ];

  let done = 0;
  const total = tasks.length;
  setLoadingProgress(0, total);

  const allLoaded = Promise.all(
    tasks.map((task) =>
      task.then(() => {
        done++;
        setLoadingProgress(done, total);
      })
    )
  );

  // Либо всё загрузилось, либо вышло максимальное время
  await Promise.race([
    allLoaded,
    new Promise((r) => setTimeout(r, MAX_LOADING_TIME)),
  ]);

  setLoadingProgress(total, total);

  // Выдерживаем минимальное время показа
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise((r) => setTimeout(r, MIN_LOADING_TIME - elapsed));
  }

  hideLoadingScreen();
}

// Подставляем версию игры на экран загрузки
const versionEl = document.getElementById('loading-version');
if (versionEl) versionEl.textContent = GAME_VERSION;

runLoadingScreen();
