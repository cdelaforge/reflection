/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * laserreflection.js
 *
 * LaserReflection user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/game_ui.js",
    g_gamethemeurl + "modules/utils.js",
    g_gamethemeurl + "modules/timer.js",
    g_gamethemeurl + "modules/main.js"
],
    function (dojo, declare) {
        return declare("bgagame.laserreflection", ebg.core.gamegui, {
            constructor: function () {
                console.log('laserreflection constructor');
            },

            setup: function (data) {
                console.log("Starting game setup", data);

                utils.serverTimeDec = Math.round(new Date().getTime() / 1000) - data["server_time"];
                gameUI.initLocalStorage(this.table_id, this.player_id);

                utils.init(this);
                gameUI.players = {};
                gameUI.playersCount = 0;
                Object.keys(data.players).map((playerId) => {
                    gameUI.playersCount++;
                    const color = data.players[playerId].color;
                    gameUI.players[playerId] = {
                        color,
                        progression: parseInt(data.players[playerId].progression, 10),
                        grid: JSON.parse(data.players[playerId].grid),
                        puzzle: data.players[playerId].puzzle ? JSON.parse(data.players[playerId].puzzle) : undefined,
                        name: data.players[playerId].name,
                        startTime: parseInt(data.players[playerId].start, 10),
                    };

                    gameUI.players[playerId].running = gameUI.players[playerId].startTime;
                    if (!gameUI.players[playerId].running) {
                        gameUI.players[playerId].duration = utils.getDurationStr(parseInt(data.players[playerId].duration, 10));
                    }

                    gameUI.shouldRefreshProgression = true;
                });

                // Setting up player boards
                if (this.isSpectator) {
                    utils.displayPuzzle(document.getElementById("playerSelect").value);
                } else {
                    const me = data.players[this.player_id];
                    gameUI.setGrid(me && me.grid ? JSON.parse(me.grid) : gameUI.getSavedGrid());
                    timer.init(me.color, 5);
                }

                gameUI.portals = data.params["portals"] ? JSON.parse(data.params["portals"]["game_value"]) : [];
                gameUI.elements = JSON.parse(data.params["elements"]["game_value"]);
                gameUI.elementsCount = gameUI.elements.length;
                gameUI.gridSize = parseInt(data.params["grid_size"]["game_value"], 10);
                gameUI.autoStart = parseInt(data.params["auto_start"]["game_value"], 10) === 1;
                gameUI.init(this);

                // Setup game notifications to handle (see "setupNotifications" method below)
                this.setupNotifications();

                console.log("Ending game setup");
            },


            ///////////////////////////////////////////////////
            //// Game & client states

            // onEnteringState: this method is called each time we are entering into a new game state.
            //                  You can use this method to perform some user interface changes at this moment.
            //
            onEnteringState: function (stateName, args) {
                console.log('Entering state: ' + stateName, args);
                const self = this;

                switch (stateName) {
                    case 'puzzleCreationInit':
                        gameUI.mode = (g_archive_mode || this.isSpectator) ? 'puzzleCreation' : 'standalone';
                        gameUI.setup();
                        break;
                    case 'puzzlePlayInit':
                        if (this.isSpectator) {
                            const publicData = args.args["_public"];
                            gameUI.puzzleUsers = {};
                            Object.keys(publicData).map((id) => {
                                gameUI.puzzleUsers[id] = parseInt(publicData[id].id, 10);
                            });
                            utils.refreshPuzzle();

                            gameUI.mode = 'play';
                        } else {
                            const privateData = args.args["_private"];
                            const savedGrid = gameUI.getSavedGrid();
                            if (savedGrid) {
                                gameUI.setGrid(savedGrid);
                            } else {
                                gameUI.setGrid(privateData.grid ? JSON.parse(privateData.grid) : undefined);
                            }
                            gameUI.puzzle = JSON.parse(privateData.puzzle);
                            gameUI.puzzleUser = gameUI.players[privateData.id]; // player that did the puzzle

                            gameUI.mode = privateData.started ? 'play' : 'empty';
                        }
                        gameUI.setup();
                        utils.displayGrid();
                        break;
                    case "puzzlePlayWait":
                        if (gameUI.autoStart && !this.isSpectator && !g_archive_mode) {
                            utils.displayTimer(function () {
                                self.callAction("puzzleStart", null, true);
                            });
                        }
                        break;
                    case "puzzlePlay":
                        gameUI.mode = 'play';
                        gameUI.setup();
                        utils.displayGrid();
                        break;
                    case "gameEnd":
                        gameUI.ended = true;
                        if (!this.isSpectator) {
                            utils.displayPuzzle(this.player_id);
                        }
                        break;
                }
            },

            // onLeavingState: this method is called each time we are leaving a game state.
            //                 You can use this method to perform some user interface changes at this moment.
            //
            onLeavingState: function (stateName) {
                console.log('Leaving state: ' + stateName);
            },

            // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
            //                        action status bar (ie: the HTML links in the status bar).
            //
            onUpdateActionButtons: function (stateName, args) {
                const isPlayerActive = this.isCurrentPlayerActive();
                console.log('onUpdateActionButtons: ' + stateName);

                if (gameUI.running !== isPlayerActive) {
                    gameUI.running = isPlayerActive;

                    try {
                        window.game.setRunning(gameUI.running);
                        console.log("set running " + gameUI.running);
                    } catch (error) { }
                }

                if (isPlayerActive) {
                    switch (stateName) {
                        case "puzzleCreation":
                            if (gameUI.elementsCount === gameUI.placedElements) {
                                this.addActionButton('puzzleCreationEnd', _('Done'), 'onPuzzleCreationEnd');
                            } else {
                                this.removeActionButtons();
                            }
                            break;
                        case "puzzlePlayWait":
                            this.removeActionButtons();
                            this.addActionButton('start', _('Start now'), 'onStartNow');
                            if (gameUI.mode === 'play') {
                                // if we don't click the start button the grid must be hidden
                                // this only occures in turn-based mode
                                gameUI.mode = 'empty';
                                gameUI.setup();
                            }
                            break;
                        case "puzzlePlay":
                            if (gameUI.playersCount == 1) {
                                dojo.place("<span style='font-weight:bold;'>&nbsp;Robby&nbsp;🤖</span>", "pagemaintitletext");
                            } else {
                                dojo.place("<span style='font-weight:bold;color:#" + gameUI.puzzleUser.color + ";'>&nbsp;" + gameUI.puzzleUser.name + "</span>", "pagemaintitletext");
                            }
                            this.removeActionButtons();
                            this.addActionButton('giveUp', _('Give up'), 'onGiveUp');
                            break;
                        case "scoreDisplay":
                            this.removeActionButtons();
                            this.addActionButton('scoreDisplayEnd', _('OK'), 'onScoreDisplayEnd');
                            break;
                    }
                }
            },

            onPuzzleCreationEnd: function () {
                if (gameUI.elementsCount === gameUI.placedElements) {
                    gameUI.puzzleCreationEnd = true;
                } else {
                    this.showMessage(_('You must place all available elements on the grid'), 'error');
                }
            },
            onStartNow: function () {
                timer.abort();
                this.callAction("puzzleStart", null, true);
            },
            onGiveUp: function () {
                var self = this;
                this.confirmationDialog(_('Are you sure to give up? You will have a score penalty'), () => {
                    gameUI.giveUp = true;
                    self.callAction("giveUp", null, true);
                });
            },
            onScoreDisplayEnd: function () {
                this.callAction("scoreDisplayEnd", null, true);
            },

            callAction: function (action, args, lock, handler) {
                if (!args) {
                    args = [];
                }
                if (lock) {
                    args.lock = true;
                }

                if (this.checkAction(action)) {
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", args, this, (result) => { }, handler);
                }
            },

            ///////////////////////////////////////////////////
            //// Reaction to cometD notifications

            setupNotifications: function () {
                console.log('notifications subscriptions setup');

                dojo.subscribe('progression', this, "notif_progression");
                dojo.subscribe('roundScores', this, "notif_roundScores");
                dojo.subscribe('playersPuzzle', this, "notif_playersPuzzle");
                dojo.subscribe('start', this, "notif_start");
                dojo.subscribe('stop', this, "notif_stop");

                if (this.isSpectator || g_archive_mode) {
                    dojo.subscribe('gridChange', this, "notif_gridChange");
                    dojo.subscribe('puzzleChange', this, "notif_puzzleChange");
                }
            },

            notif_progression: function (notif) {
                console.log("notif_progression", notif);
                const playerId = notif.args.player_id;
                const playerData = gameUI.players[playerId];

                playerData.progression = parseInt(notif.args.player_progression, 10);
                if (playerData.progression === 0) {
                    playerData.duration = "";
                }
                gameUI.shouldRefreshProgression = true;
            },

            notif_gridChange: function (notif) {
                console.log("notif_gridChange", notif);
                const playerId = notif.args.player_id;

                if (this.isSpectator) {
                    gameUI.players[playerId].grid = JSON.parse(notif.args.player_grid);
                    utils.refreshPuzzle(playerId);
                } else if (this.player_id === parseInt(playerId, 10)) {
                    gameUI.setGrid(JSON.parse(notif.args.player_grid));
                    gameUI.setup();
                }
            },

            notif_puzzleChange: function (notif) {
                console.log("notif_puzzleChange", notif);
                const playerId = notif.args.player_id;
                const puzzle = JSON.parse(notif.args.player_puzzle);

                gameUI.players[playerId].puzzle = puzzle;

                if (notif.args.default) {
                    Object.keys(gameUI.players).map((id) => {
                        if (!gameUI.players[id].puzzle) {
                            gameUI.players[id].puzzle = puzzle;
                        }
                    });
                }
            },

            notif_roundScores: function (notif) {
                console.log("notif_roundScores", notif);

                for (let player_id in notif.args.roundScores) {
                    this.scoreCtrl[player_id].incValue(notif.args.roundScores[player_id]);
                }
            },

            notif_playersPuzzle: function (notif) {
                console.log("notif_playersPuzzle", notif);

                for (let player_id in notif.args.puzzles) {
                    gameUI.players[player_id].grid = JSON.parse(notif.args.puzzles[player_id]);
                }
            },

            notif_start: function (notif) {
                console.log("notif_start", notif);
                const playerId = notif.args.player_id;
                const playerData = gameUI.players[playerId];

                playerData.startTime = notif.args.start;
                playerData.running = true;
                playerData.duration = "";
                gameUI.shouldRefreshProgression = true;
            },

            notif_stop: function (notif) {
                console.log("notif_stop", notif);
                const playerId = notif.args.player_id;
                const playerData = gameUI.players[playerId];

                playerData.running = false;
                playerData.startTime = 0;

                if (!notif.args.duration) {
                    playerData.duration = "0:00";
                    playerData.progression = 0;
                    gameUI.shouldRefreshProgression = true;
                } else if (notif.args.duration[0] === '0') {
                    playerData.duration = notif.args.duration.substring(1);
                } else {
                    playerData.duration = notif.args.duration;
                }
            },
        });
    });
