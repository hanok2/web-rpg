specialModifiers = [
  {
    nameModifier: "Giant %",
    damageModifier:4,
		attackSpeed:1,
    defenseModifier:2,
    luckModifier:0,
    hpModifier:0.5,
    rewardModifier:6
  },
  {
    nameModifier: "Tiny %",
    damageModifier:0.5,
		attackSpeed:1,
    defenseModifier:0.5,
    luckModifier:0,
    hpModifier:2,
    rewardModifier:0.25
  },
  {
    nameModifier: "Puny %",
    damageModifier:0.5,
		attackSpeed:1,
    defenseModifier:2,
    luckModifier:4,
    hpModifier:1,
    rewardModifier:1
  },
  {
    nameModifier: "Trash %",
    damageModifier:0.5,
		attackSpeed:1,
    defenseModifier:0.6,
    luckModifier:0,
    hpModifier:0.5,
    rewardModifier:0
  },
  {
    nameModifier: "Collosal %",
    damageModifier:10,
		attackSpeed:1,
    luckModifier:0,
    defenseModifier:10,
    hpModifier:2,
    rewardModifier:100
  },
  {
    nameModifier: "Quick %",
    damageModifier:.3,
		attackSpeed:2,
    luckModifier:5,
    defenseModifier:2,
    hpModifier:.9,
    rewardModifier:2
  },
  {
    nameModifier: "Slow %",
    damageModifier:1,
		attackSpeed:0.5,
    luckModifier:0,
    defenseModifier:0.5,
    hpModifier:2,
    rewardModifier:0.25
  },
  {
    nameModifier: "King of the %s",
    damageModifier: 4,
		attackSpeed:1,
    luckModifier: 0,
    defenseModifier: 2,
    hpModifier:5,
    rewardModifier:100
  },
  {
    nameModifier: "Queen of the %s",
    damageModifier: 3,
		attackSpeed:1,
    luckModifier:4,
    defenseModifier:0,
    hpModifier:1,
    rewardModifier:100
  }
];

class NPC_Modifier {
  name;
  damage_factor;
  damage_delta;
  luck_factor;
  luck_delta;
  health_factor;
  health_delta;
  reward_factor;
  constructor() {}

  get damage() {
    return {
      factor: (typeof this.damage_delta !== "undefined") ? this.damage_factor : 1,
      delta: (typeof this.damage_delta !== "undefined") ? this.damage_delta : 0
    };
  }
  get luck() {
    return {
      factor: (typeof this.luck_delta !== "undefined") ? this.luck_factor : 1,
      delta: (typeof this.luck_delta !== "undefined") ? this.luck_delta : 0
    };
  }
  get defense() {
    return {
      factor: (typeof this.defense_delta !== "undefined") ? this.defense_factor : 1,
      delta: (typeof this.defense_delta !== "undefined") ? this.defense_delta : 0
    };
  }
  get health() {
    return {
      factor: (typeof this.health_delta !== "undefined") ? this.health_factor : 1,
      delta: (typeof this.health_delta !== "undefined") ? this.health_delta : 0
    };
  }
}

const giant_mod = new NPC_Modifier();
giant_mod.name = "Giant %";
giant_mod.damage_factor = 4;
giant_mod.luck_factor = 0;
giant_mod.reward_factor = 6;

const tiny_mod = new NPC_Modifier();
tiny_mod.name = "Tiny %";
tiny_mod.damage_factor = 4;
tiny_mod.luck_factor = 0;
tiny_mod.reward_factor = 6;

const puny_mod = new NPC_Modifier();
puny_mod.name = "Puny %";
puny_mod.damage_factor = 4;
puny_mod.luck_factor = 0;
puny_mod.reward_factor = 6;

const trash_mod = new NPC_Modifier();
trash_mod.name = "Trash %";
trash_mod.damage_factor = 4;
trash_mod.luck_factor = 0;
trash_mod.reward_factor = 6;

const colossal_mod = new NPC_Modifier();
colossal_mod.name = "Colossal %";
colossal_mod.damage_factor = 4;
colossal_mod.luck_factor = 0;
colossal_mod.reward_factor = 6;

const quick_mod = new NPC_Modifier();
quick_mod.name = "Quick %";
quick_mod.damage_factor = 4;
quick_mod.luck_factor = 0;
quick_mod.reward_factor = 6;

const slow_mod = new NPC_Modifier();
slow_mod.name = "Slow %";
slow_mod.damage_factor = 4;
slow_mod.luck_factor = 0;
slow_mod.reward_factor = 6;

const king_mod = new NPC_Modifier();
king_mod.name = "King %";
king_mod.damage_factor = 4;
king_mod.luck_factor = 0;
king_mod.reward_factor = 6;

const queen_mod = new NPC_Modifier();
queen_mod.name = "Queen %";
queen_mod.damage_factor = 4;
queen_mod.luck_factor = 0;
queen_mod.reward_factor = 6;
