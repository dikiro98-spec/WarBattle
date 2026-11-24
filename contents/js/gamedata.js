/* ========================================= */
/* GAMEDATA.JS — БАЗА ДАННЫХ И КОНСТАНТЫ     */
/* ========================================= */

const ACHIEVEMENTS_DATA = {
  gold_1: { title: "Медный кошелек", desc: "Накопите 1 000 золота", target: 1000, type: "gold", reward: { gold: 200 } },
  gold_2: { title: "Звонкая монета", desc: "Накопите 10 000 золота", target: 10000, type: "gold", reward: { gold: 1000, crystal: 3 } },
  gold_3: { title: "Тугой мешок", desc: "Накопите 50 000 золота", target: 50000, type: "gold", reward: { gold: 5000, crystal: 8 } },
  gold_4: { title: "Карманы лопаются", desc: "Накопите 100 000 золота", target: 100000, type: "gold", reward: { crystal: 15 } },

  boss_1: { title: "Истребитель крыс", desc: "Победите босса 1 раз", target: 1, type: "boss", reward: { gold: 500, crystal: 2 } },
  boss_2: { title: "Гроза подземелий", desc: "Победите боссов 10 раз", target: 10, type: "boss", reward: { gold: 1500, crystal: 5 } },
  boss_3: { title: "Охотник на гоблинов", desc: "Победите боссов 50 раз", target: 50, type: "boss", reward: { gold: 5000, crystal: 12 } },

  crystal_1: { title: "Искрящийся камень", desc: "Накопите 10 кристаллов", target: 10, type: "crystal", reward: { gold: 1000 } },
  crystal_2: { title: "Горсть самоцветов", desc: "Накопите 50 кристаллов", target: 50, type: "crystal", reward: { gold: 5000, crystal: 5 } },

  power_1: { title: "Первые шаги", desc: "Достигните 500 мощи", target: 500, type: "power", reward: { gold: 500 } },
  power_2: { title: "Закаленный в боях", desc: "Достигните 2 500 мощи", target: 2500, type: "power", reward: { gold: 2000, crystal: 5 } }
};

const LOCATIONS_DATA = [
  {
    id: "riverport",
    number: 1,
    name: "Руины древнего форта",
    reqLevel: 1,
    top: 350,
    left: 200,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: true,
    houseType: "tavern2",
    bosses: [
      {
        id: "riverport-rat",
        name: "Крысюк",
        maxHp: 30,
        damage: 5,
        rewardGold: 20,
        rewardExp: 75,
        rewardTail: 1,
        staminaCost: 1,
        dailyLimit: 30,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  }
];

const QUESTS_POOL = [
  { id: "q_kill_boss", title: "Охота на монстров", desc: "Победите любого босса 3 раза", target: 3, type: "boss", reward: { gold: 300, crystal: 2 } },
  { id: "q_earn_gold", title: "Торговец", desc: "Соберите 500 золота", target: 500, type: "gold", reward: { crystal: 3 } },
  { id: "q_upgrade_talent", title: "Путь развития", desc: "Улучшите любой талант 1 раз", target: 1, type: "talent", reward: { gold: 500 } }
];
