Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

// Game.EntityGenerator.learn({
//     name: 'avatar',
//     chr: 'D',
//     fg: '#fff',
//     maxHP: 10,
//     dodge: .1,
//     defaultEquipment: ["90 Camera", "Movement Apparatus", "Big Fist"],
//     traits: [
//         "PlayerMessager", "Chronicle", "MapMemory", "Sight", "WalkerCorporeal",
//         "PlayerActor", "StatHitPoints", "MeleeAttacker", "DoorOpener",
//         "InventoryHolder", "EquipmentHolder"
//     ]
// });


Game.EntityGenerator.learn({
    name: '',
    type: 'initial_drone',
    chr: 'D',
    fg: '#fff',
    maxHP: 10,
    dodge: .1,
    defaultEquipment: ["90 Camera", "Movement Apparatus", "Big Fist"],
    traits: [
        "PlayerMessager", "Chronicle", "MapMemory", "Sight", "WalkerCorporeal",
        "PlayerActor", "StatHitPoints", "MeleeAttacker", "DoorOpener",
        "InventoryHolder", "EquipmentHolder", "SpeciesDrone"
    ]
}, "initial_drone");

Game.EntityGenerator.learn({
    name: 'janitor drone',
    chr: 'j',
    fg: '#0bf',
    maxHP: 5,
    dodge: .1,
    defaultEquipment: ["180 Camera", "Movement Apparatus", "Big Fist"],
    traits: [
        "Sight", "WanderChaserActor", "WalkerCorporeal", "StatHitPoints",
        "MeleeAttacker", "InventoryHolder", "EquipmentHolder"
    ]
});

Game.EntityGenerator.learn({
    name: 'Ancient Security Drone',
    chr: 'a',
    fg: '#0bf',
    maxHP: 3,
    dodge: 0,
    defaultEquipment: ["180 Camera", "Movement Apparatus", "Small Fist"],
    traits: [
        "Sight", "WanderChaserActor", "WalkerCorporeal", "StatHitPoints",
        "MeleeAttacker", "InventoryHolder", "EquipmentHolder"
    ]
});
