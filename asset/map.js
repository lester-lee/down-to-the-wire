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
        _itemsByLocation: {},
        _prevMapID: '',
        _nextMapID: '',
    };

    this._fov = null;
    this._scheduler = new ROT.Scheduler.Action();
    this.setUpFOV();
    Game.DATASTORE.MAP[this.attr._id] = this;
    Game.HeistPresets[mapKey].addMobs(this);
    Game.HeistPresets[mapKey].addItems(this);
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

Game.Map.prototype.getScheduler = function() {
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
    this.attr._entitiesByLocation[pos.x + ',' + pos.y] = ent.getID();
    this.attr._locationsByEntity[ent.getID()] = pos;
    ent.setMap(this);
    ent.setPos(pos);
    if (ent.hasOwnProperty('act')) {
        this._scheduler.add(ent, true);
    }
};

Game.Map.prototype.addItem = function(item, pos) {
    var loc = pos.x + "," + pos.y;
    var prevItemID = this.attr._itemsByLocation[loc];
    if (prevItemID){
        var prevItem = Game.DATASTORE.ITEM[prevItemID]
        Game.Message.send(prevItem.getName() + " has been crushed.");
        delete Game.DATASTORE.ITEM[prevItemID];
    }
    this.attr._itemsByLocation[loc] = [item.getID()];
    /*
    if (!this.attr._itemsByLocation[loc]) {
        this.attr._itemsByLocation[loc] = [];
    }
    this.attr._itemsByLocation[loc].push(item.getID());
    */
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


Game.Map.prototype.getItems = function(pos) {
    var useX = pos.x;
    var useY = pos.y;
    var itemIDs = this.attr._itemsByLocation[useX + ',' + useY];
    if (itemIDs) {
        return itemIDs.map(function(id) {
            return Game.DATASTORE.ITEM[id];
        });
    }
    return [];
};

Game.Map.prototype.extractEntity = function(ent) {
    this.attr._entitiesByLocation[ent.getX() + "," + ent.getY()] = undefined;
    this.attr._locationsByEntity[ent.getID()] = undefined;
    return ent;
};

Game.Map.prototype.extractItemAt = function(itm_or_idx, pos) {
    var useX = pos.x;
    var useY = pos.y;
    var itemIDs = this.attr._itemsByLocation[useX + ',' + useY];
    if (!itemIDs) {
        return false;
    }

    var item = false,
        extractedID = '';
    if (Number.isInteger(itm_or_idx)) {
        extractedID = itemIDs.splice(itm_or_idx, 1);
        item = Game.DATASTORE.ITEM[extractedID];
    } else {
        var idToFind = itm_or_idx.getID();
        for (var i = 0; i < itemIDs.length; i++) {
            if (idToFind === itemIDs[i]) {
                extractedID = itemIDs.splice(i, 1);
                item = Game.DATASTORE.ITEM[extractedID];
                break;
            }
        }
    }
    return item;
};

Game.Map.prototype.getRandomTile = function(filter) {
    if (filter == undefined) {
        filter = function(t, tX, tY) {
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
    } while (!filter(t, tX, tY));

    return {
        x: tX,
        y: tY
    };
}

Game.Map.prototype.getRandomTileWalkable = function() {
    var map = this;
    return this.getRandomTile(function(t, tX, tY) {
        return t.isWalkable() && !map.getEntity(tX, tY) && !t.isAirlock() && map.getItems({x:tX,y:tY}).length == 0;
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
    var showVisibleItems = (opt.showVisibleItems !== undefined) ? opt.showVisibleItems : true;
    var showVisibleTiles = (opt.showVisibleTiles !== undefined) ? opt.showVisibleTiles : true;

    var checkCellsMasked = opt.maskedCells !== undefined;
    var maskedCells = opt.maskedCells || {};
    var showMaskedEntities = (opt.showMaskedEntities !== undefined) ? opt.showMaskedEntities : false;
    var showMaskedItems = (opt.showMaskedItems !== undefined) ? opt.showMaskedItems : true;
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

            var items = this.getItems(pos);
            if (items.length == 1) {
                if (showVisibleItems && visibleCells[coord]) {
                    items[0].draw(display, x, y);
                } else if (showMaskedItems && maskedCells[coord]) {
                    items[0].draw(display, x, y, true);
                }
            } else if (items.length > 1) {
                if (showVisibleItems && visibleCells[coord]) {
                    Game.Symbol.ITEM_PILE.draw(display, x, y);
                } else if (showMaskedItems && maskedCells[coord]) {
                    Game.Symbol.ITEM_PILE.draw(display, x, y, true);
                }
            }

            var ent = this.getEntity(pos);
            if (ent) {
                if (showVisibleEntities && visibleCells[coord]) {
                    ent.draw(display, x, y);
                } else if (ent.getFriendly()) {
                    ent.draw(display, x, y);
                }else if (showMaskedEntities && maskedCells[coord]) {
                    ent.draw(display, x, y, true);
                }
            }
        }
    }
};

Game.Map.prototype.renderFovOn = function(display, camX, camY, radius) {
    var dims = Game.util.getDisplayDim(display);
    var xStart = camX - Math.round(dims.w / 2);
    var yStart = camY - Math.round(dims.h / 2);

    // track fov visibility
    var inFov = {};
    this._fov.compute(camX, camY, radius, function(x, y, radius, visibility) {
        inFov[x + "," + y] = true;
    });

    for (var x = 0; x < dims.w; x++) {
        for (var y = 0; y < dims.h; y++) {
            // Fetch the glyph for the tile and render it to the screen - sub in wall tiles for nullTiles / out-of-bounds
            var pos = {
                x: x + xStart,
                y: y + yStart
            };
            if (inFov[pos.x + ',' + pos.y]) {
                var tile = this.getTile(pos);
                if (tile.getName() == 'nullTile') {
                    tile = Game.Tile.wallTile;
                }
                tile.draw(display, x, y);
                var ent = this.getEntity(pos);
                if (ent) {
                    ent.draw(display, x, y);
                }
            }
        }
    }
    return inFov;
};

Game.Map.prototype.toJSON = function() {
    // var json = Game.UIMode.persistence.BASE_toJSON.call(this);
    // return json;
};

Game.Map.prototype.fromJSON = function(json) {
    // Game.UIMode.persistence.BASE_fromJSON.call(this, json);
};
