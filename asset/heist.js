Game.UIMode.heist = {
    attr: {
        _mapID: '',
        _avatarID: '',
        _cameraX: 50,
        _cameraY: 50,
        _avDispX: 50,
        _avDispY: 50
    },
    enter: function(heistType) {
        this.setupNewGame(heistType);
        Game.refresh();
    },
    exit: function() {
        // console.log("gamePlay exit");
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
    moveAvatar: function(dx, dy) {
        Game.Message.ageMessages();
        if (this.getAvatar().tryWalk(this.getMap(), dx, dy)) {
            this.checkMoveCamera();
            Game.refresh();
        }
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
        this.setAvatar(Game.EntityGenerator.create('avatar'));
        this.getMap().addEntity(this.getAvatar(), this.getMap().getRandomTileWalkable());
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
        switch (action) {
            // Movement commands
            case 'MOVE_UL':
                this.moveAvatar(-1, -1);
                break;
            case 'MOVE_UP':
                this.moveAvatar(0, -1);
                break;
            case 'MOVE_UR':
                this.moveAvatar(1, -1);
                break;
            case 'MOVE_LEFT':
                this.moveAvatar(-1, 0);
                break;
            case 'MOVE_STILL':
                this.getAvatar().raiseEntityEvent('tookTurn');
                break;
            case 'MOVE_RIGHT':
                this.moveAvatar(1, 0);
                break;
            case 'MOVE_DL':
                this.moveAvatar(-1, 1);
                break;
            case 'MOVE_DOWN':
                this.moveAvatar(0, 1);
                break;
            case 'MOVE_DR':
                this.moveAvatar(1, 1);
                break;
            case 'PERSISTENCE':
                Game.switchUIMode(Game.UIMode.persistence);
                break;
            case 'NEXT_LEVEL':
                this.nextLevel();
                break;
            case 'PREVIOUS_LEVEL':
                this.prevLevel();
                break;
            default:
                break;
        }
    }
};
