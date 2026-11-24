/* ========================================= */
/* COLLECTIONS-DATA.JS (Данные коллекций)    */
/* ========================================= */

const COLLECTIONS_DATA = [
  {
    id: "rat_collection",
    name: "Коллекция Риверпорта",
    locationId: "riverport",
    bossId: "riverport-rat",
    rewardSilver: 5000,
    rewardExp: 1000,
    parts: [
      { id: "rat_part_1", name: "Крысиный хвост", icon: "🪶" },
      { id: "rat_part_2", name: "Старая монета", icon: "🪙" },
      { id: "rat_part_3", name: "Кусок сыра", icon: "🧀" },
      { id: "rat_part_4", name: "Клык крысы", icon: "🦷" },
      { id: "rat_part_5", name: "Повязка на глаз", icon: "🩹" }
    ]
  },
  {
    id: "spider_collection",
    name: "Коллекция Паучьего Леса",
    locationId: "north-riverport",
    bossId: "spider-boss-1",
    rewardSilver: 3000,
    rewardExp: 800,
    parts: [
      { id: "spider_part_1", name: "Паутина", icon: "🕸️" },
      { id: "spider_part_2", name: "Ядовитый клык", icon: "🦷" },
      { id: "spider_part_3", name: "Кокон", icon: "🥚" },
      { id: "spider_part_4", name: "Хитиновый панцирь", icon: "🛡️" },
      { id: "spider_part_5", name: "8-й глаз", icon: "👁️" }
    ]
  },
  {
    id: "battalion_weapon_collection",
    name: "Оружие Батальона",
    locationId: "battalion-tomb",
    bossId: "bt_stage_1",
    rewardSilver: 0, // Награда не нужна, так как открывается предмет
    rewardExp: 0,
    parts: [
      { id: "bw_part_1", name: "Рукоять", icon: "🗡️" },
      { id: "bw_part_2", name: "Гарда", icon: "🛡️" },
      { id: "bw_part_3", name: "Клинок", icon: "⚔️" },
      { id: "bw_part_4", name: "Руны", icon: "🔮" },
      { id: "bw_part_5", name: "Печать Генерала", icon: "👑" }
    ]
  },
  {
    id: "oracle_collection",
    name: "Реликвии Оракула",
    locationId: "oracle-tomb",
    bossId: "oracle_stage_1",
    rewardSilver: 0, // Награда не нужна, так как открывается предмет
    rewardExp: 0,
    parts: [
      { id: "oracle_part_1", name: "Осколок зеркала", icon: "🔮" },
      { id: "oracle_part_2", name: "Древний свиток", icon: "📜" },
      { id: "oracle_part_3", name: "Глаз стража", icon: "👁️" },
      { id: "oracle_part_4", name: "Печать Жреца", icon: "✴️" },
      { id: "oracle_part_5", name: "Сердце Оракула", icon: "💠" }
    ]
  }
];
