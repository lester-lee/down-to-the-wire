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
