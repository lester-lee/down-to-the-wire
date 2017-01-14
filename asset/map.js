Game.DATASTORE.MAP = {};

Game.Map = function(mapKey) {
    this._tiles = Game.HeistPresets[mapKey].getMapTiles();
    this.attr = {
        _id: Game.Util.randomString(16),
        _mapKey: mapKey,
        _width: this._tiles.length,
        _height: this._tiles[0].length,
        _entitiesByLocation: {},
        _locationsByEntity: {},
        _prevMapID: '',
        _nextMapID: ''
    };
    Game.DATASTORE.MAP[this.attr._id] = this;
};

Game.Map.prototype.getID = function() {
    return this.attr._id;
};

Game.Map.prototype.getWidth = function() {
    return this.attr._width;
};

Game.Map.prototype.getHeight = function() {
    return this.attr._height;
};

Game.Map.prototype.setPrevMap = function(id){
    this.attr._prevMapID = id;
};

Game.Map.prototype.setNextMap = function(id){
    this.attr._nextMapID = id;
};

Game.Map.prototype.getPrevMap = function(){
    return Game.DATASTORE.MAP[this.attr._prevMapID];
};

Game.Map.prototype.getNextMap = function(){
    return Game.DATASTORE.MAP[this.attr._nextMapID];
};

Game.Map.prototype.getTile = function(pos) {
    x = pos.x;
    y = pos.y;
    if ((x < 0) || (x >= this.attr._width) ||
        (y < 0) || (y >= this.attr._height)) {
        return Game.Tile.nullTile;
    }
    return this._tiles[x][y] || Game.Tile.nullTile;
};

Game.Map.prototype.addEntity = function(ent, pos) {
    this.attr._entitiesByLocation[pos.x + ',' + pos.y] = ent.getID();
    this.attr._locationsByEntity[ent.getID()] = pos;
    ent.setMap(this);
    ent.setPos(pos);
}

Game.Map.prototype.updateEntityLocation = function(ent) {
    var origLoc = this.attr._locationsByEntity[ent.getID()];
    if (origLoc) {
        this.attr._entitiesByLocation[origLoc.x+','+origLoc.y] = undefined;
    }
    var pos = ent.getPos();
    this.attr._entitiesByLocation[pos.x + ',' + pos.y] = ent.getID();
    this.attr._locationsByEntity[ent.getID()] = pos;
}

Game.Map.prototype.getEntity = function(pos) {
    var entID = this.attr._entitiesByLocation[pos.x + ',' + pos.y];
    if (entID) {
        return Game.DATASTORE.ENTITY[entID];
    }
    return false;
}

Game.Map.prototype.getRandomTile = function(filter) {
    if (filter == undefined) {
        filter = function(t) {
            return true;
        };
    }
    var tX, tY, t;
    do {
        tX = Game.Util.randomInt(0, this.attr._width - 1);
        tY = Game.Util.randomInt(0, this.attr._height - 1);
        t = this.getTile({
            x: tX,
            y: tY
        });
    } while (!filter(t));
    return new Game.Coordinate(tX, tY);
}

Game.Map.prototype.getRandomTileWalkable = function() {
    return this.getRandomTile(function(t) {
        return t.isWalkable();
    });
};

Game.Map.prototype.renderOn = function(display, camX, camY) {
    var dispW = display._options.width;
    var dispH = display._options.height;
    var xStart = camX - Math.round(dispW / 2);
    var yStart = camY - Math.round(dispH / 2);
    for (var x = 0; x < dispW; x++) {
        for (var y = 0; y < dispH; y++) {
            var pos = new Game.Coordinate(x + xStart, y + yStart);
            var tile = this.getTile(pos);
            if (tile.getName() == 'null') {
                tile = Game.Tile.wallTile;
            }
            tile.draw(display, x, y);
            var ent = this.getEntity(pos);
            if (ent && ent.getName()) {
                ent.draw(display, x, y)
            }
        }
    }
};
Game.Map.prototype.toJSON = function() {
    var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
    return json;
};

Game.Map.prototype.fromJSON = function(json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};
