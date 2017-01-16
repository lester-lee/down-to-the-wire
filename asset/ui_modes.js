Game.UIMode = {};
Game.UIMode.DEFAULT_FG = '#ddd';
Game.UIMode.DEFAULT_BG = '#000';
var fg = Game.UIMode.DEFAULT_FG;
var bg = Game.UIMode.DEFAULT_BG;

Game.UIMode.titleScreen = {
    enter: function() {},
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
                Game.switchUIMode(Game.UIMode.shipScreen);
                break;
            default:
                break;
        }
    },
    newGame: function() {
        Game.clearDatastore();
        Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
        // Game.switchUIMode(Game.UIMode.gameIntro);
        Game.UIMode.shipScreen.attr.playerName = Game.Util.randomShipName();
        Game.switchUIMode(Game.UIMode.gameIntro);
    },
    saveGame: function() {
        if (this.localStorageAvailable()) {
            Game.DATASTORE.SHIP_SCREEN = Game.UIMode.shipScreen.attr;
            Game.DATASTORE.MESSAGES = Game.Message.attr;
            window.localStorage.setItem(Game.PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
            Game.switchUIMode(Game.UIMode.shipScreen);
        } else {
            Game.Message.send("Your browser does not support save files.");
            Game.switchUIMode(Game.UIMode.shipScreen);
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
        Game.UIMode.shipScreen.attr = state_data.SHIP_SCREEN;
        Game.Message.attr = state_data.MESSAGES;

        Game.switchUIMode(Game.UIMode.shipScreen);
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
        // var inputDisplay = document.getElementById('user-input');
        // inputDisplay.parentElement.style.display = "block";
        // setTimeout(function(){inputDisplay.focus()},100);
    },
    exit: function() {},
    render: function(display) {
        display.drawText(1, 4, "here is some story introduction");
        display.drawText(1, 5, "press [enter] to continue");
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData);
        if (!action) {
            return false;
        }
        switch (action.key) {
            case 'CONFIRM':
                // var inputText = document.getElementById('user-input').value;
                // console.log(inputText);
                Game.switchUIMode(Game.UIMode.shipScreen);
                break;
            default:
                break;
        }
    }
};

Game.UIMode.shipScreen = {
    attr: {
        playerName: null
    },
    shipOptions: ["navigate", "outfit drones", "outfit ship", "heist"],
    enter: function() {},
    exit: function() {},
    render: function(display) {
        display.drawText(0, 1, this.attr.playerName + " STATUS");
        this.renderShipOptions(display);
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData);
        if (!action) {
            return false;
        }
        switch (action.key) {
            case 'NUM_0':
                Game.switchUIMode(Game.UIMode.navigation);
                break;
            case 'NUM_3':
                Game.switchUIMode(Game.UIMode.heist, 'dungeon');
                break;
            case 'PERSISTENCE':
                Game.switchUIMode(Game.UIMode.persistence);
                break;
            default:
                break;
        }
    },
    renderShipOptions: function(display) {
        for (var i = 0; i < this.shipOptions.length; i++) {
            display.drawText(0, i + 3, '[' + i + '] ' + this.shipOptions[i]);
        }
    },
    toJSON: function() {
        return Game.UIMode.persistence.BASE_toJSON.call(this);
    },
    fromJSON: function(json) {
        return Game.UIMode.persistence.BASE_fromJSON.call(this, json);
    }
};

Game.UIMode.navigation = {
    curNode: null, //current location
    tarNode: null, //targeted location
    enter: function() {
        //Navmap test
        navmap = new Graph();
        navmap.addEdge("earth", "moon");
        navmap.addEdge("earth", "venus");
        navmap.addEdge("venus", "mercury");
        navmap.addEdge("mercury", "sun");
        navmap.printNodes();
        curNode = navmap.getNode('earth');
        console.log("Current Node — " + curNode.name);
    },
    exit: function() {},
    render: function(display) {
        display.drawText(0, 1, "NAVIGATION MODE " + curNode.name);
        display.drawText(0, 3, "[D] Dock");
        display.drawText(0, 4, "[T] Travel");
        for (var i = 0; i < curNode.edge_list.length; i++) {
            var bg = Game.UIMode.DEFAULT_BG;
            if (this.tarNode === i){bg = '#f00'}
            display.drawText(0, i + 5, '[' + i + '] %b{'+bg+'}' + curNode.edge_list[i] + '%b{}');
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData);
        if (!action) {
            return false;
        }
        switch (action.key) {
            case 'NUM_0':
                this.tarNode = 0;
                Game.refresh();
                console.log("Current Node — " + curNode.name);
                break;
            case 'NUM_1':
                this.tarNode = 1;
                Game.refresh();
                console.log("Current Node — " + curNode.name);
                break;
            case 'NUM_2':
                    this.tarNode = 2;
                    Game.refresh();
                console.log("Current Node — " + curNode.name);
                break;
            case 'NAVIGATE_DOCK':
                Game.switchUIMode(Game.UIMode.heist, 'dungeon');
                console.log("Current Node — " + curNode.name);
                break;
            case 'NAVIGATE_TRAVEL':
                curNode = navmap.getNode(curNode.edge_list[this.tarNode]); //changes current location to target location
                console.log("Current Node — " + curNode.name);
                break;
            case 'PERSISTENCE':
                Game.switchUIMode(Game.UIMode.persistence);
                break;
            default:
                break;
        }
    }
};
