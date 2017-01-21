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
        _nextMapID: '',
    };

    this._fov = null;
    this._scheduler = new ROT.Scheduler.Action();
    this.setUpFOV();
    Game.DATASTORE.MAP[this.attr._id] = this;
    Game.HeistPresets[mapKey].addMobs(this);
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

Game.Map.prototype.setPrevMap = function(id) {
    this.attr._prevMapID = id;
};

Game.Map.prototype.setNextMap = function(id) {
    this.attr._nextMapID = id;
};

Game.Map.prototype.getPrevMap = function() {
    return Game.DATASTORE.MAP[this.attr._prevMapID];
};

Game.Map.prototype.getNextMap = function() {
    return Game.DATASTORE.MAP[this.attr._nextMapID];
};

Game.Map.prototype.getScheduler = function(){
  return this._scheduler;
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

Game.Map.prototype.setTile = function(pos, newTile) {
    x = pos.x;
    y = pos.y;
    this._tiles[x][y] = newTile;
};

Game.Map.prototype.addEntity = function(ent, pos) {
    while (this.getEntity(pos)){
      pos = this.getRandomTileWalkable();
    }    
    this.attr._entitiesByLocation[pos.x + ',' + pos.y] = ent.getID();
    this.attr._locationsByEntity[ent.getID()] = pos;
    ent.setMap(this);
    ent.setPos(pos);
    if (ent.hasOwnProperty('act')){
      this._scheduler.add(ent, true);
    }
};

Game.Map.prototype.updateEntityLocation = function(ent) {
    var origLoc = this.attr._locationsByEntity[ent.getID()];
    if (origLoc) {
        this.attr._entitiesByLocation[origLoc.x + ',' + origLoc.y] = undefined;
    }
    var pos = ent.getPos();
    this.attr._entitiesByLocation[pos.x + ',' + pos.y] = ent.getID();
    this.attr._locationsByEntity[ent.getID()] = pos;
};

Game.Map.prototype.getEntity = function(pos) {
    var entID = this.attr._entitiesByLocation[pos.x + ',' + pos.y];
    if (entID) {
        return Game.DATASTORE.ENTITY[entID];
    }
    return false;
};

Game.Map.prototype.extractEntity = function(ent) {
    this.attr._entitiesByLocation[ent.getX() + "," + ent.getY()] = undefined;
    this.attr._locationsByEntity[ent.getID()] = undefined;
    return ent;
};

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

    return {
        x: tX,
        y: tY
    };
}

Game.Map.prototype.getRandomTileWalkable = function() {
    return this.getRandomTile(function(t) {
        return t.isWalkable();
    });
};

Game.Map.prototype.setUpFOV = function() {
    var map = this;
    this._fov = new ROT.FOV.RecursiveShadowcasting(function(x, y) {
        return !map.getTile({
            x: x,
            y: y
        }).isOpaque();
    }, {
        topology: 8
    });
};

Game.Map.prototype.getFOV = function() {
    return this._fov;
};

Game.Map.prototype.rememberCoords = function(toRemember) {
    for (var coord in toRemember) {
        if (toRemember.hasOwnProperty(coord)) {
            this.attr._rememberedCoords[coord] = true;
        }
    }
};


Game.Map.prototype.renderOn = function(display, camX, camY, renderOptions) {
    //visibleCells, showEntities, showTiles, maskRendered, memoryOnly
    var opt = renderOptions || {};
    var checkCellsVisible = opt.visibleCells !== undefined;
    var visibleCells = opt.visibleCells || {};
    var showVisibleEntities = (opt.showVisibleEntities !== undefined) ? opt.showVisibleEntities : true;
    var showVisibleTiles = (opt.showVisibleTiles !== undefined) ? opt.showVisibleTiles : true;

    var checkCellsMasked = opt.maskedCells !== undefined;
    var maskedCells = opt.maskedCells || {};
    var showMaskedEntities = (opt.showMaskedEntities !== undefined) ? opt.showMaskedEntities : false;
    var showMaskedTiles = (opt.showMaskedTiles !== undefined) ? opt.showMaskedTiles : true;

    if (!(showVisibleEntities || showVisibleTiles || showMaskedTiles || showMaskedEntities)) {
        return;
    }

    var dims = Game.Util.getDisplayDim(display);
    var xStart = camX - Math.round(dims.w / 2);
    var yStart = camY - Math.round(dims.h / 2);
    for (var x = 0; x < dims.w; x++) {
        for (var y = 0; y < dims.h; y++) {
            var pos = {
                x: (x + xStart),
                y: (y + yStart)
            };
            var coord = pos.x + ',' + pos.y;

            if (!((checkCellsVisible && visibleCells[coord]) ||
                    (checkCellsMasked && maskedCells[coord]))) {
                continue;
            }

            var tile = this.getTile(pos);
            if (tile.getName() == 'null') {
                tile = Game.Tile.wallTile;
            }

            if (showVisibleTiles && visibleCells[coord]) {
                tile.draw(display, x, y);
            } else if (showMaskedTiles && maskedCells[coord]) {
                tile.draw(display, x, y, true);
            }

            var ent = this.getEntity(pos);
            if (ent) {
                if (showVisibleEntities && visibleCells[coord]) {
                    ent.draw(display, x, y);
                } else if (showMaskedEntities && maskedCells[coord]) {
                    ent.draw(display, x, y, true);
                }
            }
        }
    }
};

Game.Map.prototype.renderFovOn = function (display,camX,camY,radius) {
  var dims = Game.util.getDisplayDim(display);
  var xStart = camX-Math.round(dims.w/2);
  var yStart = camY-Math.round(dims.h/2);

  // track fov visibility
  var inFov = {};
  this._fov.compute(camX,camY,radius,function(x, y, radius, visibility) {
        inFov[x+","+y] = true;
  });

  for (var x = 0; x < dims.w; x++) {
    for (var y = 0; y < dims.h; y++) {
      // Fetch the glyph for the tile and render it to the screen - sub in wall tiles for nullTiles / out-of-bounds
      var mapPos = {x:x+xStart,y:y+yStart};
      if (inFov[mapPos.x+','+mapPos.y]) {
        var tile = this.getTile(mapPos);
        if (tile.getName() == 'nullTile') {
          tile = Game.Tile.wallTile;
        }
        tile.draw(display,x,y);
        var ent = this.getEntity(mapPos);
        if (ent) {
          ent.draw(display,x,y);
        }
      }
    }
  }
  return inFov;
};

Game.Map.prototype.toJSON = function() {
    var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
    return json;
};

Game.Map.prototype.fromJSON = function(json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};
