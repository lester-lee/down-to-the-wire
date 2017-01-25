Game.Tile = function(properties) {
    properties = properties || {};
    Game.Symbol.call(this, properties);
    if (!('attr' in this)) {
        this.attr = {};
    }
    this.attr._name = properties.name;
    this.attr._walkable = properties.walkable || false;
    this.attr._opaque = properties.opaque || false;
    this.attr._transparent = !this.attr.opaque;
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
    return this.attr._name;
};

Game.Tile.prototype.isWalkable = function() {
    return this.attr._walkable;
};

Game.Tile.prototype.isAirlock = function(){
    return this.attr._name.localeCompare('airlock') == 0;
};

Game.Tile.prototype.isOpaque = function() {
    return this.attr._opaque;
};

Game.Tile.prototype.isTransparent = function() {
    return this.attr._transparent;
};


/*
 * Game Tiles
 */

Game.Tile.nullTile = new Game.Tile({
    name: 'null'
});
Game.Tile.floorTile = new Game.Tile({
    name: 'floor',
    chr: '.',
    fg: '#bbb',
    walkable: true,
    opaque: false
});
Game.Tile.wallTile = new Game.Tile({
    name: 'wall',
    chr: '█',
    fg: '#bbb',
    opaque: true
});
Game.Tile.doorClosedTile = new Game.Tile({
    name: 'doorClosed',
    chr: '▣',
    //chr: '█',
    fg: '#bbb',
    opaque: true,
});
Game.Tile.doorOpenTile = new Game.Tile({
    name: 'doorOpen',
    chr: '⬚',
    //chr: '⨆',
    fg: '#bbb',
    opaque: false,
    walkable: true,
});
Game.Tile.airlockTile = new Game.Tile({
    name: 'airlock',
    chr: '☼',
    fg: '#ff0',
    opaque: false,
    walkable: true
});
