Game.ItemGenerator = new Game.Generator('items', Game.Item);

Game.ItemGenerator.learn({
    name: '_inventoryContainer',
    traits: ["Container"]
});

Game.ItemGenerator.learn({
    name: 'Equipment Repair Kit',
    short_desc: 'A basic drone equipment repair kit',
    long_desc: 'Can a repair kit repair itself?',
    chr: "R",
    fg: '#f32',
    repairValue: 3,
    traits: ['Repair']
});

Game.ItemGenerator.learn({
  name: 'Basic Camera',
  short_desc: "A basic optical sensor",
  long_desc: "Better than not seeing anything.",
  chr: "C",
  fg: "#f22",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 90,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: 'Long Ranged Sensor',
  short_desc: "An upgraded optical sensor",
  long_desc: "What's that at the end of the hallway? Now you know.",
  chr: "C",
  fg: "#ff2",
  equipCategory: "head",
  newSightRadius: 8,
  newSightAngle: 90,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: 'Wide Angle Camera',
  short_desc: "An improved optical sensor",
  long_desc: "But still unable to see behind.",
  chr: "W",
  fg: "#2f2",
  equipCategory: "head",
  newSightRadius: 5,
  newSightAngle: 180,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: '360˚ Camera Array',
  short_desc: "An array of optical sensors",
  long_desc: "Now we're talking. Watch yourself.",
  chr: "C",
  fg: "#22f",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 360,
  traits: ['Equipable','StatModifierSight']
});


Game.ItemGenerator.learn({
  name: 'Spherical Lens',
  short_desc: "Top tier vision",
  long_desc: "Almost like a crystal ball, but it can't see the future.",
  chr: "C",
  fg: "#22f",
  equipCategory: "head",
  newSightRadius: 4,
  newSightAngle: 360,
  traits: ['Equipable','StatModifierSight']
});

Game.ItemGenerator.learn({
  name: 'Scrap Metal',
  short_desc: "It's metal",
  long_desc: "Maybe you'll be able to use it.",
  chr: "S",
  fg: "#eee",
  fabrications: ["Equipment Repair Kit","Basic Camera","Wheeled Chasis","Hydraulic Punch"],
  traits: ['Fabricator']
});


Game.ItemGenerator.learn({
  name: 'Sledgehammer',
  short_desc: "A mauling device",
  long_desc: "Perfect for scrapping old drones.",
  chr: "F",
  fg: "#333",
  equipCategory: "weapon",
  attack: 5,
  accuracy: .95,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Hydraulic Punch',
  short_desc: "A spike on a hydralic piston",
  long_desc: "Is violence the answer? Only if powered by hydraulics!",
  chr: "F",
  fg: "#333",
  equipCategory: "weapon",
  attack: 2,
  accuracy: .95,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Pneumatic Punch',
  short_desc: "A spike on a Pneumatic piston",
  long_desc: "Haven't seen one of these in ages.",
  chr: "p",
  fg: "#333",
  equipCategory: "weapon",
  attack: 1,
  accuracy: .75,
  traits: ['Equipable','StatModifierAttack']
});

Game.ItemGenerator.learn({
  name: 'Wheeled Chasis',
  short_desc: "Allows a drone to navigate under gravity",
  long_desc: "It's exactly what it says it is.",
  chr: "L",
  fg: "#eee",
  equipCategory: "legs",
  traits: ['Equipable','StatModifierMovement']
});

Game.ItemGenerator.learn({
  name: 'Fuel Rod',
  short_desc: "A Plutonium dowl",
  long_desc: "Seems like the ship'll need this.",
  chr: "!",
  fg: "#F80"
});

Game.ItemGenerator.learn({
  name: 'Grapple Arm',
  short_desc: "Allows a drone to tow friendly drones",
  long_desc: "Hey! Come here!",
  chr: "H",
  fg: "#eee",
  equipCategory: "arms",
  traits: ['Equipable','StatModifierTow']
});

/* ================= Misc ================== */

Game.ItemGenerator.learn({
  name: 'Necklace',
  short_desc: "A chain of beads",
  long_desc: "What is this used for?",
  chr: "n",
  fg: "#eee"
});

Game.ItemGenerator.learn({
  name: 'Broken Glass Jar',
  short_desc: "An empty container",
  long_desc: "What will all the other glass jars say?",
  chr: "b",
  fg: "#eee"
});


Game.ItemGenerator.learn({
  name: 'Bundle of Wires',
  short_desc: "A bundle of wires",
  long_desc: "All these connections to be made, nothing to make them with.",
  chr: "w",
  fg: "#eee"
});
