Game.ItemGenerator = new Game.Generator('items', Game.Item);

Game.ItemGenerator.learn({
    name: '_inventoryContainer',
    traits: ["Container"]
});

Game.ItemGenerator.learn({
    name: 'Equipment Equipment Repair Kit',
    description: 'A basic drone equipment repair kit',
    chr: "R",
    fg: '#f32',
    repairValue: 3,
    traits: ['Repair']
});

Game.ItemGenerator.learn({
  name: 'Basic Camera',
  description: "A basic optical sensor",
  chr: "C",
  fg: "#f22",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 90,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: 'Wide Angle Camera',
  description: "An optical sensor with a 180˚ feild-of-view",
  chr: "W",
  fg: "#2f2",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 180,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '360˚ Camera Array',
  description: "An array of optical sensors that give 380˚ vision",
  chr: "C",
  fg: "#22f",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 360,
  traits: ['Equipable','StatModifierSight']
});


Game.ItemGenerator.learn({
  name: 'Scrap Metal',
  description: "Maybe you'll be able to use it",
  chr: "S",
  fg: "#333",
  fabrications: ["Repair Kit","Basic Camera","Movement Apparatus","Hydraulic Punch"],
  traits: ['Fabricator']
});

Game.ItemGenerator.learn({
  name: 'Hydraulic Punch',
  description: "A a spike on a hydralic piston, effective in comabt",
  chr: "F",
  fg: "#333",
  equipCategory: "weapon",
  attack: 1,
  accuracy: .95,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Pneumatic Punch',
  description: "A spike on a Pneumatic piston, somewhat effective in combat",
  chr: "f",
  fg: "#333",
  equipCategory: "weapon",
  attack: 1,
  accuracy: .75,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Wheeled Chasis',
  description: "Allows a drone to navigate under gravity",
  chr: "L",
  fg: "#eee",
  equipCategory: "legs",
  traits: ['Equipable','StatModifierMovement']
});

Game.ItemGenerator.learn({
  name: 'Fuel Rod',
  description: "A Plutonium dowl to power your ship's warp drive",
  chr: "!",
  fg: "#F80"
});

Game.ItemGenerator.learn({
  name: 'Grapple Arm',
  description: "Aallows a drone to tow friendly drones out of danger",
  chr: "H",
  fg: "#eee",
  equipCategory: "arms",
  traits: ['Equipable','StatModifierTow']
});
