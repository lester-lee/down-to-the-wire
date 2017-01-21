Game.ItemTraits = {};

Game.ItemTraits.Repair = {
    META: {
        TraitName: 'Repair',
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
                var avatar = Game.UIMode.heist.getAvatar();
                var recoverAmt = Game.UIMode.itemMenu.curItem.getRepairValue();
                avatar.recover(recoverAmt);
                avatar.extractInventoryItems(itemID);
                // return to heist screen
                Game.goBaseUIMode();
                avatar.raiseSymbolActiveEvent('recoverHP',{hp:recoverAmt});
                avatar.raiseSymbolActiveEvent('actionDone');
            };
        },
        listeners: {
            'getStatsForDisplay': function(evtData) {
                return {
                    'repair value': this.getRepairValue()
                };
            }
        }
    },
    getRepairValue: function() {
        return this.attr._Repair_attr.repairValue;
    },
    setRepairValue: function(v) {
        this.attr._Repair_attr.repairValue = v;
    }
};

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
    extractItems: function(IDs){
        if (IDs.constructor !== Array){
          IDs = [IDs];
        }
        console.dir(IDs);
        while (IDs.length > 0){
          var curID = IDs.shift();
          var IDidx = this.attr._Container_attr.itemIDs.indexOf(curID);
          if (IDidx > -1){
            this.attr._Container_attr.itemIDs.splice(IDidx, 1);
          }
        }
    }
    /*
    extractItems: function(IDs_or_IDxs) {
        var IDsOnly = JSON.parse(JSON.stringify(IDs_or_IDxs)); // clone so we're not accidentally mucking with the param array with is passed by reference
        // first convert indexes to IDs - uniformity makes the rest of this easier
        // doing this in two passes so itemIDs doesn't change mID-loop
        console.dir(IDsOnly);
        for (var i = 0; i < IDsOnly.length; i++) {
            if (!isNaN(IDsOnly[i])) {
                IDsOnly[i] = this.attr._Container_attr.itemIDs[IDsOnly[i]];
            }
        }
        var ret = [];
        while (IDsOnly.length > 0) {
            var curID = IDsOnly.shift();
            var IDIDx = this.attr._Container_attr.itemIDs.indexOf(curID);
            if (IDIDx > -1) {
                this.attr._Container_attr.itemIDs.splice(IDIDx, 1);
                ret.push(Game.DATASTORE.ITEM[curID]);
            }
        }
        return ret;
    }
    */
};
