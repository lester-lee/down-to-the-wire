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

          var rooms = generator.getRooms();
          for (var i=0; i<rooms.length; i++) {
              var room = rooms[i];
              room.getDoors(function(mapX,mapY) {
                if (ROT.RNG.getUniform() >= 0.2){
                  mapTiles[mapX][mapY] = Game.Tile.doorClosedTile;
                }else{
                  mapTiles[mapX][mapY] = Game.Tile.doorOpenTile;
                }
              });
          }

          return mapTiles;
      },
      addMobs: function(map){
        for (var ecount = 0; ecount < 8; ecount++) {
            map.addEntity(Game.EntityGenerator.create('janitor drone'), map.getRandomTileWalkable());
        }
      },
    }
};
