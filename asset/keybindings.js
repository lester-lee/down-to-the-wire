Game.KeyBinding = {
    _availableBindings: ['numpad', 'waxd'],
    _curBinding: '',
    _curBindingLookup: {},

    setKeyBinding: function(keys) {
        this._curBinding = keys || 'waxd';
        this.initBindingLookup();
    },
    getKeyBinding: function() {
        return this._curBinding;
    },
    cycleKeyBinding: function() {
        var curIndex = this._availableBindings.indexOf(this._curBinding);
        var nextIndex = (curIndex + 1) % this._availableBindings.length;
        this.setKeyBinding(_availableBindings[nextIndex]);
        this.informPlayer();
    },
    informPlayer: function() {
        Game.Message.send('You are now using ' + _curBinding + ' key bindings');
        Game.renderMessage();
    },
    initBindingLookup: function() {
        this._curBindingLookup = {
            keydown: {
                nometa: {},
                ctrlshift: {},
                shift: {},
                ctrl: {}
            },
            keypress: {
                nometa: {},
                ctrlshift: {},
                shift: {},
                ctrl: {}
            }
        };
        for (var act in this.Action) {
            var info = this.Action[act][this._curBinding] || this.Action[act]['all'];
            if (info) {
                var metakey = 'nometa';
                if (info.inputCtrl && info.inputShift) {
                    var metakey = 'ctrlshift';
                } else if (info.inputCtrl) {
                    var metakey = 'ctrl';
                } else if (info.inputShift) {
                    var metakey = 'shift';
                }
            }
            this._curBindingLookup[info.inputType][metakey][info.inputMatch] = {
                key: act
            };
        }
    },
    getInput: function(inputType, inputData) {
        var metakey = 'nometa';
        if (inputData.ctrlKey && inputData.shiftKey) {
            var metakey = 'ctrlshift';
        } else if (inputData.ctrlKey) {
            var metakey = 'ctrl';
        } else if (inputData.shiftKey) {
            var metakey = 'shift';
        }
        var key = inputData.keyCode;
        return this._curBindingLookup[inputType][metakey][key] || false;
    },

    Action: {
        PERSISTENCE: {
            all: {
                inputMatch: ROT.VK_EQUALS,
                inputType: 'keypress',
                inputShift: false,
                inputCtrl: false
            }
        },
        PERSISTENCE_SAVE: {
            all: {
                inputMatch: ROT.VK_S,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        PERSISTENCE_LOAD: {
            all: {
                inputMatch: ROT.VK_L,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        PERSISTENCE_NEW: {
            all: {
                inputMatch: ROT.VK_N,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },

        MOVE_UL: {
            waxd: {
                inputMatch: ROT.VK_Q,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD7,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_UP: {
            waxd: {
                inputMatch: ROT.VK_W,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD8,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_UR: {
            waxd: {
                inputMatch: ROT.VK_E,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD9,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_LEFT: {
            waxd: {
                inputMatch: ROT.VK_A,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD4,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_STILL: {
            waxd: {
                inputMatch: ROT.VK_S,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD5,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_RIGHT: {
            waxd: {
                inputMatch: ROT.VK_D,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD6,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DL: {
            waxd: {
                inputMatch: ROT.VK_Z,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD1,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DOWN: {
            waxd: {
                inputMatch: ROT.VK_X,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD2,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DR: {
            waxd: {
                inputMatch: ROT.VK_C,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD3,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NEXT_LEVEL: {
          all: {
            inputMatch: ROT.VK_GREATER_THAN,
            inputType: 'keypress',
            inputShift: true,
            inputCtrl: false
          }
        },
        PREVIOUS_LEVEL: {
          all: {
            inputMatch: ROT.VK_LESS_THAN,
            inputType: 'keypress',
            inputShift: true,
            inputCtrl: false
          }
        },

        CHANGE_BINDINGS: {
            all: {
                inputMatch: ROT.VK_BACK_SLASH,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        CANCEL: {
            all: {
                inputMatch: ROT.VK_ESCAPE,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        }

    }
};
