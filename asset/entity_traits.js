Game.EntityTraits = {};

/*
Flow of combat:
(1) Player walks into Target & Raises BumpEntity event
(2) MeleeAttacker listens for BumpEntity, calculates hit% using MeleeDefender info
(3) If attack hits, raises Attacked event, if curHP <= 0, raise Kill event
(4) If attack misses, raises attackMiss event
*/

Game.EntityTraits.PlayerMessager = {
    META: {
        traitName: 'PlayerMessager',
        traitGroup: 'PlayerMessager',
        listeners: {
            'walkForbidden': function(evtData) {
                Game.Message.send("Unable to move there.");
            },
            // Combat messages
            'attackAvoided': function(evtData) {
                Game.Message.send(evtData.attacker.getName() + " tried to hit you but failed");
            },
            'attackMiss': function(evtData) {
                Game.Message.send("You miss your attack on " + evtData.target.getName());
            },
            'madeKill': function(evtData) {
                Game.Message.send("You destroy " + evtData.dead.getName());
            },
            'dealtDamage': function(evtData) {
                Game.Message.send("You deal " + evtData.damage + " damage to the " + evtData.attacked.getName());
            },
            'damagedBy': function(evtData) {
                Game.Message.send(evtData.damager.getName() + " hit you for " + evtData.damage + " damage");
            },
            'damagedEquipment': function(evtData) {
                Game.Message.send(evtData.damager.getName() + " hit " + evtData.equipment + " for " + evtData.damage + " damage");
            },
            'recoverHP': function(evtData) {
                Game.Message.send("You recovered " + evtData.hp + "HP");
            },
            'killed': function(evtData) {
                Game.Message.send("You were destroyed by " + evtData.killer.getName());
                Game.renderMessage();
            },
            'passAirlock': function() {
                Game.Message.send("Airlock entered. Press [Enter] to cycle.")
            },
            // Inventory messages
            'noItemsToPickup': function(evtData) {
                Game.Message.send('There is nothing to pickup');
            },
            'inventoryFull': function(evtData) {
                Game.Message.send('Your inventory is full');
            },
            'inventoryEmpty': function(evtData) {
                Game.Message.send('You are not carrying anything');
            },
            'noItemsPickedUp': function(evtData) {
                Game.Message.send('You could not pick up any items');
            },
            'someItemsPickedUp': function(evtData) {
                Game.Message.send('You picked up ' + evtData.lastItemPickedUpName);
            },
            'allItemsPickedUp': function(evtData) {
                Game.Message.send('You picked up ' + evtData.lastItemPickedUpName);
            },
            'itemsDropped': function(evtData) {
                Game.Message.send('You dropped the ' + evtData.lastItemDroppedName);
            }
        }
    }
};

Game.EntityTraits.PlayerActor = {
    META: {
        traitName: 'PlayerActor',
        traitGroup: 'Actor',
        stateNamespace: '_PlayerActor_attr',
        stateModel: {
            baseActionDur: 1000,
            actingState: false,
            curActionDur: 1000
        },
        listeners: {
            'actionDone': function(evtData) {
                this.getScheduler().setDuration(this.getCurActionDur());
                Game.UIMode.heist.getEngine().unlock();
                Game.renderMessage();
            },
            'killed': function(evtData) {
                var curDrone = Game.UIMode.heist.getAvatar();
                if (Game.UIMode.shipScreen.removeDrone(curDrone)) {
                    Game.Message.clear();
                    Game.switchUIMode(Game.UIMode.continue);
                } else {
                    Game.Message.send("You are out of drones. You are destined to drift through space for eternity.");
                    Game.switchUIMode(Game.UIMode.titleScreen);
                }
            },
            'injured': function(evtData) {
                this.raiseSymbolActiveEvent('forget');
            }
        }
    },
    getBaseActionDur: function() {
        return this.attr._PlayerActor_attr.baseActionDur;
    },
    setBaseActionDur: function(n) {
        this.attr._PlayerActor_attr.baseActionDur = n;
    },
    getCurActionDur: function() {
        return this.attr._PlayerActor_attr.curActionDur;
    },
    setCurActionDur: function(n) {
        this.attr._PlayerActor_attr.curActionDur = n;
    },
    isActing: function(state) {
        if (state != undefined) {
            this.attr._PlayerActor_attr.actingState = state;
        }
        return this.attr._PlayerActor_attr.actingState;
    },
    act: function() {
        if (this.isActing()) {
            return;
        } // gate to deal with JS timing issues
        this.isActing(true);
        Game.refresh();
        Game.UIMode.heist.getEngine().lock();
        this.isActing(false);
    }
};

Game.EntityTraits.SpeciesDrone = {
    META: {
        traitName: 'SpeciesDrone',
        traitGroup: 'Species',
        init: function() {
            this.setName(Game.Util.randomDroneName());
        }
    },
    toJSON: function() {
        return Game.UIMode.persistence.BASE_toJSON.call(this);
    },
    fromJSON: function(json) {
        return Game.UIMode.persistence.BASE_fromJSON.call(this, json);
    }
};

/* =========================================================================== */

Game.EntityTraits.WalkerCorporeal = {
    META: {
        traitName: 'WalkerCorporeal',
        traitGroup: 'Walker',
        stateNamespace: '_Walker_attr',
        stateModel: {
            direction: 0,
            moving: false
        },
        listeners: {
            'tryWalk': function(evtData) {
                this.tryWalk(evtData.map, evtData.dx, evtData.dy, evtData.dir);
            }
        }
    },
    tryWalk: function(map, dx, dy, dir) {
        var newX = Math.min(Math.max(0, this.getX()), map.getWidth()) + dx;
        var newY = Math.min(Math.max(0, this.getY()), map.getWidth()) + dy;
        var newPos = {
            x: newX,
            y: newY
        };
        this.setDirection(dir);
        Game.refresh();
        var ent = map.getEntity(newPos);
        if (ent) {
            this.raiseSymbolActiveEvent('bumpEntity', {
                actor: this,
                target: ent
            });
            this.raiseSymbolActiveEvent('actionDone');
            return true;
        }
        var nextTile = map.getTile(newPos);
        if (nextTile.isWalkable() && this.canMove()) {
            if (nextTile.getName() == 'airlock') {
                this.raiseSymbolActiveEvent('passAirlock');
            }
            this.setPos(newPos);
            map.updateEntityLocation(this);
            this.raiseSymbolActiveEvent('actionDone');
            return true;
        } else if (nextTile.getName() === 'doorClosed') {
            this.raiseSymbolActiveEvent('doorOpenAttempt', {
                targetPos: newPos
            });
        } else {
            this.raiseSymbolActiveEvent('walkForbidden', {
                target: nextTile
            });
            return false;
        }
    },
    getDirection: function() {
        return this.attr._Walker_attr.direction;
    },
    setDirection: function(dir) {
        this.attr._Walker_attr.direction = dir;
    },
    toggleMove: function() {
        this.attr._Walker_attr.moving = !this.attr._Walker_attr.moving;
    },
    canMove: function() {
        return this.attr._Walker_attr.moving;
    }
};

Game.EntityTraits.Chronicle = {
    META: {
        traitName: 'Chronicle',
        traitGroup: 'Chronicle',
        stateNamespace: '_Chronicle_attr',
        stateModel: {
            turnCounter: 0
        },
        listeners: {
            'actionDone': function(evtData) {
                this.trackTurns();
            }
        }
    },
    trackTurns: function() {
        this.attr._Chronicle_attr.turnCounter++;
    },
    getTurns: function() {
        return this.attr._Chronicle_attr.turnCounter;
    },
    setTurns: function(n) {
        this.attr._Chronicle_attr.turnCounter = n;
    }
};

Game.EntityTraits.EquipmentHolder = {
    META: {
        traitName: 'EquipmentHolder',
        traitGroup: 'InventoryHolder',
        stateNamespace: '_EquipmentHolder_attr',
        stateModel: {
            equipped: {}
        },
        init: function(template) {
            var defaultEquipment = template.defaultEquipment || [];
            this.attr._EquipmentHolder_attr.equipped = template.equipped || {
                head: null,
                core: null,
                torso: null,
                legs: null,
                weapon: null,
                arms: null,
                feet: null
            };
            var item;
            for (var i = 0; i < defaultEquipment.length; i++) {
                item = Game.ItemGenerator.create(defaultEquipment[i]);
                this.addEquipment(item.getID());
            }
        },
        listeners: {
          'refresh': function(){
              var equips = this.getEquipmentItemIDs();
              var item, i;
              for (i = 0; i < equips.length; i++){
                  item = Game.DATASTORE.ITEM[equips[i]];
                  item.raiseSymbolActiveEvent('ensureEquip');
              }
          }
        }
    },
    addEquipment: function(equipID) {
        var equipment = Game.DATASTORE.ITEM[equipID];
        var cat = equipment.getEquipCategory();
        equipment.toggleEquipped();
        equipment.raiseSymbolActiveEvent('equip', {
            actor: this
        });
        this.attr._EquipmentHolder_attr.equipped[cat] = equipment.getID();
        this.extractInventoryItems(equipID);
    },
    removeEquipment: function(equipID) {
        var equipment = Game.DATASTORE.ITEM[equipID];
        var cat = equipment.getEquipCategory();
        equipment.toggleEquipped();
        equipment.raiseSymbolActiveEvent('unequip', {
            actor: this
        });
        this.attr._EquipmentHolder_attr.equipped[cat] = null;
        this.addInventoryItems([equipment]);
    },
    removeEquipmentCategory: function(cat) {
        var equipID = this.attr._EquipmentHolder_attr.equipped[cat];
        if (equipID) {
            this.removeEquipment(equipID);
        }
    },
    swapEquipment: function(newEquipID) {
        var equipment = Game.DATASTORE.ITEM[newEquipID];
        var cat = equipment.getEquipCategory();
        this.removeEquipmentCategory(cat);
        this.addEquipment(newEquipID);
    },
    checkEquipmentCategory: function(cat) {
        return this.attr._EquipmentHolder_attr.equipped[cat] === null;
    },
    getEquipmentItemIDs: function() {
        var IDs = [];
        var equipped = this.attr._EquipmentHolder_attr.equipped;
        var equipCategories = Object.keys(equipped);
        equipCategories.forEach(function(elem) {
            if (equipped[elem] != null) {
                IDs.push(equipped[elem]);
            }
        });
        return IDs;
    },
    getRandomEquipmentID: function() {
        var equipped = this.attr._EquipmentHolder_attr.equipped;
        var keys = Object.keys(equipped);
        var cat = keys.random();
        var equipID = this.attr._EquipmentHolder_attr.equipped[cat];
        return equipID;
    }
};

Game.EntityTraits.InventoryHolder = {
    META: {
        traitName: 'InventoryHolder',
        traitGroup: 'InventoryHolder',
        stateNamespace: '_InventoryHolder_attr',
        stateModel: {
            containerID: '',
            inventoryCapacity: 5
        },
        init: function(template) {
            this.attr._InventoryHolder_attr.inventoryCapacity = template.inventoryCapacity || 5;
            var container = Game.ItemGenerator.create('_inventoryContainer');
            container.setCapacity(this.attr._InventoryHolder_attr.inventoryCapacity);
            this.attr._InventoryHolder_attr.containerID = container.getID();
        },
        listeners: {
            'pickupItems': function(evtData) {
                return {
                    addedItems: this.pickupItems(evtData.itemSet)
                };
            },
            'dropItems': function(evtData) {
                return {
                    droppedItems: this.dropItems(evtData.itemSet)
                };
            }
        }
    },
    _getContainer: function() {
        return Game.DATASTORE.ITEM[this.attr._InventoryHolder_attr.containerID];
    },
    hasInventorySpace: function() {
        return this._getContainer().hasSpace();
    },
    addInventoryItems: function(items_or_ids) {
        return this._getContainer().addItems(items_or_ids);
    },
    getInventoryItemIDs: function() {
        return this._getContainer().getItemIDs();
    },
    extractInventoryItems: function(ids_or_idxs) {
        return this._getContainer().extractItems(ids_or_idxs);
    },
    pickupItems: function(ids_or_idxs) {
        var itemsToAdd = [];
        var fromPile = this.getMap().getItems(this.getPos());
        var pickupResult = {
            numItemsPickedUp: 0,
            numItemsNotPickedUp: ids_or_idxs.length
        };

        // first check if possible to pick up items
        if (fromPile.length < 1) {
            this.raiseSymbolActiveEvent('noItemsToPickup');
            return pickupResult;
        }
        if (!this._getContainer().hasSpace()) {
            this.raiseSymbolActiveEvent('inventoryFull');
            this.raiseSymbolActiveEvent('noItemsPickedUp');
            return pickupResult;
        }

        // add items from pile
        for (var i = 0; i < fromPile.length; i++) {
            if ((ids_or_idxs.indexOf(i) > -1) || (ids_or_idxs.indexOf(fromPile[i].getID()) > -1)) {
                itemsToAdd.push(fromPile[i]);
            }
        }
        var addResult = this._getContainer().addItems(itemsToAdd);
        pickupResult.numItemsPickedUp = addResult.numItemsAdded;
        pickupResult.numItemsNotPickedUp = addResult.numItemsNotAdded;
        var lastItemFromMap = "";
        for (var j = 0; j < pickupResult.numItemsPickedUp; j++) {
            lastItemFromMap = this.getMap().extractItemAt(itemsToAdd[j], this.getPos());
        }

        // send user messages
        pickupResult.lastItemPickedUpName = lastItemFromMap.getName();
        if (pickupResult.numItemsPickedUp > 0) {
            this.raiseSymbolActiveEvent('someItemsPickedUp', pickupResult);
        } else {
            this.raiseSymbolActiveEvent('allItemsPickedUp', pickupResult);
        }

        return pickupResult;
    },
    dropItems: function(ids_or_idxs) {
        var itemsToDrop = this._getContainer().extractItems(ids_or_idxs);
        var dropResult = {
            numItemsDropped: 0
        };
        if (itemsToDrop.length < 1) {
            this.raiseSymbolActiveEvent('inventoryEmpty');
            return dropResult;
        }
        var lastItemDropped = "";
        for (var i = 0; i < itemsToDrop.length; i++) {
            if (itemsToDrop[i]) {
                lastItemDropped = itemsToDrop[i];
                this.getMap().addItem(itemsToDrop[i], this.getPos());
                dropResult.numItemsDropped++;
            }
        }
        dropResult.lastItemDroppedName = lastItemDropped.getName();
        this.raiseSymbolActiveEvent('itemsDropped', dropResult);
        return dropResult;
    }
};

/* ==================== Combat ==================== */

Game.EntityTraits.StatHitPoints = {
    META: {
        traitName: 'StatHitPoints',
        traitGroup: 'Stat',
        stateNamespace: '_HP_attr',
        stateModel: {
            maxHP: 1,
            curHP: 1
        },
        init: function(template) {
            this.attr._HP_attr.maxHP = template.maxHP || 1;
            this.attr._HP_attr.curHP = template.curHP || this.attr._HP_attr.maxHP;
        },
        listeners: {
            'attacked': function(evtData) {
                var dmg = evtData.attack;
                var equipID = this.getRandomEquipmentID();
                if (equipID) { // still has equipment left
                    var equipment = Game.DATASTORE.ITEM[equipID];
                    this.raiseSymbolActiveEvent('damagedEquipment', {
                        damager: evtData.attacker,
                        equipment: equipment.getName(),
                        damage: dmg
                    });
                    equipment.raiseSymbolActiveEvent('attacked', {
                        equipper: this,
                        damager: evtData.attacker,
                        damage: dmg
                    });
                    evtData.attacker.raiseSymbolActiveEvent('dealtDamage', {
                        attacked: equipment,
                        damage: dmg
                    });
                } else {
                    this.takeDamage(dmg);
                    this.raiseSymbolActiveEvent('damagedBy', {
                        damager: evtData.attacker,
                        damage: dmg
                    });
                    evtData.attacker.raiseSymbolActiveEvent('dealtDamage', {
                        attacked: this,
                        damage: dmg
                    });
                    if (this.getCurHP() <= 0) {
                        this.raiseSymbolActiveEvent('killed', {
                            dead: this,
                            killer: evtData.attacker
                        });
                        evtData.attacker.raiseSymbolActiveEvent('madeKill', {
                            dead: this,
                            killer: evtData.attacker
                        });
                    }
                }
            },
            'killed': function(evtData) {
                this.destroy();
            }
        }
    },
    getMaxHP: function() {
        return this.attr._HP_attr.maxHP;
    },
    setMaxHP: function(n) {
        this.attr._HP_attr.maxHP = n;
    },
    getCurHP: function() {
        return this.attr._HP_attr.curHP;
    },
    setCurHP: function(n) {
        this.attr._HP_attr.curHP = n;
    },
    getCoreStatus: function() {
        var curPercent = this.getCurHP() / this.getMaxHP();
        if (curPercent > .5) {
            return "Nominal";
        } else if (curPercent > .25) {
            return "Damaged";
        } else {
            return "Broken"
        }
    },
    takeDamage: function(amt) {
        this.attr._HP_attr.curHP -= amt;
    },
    recover: function(amt) {
        this.attr._HP_attr.curHP = Math.min(this.attr._HP_attr.curHP + amt, this.attr._HP_attr.maxHP);
    }
};

Game.EntityTraits.MeleeAttacker = {
    META: {
        traitName: 'MeleeAttacker',
        traitGroup: 'Attacker',
        stateNamespace: '_MeleeAttacker_attr',
        stateModel: {
            attack: 0,
            attackAccuracy: 0,
            canAttack: false
        },
        init: function(template) {
            this.attr._MeleeAttacker_attr.attack = template.attack || 0;
            this.attr._MeleeAttacker_attr.attack = template.attackAccuracy || 0;
        },
        listeners: {
            'bumpEntity': function(evtData) {
                if (this.canAttack()) {
                    var hit = this.getAttackAccuracy();
                    var dodge = evtData.target.raiseSymbolActiveEvent('getDodge').dodge || 0;
                    if (ROT.RNG.getUniform() <= Math.max(0, hit - dodge)) {
                        evtData.target.raiseSymbolActiveEvent('attacked', {
                            attacker: evtData.actor,
                            attack: this.getAttack()
                        });
                    } else {
                        this.raiseSymbolActiveEvent('attackMiss', {
                            attacker: evtData.actor,
                            target: evtData.target
                        });
                        evtData.target.raiseSymbolActiveEvent('attackAvoided', {
                            attacker: evtData.actor,
                            target: evtData.target
                        });
                    }
                } else {
                    Game.Message.send(this.getName() + " has nothing to attack with.");
                }
            }
        }
    },
    setAttack: function(n) {
        this.attr._MeleeAttacker_attr.attack = n;
    },
    getAttack: function() {
        return this.attr._MeleeAttacker_attr.attack;
    },
    setAttackAccuracy: function(n) {
        this.attr._MeleeAttacker_attr.attackAccuracy = n;
    },
    getAttackAccuracy: function() {
        return this.attr._MeleeAttacker_attr.attackAccuracy;
    },
    toggleAttack: function() {
        this.attr._MeleeAttacker_attr.canAttack = !this.attr._MeleeAttacker_attr.canAttack;
    },
    canAttack: function() {
        return this.attr._MeleeAttacker_attr.canAttack;
    }
};

/*
Game.EntityTraits.MeleeDefender = {
    META: {
        traitName: 'MeleeDefender',
        traitGroup: 'Defender',
        stateNamespace: '_MeleeDefender_attr',
        stateModel: {
            defense: 1,
            dodge: .05
        },
        init: function(template) {
            this.attr._MeleeDefender_attr.defense = template.defense || 1;
            this.attr._MeleeDefender_attr.dodge = template.dodge || .05;
        },
        listeners: {
            'getDodge': function() {
                return {
                    dodge: this.getDodge()
                };
            },
            'getDefense': function() {
                return {
                    defense: this.getDefense()
                };
            }
        }
    },
    getDefense: function() {
        return this.attr._MeleeDefender_attr.defense;
    },
    getDodge: function() {
        return this.attr._MeleeDefender_attr.dodge;
    }
};
*/

/* ================ Sight / Map ================== */

Game.EntityTraits.Sight = {
    META: {
        traitName: 'Sight',
        traitGroup: 'Sense',
        stateNamespace: '_Sight_attr',
        stateModel: {
            sightRadius: 0,
            sightAngle: 0
        },
        init: function(template) {
            this.attr._Sight_attr.sightRadius = template.sightRadius || 0;
            this.attr._Sight_attr.sightAngle = template.sightAngle || 0;
        }
    },
    getSightRadius: function() {
        return this.attr._Sight_attr.sightRadius;
    },
    setSightRadius: function(n) {
        this.attr._Sight_attr.sightRadius = n;
    },
    getSightAngle: function() {
        return this.attr._Sight_attr.sightAngle;
    },
    setSightAngle: function(n) {
        this.attr._Sight_attr.sightAngle = n;
    },

    canSeeEntity: function(ent) {
        if (!ent || this.getMapID() !== ent.getMapID()) {
            return false;
        }
        return this.canSeeCoord(ent.getPos());
    },
    canSeeCoord: function(pos) {
        var otherX = pos.x;
        var otherY = pos.y;
        if (Math.max(Math.abs(otherX - this.getX()), Math.abs(otherY - this.getY())) > this.attr._Sight_attr.sightRadius) {
            return false;
        }
        var inFOV = this.getVisibleCells();
        return inFOV[otherX + ',' + otherY] || false;
    },
    getVisibleCells: function() {
        var visibleCells = {
            'byDistance': {}
        };
        for (var i = 0; i <= this.getSightRadius(); i++) {
            visibleCells.byDistance[i] = {};
        }
        switch (this.getSightAngle()) {
            case 90:
                this.getMap().getFOV().compute90(
                    this.getX(), this.getY(), this.getSightRadius(), this.getDirection(),
                    function(x, y, radius, visibility) {
                        visibleCells[x + ',' + y] = true;
                        visibleCells.byDistance[radius][x + ',' + y] = true;
                    }
                );
                break;
            case 180:
                this.getMap().getFOV().compute180(
                    this.getX(), this.getY(), this.getSightRadius(), this.getDirection(),
                    function(x, y, radius, visibility) {
                        visibleCells[x + ',' + y] = true;
                        visibleCells.byDistance[radius][x + ',' + y] = true;
                    }
                );
                break;
            default:
                this.getMap().getFOV().compute(
                    this.getX(), this.getY(), this.getSightRadius(),
                    function(x, y, radius, visibility) {
                        visibleCells[x + ',' + y] = true;
                        visibleCells.byDistance[radius][x + ',' + y] = true;
                    }
                );
                break;
        }

        return visibleCells;
    },
    canSeeCoord_delta: function(dx, dy) {
        return this.canSeeCoord(this.getX() + dx, this.getY() + dy);
    },
};

Game.EntityTraits.MapMemory = {
    META: {
        traitName: 'MapMemory',
        traitGroup: 'MapMemory',
        stateNamespace: '_MapMemory_attr',
        stateModel: {
            mapsHash: {}
        },
        init: function(template) {
            this.attr._MapMemory_attr.mapsHash = template.mapsHash || {};
        },
        listeners: {
            'forget': function(evtData) {
                this.forgetRandomCoords(this.getMapID());
            }
        }
    },
    rememberCoords: function(coordSet, mapID) {
        var mapKey = mapID || this.getMapID();
        if (!this.attr._MapMemory_attr.mapsHash[mapKey]) {
            this.attr._MapMemory_attr.mapsHash[mapKey] = {};
        }
        for (var coord in coordSet) {
            if (coordSet.hasOwnProperty(coord) && (coord != 'byDistance')) {
                this.attr._MapMemory_attr.mapsHash[mapKey][coord] = true;
            }
        }
    },
    getRememberedCoordsForMap: function(mapID) {
        var mapKey = mapID || this.getMapID();
        return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
    },
    forgetRandomCoords: function(mapID) {
        var mapKey = mapID || this.getMapID();
        var keys = Object.keys(this.attr._MapMemory_attr.mapsHash[mapKey]);
        var times = ROT.RNG.getUniform() * keys.length;
        for (var i = 0; i < times; i++) {
            delete this.attr._MapMemory_attr.mapsHash[mapKey][keys.pop()];
        }
    }
};


Game.EntityTraits.DoorOpener = {
    META: {
        traitName: 'DoorOpener',
        traitGroup: 'DoorOpener',
        stateNamespace: '_DoorOpener_attr',
        listeners: {
            'doorOpenAttempt': function(evtData) {
                this.openDoor(this.getMap(), evtData.targetPos);
            }
        },

    },
    openDoor: function(map, pos) {
        map.setTile(pos, Game.Tile.doorOpenTile);
        Game.refresh();
    }
};

/* ====================== Enemy AI ======================= */

Game.EntityTraits.WanderChaserActor = {
    META: {
        traitName: 'WanderChaserActor',
        traitGroup: 'Actor',
        stateNamespace: '_WanderChaserActor_attr',
        stateModel: {
            baseActionDur: 1000,
            curActionDur: 1000
        },
        init: function(template) {
            this.attr._WanderChaserActor_attr.baseActionDur = template.baseActionDur || 1000;
            this.attr._WanderChaserActor_attr.curActionDur = this.attr._WanderChaserActor_attr.baseActionDur;
        }
    },
    getBaseActionDur: function() {
        return this.attr._WanderChaserActor_attr.baseActionDur;
    },
    setBaseActionDur: function(n) {
        this.attr._WanderChaserActor_attr.baseActionDur = n;
    },
    getCurActionDur: function() {
        return this.attr._WanderChaserActor_attr.curActionDur;
    },
    setCurActionDur: function(n) {
        this.attr._WanderChaserActor_attr.curActionDur = n;
    },
    getMoveDeltas: function() {
        var avatar = Game.UIMode.heist.getAvatar();
        var senseResp = this.canSeeEntity(avatar);

        if (senseResp) {
            // build path to avatar
            var source = this;
            var map = this.getMap();
            var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
                // can't move onto tile with entity
                var ent = map.getEntity({
                    x: x,
                    y: y
                });
                if (ent && ent !== avatar && ent !== source) {
                    return false;
                }
                return map.getTile({
                    x: x,
                    y: y
                }).isWalkable();
            }, {
                topology: 8
            });
            // compute the path
            var count = 0;
            var moveDeltas = {
                x: 0,
                y: 0
            };
            path.compute(this.getX(), this.getY(), function(x, y) {
                if (count == 1) {
                    moveDeltas.x = x - source.getX();
                    moveDeltas.y = y - source.getY();
                }
                count++;
            });
            return moveDeltas;
        }
        // otherwise move randomly
        return Game.Util.getAdjacentPos({
            x: 0,
            y: 0
        }).random();
    },
    act: function() {
        var engine = Game.UIMode.heist.getEngine();
        engine.lock();
        var moveDeltas = this.getMoveDeltas();
        var input = {
            map: this.getMap(),
            dx: moveDeltas.x,
            dy: moveDeltas.y,
            dir: 0
        };
        this.raiseSymbolActiveEvent('tryWalk', input);
        this.getScheduler().setDuration(this.getCurActionDur());
        this.raiseSymbolActiveEvent('actionDone');
        engine.unlock();
    }
};
