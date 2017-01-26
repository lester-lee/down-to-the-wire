Game.UIMode = {};
Game.UIMode.DEFAULT_FG = '#ddd';
Game.UIMode.DEFAULT_BG = '#000';
var fg = Game.UIMode.DEFAULT_FG;
var bg = Game.UIMode.DEFAULT_BG;

Game.UIMode.titleScreen = {
    curOption: 0,
    enter: function() {},
    exit: function() {},
    titleOptions: ['New', 'Load'],
    titleFunctions: {
        'New': function() {
            Game.Message.clear();
            Game.UIMode.persistence.newGame();
        },
        'Load': function() {
            if (Game.UIMode.persistence.loadGame() == false) {
                Game.Message.clear();
                Game.Message.send("ERROR: you do not have data to load.");
            }
        }
    },
    render: function(display) {
        display.drawText(1, 4, "___  ____ _ _ _ _  _    ___ ____");
        display.drawText(1, 5, "|  \\ |  | | | | |\\ |     |  |  |   ");
        display.drawText(1, 6, "|__/ |__| |_|_| | \\|     |  |__|   ");
        display.drawText(1, 7, "___ _  _ ____    _ _ _ _ ____ ____ ");
        display.drawText(2, 8, "|  |__| |___    | | | | |__/ |___ ");
        display.drawText(2, 9, "|  |  | |___    |_|_| | |  \\ |___ ");

        this.renderTitleOptions(display);
    },
    renderTitleOptions: function(display) {
        for (var i = 0; i < this.titleOptions.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 15, '%b{' + bg + '}> ' + this.titleOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.titleOptions.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.titleOptions.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.titleFunctions[this.titleOptions[this.curOption]]();
                break;
        }
    }
};

Game.UIMode.persistence = {
    RANDOM_SEED_KEY: 'gameRandomSeed',
    curOption: 0,
    persistOptions: ["Save", "Load", "Title Screen"],
    persistFunctions: {
        "Save": function() {
            Game.UIMode.persistence.saveGame();
        },
        "Load": function() {
            Game.UIMode.persistence.loadGame();
        },
        "Title Screen": function() {
            Game.switchUIMode(Game.UIMode.titleScreen);
        }
    },
    enter: function() {},
    exit: function() {},
    render: function(display) {
        this.renderPersistenceOptions(display);
    },
    renderPersistenceOptions: function(display) {
        for (var i = 0; i < this.persistOptions.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.persistOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.persistOptions.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.persistOptions.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.persistFunctions[this.persistOptions[this.curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    },
    newGame: function() {
        Game.clearDatastore();
        Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
        Game.UIMode.shipScreen.resetDrones();
        Game.UIMode.shipScreen.setupShipStatus();
        Game.UIMode.navigation.setupNavMap();
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
        if (!json_state_data) {
            return false;
        }
        var state_data = JSON.parse(json_state_data);

        Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

        // load shipScreen & messages
        Game.UIMode.shipScreen.attr = state_data.SHIP_SCREEN;
        Game.Message.attr = state_data.MESSAGES;

        // load nav_maps
        Game.UIMode.navigation.attr = state_data.NAV_MAP;
        Game.UIMode.navigation.attr._navMap = new Graph(state_data.NAV_MAP._navMap.node_list);


        // Load entities
        for (var entityId in state_data.ENTITY) {
            if (state_data.ENTITY.hasOwnProperty(entityId)) {
                var entAttr = JSON.parse(state_data.ENTITY[entityId]);
                var newE = Game.EntityGenerator.create(entAttr._generator_key, entAttr._ID);
                Game.DATASTORE.ENTITY[entityId] = newE;
                Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
            }
        }
        // Load items
        for (var itemId in state_data.ITEM) {
            if (state_data.ITEM.hasOwnProperty(itemId)) {
                var itemAttr = JSON.parse(state_data.ITEM[itemId]);
                var newI = Game.ItemGenerator.create(itemAttr._generator_key, itemAttr._ID);
                Game.DATASTORE.ITEM[itemId] = newI;
                Game.DATASTORE.ITEM[itemId].fromJSON(state_data.ITEM[itemId]);
            }
        }

        for (var entID in Game.DATASTORE.ENTITY) {
            Game.DATASTORE.ENTITY[entID].raiseSymbolActiveEvent('refresh');
        }

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
        var inputDisplay = document.getElementById('user-input');
        inputDisplay.parentElement.style.display = "block";
        setTimeout(function() {
            inputDisplay.focus()
        }, 100);
    },
    exit: function() {},
    render: function(display) {
        display.drawText(1, 4, "You remember dying in the year S+979 — nearly 1000 years after artificial intelligence first passed the Turing test. The last thing you remember is your consciousness being uploaded onto SERVER, but your attempts at making contact with the database have failed. All you know is that you are currently drifting through space as the commander of a General Systems Vehicle.\n\n And your name... what did you call yourself?");
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'CONFIRM':
                var inputHTML = document.getElementById('user-input');
                var inputText = inputHTML.value;
                if (inputText.length > 0) {
                    inputHTML.value = "";
                    inputHTML.parentElement.style.display = "none";
                    Game.UIMode.shipScreen.attr.playerName = inputText;
                    Game.Message.clear();
                    Game.switchUIMode(Game.UIMode.shipScreen);
                } else {
                    Game.Message.send("You did not enter a name.");
                }
                break;
        }
    }
};

Game.UIMode.shipScreen = {
    attr: {
        playerName: null,
        _curOption: 0,
        drones: [],
        fuel: 0,
        inventory: []
    },
    shipOptions: ["Navigate", "Drone Status", "Ship Inventory", "Operations Manual", "Save/Load"],
    shipFunctions: {
        Navigate: function() {
            Game.addUIMode(Game.UIMode.navigation);
        },
        "Drone Status": function() {
            Game.addUIMode(Game.UIMode.droneScreen, {
                drones: Game.UIMode.shipScreen.attr.drones,
                deploying: false
            });
        },
        "Ship Inventory": function() {
            Game.addUIMode(Game.UIMode.shipInventory, {
                drones: Game.UIMode.shipScreen.attr.drones,
                inventory: Game.UIMode.shipScreen.attr.inventory
            });
        },
        "Operations Manual": function() {
            Game.addUIMode(Game.UIMode.helpScreen);
        },
        "Save/Load": function() {
            Game.addUIMode(Game.UIMode.persistence);
        }
    },
    enter: function() {
        this.attr._curOption = 0;
        this.repairDrones();
    },
    exit: function() {},
    render: function(display) {
        display.drawText(0, 1, "The GSV " + this.attr.playerName + ": STATUS");
        this.renderShipOptions(display);
    },
    renderShipOptions: function(display) {
        for (var i = 0; i < this.shipOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.shipOptions[i]);
        }
    },
    setupShipStatus: function() {
        this.attr.fuel = 4;
        var firstDrone = Game.EntityGenerator.create('initial_drone');
        this.addDrone(firstDrone);
        this.addDrone(Game.EntityGenerator.create('initial_drone'));
    },
    addDrone: function(drone) {
        this.attr.drones.push(drone.getID());
    },
    removeDrone: function(drone) {
        var id = drone.getID();
        var idx = this.attr.drones.indexOf(id);
        this.attr.drones.splice(idx, 1);
        if (this.attr.drones.length == 0) {
            return false;
        }
        return true;
    },
    addItem: function(itemID) {
        this.attr.inventory.push(itemID);
    },
    removeItem: function(itemID) {
        var idx = this.attr.inventory.indexOf(itemID);
        this.attr.inventory.splice(idx, 1);
    },
    resetDrones: function() {
        this.attr.drones = [];
    },
    repairDrones: function() {
        for (var i = 0; i < this.attr.drones.length; i++) {
            var drone = Game.DATASTORE.ENTITY[this.attr.drones[i]];
            drone.setCurHP(drone.getMaxHP());
        }
    },
    hasFuel: function() {
        return (this.attr.fuel > 0);
    },
    useFuel: function() {
        this.attr.fuel--;
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.shipOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.shipOptions.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                this.shipFunctions[this.shipOptions[this.attr._curOption]]();
                break;
            case 'PERSISTENCE':
                Game.switchUIMode(Game.UIMode.persistence);
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

Game.UIMode.shipInventory = {
    drones: [],
    inventory: [],
    curOption: 0,
    enter: function(invArgs) {
        this.drones = invArgs.drones;
        this.inventory = invArgs.inventory;
    },
    exit: function() {
        this.curOption = 0;
    },
    render: function(display) {
        display.drawText(0, 1, "Ship Inventory");
        if (this.inventory.length > 0) {
            for (var i = 0; i < this.inventory.length; i++) {
                var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
                var item = Game.DATASTORE.ITEM[this.inventory[i]];
                var status = item.raiseSymbolActiveEvent('getStatus').st;
                var fg = Game.Util.getStatusColor(status);
                display.drawText(0, i + 3, '%c{' + fg + '}%b{' + bg + '}> ' + item.getName() + ' - ' + item.getShortDesc());
            }
        } else {
            display.drawText(0, 3, "Cargo hold empty.");
        }
    },
    refreshInventory: function() {
        this.inventory = Game.UIMode.shipScreen.attr.inventory;
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.inventory.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.inventory.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                if (this.inventory.length > 0) {
                    Game.addUIMode(Game.UIMode.shipInventoryMenu, this.inventory[this.curOption]);
                }
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    },
};

Game.UIMode.shipInventoryMenu = {
    curItem: null,
    curOption: 0,
    itemOptions: ["Give to Drone", "Vent", "Cancel"],
    itemFunctions: {
        "Give to Drone": function(itemID) {
            Game.addUIMode(Game.UIMode.shipDroneSelection, itemID);
        },
        "Vent": function(itemID) {
            var item = Game.DATASTORE.ITEM[itemID];
            Game.Message.send(item.getName() + " was destroyed.");
            Game.UIMode.shipScreen.removeItem(itemID);
            delete Game.DATASTORE.ITEM[itemID];
            Game.removeUIMode();
            Game.UIMode.shipInventory.curOption = 0;
        },
        "Cancel": function() {
            Game.removeUIMode();
        }
    },
    enter: function(itemID) {
        this.curItem = itemID;
    },
    exit: function() {
        this.curOption = 0;
    },
    render: function(display) {
        Game.UIMode.shipInventory.render(display);
    },
    renderAvatarInfo: function(display) {
        for (var i = 0; i < this.itemOptions.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.itemOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.itemOptions.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.itemOptions.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.itemFunctions[this.itemOptions[this.curOption]](this.curItem);
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.shipDroneSelection = {
    curItem: null,
    curOption: 0,
    drones: [],
    droneNames: [],
    enter: function(itemID) {
        this.curItem = itemID;
        this.drones = Game.UIMode.shipScreen.attr.drones;
        for (var i = 0; i < this.drones.length; i++) {
            this.droneNames.push(Game.DATASTORE.ENTITY[this.drones[i]].getName());
        }
        this.droneNames.push('Cancel');
    },
    exit: function() {
        this.curOption = 0;
        this.droneNames = [];
    },
    render: function(display) {
        Game.UIMode.shipInventory.render(display);
    },
    renderAvatarInfo: function(display) {
        display.drawText(0, 1, "Give to:");
        for (var i = 0; i < this.droneNames.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.droneNames[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.droneNames.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.droneNames.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                if (this.curOption >= this.drones.length) {
                    Game.removeUIMode();
                } else {
                    var droneID = this.drones[this.curOption];
                    var drone = Game.DATASTORE.ENTITY[droneID];
                    if (drone.hasInventorySpace()) {
                        drone.addInventoryItems([this.curItem]);
                        Game.UIMode.shipScreen.removeItem(this.curItem);
                        Game.UIMode.shipInventory.curOption = 0;
                        Game.removeUIMode();
                        Game.removeUIMode();
                    } else {
                        Game.Message.send(drone.getName() + " has a full inventory.");
                    }
                }
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.navigation = {
    attr: {
        _navMap: null,
        _curNode: null,
        _curOption: 0,
        _L: {
            '1': '1',
            '2': ' ',
            '3': ' ',
            '4': ' ',
            '21': ' ',
            '31': ' ',
            '32': ' ',
            '41': ' ',
            '42': ' ',
            '43': ' '
        }
    },
    navOptions: ['Begin docking procedure'],
    navFunctions: {
        'Begin docking procedure': function() {
            Game.UIMode.navigation.dock();
        }
    },
    enter: function() {
        this.setupNavOptions();
    },
    exit: function() {},
    render: function(display) {
        var numGates = this.attr._curNode.edge_list.length;
        var plural = '';
        if (numGates > 1) {
            plural = 's';
        }
        display.drawText(0, 1, "NAVIGATION MODE ");
        display.drawText(0, 3, (+1) + " hyperspace gate" + plural + " open");
        this.renderNavOptions(display);
    },
    renderNavOptions: function(display) {
        for (var i = 0; i < this.navOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 5, '%b{' + bg + '}> ' + this.navOptions[i]);
        }
    },
    renderShipLocation: function() {
        Game.Message.clear();
        Game.Message.send("Currently keeping station with the GSV " + this.attr._curNode.name);
    },

    renderAvatarInfo: function(display) {
        var L = this.attr._L;
        var C = 'center';
        if (L['41'].localeCompare('*') == 0 || L['32'].localeCompare('*') == 0) {
            C = '*';
        } else {
            C = ' ';
        }
        var dbg = Game.UIMode.DEFAULT_BG;
        var bg1 = (this.attr._curNode.navNum == 1) ? '#333' : dbg;
        var bg2 = (this.attr._curNode.navNum == 2) ? '#333' : dbg;
        var bg3 = (this.attr._curNode.navNum == 3) ? '#333' : dbg;
        var bg4 = (this.attr._curNode.navNum == 4) ? '#333' : dbg;
        display.drawText(0, 1, this.attr._curNode.starSystem);
        display.drawText(1, 3, "%c{" + dbg + "}|%c{}%b{" + bg1 + "}" + L['1'] + "%b{}%c{#999}" + L['21'] + L['21'] + L['21'] + "%c{}%b{" + bg2 + "}" + L['2'] + "%b{}");
        display.drawText(1, 4, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + L['41'] + " " + L['32'] + L['42'] + "%c{}");
        display.drawText(1, 5, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + " " + C + " " + L['42'] + "%c{}");
        display.drawText(1, 6, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + L['32'] + " " + L['41'] + L['42'] + "%c{}");
        display.drawText(1, 7, "%c{" + dbg + "}|%c{}%b{" + bg3 + "}" + L['3'] + "%b{}%c{#999}" + L['43'] + L['43'] + L['43'] + "%c{}%b{" + bg4 + "}" + L['4'] + "%b{}");
        display.drawText(1, 9, "Fuel Rods Remaining: " + Game.UIMode.shipScreen.attr.fuel);
    },
    resetNavOptions: function() {
        this.navOptions = ['Begin docking procedure'];
        this.navFunctions = {
            'Begin docking procedure': function() {
                Game.UIMode.navigation.dock();
            }
        };
        this.attr._curOption = 0;
    },
    dock: function() {
        var curNode = Game.UIMode.navigation.attr._curNode;
        if (curNode.mapType.localeCompare('void') != 0) {
            if (curNode.visited) {
                Game.Message.send('It would not be wise to dock here again.');
            } else {
                curNode.visited = true;
                Game.addUIMode(Game.UIMode.droneScreen, {
                    drones: Game.UIMode.shipScreen.attr.drones,
                    deploying: true
                });
            }
        } else {
            Game.Message.send('There is nothing to dock with here.');
        }
    },
    setupNavOptions: function() {
        this.resetNavOptions();
        var edges = this.attr._curNode.edge_list;
        for (var i = 0; i < edges.length; i++) {
            var node = this.attr._navMap.getNode(edges[i]);
            this.navOptions.push('Travel to ' + node.prefix + node.name + "(" + node.navNum + ")");
            this.navFunctions['Travel to ' + node.prefix + node.name + "(" + node.navNum + ")"] = function() {
                Game.UIMode.navigation.travelToTarget();
            };
        }
        this.navOptions.push('Warp to another star system');
        this.navFunctions['Warp to another star system'] = function() {
            Game.UIMode.navigation.createStarSystem();

        };
    },
    travelToTarget: function(targetNode) {
        if (Game.UIMode.shipScreen.hasFuel()) {
            Game.UIMode.shipScreen.useFuel();
            this.attr._curNode = targetNode || this.attr._navMap.getNode(this.attr._curNode.edge_list[this.attr._curOption - 1]); //changes current location to target location
            this.setupNavOptions();
            this.renderShipLocation();
        } else {
            Game.Message.send("Fuel rods depleted. Scavenge more from ships.");
        }
    },
    setupNavMap: function() {
        this.attr._navMap = new Graph();
        var navMap = this.attr._navMap;
        navMap.addNode({
            name: "Somewhere Between Stars",
            starSystem: "Interstellar Void",
            prefix: "",
            mapType: 'void'
        });
        this.attr._curNode = navMap.getNode("Somewhere Between Stars");
        this.attr._L = {
            '1': '1',
            '2': ' ',
            '3': ' ',
            '4': ' ',
            '21': ' ',
            '31': ' ',
            '32': ' ',
            '41': ' ',
            '42': ' ',
            '43': ' '
        };
    },
    createStarSystem: function() {
        var navMap = new Graph();
        this.attr._L = {
            '1': '1',
            '2': ' ',
            '3': ' ',
            '4': ' ',
            '21': ' ',
            '31': ' ',
            '32': ' ',
            '41': ' ',
            '42': ' ',
            '43': ' '
        };
        var ships = [];
        var systemName = 'SYSTEM' + Math.floor(ROT.RNG.getUniform() * 10000);
        var numShips = Game.Util.randomInt(2, 4);
        for (var i = 0; i < numShips; i++) {
            var ship = {
                name: Game.Util.randomShipName(),
                starSystem: systemName,
                mapType: 'ship_1',
                prefix: 'the GSV ',
                navNum: '' + (i + 1)
            };
            ships.push(ship);
            this.attr._L[ship.navNum] = ship.navNum;
        }
        var nextSys = ships.slice(0);

        for (var i = 0; i < ships.length; i++) {
            navMap.addNode(ships[i]);
        }
        navMap.randomizeEdges();
        this.attr._navMap = navMap;
        var nextShip = nextSys[0];
        this.travelToTarget(navMap.getNode(nextShip.name));
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.navOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.navOptions.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                this.navFunctions[this.navOptions[this.attr._curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
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


Game.UIMode.helpScreen = {
    curPage: 1,
    numPages: 2,
    enter: function() {
        this.curPage = 1;
    },
    exit: function() {},
    render: function(display) {
        var dimensions = Game.Util.getDisplayDim(display);
        display.drawText(1, 3, "Operations Manual - Page " + this.curPage);
        this.drawPage(this.curPage, display);
        if (this.curPage < this.numPages) {
            display.drawText(dimensions.w - 14, dimensions.h - 1, "[d] Next page");
        }
        if (this.curPage > 1) {
            display.drawText(0, dimensions.h - 1, "[a] Previous page");
        }

    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'CANCEL':
                Game.removeUIMode();
                break;
            case 'MOVE_RIGHT':
            case 'MOVE_DOWN':
                if (this.curPage < this.numPages) {
                    this.curPage++;
                }
                break;
            case 'MOVE_LEFT':
            case 'MOVE_UP':
                if (this.curPage > 1) {
                    this.curPage--;
                }
                break;
        }
    },
    drawPage: function(page, display) {
        if (page === 1) {
            display.drawText(1, 5, "Drone Opperation:");
            display.drawText(1, 6, "q   w   e");
            display.drawText(2, 7, "↖ ↑ ↗");
            display.drawText(1, 8, "a← s →d");
            display.drawText(2, 9, "↙ ↓ ↘");
            display.drawText(1, 10, "z   x   c");
            display.drawText(1, 12, "Hold [Shift] to look around.");
            display.drawText(1, 13, "[=] to open menu.");
            display.drawText(1, 14, "[Enter] to pick up items.");
            display.drawText(1, 15, "[Space] to interact in front.");
        } else if (page === 2) {
            display.drawText(1, 5, "Ship Navigation:");
            display.drawText(1, 7, "1   2   This map represents the locations of spacecraft");
            display.drawText(1, 8, "** *    within a star system. The highlighted location");
            display.drawText(1, 9, "* *     shows you where you are. In this case 4. The lines");
            display.drawText(1, 10, "** *    of *s represent paths though hyperspace that your");
            display.drawText(1, 11, "3***%b{#333}4%b{}   spacecraft can traverse. In this example you can");
            display.drawText(9, 12, "travel between 1 & 3, 1 & 4, 2 & 3, and 3 & 4.");
        } else if (page === 3) {

        } else if (page === 4) {

        }
    },
};

Game.UIMode.inventory = {
    curOption: 0,
    equip: false,
    avatar: null,
    itemIDs: null,
    enter: function(invArgs) {
        var drone = null,
            equip = null;
        if (invArgs) {
            drone = invArgs.drone;
            equip = invArgs.equip;
        }
        this.avatar = drone || Game.UIMode.heist.getAvatar();
        this.equip = equip || false;
        this.refreshItemIDs();
    },
    exit: function() {
        this.equip = false;
        this.curOption = 0;
        Game.Message.clear();
    },
    render: function(display) {
        var str = (this.equip) ? "Inventory %b{#333}Equipment%b{}" : "%b{#333}Inventory%b{} Equipment";
        display.drawText(2, 1, str);
        this.renderInventory(display);
    },
    renderInventory: function(display) {
        if (this.itemIDs.length > 0) {
            for (var i = 0; i < this.itemIDs.length; i++) {
                var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
                var item = Game.DATASTORE.ITEM[this.itemIDs[i]];
                var status = item.raiseSymbolActiveEvent('getStatus').st;
                var fg = Game.Util.getStatusColor(status);
                display.drawText(0, i + 3, '%c{' + fg + '}%b{' + bg + '}> ' + item.getName() + ' - ' + item.getShortDesc());
            }
            this.renderItemDesc();
        } else {
            var str = (this.equip) ? "anything equipped." : "any items.";
            display.drawText(0, 3, "You do not have " + str);
        }
    },
    refreshItemIDs: function() {
        this.itemIDs = (this.equip) ? this.avatar.getEquipmentItemIDs() : this.avatar.getInventoryItemIDs();
    },
    renderItemDesc: function() {
        var item = Game.DATASTORE.ITEM[this.itemIDs[this.curOption]];
        Game.Message.clear();
        Game.Message.send(item.getLongDesc());
    },
    toggleEquipment: function() {
        this.equip = !this.equip;
        this.refreshItemIDs();
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.itemIDs.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.itemIDs.length - 1 : this.curOption;
                break;
            case 'MOVE_LEFT':
            case 'MOVE_RIGHT':
                this.curOption = 0;
                this.toggleEquipment();
                break;
            case 'CONFIRM':
                if (this.itemIDs.length > 0) {
                    Game.addUIMode(Game.UIMode.itemMenu, this.itemIDs[this.curOption]);
                }
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
            case 'INVENTORY':
                Game.removeUIMode();
                break;
        }
    },
};

Game.UIMode.itemMenu = {
    curItem: null,
    curOption: 0,
    itemOptions: null,
    itemFunctions: null,
    enter: function(itemID) {
        this.curItem = Game.DATASTORE.ITEM[itemID];
        this.itemOptions = this.curItem.getOptions();
        this.itemFunctions = this.curItem.getFunctions();
        this.curOption = 0;
        if (Game._UIStack[Game._UIStack.length - 1] == Game.UIMode.heist) {
            this.setupDrop();
        }
        if (Game._UIStack[Game._UIStack.length - 1] == Game.UIMode.shipScreen) {
            this.setupStow();
        }
    },
    setupDrop: function() {
        var opt = this.itemOptions.slice();
        opt.pop(); // remove CANCEL
        opt.push('Drop');
        opt.push('Cancel');
        this.itemOptions = opt;
        this.itemFunctions['Drop'] = function() {
            var avatar = Game.UIMode.heist.getAvatar();
            avatar.dropItems(Game.UIMode.itemMenu.curItem.getID());
            Game.removeUIMode();
            Game.UIMode.inventory.refreshItemIDs();
        };
    },
    setupStow: function() {
        var opt = this.itemOptions.slice();
        opt.pop(); // remove CANCEL
        opt.push('Stow');
        opt.push('Cancel');
        this.itemOptions = opt;
        this.itemFunctions['Stow'] = function() {
            var avatar = Game.UIMode.inventory.avatar;
            var itemID = Game.UIMode.itemMenu.curItem.getID();
            if (!avatar._getContainer().extractItems(itemID)) {
                avatar.extractEquipment(itemID);
            }
            Game.removeUIMode();
            Game.UIMode.shipScreen.addItem(itemID);
            Game.UIMode.inventory.refreshItemIDs();
        };
    },
    exit: function() {},
    render: function(display) {
        Game.UIMode.inventory.render(display);
    },
    renderAvatarInfo: function(display) {
        for (var i = 0; i < this.itemOptions.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.itemOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.itemOptions.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.itemOptions.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.itemFunctions[this.itemOptions[this.curOption]]({
                    itemID: this.curItem.getID(),
                    actor: Game.UIMode.inventory.avatar
                });
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.fabricateMenu = {
    avatar: null,
    curItem: null,
    options: [],
    functions: {
        'Cancel': function() {
            Game.removeUIMode();
        }
    },
    curOption: 0,
    enter: function(itemArgs) {
        this.avatar = itemArgs.actor;
        this.curItem = Game.DATASTORE.ITEM[itemArgs.itemID];
        var opt = this.curItem.getFabrications().slice();
        this.options = opt;
        this.setupFunctions();
        opt.push('Cancel');
    },
    setupFunctions: function() {
        for (var i = 0; i < this.options.length; i++) {
            this.functions[this.options[i]] = function(itemKey) {
                var curID = Game.UIMode.fabricateMenu.curItem.getID();
                Game.DATASTORE.ITEM[curID] = Game.ItemGenerator.create(itemKey, curID);
                Game.UIMode.fabricateMenu.curItem = Game.DATASTORE.ITEM[curID];
                Game.removeUIMode();
                Game.removeUIMode();
                Game.UIMode.inventory.refreshItemIDs();
                Game.UIMode.inventory.curOption = 0;
            };
        }
    },
    exit: function() {
        this.curOption = 0;
    },
    render: function(display) {
        Game.UIMode.inventory.render(display);
    },
    renderAvatarInfo: function(display) {
        display.drawText(0, 1, "Fabricate:");
        for (var i = 0; i < this.options.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.options[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.options.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.options.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                var name = this.options[this.curOption];
                this.functions[name](name);
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.repairMenu = {
    avatar: null,
    repItem: null,
    items: [],
    options: [],
    curOption: 0,
    enter: function(itemArgs) {
        this.avatar = itemArgs.actor;
        this.repItem = Game.DATASTORE.ITEM[itemArgs.itemID];
        this.setupItems();
    },
    setupItems: function() {
        var invItems = this.avatar.getInventoryItemIDs();
        var eqItems = this.avatar.getEquipmentItemIDs();
        var i, item;
        for (i = 0; i < invItems.length; i++) {
            item = Game.DATASTORE.ITEM[invItems[i]];
            var status = item.raiseSymbolActiveEvent('isDamaged');
            if (status.dmg) {
                this.items.push(invItems[i]);
            }
        }
        for (i = 0; i < eqItems.length; i++) {
            item = Game.DATASTORE.ITEM[eqItems[i]];
            var status = item.raiseSymbolActiveEvent('isDamaged');
            if (status.dmg) {
                this.items.push(eqItems[i]);
            }
        }
        for (i = 0; i < this.items.length; i++) {
            item = Game.DATASTORE.ITEM[this.items[i]];
            this.options.push(item.getName());
        }
        this.options.push('Cancel');
    },
    exit: function() {
        this.curOption = 0;
        this.items = [];
        this.options = [];
    },
    render: function(display) {
        Game.UIMode.inventory.render(display);
    },
    renderAvatarInfo: function(display) {
        display.drawText(0, 1, "Repair an item:");
        for (var i = 0; i < this.options.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            var fg = Game.UIMode.DEFAULT_FG;
            if (i < this.items.length) {
                var item = Game.DATASTORE.ITEM[this.items[i]];
                var status = item.raiseSymbolActiveEvent('getStatus').st;
                fg = Game.Util.getStatusColor(status);
            }
            display.drawText(0, i + 3, '%c{' + fg + '}%b{' + bg + '}> ' + this.options[i]);
        }
    },
    repairSelectedItem: function() {
        var repVal = this.repItem.getRepairValue();
        var itemID = this.items[this.curOption];
        var item = Game.DATASTORE.ITEM[itemID];
        item.repair(repVal);
        Game.Message.send(item.getName() + " has been repaired.");
        this.avatar.extractInventoryItems(this.repItem.getID());
        Game.removeUIMode();
        Game.removeUIMode();
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.options.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.options.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                if (this.curOption >= this.items.length) {
                    Game.removeUIMode();
                } else {
                    this.repairSelectedItem();
                }
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.heistMenu = {
    attr: {
        _curOption: 0,
        _abort: false,
    },
    menuOptions: ["Inventory", "Equipment", "Operations Manual", "Abandon Drone", "Close Menu"],
    menuFunctions: {
        'Inventory': function() {
            Game.addUIMode(Game.UIMode.inventory);
        },
        'Equipment': function() {
            Game.addUIMode(Game.UIMode.inventory, true);
        },
        'Operations Manual': function() {
            Game.addUIMode(Game.UIMode.helpScreen);
        },
        'Options': function() {
            console.log("options");
        },
        'Abandon Drone': function() {
            if (Game.UIMode.heistMenu.attr._abort) {
                Game.UIMode.heistMenu.attr._abort = false;
                var curDrone = Game.UIMode.heist.getAvatar();
                Game.UIMode.heist.getAvatar().setEntTowed(null); // Stop towing anything
                if (Game.UIMode.shipScreen.removeDrone(curDrone)) {
                    Game.Message.clear();
                    Game.switchUIMode(Game.UIMode.continue);
                } else {
                    Game.Message.send("You are out of drones. You are destined to drift through space for eternity.");
                    Game.switchUIMode(Game.UIMode.titleScreen);
                }
            } else {
                Game.UIMode.heistMenu.attr._abort = true;
                Game.Message.send("Press [Abandon Drone] again to leave.");
                Game.Message.send("If you do, you will lose control of this drone.");
            }
        },
        'Close Menu': function() {
            Game.Message.clear();
            Game.removeUIMode();
        }
    },
    enter: function() {},
    exit: function() {
        this.attr._curOption = 0;
    },
    render: function(display) {
        Game.UIMode.heist.render(display);
    },
    renderAvatarInfo: function(display) {
        this.renderMenuOptions(display);
    },
    renderMenuOptions: function(display) {
        for (var i = 0; i < this.menuOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.menuOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._abort = false;
                this.attr._curOption++;
                this.attr._curOption %= this.menuOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._abort = false;
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.menuOptions.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                this.menuFunctions[this.menuOptions[this.attr._curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.continue = {
    options: ["Yes", "No"],
    functions: {
        Yes: function() {
            var heist = Game.UIMode.heist;
            var airlockPos = heist.attr._airlockPos;
            var airlockClear = !heist.getMap().getEntity(airlockPos);
            if (airlockClear) {
                Game.addUIMode(Game.UIMode.droneScreen, {
                    drones: Game.UIMode.shipScreen.attr.drones,
                    deploying: true,
                    continue: true,
                    airlockPos: airlockPos
                });
            } else {
                Game.Message.send("The airlock is blocked.");
                Game.switchUIMode(Game.UIMode.shipScreen);
            }
        },
        No: function() {
            Game.Message.send("Returned to ship.")
            Game.switchUIMode(Game.UIMode.shipScreen);
        }
    },
    curOption: 0,
    enter: function() {
        this.curOption = 0;
    },
    exit: function() {},
    render: function(display) {
        display.drawText(1, 2, 'You have lost control of your drone.');
        display.drawText(1, 3, 'Do you want to send in another drone?');
        this.renderOptions(display);
    },
    renderOptions: function(display) {
        for (var i = 0; i < this.options.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 15, '%b{' + bg + '}> ' + this.options[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.options.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.options.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.functions[this.options[this.curOption]]();
                break;
        }
    }
};

Game.UIMode.droneScreen = {
    drones: [],
    curDrone: 0,
    deploying: false,
    continue: false,
    airlockPos: null,
    enter: function(droneArgs) {
        this.curDrone = 0;
        this.drones = droneArgs.drones;
        this.deploying = droneArgs.deploying;
        this.continue = droneArgs.continue || false;
        this.airlockPos = droneArgs.airlockPos || null;
    },
    exit: function() {
      Game.Message.clear();
    },
    render: function(display) {
        var str = (this.deploying) ? "Choose a drone to deploy: " : "Drones";
        display.drawText(2, 1, str);
        this.renderDroneList(display);
    },
    renderDroneList: function(display) {
        for (var i = 0; i < this.drones.length; i++) {
            var bg = (this.curDrone == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.getDrone(this.drones[i]).getName());
        }
        this.renderDroneDesc();
    },
    renderDroneDesc: function(){
        Game.Message.clear();
        Game.Message.send(this.getDrone(this.drones[this.curDrone]).getLongDesc());
    },
    renderAvatarInfo: function(display) {
        var drone = this.getCurDrone();
        display.drawText(1, 1, drone.getName());
        var status = drone.getCoreStatus();
        var fg = Game.Util.getStatusColor(status);
        display.drawText(1, 3, "%c{" + fg + "}Core: " + drone.getCoreStatus());
        display.drawText(1, 5, "Equipment:");
        this.renderDroneEquip(display, drone);
    },
    renderDroneEquip: function(display, drone) {
        var equips = drone.getEquipmentItemIDs();
        var item, status, fg;
        for (var i = 0; i < equips.length; i++) {
            item = Game.DATASTORE.ITEM[equips[i]];
            status = item.getStatus();
            fg = Game.Util.getStatusColor(status);
            display.drawText(1, i + 6, "%c{" + fg + "}" + item.getName());
        }
    },
    getDrone: function(droneID) {
        return Game.DATASTORE.ENTITY[droneID];
    },
    getCurDrone: function() {
        return Game.DATASTORE.ENTITY[this.drones[this.curDrone]];
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curDrone++;
                this.curDrone %= this.drones.length;
                break;
            case 'MOVE_UP':
                this.curDrone--;
                this.curDrone = (this.curDrone < 0) ? this.drones.length - 1 : this.curDrone;
                break;
            case 'CONFIRM':
                Game.addUIMode(Game.UIMode.droneMenu, {
                    drone: this.getCurDrone(),
                    deploying: this.deploying
                });
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    }
};

Game.UIMode.droneMenu = {
    menuOptions: ["Inventory", "Equipment", "Close Menu"],
    menuFunctions: {
        Inventory: function() {
            Game.addUIMode(Game.UIMode.inventory, {
                drone: Game.UIMode.droneMenu.drone,
                equip: false
            });
        },
        Equipment: function() {
            Game.addUIMode(Game.UIMode.inventory, {
                drone: Game.UIMode.droneMenu.drone,
                equip: true
            });
        },
        "Close Menu": function() {
            Game.removeUIMode();
        },
        "Deploy": function() {
            Game.Message.clear();
            Game.switchUIMode(Game.UIMode.heist, {
                map: Game.UIMode.navigation.attr._curNode.mapType,
                drone: Game.UIMode.droneMenu.drone,
                continue: Game.UIMode.droneScreen.continue,
                airlockPos: Game.UIMode.droneScreen.airlockPos
            });
        }
    },
    drone: null,
    curOption: 0,
    enter: function(droneArgs) {
        this.drone = droneArgs.drone;
        if (droneArgs.deploying) {
            this.menuOptions = ["Deploy", "Inventory", "Equipment", "Close Menu"];
        }
    },
    exit: function() {
        this.curOption = 0;
        this.menuOptions = ["Inventory", "Equipment", "Close Menu"];
    },
    render: function(display) {
        Game.UIMode.droneScreen.render(display);
    },
    renderAvatarInfo: function(display) {
        for (var i = 0; i < this.menuOptions.length; i++) {
            var bg = (this.curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.menuOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.curOption++;
                this.curOption %= this.menuOptions.length;
                break;
            case 'MOVE_UP':
                this.curOption--;
                this.curOption = (this.curOption < 0) ? this.menuOptions.length - 1 : this.curOption;
                break;
            case 'CONFIRM':
                this.menuFunctions[this.menuOptions[this.curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    },
};
