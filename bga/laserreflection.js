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

const fileType = ".min"; // ".min" or ""

define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/game_ui" + fileType + ".js",
    g_gamethemeurl + "modules/main.js"
],
    function (dojo, declare) {
        return declare("bgagame.laserreflection", ebg.core.gamegui, {
            constructor: function () {
                console.log('laserreflection constructor');
            },

            addMoveToLog: function (t, i) {
                this.log_to_move_id[t] = i;

                try {
                    const div = document.getElementById('log_' + t);
                    if (div.innerText.startsWith('🧙')) {
                        div.classList.add("lrf_team_1");
                    } else if (div.innerText.startsWith('🧛')) {
                        div.classList.add("lrf_team_2");
                    } else if (div.innerText.startsWith('👽')) {
                        div.classList.add("lrf_team_3");
                    } else if (div.innerText.startsWith('💗') || div.innerText.startsWith('💔')) {
                        div.classList.add("lrf_heart");
                    }
                } catch (error) { }
            },

            initPreferencesObserver: function () {
                dojo.query('.preference_control').on('change', (e) => {
                    const match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
                    if (match) {
                        const pref = match[1];
                        this.prefs[pref].value = e.target.value;
                        this.onPreferenceChange(pref, e.target.value);
                    }
                });
            },

            onPreferenceChange: function (prefId, prefValue) {
                console.log("Preference changed", prefId, prefValue);
                if (prefId === "100") {
                    window.game.setSmart(prefValue === "1");
                } else if (prefId === "110") {
                    if (prefValue === "10") {
                        document.body.parentNode.classList.add('space');
                    } else {
                        document.body.parentNode.classList.remove('space');
                    }
                } else if (prefId === "150") {
                    if (prefValue === "10") {
                        document.body.parentNode.classList.add('lrf_stripes');
                    } else {
                        document.body.parentNode.classList.remove('lrf_stripes');
                    }
                }
            },

            setup: function (data) {
                console.log("Starting game setup", data);

                try {
                    this.initPreferencesObserver();

                    gameUI.serverTimeDec = Math.round(new Date().getTime() / 1000) - data["server_time"];
                    gameUI.initLocalStorage(this.table_id, this.player_id);

                    if (g_archive_mode) {
                        gameUI.playerSpied = this.player_id;
                    }

                    gameUI.players = {};
                    gameUI.playersCount = 0;

                    Object.keys(data.players).map((playerId) => {
                        gameUI.playersCount++;
                        gameUI.savePlayerData(data.players[playerId], playerId);
                    });

                    data.params.map((p) => {
                        switch (p.key) {
                            case "partial":
                                gameUI.partialSolutionAllowed = parseInt(p.val, 10) !== 2;
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
                            case "teams":
                                gameUI.teamsCount = p.val;
                                break;
                            case "giveup":
                                gameUI.setCollectiveGiveup(p.val);
                                break;
                            case "transfo":
                                gameUI.transfo = p.val;
                                break;
                            case "round":
                                gameUI.round = parseInt(p.val, 10);
                                break;
                            case "solo_mode":
                                gameUI.soloMode = parseInt(p.val, 10);
                                break;
                            case "cooperative_mode":
                                gameUI.cooperativeMode = parseInt(p.val, 10);
                                break;
                            case "hearts":
                                gameUI.hearts = parseInt(p.val, 10);
                                break;
                        }
                    });

                    gameUI.realtime = gameUI.trainingMode || ['0', '1', '2', '9'].some(s => s == data["tablespeed"]);

                    gameUI.durations = data.durations;
                    if (data.boards) {
                        gameUI.boards = data.boards.map(g => { return { pgk: g.pgk, grid: JSON.parse(g.grid) } });
                    }
                    if (data.puzzles) {
                        gameUI.puzzles = data.puzzles.map(p => JSON.parse(p));
                        gameUI.buildRoundsPuzzleSelect();
                    }
                    if (data.round_puzzle) {
                        gameUI.puzzle = JSON.parse(data.round_puzzle);
                    }

                    gameUI.step = "puzzleCreation";
                    gameUI.shouldRefreshProgression = true;

                    gameUI.isTutorial = !!(window.g_tutorialwritten && window.g_tutorialwritten.author);
                    if (gameUI.isTutorial) {
                        document.body.parentNode.classList.add('tutorial');
                    }

                    // Setting up player boards
                    if (this.isSpectator) {
                        gameUI.spyBoard(document.getElementById("playerSelect").value);
                    } else {
                        const me = data.players[this.player_id];
                        gameUI.setGrid(me && me.grid ? JSON.parse(me.grid) : gameUI.getSavedGrid());
                    }

                    gameUI.init(this);
                    gameUI.displayPlayerIcons();

                    if (!this.isSpectator && gameUI.teamsCount > 0) {
                        gameUI.buildCollectiveGiveupArea();
                        gameUI.displayCollectiveGiveup();
                    }

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

                switch (stateName) {
                    case "design":
                        if (!this.isSpectator) {
                            gameUI.players[this.player_id].state = "design";
                            gameUI.elements = JSON.parse(args.args["elements"]);
                            gameUI.portals = JSON.parse(args.args["portals"]);
                            gameUI.transfo = args.args["transfo"];
                            gameUI.mode = 'puzzleCreation';
                            gameUI.setup();
                            gameUI.displayDesignArea();
                            gameUI.shouldRefreshProgression = true;
                        } else {
                            gameUI.displayGrid();
                        }
                        break;
                    case 'teamSelection':
                        if (!this.isSpectator) {
                            gameUI.displayTeamSelection();
                        }
                        break;
                    case 'teamSelected':
                        if (!this.isSpectator) {
                            gameUI.hideTeamSelection();
                        }
                        break;
                    case "createFromSeed":
                        if (!this.isSpectator) {
                            gameUI.displaySeedArea();
                        }
                        break;
                    case 'puzzleCreationInit':
                        gameUI.mode = 'puzzleCreation';
                        gameUI.setup();
                        break;
                    case 'puzzlePlayInit':
                        gameUI.step = "play";

                        const publicData = args.args["_public"];
                        const privateData = args.args["_private"];

                        if (publicData.portals) {
                            gameUI.portals = JSON.parse(publicData.portals);
                        }
                        if (publicData.elements) {
                            gameUI.elements = JSON.parse(publicData.elements);
                        }

                        if (this.isSpectator) {
                            gameUI.puzzleUsers = {};
                            Object.keys(publicData).map((id) => {
                                if (publicData[id] && publicData[id].id) {
                                    gameUI.puzzleUsers[id] = parseInt(publicData[id].id, 10);
                                }
                            });
                            gameUI.refreshPuzzle();

                            gameUI.mode = 'play';
                        } else {
                            gameUI.buildTeamData();

                            const savedGrid = gameUI.getSavedGrid();
                            const isPlaying = args.private_state && args.private_state.id === "51";

                            gameUI.round = parseInt(privateData.round, 10);

                            if (savedGrid) {
                                gameUI.setGrid(savedGrid);
                            } else if (!privateData.grid) {
                                gameUI.setGrid(undefined);
                            } else {
                                const grid = JSON.parse(privateData.grid);
                                gameUI.setGrid(grid);
                            }

                            gameUI.puzzle = JSON.parse(privateData.puzzle);
                            gameUI.puzzleUser = gameUI.players[privateData.id]; // player that did the puzzle

                            gameUI.mode = isPlaying || privateData.grid ? 'play' : 'empty';
                        }

                        gameUI.setup();
                        gameUI.displayGrid();
                        gameUI.shouldRefreshProgression = true;
                        break;
                    case "puzzlePlayWait":
                        gameUI.clearSavedTeamData();
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
                        gameUI.hideCollectiveGiveup();
                        break;
                    case "gameEnd":
                        gameUI.ended = true;

                        if (gameUI.soloMode === 100) {
                            gameUI.hideDesignArea();
                        } else if (gameUI.modeRandom) {
                            gameUI.displayRoundPuzzle(document.getElementById("roundSelect").value);
                        } else if (this.isSpectator) {
                            gameUI.displayPlayerPuzzle(document.getElementById("playerSelect").value);
                        } else {
                            gameUI.displayPlayerPuzzle(this.player_id);
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
                console.log('onUpdateActionButtons: ' + stateName, isPlayerActive);

                if (gameUI.running !== isPlayerActive) {
                    gameUI.running = isPlayerActive;

                    try {
                        window.game.setRunning(gameUI.running);
                        console.log("set running " + gameUI.running);
                    } catch (error) { }
                }

                if (isPlayerActive) {
                    switch (stateName) {
                        case "design":
                            this.addActionButton('reset', _('Reset') + " ↺", 'onResetDesign');
                            this.addActionButton('stop', _('Stop'), 'onStop');
                            break;
                        case "createFromSeed":
                            this.addActionButton('seedValidate', _('Done'), 'onSeedValidate');
                            break;
                        case "teamSelection":
                            this.removeActionButtons();
                            const team = gameUI.getMyData().team;
                            if (team) {
                                this.addActionButton('teamValidate', _('OK'), 'onTeamValidate');
                            }
                            break;
                        case "teamSelected":
                            this.removeActionButtons();
                            this.addActionButton('teamCancel', _('I changed my mind'), 'onTeamDevalidate');
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
                            if (gameUI.round > 1) {
                                this.addActionButton('displayDurations', _('Previous results'), 'onDisplayDurations');
                            }
                            this.addActionButton('start', _('Start'), 'onStartNow');
                            break;
                        case "puzzlePlay":
                            if (gameUI.mode === "play" && gameUI.progression === 100 && !gameUI.partialSolutionAllowed) {
                                document.getElementById('pagemaintitletext').innerHTML = _("All items must be used");
                            }
                            this.removeActionButtons();
                            this.addActionButton('undo', _('Undo') + " ⎌", 'onUndo');
                            this.addActionButton('reset', _('Reset') + " ↺", 'onReset');
                            this.addActionButton('giveUp', _('Give up'), 'onGiveUp');
                            break;
                        case "puzzleCopy":
                            this.removeActionButtons();
                            this.addActionButton('undo', _('Undo') + " ⎌", 'onUndo');
                            this.addActionButton('reset', _('Reset') + " ↺", 'onReset');
                            this.addActionButton('giveUp', _('Give up'), 'onGiveUp');
                            break;
                        case "scoreDisplay":
                            this.removeActionButtons();
                            this.addActionButton('hideScore', _('OK'), 'onScoreDisplayEnd');
                            if (this.is_solo && gameUI.soloMode === 0) {
                                this.addActionButton('stop', _('Stop'), 'onStop');
                            }
                            break;
                        case "puzzleSolution":
                            this.removeActionButtons();
                            this.addActionButton('solutionDisplayEnd', _('OK'), 'onSolutionDisplayEnd');
                            this.addActionButton('solutionOnly', "<div class='lrf_button_check'><span>" + _('Solution only') + "</span><span id='lrf_solution_check'>" + gameUI.getCheckBox(false) + "</span></div>", 'onSolutionOnly');
                            if (this.is_solo && gameUI.soloMode === 0) {
                                this.addActionButton('stop', _('Stop'), 'onStop');
                            }
                            break;
                    }
                }
            },

            onResetDesign: function () {
                if (!g_archive_mode) {
                    gameUI.setGrid(undefined);
                    gameUI.saveGrid();
                    gameUI.history = [];
                    this.callAction("resetDesign", null, true);
                }
            },

            onSeedValidate: function () {
                if (!g_archive_mode) {
                    gameUI.seedValidate(document.getElementById('lrf_seed_input').value);
                }
            },

            onTeamValidate: function () {
                if (!g_archive_mode) {
                    this.callAction("teamValidate", null, true);
                }
            },

            onTeamDevalidate: function () {
                if (!g_archive_mode) {
                    this.callAction("teamCancel", null, true);
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
                    this.callAction("puzzleStart", null, true);
                }
            },
            onDisplayDurations: function () {
                if (!g_archive_mode) {
                    this.callAction("displayDurations", null, true);
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
                    if (gameUI.teamsCount > 0 && gameUI.realtime) {
                        const team = gameUI.getMyData().team;
                        const teammates = gameUI.getTeamPlayersId(team);

                        if (teammates.length === 1) {
                            this.confirmationDialog(_('Are you sure to give up? You will have a score penalty'), () => {
                                gameUI.giveUpPropose = true;
                            });
                        } else {
                            gameUI.giveUpPropose = true;
                        }
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
            onSolutionOnly: function () {
                gameUI.mode = (gameUI.mode === 'solution') ? 'solutionOnly' : 'solution';
                gameUI.setup();
                document.getElementById("lrf_solution_check").innerHTML = gameUI.getCheckBox(gameUI.mode === 'solutionOnly');
            },
            onStop: function () {
                if (!g_archive_mode) {
                    this.callAction("stopGame", null, true);
                }
            },

            callAction: function (action, args, lock, verb) {
                if (!args) {
                    args = [];
                }
                if (lock) {
                    args.lock = true;
                }

                if (this.checkAction(action)) {
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", args, this, (result) => { }, undefined, verb);
                }
            },

            ///////////////////////////////////////////////////
            //// Reaction to cometD notifications

            setupNotifications: function () {
                console.log('notifications subscriptions setup');

                dojo.subscribe('puzzleCreated', this, "notif_puzzleCreated");
                dojo.subscribe('progression', this, "notif_progression");
                dojo.subscribe('roundScores', this, "notif_roundScores");
                dojo.subscribe('playersPuzzle', this, "notif_playersPuzzle");
                dojo.subscribe('roundsPuzzle', this, "notif_roundsPuzzle");
                dojo.subscribe('start', this, "notif_start");
                dojo.subscribe('stop', this, "notif_stop");
                dojo.subscribe('roundStart', this, "notif_roundStart");
                dojo.subscribe('teamSelection', this, "notif_teamSelection");
                dojo.subscribe('gridChange', this, "notif_gridChange");
                dojo.subscribe('collectiveGiveup', this, "notif_collectiveGiveup");
                dojo.subscribe('hearts', this, "notif_hearts");

                if (this.isSpectator) {
                    dojo.subscribe('puzzleChange', this, "notif_puzzleChange");
                }
            },

            subscribe: function (evt, funcName) {
                dojo.subscribe(evt, this, funcName);
            },

            notif_puzzleCreated: function (notif) {
                console.log("notif_progression", notif);
                const playerId = notif.args.player_id;
                const playerData = gameUI.players[playerId];

                playerData.state = "created";
                gameUI.shouldRefreshProgression = true;
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

            notif_teamSelection: function (notif) {
                console.log("notif_teamSelection", notif);

                const action = notif.args.action;
                const playerId = notif.args.player_id;
                const playerData = playerId ? gameUI.players[playerId] : undefined;

                switch (action) {
                    case "selected":
                        playerData.team = parseInt(notif.args.player_team, 10);
                        playerData.state = "teamSelecting";
                        gameUI.displayPlayerTeam(playerId);
                        break;
                    case "validated":
                        playerData.state = "teamSelected";
                        break;
                    case "devalidated":
                        if (playerData) {
                            playerData.state = "teamSelecting";
                        } else {
                            Object.keys(gameUI.players).map(playerId => {
                                gameUI.players[playerId].state = "teamSelecting";
                            });
                        }
                        break;
                }
                gameUI.shouldRefreshProgression = true;
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
                } else if (gameUI.teamsCount > 0) {
                    const data = gameUI.teamData.find((t) => t.id === playerId);
                    if (data) {
                        data.grid = JSON.parse(notif.args.player_grid);
                        gameUI.refreshTeamData = true;
                    }
                }
            },

            notif_collectiveGiveup: function (notif) {
                console.log("notif_collectiveGiveup", notif);

                const playerTeam = +notif.args.player_team;
                const playerId = +notif.args.player_id;
                const playerNum = +notif.args.player_num;

                switch (notif.args.action) {
                    case "propose":
                        gameUI.collectiveGiveupTeams[playerTeam] = playerId;
                        gameUI.collectiveGiveupPlayers[playerNum] = 1;
                        break;
                    case "cancel":
                        gameUI.collectiveGiveupTeams[playerTeam] = 0;
                        Object.keys(gameUI.players).map(id => {
                            if (gameUI.players[id].team === playerTeam) {
                                gameUI.collectiveGiveupPlayers[gameUI.players[id].num] = 0;
                            }
                        });
                        break;
                }
                gameUI.displayCollectiveGiveup();
            },

            notif_puzzleChange: function (notif) {
                console.log("notif_puzzleChange", notif);

                if (gameUI.modeRandom) {
                    gameUI.puzzle = JSON.parse(notif.args.round_puzzle);
                    gameUI.gridSize = gameUI.puzzle[0].length;

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

                if (notif.args.type === "teams") {
                    Object.keys(gameUI.players).map((player_id) => {
                        const roundScore = notif.args.roundScores[gameUI.players[player_id].team];
                        this.scoreCtrl[player_id].incValue(roundScore);
                    });
                } else {
                    for (let player_id in notif.args.roundScores) {
                        this.scoreCtrl[player_id].incValue(notif.args.roundScores[player_id]);
                    }
                }
            },

            notif_playersPuzzle: function (notif) {
                console.log("notif_playersPuzzle", notif);

                for (let player_id in notif.args.puzzles) {
                    gameUI.players[player_id].grid = JSON.parse(notif.args.puzzles[player_id]);
                }
                gameUI.durations = notif.args.durations;
                gameUI.boards = notif.args.boards.map(g => { return { pgk: g.pgk, grid: JSON.parse(g.grid) } });
            },

            notif_roundsPuzzle: function (notif) {
                console.log("notif_roundsPuzzle", notif);
                gameUI.puzzles = notif.args.puzzles.map(p => JSON.parse(p));
                gameUI.durations = notif.args.durations;
                gameUI.boards = notif.args.boards.map(g => { return { pgk: g.pgk, grid: JSON.parse(g.grid) } });
                gameUI.buildRoundsPuzzleSelect();
            },

            notif_start: function (notif) {
                console.log("notif_start", notif);
                const team = notif.args.player_team;
                const idList = team ? gameUI.getTeamPlayersId(+team) : [notif.args.player_id];

                idList.forEach(id => {
                    const playerData = gameUI.players[id];
                    playerData.startTime = notif.args.start;
                    playerData.running = true;
                    playerData.state = "playing";
                    playerData.duration = "";
                    playerData.progression = 0;
                });

                gameUI.shouldRefreshProgression = true;
            },

            notif_stop: function (notif) {
                console.log("notif_stop", notif);
                const team = notif.args.player_team;
                const idList = team ? gameUI.getTeamPlayersId(+team) : [notif.args.player_id];

                idList.forEach(id => {
                    const playerData = gameUI.players[id];
                    playerData.running = false;
                    playerData.startTime = 0;

                    if (!notif.args.duration) {
                        playerData.state = "failed";
                        playerData.duration = "0:00";
                        playerData.progression = 0;
                        gameUI.shouldRefreshProgression = true;
                    } else if (notif.args.duration[0] === '0') {
                        playerData.duration = notif.args.duration.substring(1);
                        playerData.state = "success";
                    } else {
                        playerData.duration = notif.args.duration;
                        playerData.state = "success";
                    }
                });
            },

            notif_roundStart: function (notif) {
                console.log("notif_roundStart", notif);

                Object.keys(gameUI.players).map((id) => {
                    gameUI.players[id].state = "inactive";
                });
                gameUI.shouldRefreshProgression = true;
            },

            notif_hearts: function (notif) {
                console.log("notif_hearts", notif);
                gameUI.hearts = notif.args.hearts;

                Object.keys(gameUI.players).map((id) => {
                    gameUI.displayPlayerHearts(gameUI.hearts, id);
                });
            }
        });
    });
