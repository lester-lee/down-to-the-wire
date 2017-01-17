Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
    name: 'avatar',
    chr: '@',
    fg: '#f00',
    maxHP: 10,
    traits: [Game.EntityTraits.WalkerCorporeal, Game.EntityTraits.Chronicle, Game.EntityTraits.StatHitPoints, Game.EntityTraits.MeleeAttacker, Game.EntityTraits.PlayerMessager]
});

Game.EntityGenerator.learn({
    name: 'manta ray',
    chr: 'm',
    fg: '#0bf',
    maxHP: 2,
    traits: [Game.EntityTraits.WalkerCorporeal, Game.EntityTraits.Chronicle, Game.EntityTraits.StatHitPoints]
});
