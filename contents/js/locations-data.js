const LOCATIONS_DATA = [
  /* ========================================= */
  /* РЯД 1 (Низ карты: Y = 2100)               */
  /* ========================================= */
  {
    id: "riverport",
    number: 1,
    name: "Риверпорт",
    reqLevel: 1,
    top: 2100, left: 300,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: true,
    houseType: "tavern",
    actionsTop: 2100, actionsLeft: 300,
    bosses: [
      {
        id: "riverport-rat",
        name: "Крысюк",
        maxHp: 30, damage: 15,
        rewardGold: 20, rewardExp: 75, rewardTail: 1,
        dailyLimit: 30, staminaCost: 1,
        battleImage: "/contents/IconsGame/boss/krysyuk.png"
      }
    ]
  },
  {
    id: "north-riverport",
    number: 2,
    name: "Северный\nРиверпорт",
    reqLevel: 3,
    top: 2100, left: 600,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: true,
    houseType: "tavern2",
    actionsTop: 2100, actionsLeft: 600,
    bosses: [
      {
        id: "north-black-rat",
        name: "Черный Крысюк",
        maxHp: 275, damage: 40,
        rewardGold: 60, rewardExp: 150, rewardTail: 0,
        dailyLimit: 20, staminaCost: 2,
        battleImage: "/contents/IconsGame/boss.png"
      },
      {
        id: "spider-boss-1",
        name: "Пещерный Паук",
        maxHp: 80, damage: 36,
        rewardGold: 30, rewardExp: 125, rewardTail: 1,
        dailyLimit: 20, staminaCost: 2,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "spider-forest",
    number: 3,
    name: "Паучий лес",
    reqLevel: 5,
    top: 2100, left: 900,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "spider-king",
        name: "Король Пауков",
        maxHp: 600, damage: 21,
        rewardGold: 90, rewardExp: 175, rewardTail: 0,
        dailyLimit: 16, staminaCost: 3,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "forest-hermit",
    number: 4,
    name: "Лесной отшельник",
    reqLevel: 7,
    top: 2100, left: 1200,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: true,
    houseType: "hut",
    bosses: null
  },
  {
    id: "bandit-camp",
    number: 5,
    name: "Разбойничий лагерь",
    reqLevel: 9,
    top: 2100, left: 1500,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "bandit",
        name: "Разбойник",
        maxHp: 1775, damage: 21,
        rewardGold: 100, rewardExp: 275, rewardTail: 0,
        dailyLimit: 16, staminaCost: 3,
        battleImage: "/contents/IconsGame/boss.png"
      },
      {
        id: "finya",
        name: "Финя",
        maxHp: 2800, damage: 32,
        rewardGold: 110, rewardExp: 300, rewardTail: 0,
        dailyLimit: 16, staminaCost: 3,
        battleImage: "/contents/IconsGame/boss/fin.png"
      }
    ]
  },
  {
    id: "dead-pass",
    number: 6,
    name: "Перевал мертвецов",
    reqLevel: 11,
    top: 2100, left: 1800,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "skeleton-warrior",
        name: "Скелет-воин",
        maxHp: 4500, damage: 45,
        rewardGold: 150, rewardExp: 400, rewardTail: 1,
        dailyLimit: 15, staminaCost: 4,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "swamp",
    number: 7,
    name: "Гнилые топи",
    reqLevel: 13,
    top: 2100, left: 2100,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "swamp-creature",
        name: "Болотная тварь",
        maxHp: 7000, damage: 60,
        rewardGold: 200, rewardExp: 550, rewardTail: 1,
        dailyLimit: 15, staminaCost: 4,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },

  /* ========================================= */
  /* РЯД 2 (Справа налево: Y = 1700)           */
  /* ========================================= */
  {
    id: "witch-house",
    number: 8,
    name: "Дом ведьмы",
    reqLevel: 15,
    top: 1700, left: 2100,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "witch",
        name: "Ведьма",
        maxHp: 10000, damage: 80,
        rewardGold: 300, rewardExp: 800, rewardTail: 1,
        dailyLimit: 12, staminaCost: 5,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "lizard-den",
    number: 9,
    name: "Логово ящеров",
    reqLevel: 17,
    top: 1700, left: 1800,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "lizard-king",
        name: "Король ящеров",
        maxHp: 15000, damage: 110,
        rewardGold: 450, rewardExp: 1200, rewardTail: 1,
        dailyLimit: 10, staminaCost: 6,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "sunken-ruins",
    number: 10,
    name: "Затонувшие руины",
    reqLevel: 19,
    top: 1700, left: 1500,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "water-elemental",
        name: "Водяной элементаль",
        maxHp: 22000, damage: 140,
        rewardGold: 600, rewardExp: 1600, rewardTail: 1,
        dailyLimit: 8, staminaCost: 7,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "hydra-lair",
    number: 11,
    name: "Логово гидры",
    reqLevel: 21,
    top: 1700, left: 1200,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "hydra",
        name: "Гидра",
        maxHp: 30000, damage: 180,
        rewardGold: 800, rewardExp: 2000, rewardTail: 1,
        dailyLimit: 6, staminaCost: 8,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "cursed-mill",
    number: 12,
    name: "Проклятая мельница",
    reqLevel: 23,
    top: 1700, left: 900,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "mill-ghost",
        name: "Призрак мельника",
        maxHp: 40000, damage: 220,
        rewardGold: 1000, rewardExp: 2500, rewardTail: 1,
        dailyLimit: 5, staminaCost: 9,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "stone-pass",
    number: 13,
    name: "Каменный перевал",
    reqLevel: 25,
    top: 1700, left: 600,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "stone-golem",
        name: "Каменный голем",
        maxHp: 50000, damage: 260,
        rewardGold: 1200, rewardExp: 3000, rewardTail: 1,
        dailyLimit: 4, staminaCost: 10,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "eagle-nest",
    number: 14,
    name: "Орлиное гнездо",
    reqLevel: 27,
    top: 1700, left: 300,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "eagle-king",
        name: "Король орлов",
        maxHp: 65000, damage: 320,
        rewardGold: 1500, rewardExp: 3500, rewardTail: 1,
        dailyLimit: 3, staminaCost: 11,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },

  /* ========================================= */
  /* РЯД 3 (Слева направо: Y = 1300)           */
  /* ========================================= */
  {
    id: "deep-mine",
    number: 15,
    name: "Глубокие шахты",
    reqLevel: 29,
    top: 1300, left: 300,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "mine-troll",
        name: "Шахтный тролль",
        maxHp: 80000, damage: 380,
        rewardGold: 1800, rewardExp: 4000, rewardTail: 1,
        dailyLimit: 3, staminaCost: 12,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "ice-cave",
    number: 16,
    name: "Ледяная пещера",
    reqLevel: 31,
    top: 1300, left: 600,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "ice-giant",
        name: "Ледяной великан",
        maxHp: 95000, damage: 440,
        rewardGold: 2100, rewardExp: 4500, rewardTail: 1,
        dailyLimit: 3, staminaCost: 13,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "dragon-peak",
    number: 17,
    name: "Драконий пик",
    reqLevel: 33,
    top: 1300, left: 900,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "young-dragon",
        name: "Молодой дракон",
        maxHp: 120000, damage: 520,
        rewardGold: 2500, rewardExp: 5200, rewardTail: 1,
        dailyLimit: 2, staminaCost: 14,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "sky-fortress",
    number: 18,
    name: "Небесная крепость",
    reqLevel: 35,
    top: 1300, left: 1200,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "sky-knight",
        name: "Небесный рыцарь",
        maxHp: 150000, damage: 600,
        rewardGold: 3000, rewardExp: 6000, rewardTail: 1,
        dailyLimit: 2, staminaCost: 15,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "ash-fields",
    number: 19,
    name: "Пепельные поля",
    reqLevel: 37,
    top: 1300, left: 1500,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "ash-demon",
        name: "Пепельный демон",
        maxHp: 185000, damage: 700,
        rewardGold: 3500, rewardExp: 7000, rewardTail: 1,
        dailyLimit: 2, staminaCost: 16,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "lava-river",
    number: 20,
    name: "Река лавы",
    reqLevel: 39,
    top: 1300, left: 1800,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "lava-worm",
        name: "Лавовый червь",
        maxHp: 220000, damage: 800,
        rewardGold: 4000, rewardExp: 8000, rewardTail: 1,
        dailyLimit: 2, staminaCost: 17,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  },
  {
    id: "volcano",
    number: 21,
    name: "Вулкан",
    reqLevel: 41,
    top: 1300, left: 2100,
    mapIcon: "/contents/IconsGame/but.png",
    hasHouse: false,
    bosses: [
      {
        id: "fire-lord",
        name: "Повелитель огня",
        maxHp: 260000, damage: 950,
        rewardGold: 5000, rewardExp: 9500, rewardTail: 1,
        dailyLimit: 1, staminaCost: 18,
        battleImage: "/contents/IconsGame/boss.png"
      }
    ]
  }
  ];

