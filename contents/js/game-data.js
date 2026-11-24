const DEFAULT_PLAYER_DATA = {
  profile: { name: "НОВЫЙ ИГРОК", power: 0, level: 1, xp: 0, xpToNext: 100, daysInKingdom: 1 },
  resources: { stamina: 50, staminaMax: 50, silver: 0, gold: 0, crystal: 0, food: 0 },
  inventory: { grayScroll: 1, goldScroll: 1, potion: 1 },
  talents: {
    staminaMastery: { level: 0, baseCost: 100, currency: "silver" },
    fierceStrike: { level: 0, baseCost: 120, currency: "gold" },
    shieldBlock: { level: 0, baseCost: 90, currency: "gold" },
    invisibleStrike: { level: 0, baseCost: 150, currency: "gold" },
    masterHealer: { level: 0, baseCost: 110, currency: "gold" }
  },
  house: { level: 1, maxLevel: 5, lastCollectTime: 0 },
  shop: { purchasedItems: [] }
};

const SHOP_CATEGORIES = [
  { id: "weapons", title: "Оружие" }, { id: "helmets", title: "Шлемы" }, { id: "armor", title: "Броня" },
  { id: "pauldrons", title: "Наплечники" }, { id: "bracers", title: "Наручи" }, { id: "gloves", title: "Перчатки" },
  { id: "pants", title: "Штаны" }, { id: "boots", title: "Ботинки" }, { id: "shields", title: "Щиты" }, { id: "jewelry", title: "Бижутерия" }
];

const SHOP_ITEMS = [
  // Оружие
  { id: "wood_sword",   category: "weapons", name: "Деревянный меч", price: 50,  currency: "silver", damage: 3,  stamina: 0, icon: "🗡️", image: null, reqLevel: 1,  source: "shop" },
  { id: "iron_sword",   category: "weapons", name: "Железный меч",   price: 120, currency: "silver", damage: 7,  stamina: 0, icon: "⚔️", image: null, reqLevel: 3,  source: "shop" },
  { id: "knight_blade", category: "weapons", name: "Клинок рыцаря",  price: 8,   currency: "gold",   damage: 15, stamina: 0, icon: "🔪", image: null, reqLevel: 7,  source: "shop" },
  { 
  id: "battalion_blade", 
  category: "weapons", 
  name: "Клинок Батальона", 
  price: 5000, 
  currency: "gold", 
  damage: 50, 
  health: 0, 
  isHidden: true // 🔴 Флаг, что предмет скрыт до сбора коллекции
},
    {
    id: "oracle_blade",
    category: "weapons",
    name: "Клинок Оракула",
    price: 8000,
    currency: "gold",
    damage: 65,
    health: 0,
    lockCollection: "oracle_collection", // 🔒 открывается после сборки этой коллекции
    lockMessage: "Соберите коллекцию «Реликвии Оракула» в гробнице оракула, чтобы открыть это оружие!"
  },



  // Шлемы
  { id: "leather_helmet", category: "helmets", name: "Кожаный шлем",   price: 40,  currency: "silver", damage: 0, stamina: 1, icon: "🧢", image: null, reqLevel: 1, source: "shop" },
  { id: "iron_helmet",    category: "helmets", name: "Железный шлем",  price: 100, currency: "silver", damage: 0, stamina: 2, icon: "🪖", image: null, reqLevel: 3, source: "shop" },

  // Броня
  { id: "leather_armor", category: "armor", name: "Кожаная броня",   price: 80, currency: "silver", damage: 0, stamina: 1, icon: "🥋", image: null, reqLevel: 1, source: "shop" },
  { id: "iron_armor",    category: "armor", name: "Железная броня",  price: 10, currency: "gold",   damage: 0, stamina: 3, icon: "🦺", image: null, reqLevel: 5, source: "shop" },

  // Наплечники
  { id: "leather_pauldrons", category: "pauldrons", name: "Кожаные наплечники",   price: 60, currency: "silver", damage: 0, stamina: 1, icon: "🎽", image: null, reqLevel: 2, source: "shop" },
  { id: "iron_pauldrons",    category: "pauldrons", name: "Железные наплечники",  price: 6,  currency: "gold",   damage: 0, stamina: 2, icon: "🛡️", image: null, reqLevel: 5, source: "shop" },

  // Наручи
  { id: "leather_bracers", category: "bracers", name: "Кожаные наручи",   price: 30, currency: "silver", damage: 1, stamina: 1, icon: "🧤", image: null, reqLevel: 2, source: "shop" },
  { id: "iron_bracers",    category: "bracers", name: "Железные наручи",  price: 4,  currency: "gold",   damage: 2, stamina: 1, icon: "🦾", image: null, reqLevel: 5, source: "shop" },

  // Перчатки
  { id: "leather_gloves", category: "gloves", name: "Кожаные перчатки",  price: 30, currency: "silver", damage: 2, stamina: 0, icon: "🥊", image: null, reqLevel: 2, source: "shop" },
  { id: "iron_gloves",    category: "gloves", name: "Железные рукавицы", price: 4,  currency: "gold",   damage: 4, stamina: 0, icon: "✊", image: null, reqLevel: 5, source: "shop" },

  // Штаны
  { id: "leather_pants", category: "pants", name: "Кожаные штаны",   price: 50, currency: "silver", damage: 0, stamina: 1, icon: "👖", image: null, reqLevel: 1, source: "shop" },
  { id: "iron_pants",    category: "pants", name: "Железные поножи", price: 5,  currency: "gold",   damage: 0, stamina: 2, icon: "🦵", image: null, reqLevel: 5, source: "shop" },

  // Ботинки
  { id: "leather_boots", category: "boots", name: "Кожаные сапоги",  price: 40, currency: "silver", damage: 0, stamina: 1, icon: "🥾", image: null, reqLevel: 1, source: "shop" },
  { id: "iron_boots",    category: "boots", name: "Железные сапоги", price: 4,  currency: "gold",   damage: 0, stamina: 1, icon: "👢", image: null, reqLevel: 5, source: "shop" },

  // Щиты
  { id: "wood_shield", category: "shields", name: "Деревянный щит", price: 60, currency: "silver", damage: 0, stamina: 1, icon: "🪵", image: null, reqLevel: 1, source: "shop" },
  { id: "iron_shield", category: "shields", name: "Стальной щит",   price: 8,  currency: "gold",   damage: 0, stamina: 3, icon: "🔰", image: null, reqLevel: 5, source: "shop" },

  // Бижутерия
  { id: "wolf_talisman", category: "jewelry", name: "Талисман волка", price: 12, currency: "gold", damage: 5,  stamina: 1, icon: "🐺", image: null, reqLevel: 7, source: "shop" },
  { id: "power_ring",    category: "jewelry", name: "Кольцо силы",    price: 15, currency: "gold", damage: 10, stamina: 0, icon: "💍", image: null, reqLevel: 9, source: "shop" }
];

// Сколько ХП даёт 1 единица выносливости
const HP_PER_STAMINA = 15;

//Достижения 
const achievementsData = [
  { id: 'first_blood', title: 'Первая кровь', desc: 'Победите первого босса', reward: 50, completed: false },
  { id: 'rich_man', title: 'Златоуст', desc: 'Накопите 10 000 золота', reward: 200, completed: false },
  { id: 'boss_hunter', title: 'Гроза монстров', desc: 'Убейте 10 боссов', reward: 500, completed: false }
];

// Проверка и выдача достижения
function checkAchievement(id, currentValue) {
  const ach = achievementsData.find(a => a.id === id);
  if (ach && !ach.completed) {
    // Здесь условие зависит от ачивки, например, если currentValue достигло цели
    // ach.completed = true;
    // показать уведомление игроку!
  }
}
