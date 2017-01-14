Game.UIMode = {};
Game.UIMode.DEFAULT_FG = '#ddd';
Game.UIMode.DEFAULT_BG = '#000';
var fg = Game.UIMode.DEFAULT_FG;
var bg = Game.UIMode.DEFAULT_BG;

Game.UIMode.titleScreen = {
    enter: function() {
      //Navmap test
      const navmap = new Graph();
      navmap.addEdge("earth", "moon");
      navmap.addEdge("earth", "venus");
      navmap.addEdge("venus", "mercury");
      navmap.addEdge("mercury", "sun");
      navmap.printNodes();
    },
    exit: function() {},
    render: function(display) {
        display.drawText(1, 4, "this is a title screen");
        display.drawText(1, 5, "Press any key to continue.");
    },
    handleInput: function(inputType, inputData) {
        if (inputData.charCode !== 0) {
            Game.switchUIMode(Game.UIMode.persistence);
        }
    }
};

Game.UIMode.persistence = {
    RANDOM_SEED_KEY: 'gameRandomSeed',
    enter: function() {},
    exit: function() {},
    render: function(display) {
        display.drawText(1, 4, "[S] to save your game");
        display.drawText(1, 5, "[L] to load your game");
        display.drawText(1, 6, "[N] to start a new game");
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'PERSISTENCE_SAVE':
                this.saveGame();
                break;
            case 'PERSISTENCE_LOAD':
                this.loadGame();
                break;
            case 'PERSISTENCE_NEW':
                this.newGame();
                break;
            case 'CANCEL':
                Game.switchUIMode(Game.UIMode.gamePlay);
                break;
            default:
                break;
        }
    },
    newGame: function() {
        Game.clearDatastore();
        Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
        Game.switchUIMode(Game.UIMode.gameIntro);
    },
    saveGame: function() {
        if (this.localStorageAvailable()) {
            Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
            Game.DATASTORE.MESSAGES = Game.Message.attr;
            window.localStorage.setItem(Game.PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
            Game.switchUIMode(Game.UIMode.gamePlay);
        } else {
            Game.Message.send("Your browser does not support save files.");
            Game.switchUIMode(Game.UIMode.gamePlay);
        }
    },
    loadGame: function() {
        var json_state_data = window.localStorage.getItem(Game.PERSISTENCE_NAMESPACE);
        var state_data = JSON.parse(json_state_data);

        Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

        /*
              // load maps
              for (var mapID in state_data.MAP) {
                  if (state_data.MAP.hasOwnProperty(mapID)) {
                      var mapAttr = JSON.parse(state_data.MAP[mapID]);
                      Game.DATASTORE.MAP[mapID] = new Game.Map(mapAttr._mapKey);
                      Game.DATASTORE.MAP[mapID].fromJSON(state_data.MAP[mapID]);
                  }
              }

              // load entities
              for (var entID in state_data.ENTITY) {
                  if (state_data.ENTITY.hasOwnProperty(entID)) {
                      var entAttr = JSON.parse(state_data.ENTITY[entID]);
                      Game.DATASTORE.ENTITY[entID] = Game.EntityGenerator.create(entAttr._generator_key);
                      Game.DATASTORE.ENTITY[entID].fromJSON(state_data.ENTITY[entID]);
                  }
              }
        */
        // load gamePlay
        Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
        Game.Message.attr = state_data.MESSAGES;

        Game.switchUIMode(Game.UIMode.gamePlay);
    },
    localStorageAvailable: function() { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
        try {
            var x = '__storage_test__';
            window.localStorage.setItem(x, x);
            window.localStorage.removeItem(x);
            return true;
        } catch (e) {
            Game.Message.send('Sorry, no local data storage is available for this browser');
            return false;
        }
    },
    BASE_toJSON: function(state_hash_name) {
        var state = this.attr;
        if (state_hash_name) {
            state = this[state_hash_name];
        }
        return JSON.stringify(state);
    },
    BASE_fromJSON: function(json, state_hash_name) {
        var using_state_hash = 'attr';
        if (state_hash_name) {
            using_state_hash = state_hash_name;
        }
        this[using_state_hash] = JSON.parse(json);
    }
};

Game.UIMode.gameIntro = {
    enter: function() {
        Game.Message.clear();
        Game.Message.send('yer embarkin on a new journey');
        var inputDisplay = document.getElementById('user-input');
        inputDisplay.parentElement.style.display = "block";
        setTimeout(function(){inputDisplay.focus()},100);
    },
    exit: function() {},
    render: function(display) {
        display.drawText(1, 4, "here is some story introduction");
        display.drawText(1, 5, "please enter your name");
    },
    handleInput: function(inputType, inputData) {
        // if (inputData.charCode !== 0) {
        //     Game.switchUIMode(Game.UIMode.shipScreen);
        // }
    }
};

Game.UIMode.shipScreen = {
    enter: function() {},
    exit: function() {},
    render: function(display) {

    },
    handleInput: function(inputType, inputData) {

    }
};

Game.UIMode.navigation = {
    enter: function() {},
    exit: function() {},
    render: function(display) {

    },
    handleInput: function(inputType, inputData) {

    }
};

Game.UIMode.gamePlay = {
    attr: {},
    enter: function() {},
    exit: function() {},
    render: function(display) {

    },
    handleInput: function(inputType, inputData) {

    }
};
