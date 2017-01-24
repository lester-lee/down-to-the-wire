Game.ItemGenerator = new Game.Generator('items', Game.Item);

Game.ItemGenerator.learn({
    name: '_inventoryContainer',
    traits: ["Container"]
});

Game.ItemGenerator.learn({
    name: 'Repair Kit',
    description: 'a basic drone repair kit',
    chr: "R",
    fg: '#f32',
    repairValue: 3,
    traits: ['Repair']
});

Game.ItemGenerator.learn({
  name: '90 Camera',
  description: "it's a camera",
  chr: "C",
  fg: "#f22",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 90,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '180 Camera',
  description: "it's a camera",
  chr: "C",
  fg: "#2f2",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 180,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '360 Camera',
  description: "it's a camera",
  chr: "C",
  fg: "#22f",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 360,
  traits: ['Equipable','StatModifierSight']
});


Game.ItemGenerator.learn({
  name: 'Scrap Metal',
  description: "maybe you'll be able to use it",
  chr: "F",
  fg: "#333"
});

Game.ItemGenerator.learn({
  name: 'Big Fist',
  description: "you can punch now",
  chr: "F",
  fg: "#333",
  equipCategory: "weapon",
  attack: 1,
  accuracy: .95,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Movement Apparatus',
  description: "it lets you move",
  chr: "L",
  fg: "#eee",
  equipCategory: "legs",
  traits: ['Equipable','StatModifierMovement']
});

Game.ItemGenerator.learn({
  name: 'Fuel Rod',
  description: "it is a Plutonium dowl to power your ship",
  chr: "!",
  fg: "#F80"
});
