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
  newSightRadius: 4,
  newSightAngle: 90,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '180 Camera',
  description: "it's a camera",
  chr: "C",
  fg: "#2f2",
  newSightRadius: 10,
  newSightAngle: 180,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '360 Camera',
  description: "it's a camera",
  chr: "C",
  fg: "#22f",
  newSightRadius: 10,
  newSightAngle: 360,
  traits: ['Equipable','StatModifierSight']
});
