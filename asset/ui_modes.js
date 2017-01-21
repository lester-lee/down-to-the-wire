Game.UIMode = {};
Game.UIMode.DEFAULT_FG = '#ddd';
Game.UIMode.DEFAULT_BG = '#000';
var fg = Game.UIMode.DEFAULT_FG;
var bg = Game.UIMode.DEFAULT_BG;

Game.UIMode.titleScreen = {
    attr: {
        _curOption: 0
    },
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
        display.drawText(1, 4, "this is a title screen");
        this.renderTitleOptions(display);
    },
    renderTitleOptions: function(display) {
        for (var i = 0; i < this.titleOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 15, '%b{' + bg + '}> ' + this.titleOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.titleOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.titleOptions.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                this.titleFunctions[this.titleOptions[this.attr._curOption]]();
                break;
        }
    }
};

Game.UIMode.persistence = {
    RANDOM_SEED_KEY: 'gameRandomSeed',
    attr: {
        _curOption: 0
    },
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
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.persistOptions[i]);
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.persistOptions.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.persistOptions.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                this.persistFunctions[this.persistOptions[this.attr._curOption]]();
                break;
            case 'CANCEL':
                Game.removeUIMode();
                break;
        }
    },
    newGame: function() {
        Game.clearDatastore();
        Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
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
        display.drawText(1, 4, "here is some story introduction");
        display.drawText(1, 5, "what will you call yourself?");
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
        _curOption: 0
    },
    shipOptions: ["Navigate", "Outfit drones", "Outfit ship", "heist", "Save/Load"],
    shipFunctions: {
        Navigate: function() {
            Game.addUIMode(Game.UIMode.navigation);
        },
        heist: function() {
            Game.switchUIMode(Game.UIMode.heist, 'ship_easy');
        },
        "Save/Load": function() {
            Game.addUIMode(Game.UIMode.persistence);
        }
    },
    enter: function() {
        this.attr._curOption = 0;
    },
    exit: function() {},
    render: function(display) {
        display.drawText(0, 1, this.attr.playerName + " STATUS");
        this.renderShipOptions(display);
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
    renderShipOptions: function(display) {
        for (var i = 0; i < this.shipOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 3, '%b{' + bg + '}> ' + this.shipOptions[i]);
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
        },
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
        display.drawText(0, 1, "NAVIGATION MODE " + this.attr._curNode.name);
        display.drawText(0, 3, (this.attr._curNode.edge_list.length + 1) + " hyperspace KEYBOARDGUNK open");
        this.renderNavOptions(display);
    },
    renderNavOptions: function(display) {
        for (var i = 0; i < this.navOptions.length; i++) {
            var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
            display.drawText(0, i + 5, '%b{' + bg + '}> ' + this.navOptions[i]);
        }
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
        display.drawText(3, 3, "%c{" + dbg + "}|%c{}%b{" + bg1 + "}" + L['1'] + "%b{}%c{#999}" + L['21'] + L['21'] + L['21'] + "%c{}%b{" + bg2 + "}" + L['2'] + "%b{}");
        display.drawText(3, 4, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + L['41'] + " " + L['32'] + L['42'] + "%c{}");
        display.drawText(3, 5, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + " " + C + " " + L['42'] + "%c{}");
        display.drawText(3, 6, "%c{" + dbg + "}|%c{}" + "%c{#999}" + L['31'] + L['32'] + " " + L['41'] + L['42'] + "%c{}");
        display.drawText(3, 7, "%c{" + dbg + "}|%c{}%b{" + bg3 + "}" + L['3'] + "%b{}%c{#999}" + L['43'] + L['43'] + L['43'] + "%c{}%b{" + bg4 + "}" + L['4'] + "%b{}");

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
        if (Game.UIMode.navigation.attr._curNode.mapType.localeCompare('void') != 0) {
            Game.switchUIMode(Game.UIMode.heist, Game.UIMode.navigation.attr._curNode.mapType);
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
        this.attr._curNode = targetNode || this.attr._navMap.getNode(this.attr._curNode.edge_list[this.attr._curOption - 1]); //changes current location to target location
        this.setupNavOptions();
    },
    setupNavMap: function() {
        this.attr._navMap = new Graph();
        var navMap = this.attr._navMap;
        navMap.addNode({
            name: "Somewhere in Space",
            starSystem: "system undefined",
            prefix: "",
            mapType: 'void'
        });
        this.attr._curNode = navMap.getNode("Somewhere in Space");
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
                mapType: 'ship_easy',
                prefix: 'the SRV ',
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
    numPages: 3,
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
        } else if (page === 2) {

        } else if (page === 3) {

        } else if (page === 4) {

        }
    },
};

Game.UIMode.inventory = {
    attr: {
        _curOption: 0
    },
    avatar: null,
    itemIDs: null,
    enter: function() {
        this.avatar = Game.UIMode.heist.getAvatar();
        this.itemIDs = this.avatar.getInventoryItemIDs();
    },
    exit: function() {},
    render: function(display) {
        display.drawText(2, 1, "Inventory");
        this.renderInventory(display);
    },
    renderInventory: function(display) {
        if (this.itemIDs.length > 0) {
            for (var i = 0; i < this.itemIDs.length; i++) {
                var bg = (this.attr._curOption == i) ? '#333' : Game.UIMode.DEFAULT_BG;
                var item = Game.DATASTORE.ITEM[this.itemIDs[i]];
                display.drawText(0, i + 3, '%b{' + bg + '}> ' + item.getName() + ' - ' + item.getDescription());
            }
        } else {
            display.drawText(0, 3, "You do not have any items.");
        }
    },
    handleInput: function(inputType, inputData) {
        var action = Game.KeyBinding.getInput(inputType, inputData).key;
        switch (action) {
            case 'MOVE_DOWN':
                this.attr._curOption++;
                this.attr._curOption %= this.itemIDs.length;
                break;
            case 'MOVE_UP':
                this.attr._curOption--;
                this.attr._curOption = (this.attr._curOption < 0) ? this.itemIDs.length - 1 : this.attr._curOption;
                break;
            case 'CONFIRM':
                if (this.itemIDs.length > 0) {
                    Game.addUIMode(Game.UIMode.itemMenu, this.itemIDs[this.attr._curOption]);
                }
                break;
            case 'CANCEL':
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
                this.itemFunctions[this.itemOptions[this.curOption]](this.curItem.getID());
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
    menuOptions: ["Inventory", "Help", "Options", "Abort Heist", "Close Menu"],
    menuFunctions: {
        'Inventory': function() {
            Game.addUIMode(Game.UIMode.inventory);
        },
        'Help': function() {
            Game.addUIMode(Game.UIMode.helpScreen);
        },
        'Options': function() {
            console.log("options");
        },
        'Abort Heist': function() {
            if (Game.UIMode.heistMenu.attr._abort) {
                Game.UIMode.heistMenu.attr._abort = false;
                Game.switchUIMode(Game.UIMode.shipScreen);
                Game.Message.clear();
            } else {
                Game.UIMode.heistMenu.attr._abort = true;
                Game.Message.send("Press [Abort Heist] again to leave.");
                Game.Message.send("If you abort, you will lose this drone.");
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
