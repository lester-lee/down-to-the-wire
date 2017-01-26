Game.HeistPresets = {
    'ship_1': {
        _width: 60,
        _height: 25,
        mobs: {
            "Ancient Security Drone": [3,7]
        },
        items: {
            "Scrap Metal": [0,3],
            "Equipment Repair Kit": [0,2],
            "Wide Angle Camera": [0,1],
            "Fuel Rod": [1,2],
            "Pneumatic Punch": [0,1],
            "Necklace": [0,1],
            "Broken Glass Jar": [0,1],
            "Bundle of Wires": [0,1]
        },
        getMapTiles: function() {
            var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
            var generator = new ROT.Map.Uniform(this._width, this._height, {
                roomDugPercentage: 0.15
            });
            generator.create(function(x, y, v) {
                if (v === 0) {
                    mapTiles[x][y] = Game.Tile.floorTile;
                } else {
                    mapTiles[x][y] = Game.Tile.wallTile;
                }
            });

            var rooms = generator.getRooms();
            for (var i = 0; i < rooms.length; i++) {
                var room = rooms[i];
                room.getDoors(function(mapX, mapY) {
                    if (ROT.RNG.getUniform() >= 0.4) {
                        mapTiles[mapX][mapY] = Game.Tile.doorClosedTile;
                    } else {
                        mapTiles[mapX][mapY] = Game.Tile.doorOpenTile;
                    }
                });
            }

            return mapTiles;
        },
        addMobs: function(map) {
            var mobNames = Object.keys(this.mobs);
            var amt, i, j;
            for (i = 0; i < mobNames.length; i++) {
                amt = Game.Util.randomInt(this.mobs[mobNames[i]][0], this.mobs[mobNames[i]][1]);
                for (j = 0; j < amt; j++) {
                    map.addEntity(Game.EntityGenerator.create(mobNames[i]), map.getRandomTileWalkable());
                }
            }
        },
        addItems: function(map) {
            var itemNames = Object.keys(this.items);
            var amt, i, j;
            for (i = 0; i < itemNames.length; i++) {
                amt = Game.Util.randomInt(this.items[itemNames[i]][0], this.items[itemNames[i]][1]);
                for (j = 0; j < amt; j++) {
                    map.addItem(Game.ItemGenerator.create(itemNames[i]), map.getRandomTileWalkable());
                }
            }
        }
    },
    'ship_2': {
        _width: 72,
        _height: 30,
        mobs: {
            "Ancient Security Drone": [5,8]
        },
        items: {
            "Scrap Metal": [0,3],
            "Equipment Repair Kit": [0,2],
            "Wide Angle Camera": [0,1],
            "Fuel Rod": [1,2]
        },
        getMapTiles: function() {
            var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
            var generator = new ROT.Map.Uniform(this._width, this._height, {
                roomDugPercentage: 0.2
            });
            generator.create(function(x, y, v) {
                if (v === 0) {
                    mapTiles[x][y] = Game.Tile.floorTile;
                } else {
                    mapTiles[x][y] = Game.Tile.wallTile;
                }
            });

            var rooms = generator.getRooms();
            for (var i = 0; i < rooms.length; i++) {
                var room = rooms[i];
                room.getDoors(function(mapX, mapY) {
                    if (ROT.RNG.getUniform() >= 0.4) {
                        mapTiles[mapX][mapY] = Game.Tile.doorClosedTile;
                    } else {
                        mapTiles[mapX][mapY] = Game.Tile.doorOpenTile;
                    }
                });
            }

            return mapTiles;
        },
        addMobs: function(map) {
            var mobNames = Object.keys(this.mobs);
            var amt, i, j;
            for (i = 0; i < mobNames.length; i++) {
                amt = Game.Util.randomInt(this.mobs[mobNames[i]][0], this.mobs[mobNames[i]][1]);
                for (j = 0; j < amt; j++) {
                    map.addEntity(Game.EntityGenerator.create(mobNames[i]), map.getRandomTileWalkable());
                }
            }
        },
        addItems: function(map) {
            var itemNames = Object.keys(this.items);
            var amt, i, j;
            for (i = 0; i < itemNames.length; i++) {
                amt = Game.Util.randomInt(this.items[itemNames[i]][0], this.items[itemNames[i]][1]);
                for (j = 0; j < amt; j++) {
                    map.addItem(Game.ItemGenerator.create(itemNames[i]), map.getRandomTileWalkable());
                }
            }
        }
    },
    'ship_test': {
        _width: 60,
        _height: 25,
        getMapTiles: function() {
            var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
            var generator = new ROT.Map.Uniform(this._width, this._height, {
                roomDugPercentage: 0.15
            });
            generator.create(function(x, y, v) {
                if (v === 0) {
                    mapTiles[x][y] = Game.Tile.floorTile;
                } else {
                    mapTiles[x][y] = Game.Tile.wallTile;
                }
            });

            var rooms = generator.getRooms();
            for (var i = 0; i < rooms.length; i++) {
                var room = rooms[i];
                room.getDoors(function(mapX, mapY) {
                    if (ROT.RNG.getUniform() >= 0.4) {
                        mapTiles[mapX][mapY] = Game.Tile.doorClosedTile;
                    } else {
                        mapTiles[mapX][mapY] = Game.Tile.doorOpenTile;
                    }
                });
            }

            return mapTiles;
        },
        addMobs: function(map) {
            for (var ecount = 0; ecount < 8; ecount++) {
                var mobSuccess = map.addEntity(Game.EntityGenerator.create('Ancient Security Drone'), map.getRandomTileWalkable());
            }
        },
        addItems: function(map) {
            for (var icount = 0; icount < 8; icount++) {
                map.addItem(Game.ItemGenerator.create('Equipment Repair Kit'), map.getRandomTileWalkable());
            }
            for (var icount = 0; icount < 4; icount++) {
                map.addItem(Game.ItemGenerator.create('Wide Angle Camera'), map.getRandomTileWalkable());
            }
            for (var icount = 0; icount < 4; icount++) {
                map.addItem(Game.ItemGenerator.create('360˚ Camera Array'), map.getRandomTileWalkable());
            }
            for (var icount = 0; icount < 4; icount++) {
                map.addItem(Game.ItemGenerator.create('Fuel Rod'), map.getRandomTileWalkable());
            }
        }
    }
};
