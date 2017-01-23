Game.ItemTraits = {};

Game.ItemTraits.Equipable = {
    META: {
        traitName: 'Equipable',
        traitGroup: 'Equipable',
        stateNamespace: '_Equipable_attr',
        stateModel: {
            equipCategory: null,
            equipped: false
        },
        init: function(template) {
            this.attr._Equipable_attr.equipCategory = template.equipCategory || "torso";
            this.attr.itemOptions = this.attr.itemOptions || [];
            this.attr.itemOptions.push('Equip');
            this.attr.itemOptions.push('Unequip');
            this.attr.itemFunctions = this.attr.itemFunctions || {};
            this.attr.itemFunctions['Equip'] = function(itemID) {
                var item = Game.DATASTORE.ITEM[itemID];
                var cat = item.getEquipCategory();
                var actor = Game.UIMode.heist.getCurrentActor();
                if (!item.isEquipped() && actor.checkEquipmentCategory(cat)) {
                    actor.addEquipment(itemID);
                    Game.removeUIMode();
                } else if (!item.isEquipped() && !actor.checkEquipmentCategory(cat)) {
                    actor.swapEquipment(itemID);
                    Game.removeUIMode();
                } else {
                    Game.Message.send("Yer already wearin that.");
                }
            };
            this.attr.itemFunctions['Unequip'] = function(itemID) {
                var item = Game.DATASTORE.ITEM[itemID];
                if (item.isEquipped()) {
                    var actor = Game.UIMode.heist.getCurrentActor();
                    actor.removeEquipment(itemID);
                    Game.UIMode.inventory.refreshItemIDs();
                    Game.removeUIMode();
                } else {
                    Game.Message.send("You'd have to equip that first.");
                }
            };
        }
    },
    getEquipCategory: function() {
        return this.attr._Equipable_attr.equipCategory;
    },
    toggleEquipped: function() {
        this.attr._Equipable_attr.equipped = !this.attr._Equipable_attr.equipped;
    },
    isEquipped: function() {
        return this.attr._Equipable_attr.equipped;
    }
};

Game.ItemTraits.Repair = {
    META: {
        traitName: 'Repair',
        traitGroup: 'Repair',
        stateNamespace: '_Repair_attr',
        stateModel: {
            repairValue: 3,
        },
        init: function(template) {
            this.attr._Repair_attr.repairValue = template.repairValue || 3;
            this.attr.itemOptions = this.attr.itemOptions || [];
            this.attr.itemOptions.push('Use');
            this.attr.itemFunctions = this.attr.itemFunctions || {};
            this.attr.itemFunctions['Use'] = function(itemID) {
                var actor = Game.UIMode.heist.getCurrentActor();
                var recoverAmt = Game.UIMode.itemMenu.curItem.getRepairValue();
                actor.recover(recoverAmt);
                actor.extractInventoryItems(itemID);
                // return to heist screen
                Game.goBaseUIMode();
                actor.raiseSymbolActiveEvent('recoverHP', {
                    hp: recoverAmt
                });
                actor.raiseSymbolActiveEvent('actionDone');
            };
        }
    },
    getRepairValue: function() {
        return this.attr._Repair_attr.repairValue;
    },
    setRepairValue: function(v) {
        this.attr._Repair_attr.repairValue = v;
    }
};

/* ================= Stat Modifiers ================= */

Game.ItemTraits.StatModifierSight = {
    META: {
        traitName: 'StatModifierSight',
        traitGroup: 'StatModifier',
        stateNamespace: '_StatModifier_Sight_attr',
        stateModel: {
            newSightRadius: 0,
            newSightAngle: 0
        },
        init: function(template) {
            this.attr._StatModifier_Sight_attr.newSightRadius = template.newSightRadius || 3;
            this.attr._StatModifier_Sight_attr.newSightAngle = template.newSightAngle || 90;
        },
        listeners: {
            'equip': function(evtData) {
                var actor = evtData.actor;
                var newValues = this.getNewSightValues();
                actor.setSightRadius(newValues.rad);
                actor.setSightAngle(newValues.ang);
            },
            'unequip': function(evtData) {
                var actor = evtData.actor;
                actor.setSightRadius(0);
                actor.setSightAngle(0);
            }
        }
    },
    setOldSightValues: function(oldRadius, oldAngle) {
        this.attr._StatModifier_Sight_attr.oldSightRadius = oldRadius;
        this.attr._StatModifier_Sight_attr.oldSightAngle = oldAngle;
    },
    getOldSightValues: function() {
        return {
            rad: this.attr._StatModifier_Sight_attr.oldSightRadius,
            ang: this.attr._StatModifier_Sight_attr.oldSightAngle
        };
    },
    getNewSightValues: function() {
        return {
            rad: this.attr._StatModifier_Sight_attr.newSightRadius,
            ang: this.attr._StatModifier_Sight_attr.newSightAngle
        };
    }
};

Game.ItemTraits.StatModifierMovement = {
  META: {
      traitName: 'StatModifierMovement',
      traitGroup: 'StatModifier',
      stateNamespace: '_StatModifier_Movement_attr',
      stateModel: {
          moveSpeed: 1000
      },
      init: function(template) {
          this.attr._StatModifier_Movement_attr.moveSpeed = template.moveSpeed || 1000;
      },
      listeners: {
          'equip': function(evtData) {
              var actor = evtData.actor;
              actor.toggleMove();
          },
          'unequip': function(evtData) {
              var actor = evtData.actor;
              actor.toggleMove();
          }
      }
  },
};

/* =============================================== */

Game.ItemTraits.Container = {
    META: {
        traitName: 'Container',
        traitGroup: 'Container',
        stateNamespace: '_Container_attr',
        stateModel: {
            itemIDs: [],
            capacity: 1
        },
        init: function(template) {
            this.attr._Container_attr.itemIDs = template.itemIDs || [];
            this.attr._Container_attr.capacity = template.capacity || 1;
        }
    },
    getCapacity: function() {
        return this.attr._Container_attr.capacity;
    },
    setCapacity: function(c) {
        this.attr._Container_attr.capacity = c;
    },
    hasSpace: function() {
        return this.attr._Container_attr.capacity > this.attr._Container_attr.itemIDs.length;
    },
    addItems: function(items_or_IDs) {
        var addItemStatus = {
            numItemsAdded: 0,
            numItemsNotAdded: items_or_IDs.length
        };
        if (items_or_IDs.length < 1) {
            return addItemStatus;
        }

        for (var i = 0; i < items_or_IDs.length; i++) {
            if (!this.hasSpace()) {
                if (i === 0) {
                    return addItemStatus;
                } else {
                    return addItemStatus;
                }
            }
            var itemID = items_or_IDs[i];
            if (typeof itemID !== 'string') {
                itemID = itemID.getID();
            }
            this._forceAddItemID(itemID);
            addItemStatus.numItemsAdded++;
            addItemStatus.numItemsNotAdded--;
        }

        return addItemStatus;
    },
    _forceAddItemID: function(itemID) {
        this.attr._Container_attr.itemIDs.push(itemID);
    },
    getItemIDs: function() {
        return this.attr._Container_attr.itemIDs;
    },
    extractItems: function(IDs) {
        if (IDs.constructor !== Array) {
            IDs = [IDs];
        }
        while (IDs.length > 0) {
            var curID = IDs.shift();
            var IDidx = this.attr._Container_attr.itemIDs.indexOf(curID);
            if (IDidx > -1) {
                this.attr._Container_attr.itemIDs.splice(IDidx, 1);
            }
        }
    }
};
