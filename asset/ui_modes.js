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
        Game.UIMode.navigation.setupNavMap();
        Game.UIMode.shipScreen.attr.playerName = Game.Util.randomShipName();
        Game.switchUIMode(Game.UIMode.gameIntro);
    },
    saveGame: function() {
        if (this.localStorageAvailable()) {
            Game.DATASTORE.SHIP_SCREEN = Game.UIMode.shipScreen.attr;
            Game.DATASTORE.MESSAGES = Game.Message.attr;
            Game.DATASTORE.NAV_MAP = Game.UIMode.navigation.attr;
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

        // load nav_maps
        Game.UIMode.navigation.attr = state_data.NAV_MAP;
        Game.UIMode.navigation.attr._navMap = new Graph(state_data.NAV_MAP._navMap.node_list);


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
        playerName: null,
        _curOption: 0
    },
    shipOptions: ["navigate", "outfit drones", "outfit ship", "heist"],
    shipFunctions: {
      navigate: function(){
          Game.addUIMode(Game.UIMode.navigation);
        },
      heist: function(){
          Game.switchUIMode(Game.UIMode.heist, 'ship_easy');
      }
    },
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
                this.shipFunctions['navigate']();
                break;
            case 'NUM_3':
                this.shipFunctions['heist']();
                break;
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.shipOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.shipOptions.length-1 : this.attr._curOption;
                this.attr._curOption %= this.shipOptions.length;
                break;
            case 'CONFIRM':
                this.shipFunctions[this.shipOptions[this.attr._curOption]]();
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
            var bg = (this.attr._curOption == i)? '#333':Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{'+bg+'}[' + i + '] ' + this.shipOptions[i]);
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
    attr: {
        _navMap: null,
        _curNode: null,
        _curOption: 0,
        _L: {'1':'1','2':' ','3':' ','4':' ','21':' ','31':' ','32':' ','41':' ','42':' ','43':' '},
    },
    navOptions: ['Begin docking procedure'],
    navFunctions: {
      'Begin docking procedure': function(){
          Game.UIMode.navigation.dock();
      }
    },
    enter: function() {
      this.setupNavOptions();
    },
    exit: function() {},
    render: function(display) {
        display.drawText(0, 1, "NAVIGATION MODE " + this.attr._curNode.name);
        display.drawText(0, 3, (this.attr._curNode.edge_list.length+1)+" hyperspace KEYBOARDGUNK open");
        this.renderNavOptions(display);
    },
    renderNavOptions: function(display){
      for (var i = 0; i < this.navOptions.length; i++){
        var bg = (this.attr._curOption == i)? '#333':Game.UIMode.DEFAULT_BG;
        display.drawText(0, i+5, '%b{'+bg+'}['+i+'] ' + this.navOptions[i]);
      }
    },
    renderAvatarInfo: function(display){
      var L = this.attr._L;
      var C = 'center';
      if ( L['41'].localeCompare('*')==0 || L['32'].localeCompare('*')==0 ){ C = '*'; }else{ C = ' ';}
      display.drawText(0,1, this.attr._curNode.starSystem);
      display.drawText(0,3,"|"+L['1']+"%c{#999}"+L['21']+L['21']+L['21']+"%c{}"+L['2']);
      display.drawText(0,4,"|"+"%c{#999}"+L['31']+L['41']+" "+L['32']+L['42']+"%c{}");
      display.drawText(0,5,"|"+"%c{#999}"+L['31']+" "+C+" "+L['42']+"%c{}");
      display.drawText(0,6,"|"+"%c{#999}"+L['31']+L['32']+" "+L['41']+L['42']+"%c{}");
      display.drawText(0,7,"|"+L['3']+"%c{#999}"+L['43']+L['43']+L['43']+"%c{}"+L['4']);
    },
    resetNavOptions: function(){
      this.navOptions = ['Begin docking procedure'];
      this.navFunctions = {
        'Begin docking procedure': function(){
            Game.UIMode.navigation.dock();
        }
      };
      this.attr._curOption = 0;
    },
    dock: function(){
      if (Game.UIMode.navigation.attr._curNode.mapType.localeCompare('void') != 0){
        Game.switchUIMode(Game.UIMode.heist, Game.UIMode.navigation.attr._curNode.mapType);
      }else{
        Game.Message.send('There is nothing to dock with here.');
      }
    },
    setupNavOptions: function(){
      this.resetNavOptions();
      for (var i = 0; i < this.attr._curNode.edge_list.length; i++) {
          this.navOptions.push('Travel to ' + this.attr._curNode.edge_list[i].prefix + this.attr._curNode.edge_list[i].name);
          this.navFunctions['Travel to ' + this.attr._curNode.edge_list[i].prefix + this.attr._curNode.edge_list[i].name] = function(){
              Game.UIMode.navigation.travelToTarget();
          };
      }
      this.navOptions.push('One-way warp to another star system');
      this.navFunctions['One-way warp to another star system'] = function(){
          Game.UIMode.navigation.createStarSystem();
      };
    },
    travelToTarget: function(targetNode){
      this.attr._curNode = targetNode || this.attr._navMap.getNode(this.attr._curNode.edge_list[this.attr._curOption-1].name); //changes current location to target location
      this.setupNavOptions();
    },
    setupNavMap: function(){
      this.attr._navMap = new Graph();
      var navMap = this.attr._navMap;
      navMap.addNode({name:"Somewhere in Space",starSystem:"Interstelar Space",prefix:"",mapType:'void', navNum: '1'});
      this.attr._curNode = navMap.getNode("Somewhere in Space");
    },
    createStarSystem: function(){
      var navMap = new Graph();
      this.attr._L = {'1':'1','2':' ','3':' ','4':' ','21':' ','31':' ','32':' ','41':' ','42':' ','43':' '};
      var ships = [];
      var systemName = 'SYSTEM' + Math.floor(ROT.RNG.getUniform()*10000);
      for (var i = 0; i < ROT.RNG.getUniform()*3+1; i++){
        var ship = {name: Game.Util.randomShipName(), starSystem: systemName, mapType: 'ship_easy', prefix: 'the SRV ', navNum: ''+(i+1)};
        ships.push(ship);
        this.attr._L[ship.navNum] = ship.navNum;
      }
      var nextSys = ships;
      for (var i = 0; i < ships.length; i++){
        var ship = ships.pop();
        for (var j = 0; j < ships.length; j++){
          if (ROT.RNG.getUniform() >= 0.2){
            navMap.addEdge(ship,ships[j]);
            this.attr._L[ship.navNum + ships[j].navNum] = '*';
          }
        }
      }

      this.attr._navMap = navMap;
      var nextShip = nextSys[Math.floor(ROT.RNG.getUniform()*nextSys.length)];
      this.travelToTarget(navMap.getNode(nextShip.name));
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData);
        if (!action) {
            return false;
        }
        switch (action.key) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.navOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.navOptions.length-1 : this.attr._curOption;
                this.attr._curOption %= this.navOptions.length;
                break;
            case 'CONFIRM':
                this.navFunctions[this.navOptions[this.attr._curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
            default:
                break;
        }
    },
    toJSON: function() {
        return Game.UIMode.persistence.BASE_toJSON.call(this);
    },
    fromJSON: function(json) {
        return Game.UIMode.persistence.BASE_fromJSON.call(this, json);
    }
};
