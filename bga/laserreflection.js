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

                try {
                    gameUI.serverTimeDec = Math.round(new Date().getTime() / 1000) - data["server_time"];
                    gameUI.initLocalStorage(this.table_id, this.player_id);

                    if (g_archive_mode) {
                        gameUI.playerSpied = this.player_id;
                    }

                    gameUI.players = {};
                    gameUI.playersCount = 0;
                    gameUI.realtime = parseInt(data["tablespeed"], 10) < 3;

                    Object.keys(data.players).map((playerId) => {
                        gameUI.playersCount++;
                        gameUI.savePlayerData(data.players[playerId], playerId);
                    });

                    data.params.map((p) => {
                        switch (p.key) {
                            case "auto_start":
                                gameUI.autoStart = parseInt(p.val, 10) === 1;
                                break;
                            case "elements":
                                gameUI.elements = JSON.parse(p.val);
                                gameUI.elementsCount = gameUI.elements.length;
                                break;
                            case "grid_size":
                                gameUI.gridSize = parseInt(p.val, 10);
                                break;
                            case "portals":
                                gameUI.portals = JSON.parse(p.val);
                                break;
                            case "random":
                                gameUI.modeRandom = p.val;
                                break;
                            case "same_puzzle":
                                gameUI.samePuzzle = p.val;
                                break;
                            case "resting_player":
                                if (p.val !== "0") {
                                    gameUI.puzzleUser = gameUI.players[p.val];
                                }
                                break;
                            case "ended":
                                gameUI.ended = p.val;
                                break;
                            case "time_limit":
                                gameUI.timeLimit = parseInt(p.val, 10) || 60;
                                break;
                            case "training_mode":
                                gameUI.trainingMode = p.val;
                                break;
                        }
                    });

                    if (data.puzzles) {
                        gameUI.puzzles = data.puzzles.map(p => JSON.parse(p));
                        gameUI.buildRoundsPuzzleSelect();
                    }

                    if (data.round_puzzle) {
                        gameUI.puzzle = JSON.parse(data.round_puzzle);
                    }

                    gameUI.step = "puzzleCreation";
                    gameUI.shouldRefreshProgression = true;

                    // Setting up player boards
                    if (!this.isSpectator) {
                        const me = data.players[this.player_id];
                        gameUI.setGrid(me && me.grid ? JSON.parse(me.grid) : gameUI.getSavedGrid());
                        timer.init(me.color, 5);
                    } else if (gameUI.ended && gameUI.modeRandom) {
                        gameUI.displayRoundPuzzle(0);
                    } else {
                        gameUI.displayPuzzle(document.getElementById("playerSelect").value);
                    }

                    gameUI.init(this);
                    gameUI.displayPlayerTeams();

                    // Setup game notifications to handle (see "setupNotifications" method below)
                    this.setupNotifications();

                    console.log("Ending game setup");
                }
                catch (error) {
                    this.showMessage(error.stack, "error");
                    setTimeout(function () {
                        document.getElementById("head_infomsg_1").style.display = "";
                    }, 7000);
                }
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
                    case 'teamSelection':
                        gameUI.displayTeamSelection();
                        break;
                    case 'teamSelected':
                        gameUI.hideTeamSelection();
                        break;
                    case 'puzzleCreationInit':
                        gameUI.mode = 'puzzleCreation';
                        gameUI.setup();
                        break;
                    case 'puzzlePlayInit':
                        gameUI.step = "play";
                        if (this.isSpectator) {
                            const publicData = args.args["_public"];
                            gameUI.puzzleUsers = {};
                            Object.keys(publicData).map((id) => {
                                gameUI.puzzleUsers[id] = parseInt(publicData[id].id, 10);
                            });
                            gameUI.refreshPuzzle();

                            gameUI.mode = 'play';
                        } else {
                            const privateData = args.args["_private"];
                            const savedGrid = gameUI.getSavedGrid();
                            const isPlaying = args.private_state && args.private_state.id === "51";

                            if (privateData.portals) {
                                gameUI.portals = JSON.parse(privateData.portals);
                            }

                            if (savedGrid) {
                                gameUI.setGrid(savedGrid);
                            } else if (!privateData.grid) {
                                gameUI.setGrid(undefined);
                            } else {
                                const grid = JSON.parse(privateData.grid);

                                const isGridCorrect = function (grid) {
                                    if (!gameUI.portals) {
                                        return true;
                                    }
                                    if (grid[gameUI.portals[0]][gameUI.portals[1]] !== 7) {
                                        return false;
                                    }
                                    if (grid[gameUI.portals[2]][gameUI.portals[3]] !== 7) {
                                        return false;
                                    }
                                    return true;
                                };

                                if (isGridCorrect(grid)) {
                                    gameUI.setGrid(grid);
                                } else {
                                    gameUI.setGrid(undefined);
                                    gameUI.saveGrid();
                                    gameUI.history = [];
                                }
                            }

                            gameUI.puzzle = JSON.parse(privateData.puzzle);
                            gameUI.puzzleUser = gameUI.players[privateData.id]; // player that did the puzzle

                            if (privateData.elements) {
                                gameUI.elements = JSON.parse(privateData.elements);
                            }

                            gameUI.mode = isPlaying || privateData.grid ? 'play' : 'empty';
                        }

                        gameUI.setup();
                        gameUI.displayGrid();
                        gameUI.shouldRefreshProgression = true;
                        break;
                    case "puzzlePlayWait":
                        gameUI.clearSavedTeamData();
                        if (gameUI.autoStart && !this.isSpectator && !g_archive_mode) {
                            gameUI.displayTimer(function () {
                                self.callAction("puzzleStart", null, true);
                            });
                        }
                        break;
                    case "puzzlePlay":
                        gameUI.mode = 'play';
                        gameUI.setup();
                        gameUI.displayGrid();
                        break;
                    case "puzzleSolution":
                        const data = args.args;

                        gameUI.mode = 'solution';
                        gameUI.solution = JSON.parse(data.grid);
                        gameUI.setup();
                        gameUI.displayGrid();
                        break;
                    case "gameEnd":
                        gameUI.ended = true;

                        if (gameUI.modeRandom) {
                            gameUI.displayRoundPuzzle(0);
                        } else if (this.isSpectator) {
                            gameUI.displayPuzzle(document.getElementById("playerSelect").value);
                        } else {
                            gameUI.displayPuzzle(this.player_id);
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
                        case "teamSelection":
                            this.removeActionButtons();
                            const team = gameUI.players[this.player_id].team;
                            if (team) {
                                this.addActionButton('teamValidate', _('OK'), 'onTeamValidate');
                            }
                            break;
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
                            break;
                        case "puzzlePlay":
                            if (gameUI.modeRandom) {
                                dojo.place("<span style='font-weight:bold;'>&nbsp;Robby&nbsp;🤖</span>", "pagemaintitletext");
                            } else {
                                dojo.place("<span style='font-weight:bold;color:#" + gameUI.puzzleUser.color + ";'>&nbsp;" + gameUI.puzzleUser.name + "</span>", "pagemaintitletext");
                            }
                            this.removeActionButtons();
                            this.addActionButton('undo', _('Undo') + " ⎌", 'onUndo');
                            this.addActionButton('reset', _('Reset') + " ↺", 'onReset');
                            this.addActionButton('giveUp', _('Give up'), 'onGiveUp');
                            break;
                        case "scoreDisplay":
                            this.removeActionButtons();
                            this.addActionButton('hideScore', _('OK'), 'onScoreDisplayEnd');
                            if (this.is_solo) {
                                this.addActionButton('stop', _('Stop'), 'onStop');
                            }
                            break;
                        case "puzzleSolution":
                            this.removeActionButtons();
                            this.addActionButton('solutionDisplayEnd', _('OK'), 'onSolutionDisplayEnd');
                            if (this.is_solo) {
                                this.addActionButton('stop', _('Stop'), 'onStop');
                            }
                            break;
                    }
                }
            },

            onTeamValidate: function () {
                if (!g_archive_mode) {
                    this.callAction("teamValidate", null, true);
                }
            },

            onPuzzleCreationEnd: function () {
                if (!g_archive_mode) {
                    if (gameUI.elementsCount === gameUI.placedElements) {
                        gameUI.puzzleCreationEnd = true;
                    } else {
                        this.showMessage(_('You must place all available elements on the grid'), 'error');
                    }
                }
            },
            onStartNow: function () {
                if (!g_archive_mode) {
                    timer.abort();
                    this.callAction("puzzleStart", null, true);
                }
            },
            onReset: function () {
                if (!g_archive_mode) {
                    gameUI.reset();
                }
            },
            onUndo: function () {
                if (!g_archive_mode) {
                    gameUI.undo();
                }
            },
            onGiveUp: function () {
                if (!g_archive_mode) {
                    if (gameUI.playersCount === 1) {
                        gameUI.giveUp = true;
                    } else {
                        this.confirmationDialog(_('Are you sure to give up? You will have a score penalty'), () => {
                            gameUI.giveUp = true;
                        });
                    }
                }
            },
            onScoreDisplayEnd: function () {
                if (!g_archive_mode) {
                    this.callAction("hideScore", null, true);
                }
            },
            onSolutionDisplayEnd: function () {
                if (!g_archive_mode) {
                    gameUI.clearSavedGrid();
                    this.callAction("hideSolution", null, true);
                }
            },
            onStop: function () {
                if (!g_archive_mode) {
                    this.callAction("stopGame", null, true);
                }
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
                dojo.subscribe('roundsPuzzle', this, "notif_roundsPuzzle");
                dojo.subscribe('start', this, "notif_start");
                dojo.subscribe('stop', this, "notif_stop");
                dojo.subscribe('roundStart', this, "notif_roundStart");
                dojo.subscribe('teamSelect', this, "notif_teamSelect");

                if (g_archive_mode) {
                    dojo.subscribe('gridChange_' + this.player_id, this, "notif_gridChange");
                } else if (!this.isSpectator) {
                    gameUI.buildTeamDataAndRegister();
                } else if (gameUI.trainingMode) {
                    Object.keys(gameUI.players).map((id) => {
                        dojo.subscribe('gridChange_' + id, this, "notif_gridChange");
                    });
                    dojo.subscribe('puzzleChange', this, "notif_puzzleChange");
                }
            },

            subscribe: function (evt, funcName) {
                dojo.subscribe(evt, this, funcName);
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

            notif_teamSelect: function (notif) {
                console.log("notif_teamSelect", notif);

                const playerId = notif.args.player_id;
                const playerData = gameUI.players[playerId];
                playerData.team = parseInt(notif.args.team, 10);
                gameUI.displayPlayerTeam(playerId);
            },

            notif_gridChange: function (notif) {
                console.log("notif_gridChange", notif);
                const playerId = notif.args.player_id;

                if (this.isSpectator) {
                    gameUI.players[playerId].grid = JSON.parse(notif.args.player_grid);
                    gameUI.refreshPuzzle(playerId);
                } else if (g_archive_mode) {
                    gameUI.setGrid(JSON.parse(notif.args.player_grid));
                    gameUI.setup();
                } else {
                    const data = gameUI.teamData.find((t) => t.id === playerId);
                    if (data) {
                        data.grid = JSON.parse(notif.args.player_grid);
                    }
                    gameUI.refreshTeamData = true;
                }
            },

            notif_puzzleChange: function (notif) {
                console.log("notif_puzzleChange", notif);

                if (gameUI.modeRandom) {
                    gameUI.puzzle = JSON.parse(notif.args.round_puzzle);

                    Object.keys(gameUI.players).map(playerId => {
                        gameUI.players[playerId].grid = undefined;
                    });
                    gameUI.refreshPuzzle();
                } else {
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

            notif_roundsPuzzle: function (notif) {
                console.log("notif_roundsPuzzle", notif);
                gameUI.puzzles = notif.args.puzzles.map(p => JSON.parse(p));
                gameUI.buildRoundsPuzzleSelect();
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
                    playerData.failed = true;
                    playerData.duration = "0:00";
                    playerData.progression = 0;
                    gameUI.shouldRefreshProgression = true;
                } else if (notif.args.duration[0] === '0') {
                    playerData.duration = notif.args.duration.substring(1);
                    playerData.success = true;
                } else {
                    playerData.duration = notif.args.duration;
                    playerData.success = true;
                }
            },

            notif_roundStart: function (notif) {
                console.log("notif_roundStart", notif);

                Object.keys(gameUI.players).map((id) => {
                    gameUI.players[id].failed = false;
                    gameUI.players[id].success = false;
                    gameUI.players[id].creating = false;
                });
                gameUI.shouldRefreshProgression = true;
            }
        });
    });
