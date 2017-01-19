Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: 'D',
    fg: '#fff',
    maxHP: 10,
    attack: 2,
    defense: 2,
    dodge: .1,
    sightRadius: 4,
    sightAngle: 90,
    traits: ["PlayerActor","MapMemory", "Sight", "WalkerCorporeal", "Chronicle", "StatHitPoints", "MeleeAttacker", "PlayerMessager", "MeleeDefender"]
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
    maxHP: 3,
    attack: 1,
    defense: 1,
    dodge: .05,
    traits: ["WanderChaserActor","WalkerCorporeal","StatHitPoints","MeleeAttacker","MeleeDefender"]
});
