Game.DATASTORE.ENTITY = {};

Game.Entity = function(template) {
    this._traitSet = Game.EntityTraits;
    Game.SymbolActive.call(this, template);
    this.attr._position = {x:0,y:0};
    this.attr._dispPos = {x:0,y:0};
    this.attr._mapID = null;
    this.attr._generator_key = template._generator_key || '';
    this.attr.friendly = template.friendly || false;
    Game.DATASTORE.ENTITY[this.attr._ID] = this;
};

Game.Entity.extend(Game.SymbolActive);

Game.Entity.prototype.destroy = function() {
    this.getMap().extractEntity(this);
    Game.DATASTORE.ENTITY[this.getID()] = undefined;
    this.getScheduler().remove(this);
};

Game.Entity.prototype.getMap = function() {
    return Game.DATASTORE.MAP[this.attr._mapID];
};
Game.Entity.prototype.setMap = function(map) {
    this.attr._mapID = map.getID();
};
Game.Entity.prototype.getMapID = function() {
    return this.attr._mapID;
}

Game.Entity.prototype.getScheduler = function(){
    return this.getMap().getScheduler();
};

Game.Entity.prototype.setPos = function(pos) {
    this.attr._position = pos;
};
Game.Entity.prototype.getPos = function() {
    return this.attr._position;
};
Game.Entity.prototype.getX = function() {
    return this.attr._position.x;
};
Game.Entity.prototype.getY = function() {
    return this.attr._position.y;
};
Game.Entity.prototype.setDispPos = function(pos) {
    this.attr._dispPos = pos;
};
Game.Entity.prototype.getDispPos = function() {
    return this.attr._dispPos;
};
Game.Entity.prototype.getFriendly = function() {
    return this.attr.friendly;
};
Game.Entity.prototype.setFriendly = function(bool) {
    this.attr.friendly = bool;
};
