Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: 'D',
    fg: '#fff',
    maxHP: 10,
    attack: 5,
    defense: 2,
    dodge: .1,
    sightRadius: 4,
    sightAngle: 90,
    defaultEquipment: ["90 Camera", "Movement Apparatus"],
    traits: [
        "PlayerMessager", "Chronicle", "MapMemory", "Sight", "WalkerCorporeal",
        "PlayerActor", "StatHitPoints", "MeleeAttacker", "MeleeDefender", "DoorOpener",
        "InventoryHolder", "EquipmentHolder"
    ]
});

Game.EntityGenerator.learn({
    name: 'manta ray',
    chr: 'm',
    fg: '#0bf',
    maxHP: 5,
    dodge: .1,
    traits: ["WalkerCorporeal", "Chronicle", "StatHitPoints", "MeleeDefender"]
});

Game.EntityGenerator.learn({
    name: 'janitor drone',
    chr: 'j',
    fg: '#0bf',
    maxHP: 10,
    attack: 3,
    attackAccuracy: .6,
    defense: 1,
    dodge: .1,
    sightRadius: 4,
    sightAngle: 360,
    traits: ["Sight", "WanderChaserActor", "WalkerCorporeal", "StatHitPoints", "MeleeAttacker", "MeleeDefender"]
});
