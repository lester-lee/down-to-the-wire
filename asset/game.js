window.onload = function() {
    if (!ROT.isSupported()) {
        document.getElementById('main-display').innerHTML = "The rot.js library isn't supported by your browser.";
    } else {
        Game.init();
        // Add containers to HTML
        document.getElementById('avatar-display').appendChild(
            Game.getDisplay('avatar').getContainer()
        );
        document.getElementById('main-display').appendChild(
            Game.getDisplay('main').getContainer()
        );
        document.getElementById('message-display').appendChild(
            Game.getDisplay('message').getContainer()
        );

        // Handle keyboard events
        var bindEventToScreen = function(evtType) {
            window.addEventListener(evtType, function(evt) {
                Game.eventHandler(evtType, evt);
            });
        };
        bindEventToScreen('keypress');
        bindEventToScreen('keydown');

        Game.switchUIMode(Game.UIMode.titleScreen);
    }
};

var Game = {
    PERSISTENCE_NAMESPACE: 'spacerogue',
    DATASTORE: {},
    _randomSeed: 0,
    _SPACING: 1.1,
    _display: {
        main: {
            w: 60,
            h: 25,
            o: null
        },
        message: {
            w: 80,
            h: 6,
            o: null
        },
        avatar: {
            w: 20,
            h: 25,
            o: null
        }
    },
    _curUIMode: null,
    _UIStack: [],

    init: function() {
        // set up displays
        for (var display_key in this._display) {
            this._display[display_key].o = new ROT.Display({
                width: this._display[display_key].w,
                height: this._display[display_key].h,
                spacing: Game._SPACING,
                fg: Game.UIMode.DEFAULT_FG,
                bg: Game.UIMode.DEFAULT_BG
                // forceSquareRatio: true
            });
        }
        this.renderAll();
        Game.KeyBinding.setKeyBinding('waxd');
    },
    setRandomSeed: function(s) {
        this._randomSeed = s;
        console.log("using random seed " + this._randomSeed);
        this.DATASTORE[Game.UIMode.persistence.RANDOM_SEED_KEY] = this._randomSeed;
        ROT.RNG.setSeed(this._randomSeed);
    },

    getDisplay: function(displayID) {
        if (this._display.hasOwnProperty(displayID)) {
            return this._display[displayID].o;
        }
        return null;
    },

    refresh: function() {
        this.renderAll();
    },
    renderAll: function() {
        if (this._curUIMode) {
            this.renderMain();
            this.renderAvatar();
            this.renderMessage();
        }
    },
    renderMain: function() {
        this._display.main.o.clear();
        if (this._curUIMode && this._curUIMode.hasOwnProperty('render')) {
            var d = this.getDisplay('main');
            this._curUIMode.render(d);
        }
    },
    renderAvatar: function() {
        this._display.avatar.o.clear();
        if (this._curUIMode && this._curUIMode.hasOwnProperty('renderAvatarInfo')) {
            var d = this.getDisplay('avatar');
            this._curUIMode.renderAvatarInfo(d);
        }
    },
    renderMessage: function() {
        var d = this.getDisplay('message');
        Game.Message.render(d);
    },

    eventHandler: function(evtType, evt) {
        // When an event is received have the current ui handle it
        if (this._curUIMode) {
            this._curUIMode.handleInput(evtType, evt);
            Game.refresh();
        }
    },

    switchUIMode: function(newMode, args) {
        if (this._curUIMode) {
            this._curUIMode.exit();
        }
        this._curUIMode = newMode;
        this._UIStack = [newMode];
        if (this._curUIMode) {
            this._curUIMode.enter(args);
        }
        Game.refresh();
    },

    addUIMode: function(newMode, args){
        this._UIStack.unshift(newMode);
        this._curUIMode = this._UIStack[0];
        this._curUIMode.enter(args);
        Game.refresh();
    },
    removeUIMode: function(){
        var oldMode = this._UIStack.shift();
        oldMode.exit();
        this._curUIMode = this._UIStack[0];
        Game.refresh();
    },
    goBaseUIMode: function(){
        while (this._UIStack.length > 1){
          Game.removeUIMode();
        }
    },

    clearDatastore: function() {
        this.DATASTORE = {
            ENTITY: {},
            SHIP_SCREEN: {},
            MAP: {},
            ITEM: {},
            NAV_MAP: {},
            gameRandomSeed: 0
        }
    },

    toJSON: function() {
        var json = {};
        json._randomSeed = this._randomSeed;
        json[Game.UIMode.gamePlay.JSON_KEY] = Game.UIMode.gamePlay.toJSON();
        return json;
    }

};
