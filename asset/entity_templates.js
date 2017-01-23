Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: 'D',
    fg: '#fff',
    maxHP: 10,
    dodge: .1,
    defaultEquipment: ["90 Camera", "Movement Apparatus", "Big Fist"],
    traits: [
        "PlayerMessager", "Chronicle", "MapMemory", "Sight", "WalkerCorporeal",
        "PlayerActor", "StatHitPoints", "MeleeAttacker", "DoorOpener",
        "InventoryHolder", "EquipmentHolder"
    ]
});


Game.EntityGenerator.learn({
    name: 'janitor drone',
    chr: 'j',
    fg: '#0bf',
    maxHP: 10,
    dodge: .1,
    defaultEquipment: ["360 Camera", "Movement Apparatus", "Big Fist"],
    traits: [
      "Sight", "WanderChaserActor", "WalkerCorporeal", "StatHitPoints",
      "MeleeAttacker", "InventoryHolder", "EquipmentHolder"
    ]
});
