Game.HeistPresets = {
    'ship_easy':{
      _width: 60,
      _height: 25,
      getMapTiles: function() {
          var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
          var generator = new ROT.Map.Uniform(this._width, this._height, {roomDugPercentage:0.15});
          generator.create(function(x, y, v) {
              if (v === 0) {
                  mapTiles[x][y] = Game.Tile.floorTile;
              } else {
                  mapTiles[x][y] = Game.Tile.wallTile;
              }
          });

          return mapTiles;
      }
    },
    'dungeon': {
        _width: 100,
        _height: 100,
        getMapTiles: function() {
            var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
            var generator = new ROT.Map.Rogue(this._width, this._height);
            generator.create(function(x, y, v) {
                if (v === 0) {
                    mapTiles[x][y] = Game.Tile.floorTile;
                } else {
                    mapTiles[x][y] = Game.Tile.wallTile;
                }
            });

            return mapTiles;
        }
    },
    'cave': {
        _width: 100,
        _height: 100,
        getMapTiles: function() {
            var mapTiles = Game.Util.init2DArray(this._width, this._height, Game.Tile.nullTile);
            var generator = new ROT.Map.Cellular(this._width, this._height);
            generator.randomize(0.55);
            generator.create(function(x, y, v) {
                if (v === 1) {
                    mapTiles[x][y] = Game.Tile.floorTile;
                } else {
                    mapTiles[x][y] = Game.Tile.wallTile;
                }
            });

            return mapTiles;
        }
    }
};
