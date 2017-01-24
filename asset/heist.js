Game.UIMode.heist = {
    attr: {
        _mapID: '',
        _avatarID: '',
        _cameraX: 50,
        _cameraY: 50,
        _avDispX: 50,
        _avDispY: 50,
        _engine: null,
        _airlockPos: null
    },
    enter: function(heistArgs) {
        if (heistArgs) {
            var droneID = heistArgs.drone.getID();
            this.attr._avatarID = droneID;
            if (heistArgs.continue) {
                this.getMap().addEntity(this.getAvatar(), heistArgs.airlockPos);
            } else {
                var mapType = heistArgs.map;
                this.setupNewGame(mapType);
                this.getEngine().unlock();
                Game.refresh();
            }
        } else {
            this.getEngine().unlock();
            Game.refresh();
        }
    },
    exit: function() {
        // console.log("gamePlay exit");
        this.getEngine().lock();
        Game.refresh();
    },
    getMap: function() {
        return Game.DATASTORE.MAP[this.attr._mapID];
    },
    setMap: function(m) {
        this.attr._mapID = m.getID();
    },
    getAvatar: function() {
        return Game.DATASTORE.ENTITY[this.attr._avatarID];
    },
    setAvatar: function(a) {
        this.attr._avatarID = a.getID();
    },
    getEngine: function() {
        return this.attr._engine;
    },
    setEngine: function(sched) {
        this.attr._engine = new ROT.Engine(sched);
    },
    render: function(display) {
        var seenCells = this.getAvatar().getVisibleCells();
        this.getMap().renderOn(display, this.attr._cameraX, this.attr._cameraY, {
            visibleCells: seenCells,
            maskedCells: this.getAvatar().getRememberedCoordsForMap()
        });
        this.getAvatar().rememberCoords(seenCells);
    },
    renderAvatarInfo: function(display) {
        display.drawText(1, 2, "avatar x:" + this.getAvatar().getX(), fg, bg); // DEV
        display.drawText(1, 3, "avatar y:" + this.getAvatar().getY(), fg, bg); // DEV
        display.drawText(1, 4, "camera x:" + this.attr._cameraX, fg, bg); // DEVdisplay.drawText(1, 5, "camera y:" + this.attr._cameraY, fg, bg); // DEV
        display.drawText(1, 5, "camera y:" + this.attr._cameraY, fg, bg); // DEVdisplay.drawText(1, 5, "camera y:" + this.attr._cameraY, fg, bg); // DEV
        display.drawText(1, 1, "HP: " + this.getAvatar().getCurHP() + "/" + this.getAvatar().getMaxHP());
        display.drawText(1, 6, "Turns taken: " + this.getAvatar().getTurns());
    },
    moveAvatar: function(dx, dy, dir) {
        Game.Message.ageMessages();
        var input = {
            map: this.getMap(),
            dx: dx,
            dy: dy,
            dir: dir
        };
        if (this.getAvatar().raiseSymbolActiveEvent('tryWalk', input)) {
            this.checkMoveCamera();
            Game.refresh();
        }
    },
    turnAvatar: function(dir) {
        this.getAvatar().setDirection(dir);
        Game.refresh();
    },
    checkMoveCamera: function() {
        // camera follows player
        // this.setCameraToAvatar();

        // camera scrolls when player reaches threshold
        this.setWindowCamera(.30, .70);
    },
    moveCamera: function(dx, dy) {
        this.setCamera(this.attr._cameraX + dx, this.attr._cameraY + dy)
    },
    setCamera: function(sx, sy) {
        var display = Game.getDisplay('main');
        var dispW2 = Math.round(display._options.width / 2);
        var dispH2 = Math.round(display._options.height / 2) - 1;
        this.attr._cameraX = Math.min(Math.max(dispW2, sx), this.getMap().getWidth() - dispW2);
        this.attr._cameraY = Math.min(Math.max(dispH2, sy), this.getMap().getHeight() - dispH2);
    },
    setCameraToAvatar: function() {
        this.setCamera(this.getAvatar().getX(), this.getAvatar().getY());
    },
    setWindowCamera: function(min, max) {
        var display = Game.getDisplay('main');
        var dispW = display._options.width;
        var dispH = display._options.height;
        this.attr._avDispX = this.getAvatar().getX() - this.attr._cameraX + Math.round(display._options.width / 2);
        this.attr._avDispY = this.getAvatar().getY() - this.attr._cameraY + Math.round(display._options.height / 2);
        if (this.attr._avDispX < Math.round(min * dispW)) {
            this.moveCamera(-1, 0);
        }
        if (this.attr._avDispX > Math.round(max * dispW)) {
            this.moveCamera(1, 0);
        }
        if (this.attr._avDispY < Math.round(min * dispH)) {
            this.moveCamera(0, -1);
        }
        if (this.attr._avDispY > Math.round(max * dispH)) {
            this.moveCamera(0, 1);
        }
    },
    setupNewGame: function(heistType) {
        this.setMap(new Game.Map(heistType));
        this.setEngine(this.getMap().getScheduler());
        var startPos = this.getMap().getRandomTileWalkable();
        var airlockPos = {
            x: startPos.x,
            y: startPos.y - 1
        };
        this.attr._airlockPos = airlockPos;
        this.getMap().addEntity(this.getAvatar(), startPos);
        this.getMap().setTile(airlockPos, Game.Tile.airlockTile);
        this.setCameraToAvatar();
    },
    placeAvatar: function() {
        var map = this.getMap();
        var tile = map.getRandomTileWalkable();
        var avatar = this.getAvatar();
        avatar.setPos(tile);
        map.updateEntityLocation(avatar);
        this.setCameraToAvatar();
    },
    /*
     nextLevel: function() {
         var oldMap = this.getMap();
         var nextMap = oldMap.getNextMap()
         if (nextMap) {
             this.setMap(nextMap);
             this.placeAvatar();
         } else {
             nextMap = new Game.Map('cave');
             this.setMap(nextMap);
             nextMap.addEntity(this.getAvatar(), nextMap.getRandomTileWalkable());
             this.setCameraToAvatar();
             this.addMobs(25);
         }
         oldMap.setNextMap(nextMap.getID());
         nextMap.setPrevMap(oldMap.getID());
         Game.refresh();
         Game.Message.send('new land ahoy');
     },
     prevLevel: function() {
         var prevMap = this.getMap().getPrevMap();
         if (!prevMap) {
             return false;
         }
         this.setMap(prevMap);
         this.placeAvatar();
         Game.refresh();
         Game.Message.send('returnin to yer roots eh?');
     }, */
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        var avatar = this.getAvatar();
        var tookTurn = false;
        switch (action) {
            // Movement commands
            case 'MOVE_UL':
                tookTurn = this.moveAvatar(-1, -1, 7);
                break;
            case 'MOVE_UP':
                tookTurn = this.moveAvatar(0, -1, 0);
                break;
            case 'MOVE_UR':
                tookTurn = this.moveAvatar(1, -1, 1);
                break;
            case 'MOVE_LEFT':
                tookTurn = this.moveAvatar(-1, 0, 6);
                break;
            case 'MOVE_STILL':
                avatar.raiseSymbolActiveEvent('actionDone');
                break;
            case 'MOVE_RIGHT':
                tookTurn = this.moveAvatar(1, 0, 2);
                break;
            case 'MOVE_DL':
                tookTurn = this.moveAvatar(-1, 1, 5);
                break;
            case 'MOVE_DOWN':
                tookTurn = this.moveAvatar(0, 1, 4);
                break;
            case 'MOVE_DR':
                tookTurn = this.moveAvatar(1, 1, 3);
                break;
            case 'TURN_UL':
                this.turnAvatar(7);
                break;
            case 'TURN_UP':
                this.turnAvatar(0);
                break;
            case 'TURN_UR':
                this.turnAvatar(1);
                break;
            case 'TURN_LEFT':
                this.turnAvatar(6);
                break;
            case 'TURN_STILL':
                tookTurn = true;
                break;
            case 'TURN_RIGHT':
                this.turnAvatar(2);
                break;
            case 'TURN_DL':
                this.turnAvatar(5);
                break;
            case 'TURN_DOWN':
                this.turnAvatar(4);
                break;
            case 'TURN_DR':
                this.turnAvatar(3);
                break;
            case 'PERSISTENCE':
                Game.addUIMode(Game.UIMode.heistMenu);
                break;
            case 'INVENTORY':
                Game.addUIMode(Game.UIMode.inventory);
                break;
            case 'EQUIPMENT':
                Game.addUIMode(Game.UIMode.inventory, {
                    equip: true
                });
                break;
            case 'NEXT_LEVEL':
                this.nextLevel();
                break;
            case 'PREVIOUS_LEVEL':
                this.prevLevel();
                break;
            case 'CONFIRM':
                var pos = avatar.getPos();
                var tile = this.getMap().getTile(pos);
                if (tile.getName() == 'airlock') {
                    Game.Message.clear();
                    Game.Message.send("Successfully returned to ship.");
                    var inventory = avatar.getInventoryItemIDs();
                    for (var i=0; i < inventory.length; i++){
                      var item = Game.DATASTORE.ITEM[inventory[i]];
                      if (item.getName() === 'Fuel Rod'){
                        avatar.extractInventoryItems([inventory[i]]);
                        Game.UIMode.shipScreen.attr.fuel++;
                      }
                    }
                    Game.switchUIMode(Game.UIMode.shipScreen);
                } else {
                    var itemList = Game.Util.arrayObjectToID(avatar.getMap().getItems(avatar.getPos()));
                    if (itemList.length <= 1) {
                        var itemRes = avatar.pickupItems(itemList);
                        tookTurn = itemRes.numItemsPickedUp > 0;
                    }
                }
                break;
        }
        if (tookTurn) {
            avatar.raiseSymbolActiveEvent('actionDone');
            Game.Message.ageMessages();
            return true;
        }
        return false;
    }
};
