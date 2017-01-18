Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: 'D',
    fg: '#8E7242',
    maxHP: 10,
    attack: 5,
    defense: 2,
    dodge: .1,
    traits: ["WalkerCorporeal", "Chronicle", "StatHitPoints", "MeleeAttacker", "PlayerMessager", "MeleeDefender"]
});

Game.EntityGenerator.learn({
    name: 'manta ray',
    chr: 'm',
    fg: '#0bf',
    maxHP: 2,
    dodge: .1,
    traits: ["WalkerCorporeal", "Chronicle", "StatHitPoints", "MeleeDefender"]
});
