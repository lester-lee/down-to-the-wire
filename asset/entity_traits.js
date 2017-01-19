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
                Game.Message.send("it'd be mighty impolite to walk into " + evtData.target.getName());
                Game.renderMessage();
            },
            'attackMiss': function(evtData) {
                Game.Message.send("You miss your attack on " + evtData.target.getName());
            },
            'madeKill': function(evtData) {
                Game.Message.send("You destroy " + evtData.dead.getName());
            },
            'dealtDamage': function(evtData) {
                Game.Message.send("You deal " + evtData.damage + " damage to the " + evtData.attacked.getName());
            }
        }
    }
};

Game.EntityTraits.WalkerCorporeal = {
    META: {
        traitName: 'WalkerCorporeal',
        traitGroup: 'Walker',
        stateNamespace: '_Walker_attr',
        stateModel: {
            direction: 0
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
            this.raiseEntityEvent('bumpEntity', {
                actor: this,
                target: ent
            });
            this.raiseEntityEvent('tookTurn');
            return true;
        }
        var nextTile = map.getTile(newPos);
        if (nextTile.isWalkable()) {
            this.setPos(newPos);
            map.updateEntityLocation(this);
            this.raiseEntityEvent('tookTurn');
            return true;
        } else if(nextTile.getName() === 'doorClosed'){
          this.raiseEntityEvent('doorOpenAttempt',{targetPos: newPos});
        }else{
            this.raiseEntityEvent('walkForbidden', {
                target: nextTile
            });
            return false;
        }
    },
    getDirection() {
        return this.attr._Walker_attr.direction;
    },
    setDirection(dir) {
        this.attr._Walker_attr.direction = dir;
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
            'tookTurn': function(evtData) {
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
                var defense = this.raiseEntityEvent('getDefense') || 0;
                var dmg = evtData.attack - defense;
                this.takeDamage(dmg);
                evtData.attacker.raiseEntityEvent('dealtDamage', {
                    attacked: this,
                    damage: dmg
                });
                if (this.getCurHP() <= 0) {
                    this.raiseEntityEvent('killed', {
                        entKilled: this,
                        killedBy: evtData.attacker
                    });
                    evtData.attacker.raiseEntityEvent('madeKill', {
                        dead: this,
                        killer: evtData.attacker
                    });
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
    takeDamage: function(amt) {
        this.attr._HP_attr.curHP -= amt;
    },
    recover: function(amt) {
        this.attr._HP_attr.curHP = Math.min(this.attr._HP_attr.curHP + amt, this.attr._HitPoints_attr.maxHP);
    }
};

Game.EntityTraits.MeleeAttacker = {
    META: {
        traitName: 'MeleeAttacker',
        traitGroup: 'Attacker',
        stateNamespace: '_MeleeAttacker_attr',
        stateModel: {
            attack: 1,
            attackAccuracy: .95
        },
        init: function(template) {
            this.attr._MeleeAttacker_attr.attack = template.attack || 1;
        },
        listeners: {
            'bumpEntity': function(evtData) {
                var hit = this.getAttackAccuracy()
                var dodge = evtData.target.raiseEntityEvent('getDodge') || 0;
                if (ROT.RNG.getUniform() <= hit - dodge) {
                    evtData.target.raiseEntityEvent('attacked', {
                        attacker: evtData.actor,
                        attack: this.getAttack()
                    });
                } else {
                    this.raiseEntityEvent('attackMiss', {
                        attacker: evtData.actor,
                        target: evtData.target
                    });
                }
            }
        }
    },
    getAttack: function() {
        return this.attr._MeleeAttacker_attr.attack;
    },
    getAttackAccuracy: function() {
        return this.attr._MeleeAttacker_attr.attackAccuracy;
    }
};

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
            'bumpEntity': function(evtData) {
                evtData.target.raiseEntityEvent('attacked', {
                    attacker: evtData.actor,
                    attack: this.getAttack()
                });
            },
            'getDodge': function() {
                return this.getDodge();
            },
            'getDefense': function() {
                return this.getDefense();
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

Game.EntityTraits.Sight = {
    META: {
        traitName: 'Sight',
        traitGroup: 'Sense',
        stateNamespace: '_Sight_attr',
        stateModel: {
            sightRadius: 3,
            sightAngle: 90
        },
        init: function(template) {
            this.attr._Sight_attr.sightRadius = template.sightRadius || 3;
            this.attr._Sight_attr.sightAngle = template.sightAngle || 90;
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
        if (!ent || this.getMap().getID() !== ent.getMap().getID()) {
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
        }
    },
    rememberCoords: function(coordSet, mapID) {
        var mapKey = mapID || this.getMap().getID();
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
        var mapKey = mapID || this.getMap().getID();
        return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
    }
};

Game.EntityTraits.DoorOpener = {
    META: {
        traitName: 'DoorOpener',
        traitGroup: 'DoorOpener',
        stateNamespace: '_DoorOpener_attr',
        listeners: {
            'doorOpenAttempt': function(evtData) {
                this.openDoor(this.getMap(),evtData.targetPos);
            }
        },

    },
    openDoor: function(map, pos){
        map.setTile(pos, Game.Tile.doorOpenTile);
        Game.refresh();
    }

};
