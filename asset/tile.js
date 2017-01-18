Game.Tile = function(properties) {
    properties = properties || {};
    Game.Symbol.call(this, properties);
    if (!('attr' in this)) { this.attr = {}; }
    this.attr._name = properties.name;
    this.attr._walkable = properties.walkable || false;
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
    return this.attr._name;
}

Game.Tile.prototype.isWalkable = function() {
  return this.attr._walkable;
}

/*
 * Game Tiles
 */

Game.Tile.nullTile = new Game.Tile({name: 'null'});
Game.Tile.floorTile = new Game.Tile({name: 'floor', chr:'.', fg:'#555', walkable:true});
Game.Tile.wallTile = new Game.Tile({name: 'wall', chr:'#'});
