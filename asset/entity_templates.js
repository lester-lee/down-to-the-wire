Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: '@',
    fg: '#f00',
    maxHP: 10,
    attackPower: 5,
    traits: [Game.EntityTraits.WalkerCorporeal, Game.EntityTraits.Chronicle, Game.EntityTraits.StatHitPoints, Game.EntityTraits.MeleeAttacker, Game.EntityTraits.PlayerMessager, Game.EntityTraits.MeleeDefender]
});

Game.EntityGenerator.learn({
    name: 'manta ray',
    chr: 'm',
    fg: '#0bf',
    maxHP: 2,
    dodge: .95,
    traits: [Game.EntityTraits.WalkerCorporeal, Game.EntityTraits.Chronicle, Game.EntityTraits.StatHitPoints, Game.EntityTraits.MeleeDefender]
});
