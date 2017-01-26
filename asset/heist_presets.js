Game.HeistPresets = {
  'ship_easy': {
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
          var numASDs = Game.Util.randomInt(5,10);
          for (var ecount = 0; ecount < numASDs; ecount++) {
              var mobSuccess = map.addEntity(Game.EntityGenerator.create('Ancient Security Drone'), map.getRandomTileWalkable());
          }
      },
      addItems: function(map) {
          var numScrap = Game.Util.randomInt(0,3);
          for (var icount = 0; icount < numScrap; icount++) {
              map.addItem(Game.ItemGenerator.create('Scrap Metal'), map.getRandomTileWalkable());
          }
          var numRepair = Game.Util.randomInt(0,2);
          for (var icount = 0; icount < numRepair; icount++) {
              map.addItem(Game.ItemGenerator.create('Equipment Repair Kit'), map.getRandomTileWalkable());
          }
          var numWACs = Game.Util.randomInt(0,1);
          for (var icount = 0; icount < numWACs; icount++) {
              map.addItem(Game.ItemGenerator.create('Wide Angle Camera'), map.getRandomTileWalkable());
          }
          var numFuel = Game.Util.randomInt(0,2);
          for (var icount = 0; icount < numFuel; icount++) {
              map.addItem(Game.ItemGenerator.create('Fuel Rod'), map.getRandomTileWalkable());
          }
      }
  },
  'ship_medium': {
      _width: 72,
      _height: 30,
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
          var numASDs = Game.Util.randomInt(5,10);
          console.log(numASDs);
          for (var ecount = 0; ecount < numASDs; ecount++) {
              var mobSuccess = map.addEntity(Game.EntityGenerator.create('Ancient Security Drone'), map.getRandomTileWalkable());
          }
      },
      addItems: function(map) {
          var numScrap = Game.Util.randomInt(0,3);
          console.log(numScrap);
          for (var icount = 0; icount < numScrap; icount++) {
              map.addItem(Game.ItemGenerator.create('Scrap Metal'), map.getRandomTileWalkable());
          }
          var numRepair = Game.Util.randomInt(0,2);
          console.log(numRepair);
          for (var icount = 0; icount < numRepair; icount++) {
              map.addItem(Game.ItemGenerator.create('Equipment Repair Kit'), map.getRandomTileWalkable());
          }
          var numWACs = Game.Util.randomInt(0,1);
          console.log(numWACs);
          for (var icount = 0; icount < numWACs; icount++) {
              map.addItem(Game.ItemGenerator.create('Wide Angle Camera'), map.getRandomTileWalkable());
          }
          var numFuel = Game.Util.randomInt(0,2);
          console.log(numFuel);
          for (var icount = 0; icount < numFuel; icount++) {
              map.addItem(Game.ItemGenerator.create('Fuel Rod'), map.getRandomTileWalkable());
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
