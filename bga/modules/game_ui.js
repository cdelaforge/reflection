const STORAGE_TTL = 1000 * 60 * 20; // 20 minutes
const GIVEUP_DURATION_STR = "6666";
const GIVEUP_DURATION = 6666;
const MAX_ROUNDS_DISPLAY = 10;

const gameUI = {
  hiddenPlayer: [],
  teamData: [],
  history: [],

  init: function (dojoGame) {
    if (!this.dojoGame) {
      this.dojoGame = dojoGame;
      this.playerId = dojoGame.player_id;
      this.isSpectator = dojoGame.isSpectator;
    }

    if (!window.game) {
      // waiting for the React application
      setTimeout(function () { gameUI.init(dojoGame); }, 100);
      return;
    }

    window.game.onLockChange = function (lockedCells) {
      const isLocked = lockedCells.some(row => row.some(cell => !!cell));
      gameUI.lockedCells = isLocked ? lockedCells : undefined;
      gameUI.saveLockedCells();
    };
    window.game.onGridChange = function (grid) {
      const gridChanged = JSON.stringify(gameUI.grid) !== JSON.stringify(grid);
      if (gridChanged) {
        if (gameUI.grid) {
          gameUI.history.push(gameUI.grid);
        }
        gameUI.setGrid(grid);
        gameUI.saveGrid();

        if (gameUI.soloMode === 100) {
          const seedCode = grid ? window.game.getSeed(grid) : "";
          const validSeedCode = gameUI._isSeedValid(seedCode) ? seedCode : "";
          document.getElementById("lrf_design_input").value = validSeedCode;
        } else {
          gameUI.shouldSendProgression = true;
        }
      }
    };
    window.game.onProgression = function (progression) {
      gameUI.progression = progression;
    };
    window.game.onPuzzleChange = function (puzzle) {
      if (gameUI.mode === "puzzleCreation") {
        gameUI.puzzle = puzzle;
      }
    };
    window.game.onPuzzleResolve = function (grid) {
      if (gameUI.mode === "play") {
        gameUI.setGrid(grid);

        if (dojoGame.isCurrentPlayerActive() && gameUI.getMyData().state === "playing") {
          gameUI.resolved = true;
        }
      }
    };

    this.stateEmoticons = {
      'teamSelecting': '🤨',
      'teamSelected': '👍',
      'failed': '😕',
      'resting': '😎',
      'creating': '🤨',
      'created': '😎',
      'playing': '🤨',
      'design': '🤨',
      'success': '😎',
      'default': '😴'
    };

    this.stateLabels = {
      'teamSelecting': _("Team selection"),
      'teamSelected': _("Team selected"),
      'failed': _("Failed to solve the puzzle"),
      'resting': _("It's my puzzle"),
      'creating': _("In progress"),
      'created': _("Puzzle created"),
      'playing': _("In progress"),
      'design': _("In progress"),
      'success': _("Success"),
      'default': _("Not yet started")
    };

    const securedLive = function () {
      try {
        gameUI.live();
      }
      catch (error) {
        console.error("Error in gameUI.live", error)
      }
    }

    this.timeLimitStr = this.getDurationStr(this.timeLimit * 60);

    securedLive();
    setInterval(securedLive, 500);
    window.game.setSmart(dojoGame.prefs[100].value == 1);
    window.game.setHoverDisplay(dojoGame.prefs[101].value == 1);
    window.game.setSimplifiedDisplay(dojoGame.prefs[103].value == 2);
    window.game.setPartialSolutionAllowed(this.partialSolutionAllowed);

    this.liveLoop = 0;
    this.initialized = true;
  },

  getMyData: function () {
    return this.players[this.playerId];
  },

  initLocalStorage: function (tableId, playerId) {
    this.storageKey = "lr_" + tableId + "_" + playerId;
    this.lockedStorageKey = "lr_l_" + tableId + "_" + playerId;
    this.teamStorageKey = "lr_t_" + tableId + "_" + playerId;

    const len = localStorage.length;
    const now = new Date().getTime();
    const toDelete = [];

    for (let i = 0; i < len; ++i) {
      const key = localStorage.key(i);

      if (key.startsWith('lr_')) {
        const jsonItem = localStorage.getItem(key);
        const item = JSON.parse(jsonItem);

        if (item.expires < now) {
          toDelete.push(key);
        }
      }
    }

    toDelete.forEach(key => localStorage.removeItem(key));
  },

  resetLockedCells: function () {
    try {
      window.game.resetLockedCells();
    }
    catch (error) {
      console.error("Exception occured in resetLockedCells", error);
    }
  },

  reset: function () {
    if (this.lockedCells && this.grid) {
      const grid = this.grid.map((row, rowIndex) => row.map((cell, colIndex) => {
        return cell === 7 || this.lockedCells[rowIndex][colIndex] ? cell : 0;
      }));
      this.setGrid(grid);
    } else {
      this.setGrid(undefined);
    }

    this.setup();
    this.saveGrid();
    this.history = [];
    this.shouldSendProgression = true;
  },

  undo: function () {
    if (this.history.length) {
      const grid = this.history.pop();
      this.setGrid(grid);
      this.setup();
      this.saveGrid();
      this.shouldSendProgression = true;
    }
  },

  saveLockedCells: function () {
    if (this.lockedCells) {
      const item = { lockedCells: this.lockedCells, expires: new Date().getTime() + STORAGE_TTL };
      localStorage.setItem(this.lockedStorageKey, JSON.stringify(item));
    } else {
      localStorage.removeItem(this.lockedStorageKey);
    }
  },

  getSavedLockedCells: function () {
    try {
      const jsonItem = localStorage.getItem(this.lockedStorageKey);
      if (jsonItem) {
        const item = JSON.parse(jsonItem);
        return item.lockedCells;
      }
    } catch (error) { }
    return undefined;
  },

  saveGrid: function () {
    const item = { grid: this.grid, expires: new Date().getTime() + STORAGE_TTL };
    localStorage.setItem(this.storageKey, JSON.stringify(item));
  },

  _saveTeamData: function () {
    const item = { team: this.teamData, expires: new Date().getTime() + STORAGE_TTL };
    localStorage.setItem(this.teamStorageKey, JSON.stringify(item));
  },

  getSavedGrid: function () {
    try {
      const jsonItem = localStorage.getItem(this.storageKey);
      if (jsonItem) {
        const item = JSON.parse(jsonItem);
        return item.grid;
      }
    } catch (error) { }
    return undefined;
  },

  _getSavedTeamData: function () {
    try {
      const jsonItem = localStorage.getItem(this.teamStorageKey);
      if (jsonItem) {
        const item = JSON.parse(jsonItem);
        return item.team;
      }
    } catch (error) { }
    return undefined;
  },

  clearSavedGrid: function () {
    localStorage.removeItem(this.storageKey);
    this.history = [];
  },

  clearSavedTeamData: function () {
    localStorage.removeItem(this.teamStorageKey);
    this.teamData.forEach(d => d.grid = undefined);
  },

  displayTeamEyes: function () {
    if (this.realtime && !this.isSpectator && !g_archive_mode) {
      const team = this.getMyData().team;
      const eyesDisplay = (!this.ended)
        && (
          (this.samePuzzle && this.puzzleUser && this.puzzleUser.id == this.playerId)
          || (team && this.teamData.length && gameUI.players[this.playerId].state !== "success")
        );

      Object.keys(gameUI.players).map(id => {
        const butId = "lrf_disp_" + id;
        if (!eyesDisplay || id == this.playerId || (team && !this.teamData.some(d => d.id == id))) {
          document.getElementById(butId).innerHTML = "&nbsp;"
        } else {
          document.getElementById(butId).innerHTML = gameUI.getCheckBox(!gameUI.hiddenPlayer[id], "#000000") + '👀';
        }
      });
    }
  },

  teamDisplay: function (id) {
    this.hiddenPlayer[id] = !this.hiddenPlayer[id];
    this.shouldRefreshProgression = true;
    this.refreshTeamData = true;
  },

  savePlayerData: function (playerData, playerId, playerActive) {
    const result = {
      id: playerId,
      color: playerData.color,
      progression: parseInt(playerData.progression, 10),
      grid: playerData.grid ? JSON.parse(playerData.grid) : undefined,
      puzzle: playerData.puzzle ? JSON.parse(playerData.puzzle) : undefined,
      name: playerData.name,
      startTime: parseInt(playerData.start, 10),
      team: parseInt(playerData.team, 10),
      num: parseInt(playerData.num, 10),
    };

    result.running = result.startTime > 0;

    if (result.running) {
      if (playerData.state === "54") {
        result.state = "success";
      } else {
        result.state = "playing";
      }
    } else {
      result.duration = gameUI.getDurationStr(parseInt(playerData.duration, 10));

      if (playerData.state === "90") {
        if (playerActive) {
          result.state = "teamSelecting";
        } else {
          result.state = "teamSelected";
        }
      } else if (playerData.state === "91" || playerData.state === "92") {
        result.state = "teamSelected";
      } else if (playerData.state === "30") {
        result.state = "creating";
      } else if (playerData.state === "31") {
        result.state = "created";
      } else if (playerData.state === "52") {
        result.state = "failed";
      } else if (['51', '54', '80'].some(s => playerData.state === s) && result.progression === 100) {
        result.state = "success";
      } else if (playerData.state === "80" && playerData.duration === GIVEUP_DURATION_STR) {
        result.state = "failed";
      } else {
        result.state = "unknown";
      }
    }

    this.players[playerId] = result;
  },

  setCollectiveGiveup: function (data) {
    this.collectiveGiveupTeams = [0].concat(data.teams.map(t => +t));
    this.collectiveGiveupPlayers = [0].concat(data.players.map(p => +p));
  },

  buildCollectiveGiveupArea: function () {
    dojo.place(this.dojoGame.format_block('jstpl_giveup', {
      giveup_decision_title: _("Would you like to giveup this round (you will receive a point penalty)?"),
      yes: _("Yes"),
      no: _("No"),
    }), 'left-side', 12);

    $('giveup_decision_yes').onclick = function () {
      gameUI.giveUpPropose = true;
    };
    $('giveup_decision_no').onclick = function () {
      gameUI.giveUpRefuse = true;
    };
  },

  hideCollectiveGiveup: function () {
    if (this.teamsCount > 0) {
      const playerTeam = this.getMyData().team;

      gameUI.collectiveGiveupTeams[playerTeam] = 0;
      Object.keys(gameUI.players).map(id => {
        if (gameUI.players[id].team === playerTeam) {
          gameUI.collectiveGiveupPlayers[gameUI.players[id].num] = 0;
        }
      });

      this.displayCollectiveGiveup();
    }
  },

  displayCollectiveGiveup: function () {
    if (!this.ended && this.teamsCount > 0) {
      const team = this.getMyData().team;
      const askedGiveup = this.collectiveGiveupTeams[team];
      const players = [];

      if (askedGiveup) {
        dojo.style("giveup-decision", "display", "");

        Object.keys(this.players).map((playerId) => {
          const playerTeam = this.players[playerId].team;
          const playerNum = this.players[playerId].num;
          const playerGiveup = this.collectiveGiveupPlayers[playerNum];

          if (playerTeam === team && playerGiveup) {
            players.push(this.players[playerId].name);
          }
        });

        document.getElementById('giveup-decision-players').innerHTML = players.join(', ');
      } else {
        dojo.style("giveup-decision", "display", "none");
      }
    }
  },

  shouldAddTime: function () {
    if (!this.realtime || this.mode !== "play") {
      return false;
    }

    const timerTxt = document.getElementById('timeToThink_' + this.playerId).innerHTML;
    /* If timer starts with - or 0, then it remains less than 1 minute */
    const result = timerTxt[0] == '-' || timerTxt[0] == '0';

    if (!result) {
      return false;
    }

    const now = new Date().getTime() / 1000;
    if (this.lastAddTime && ((now - this.lastAddTime) < 2)) {
      return false;
    }

    this.lastAddTime = now;
    return true;
  },

  buildProgressionBars: function () {
    Object.keys(this.players).map((playerId) => {
      this.displayProgression(
        playerId,
        this.players[playerId].progression,
        this.players[playerId].startTime,
        this.players[playerId].duration
      );
    });
  },

  buildTeamData: function () {
    const savedTeamData = this._getSavedTeamData();

    if (savedTeamData) {
      this.teamData = savedTeamData;
      this.refreshTeamData = true;
      return;
    }

    const team = this.getMyData().team;

    if (team && !this.teamData.length) {
      Object.keys(this.players).map((id) => {
        if (this.playerId !== +id && this.players[id].team === team) {
          this.teamData.push({ id, color: '#' + this.players[id].color });
        }
      });
    }

    this.shouldRefreshProgression = true;
  },

  getTeamPlayersId: function (team) {
    const result = [];
    Object.keys(this.players).forEach((id) => {
      if (this.players[id].team === team) {
        result.push(id);
      }
    });
    return result;
  },

  _setTeam: function () {
    if (this.refreshTeamData) {
      try {
        const filteredTeamData = this.teamData.filter(data => {
          const playerState = this.players[data.id].state;
          if (data.id == this.playerId || this.hiddenPlayer[+data.id]) {
            return false;
          }
          if (playerState !== "playing" && playerState !== "success") {
            return false;
          }
          return true;
        });

        window.game.setTeam(filteredTeamData);
        this._saveTeamData(this.teamData);
      }
      catch (error) {
        console.error("Error in setTeam", error, this.teamData);
      }
      this.refreshTeamData = false;
    }
  },

  live: function () {
    this.liveLoop = (this.liveLoop + 1) % 4;

    this._setTeam();

    if (this.resolved) {
      this.resolved = false;
      this.giveUp = false;
      this.timeout = false;
      this.shouldSendProgression = false;
      this.clearSavedGrid();
      this.callAction("puzzleResolve", { grid: JSON.stringify(this.grid) }, true, "post", (error) => {
        if (error) {
          // we are not connected to internet, retry in 5 seconds
          this.saveGrid();
          setTimeout(() => {
            this.resolved = true;
          }, 5000);
        }
      });
    }

    if (this.giveUpPropose) {
      this.giveUpPropose = false;
      this.shouldSendProgression = false;

      this.callAction("giveUpPropose", { grid: JSON.stringify(gameUI.grid) }, true, "post");
    } else if (this.giveUpRefuse) {
      this.giveUpRefuse = false;
      this.shouldSendProgression = false;

      this.callAction("giveUpRefuse", null, true);
    } else if (this.timeout || this.giveUp) {
      const action = this.timeout ? "timeout" : "giveUp";
      this.shouldSendProgression = false;
      this.giveUp = false;
      this.timeout = false;
      this.mode = 'solution';

      this.callAction(action, { grid: JSON.stringify(this.grid) }, true, "post", (error) => {
        if (error) {
          // we are not connected to internet, retry in 5 seconds
          setTimeout(() => {
            if (action === "timeout") {
              this.timeout = true;
            } else {
              this.giveUp = true;
            }
          }, 5000);
        }
      });
    } else if ((this.liveLoop === 0 || this.liveLoop === 2) && this.mode === "play") {
      this.manageTimeLimit();
    }

    if (this.puzzleCreationEnd) {
      this.puzzleCreationEnd = false;
      this.shouldSendProgression = false;
      this.callAction("creationEnd", { grid: JSON.stringify(this.grid), puzzle: JSON.stringify(this.puzzle) }, true, "post");
      this.clearSavedGrid();
    }

    // We send the grid content every 2 seconds max (when liveLoop is 0), or if progression is 100, or if we have a team
    if (this.shouldSendProgression && (this.liveLoop === 0 || this.progression === 100 || this.teamData.length)) {
      this.shouldSendProgression = false;

      if (this.running && !g_archive_mode && (this.mode === "puzzleCreation" || this.mode === "play")) {
        const data = {
          grid: JSON.stringify(this.grid),
          progression: this.progression || 0,
          give_time: this.shouldAddTime(),
        };

        if (data.give_time) {
          // To avoid size changes during the post :
          const titleBar = document.getElementById("page-title")
          titleBar.style.minHeight = window.getComputedStyle(titleBar, null).getPropertyValue("height");
        }

        this.callAction("gridChange", data, data.give_time, "post", () => { titleBar.style.minHeight = "50px"; });
      }
    }

    if (this.shouldRefreshProgression) {
      this.buildProgressionBars();
      this.displayBars();
      this.displayTeamEyes();
      this.shouldRefreshProgression = false;
    } else if (!this.ended) {
      const time = Math.round(new Date().getTime() / 1000);

      Object.keys(this.players).map((playerId) => {
        const playerData = this.players[playerId];

        if ((playerData.startTime || playerData.duration) && (gameUI.realtime || gameUI.playerId == playerId)) {
          let durationStr = playerData.duration;
          if (!durationStr && !g_archive_mode) {
            durationStr = gameUI.getDurationStr(gameUI.getDuration(playerData.startTime, time));
          }

          gameUI._displayDuration(
            playerId,
            durationStr
          );
        }
      });
    }

    const titleBar = document.getElementById("page-title");
    const menuBar = document.getElementById("maingameview_menuheader");
    const archiveBar = document.getElementById("archivecontrol");

    let offsetHeight = titleBar.offsetHeight + 90;
    if (menuBar && menuBar.offsetHeight) {
      offsetHeight += menuBar.offsetHeight + 30;
    }
    if (archiveBar && archiveBar.offsetHeight) {
      offsetHeight += archiveBar.offsetHeight;
    }

    const areaWidth = Math.floor(titleBar.offsetWidth / 50) * 50;
    const areaHeight = Math.floor((window.innerHeight - offsetHeight) / 50) * 50;

    window.game.setAreaSize(areaWidth, areaHeight);

    try {
      dojo.query(".replay_last_move_button")[0].parentNode.parentNode.style.display = "none";
    }
    catch (error) { }
  },

  manageTimeLimit: function () {
    const button = document.getElementById('giveUp');

    if (button) {
      const playerData = this.getMyData();

      if (playerData.startTime) {
        const duration = gameUI.getDuration(playerData.startTime);
        const remainingTime = this.timeLimit * 60 - duration;

        if (remainingTime <= 0) {
          this.timeout = true;
        } else if (remainingTime <= 30) {
          button.innerHTML = _('Give up') + " (" + remainingTime + ")";
        }
      }
    }
  },

  setGrid: function (grid) {
    let cpt = 0;

    if (grid) {
      grid.forEach(row => {
        row.forEach(val => {
          if (val && val !== 7) {
            cpt++;
          }
        });
      });
    }

    this.grid = grid;
    this.placedElements = cpt;
  },

  _checkPortals: function (portals) {
    if (!portals || portals.length !== 4) {
      return undefined;
    }
    if (portals[0] < 0 || portals[1] < 0 || portals[2] < 0 || portals[3] < 0) {
      return undefined;
    }
    return portals;
  },

  isGridCorrect: function () {
    if (!this._checkPortals(this.portals) || !this.grid) {
      return true;
    }
    if (this.grid[this.portals[0]][this.portals[1]] !== 7) {
      return false;
    }
    if (this.grid[this.portals[2]][this.portals[3]] !== 7) {
      return false;
    }
    return true;
  },

  setup: function (options) {
    if (!this.initialized) {
      setTimeout(function () { gameUI.setup(options); }, 100);
      return;
    }

    if ((this.mode === "play" || this.mode === "empty") && !this.isGridCorrect()) {
      console.error("Invalid grid", this.grid);
      this.setGrid(undefined);
      this.saveGrid();
      this.history = [];
    }

    if (this.grid) {
      this.gridSize = this.grid.length;
    }

    if (this.mode !== "play" && this.lockedCells) {
      this.lockedCells = undefined;
      this.saveLockedCells();
    }

    const data = {
      mode: this.mode,
      elements: this.elements,
      gridSize: this.gridSize,
      grid: this.grid,
      puzzle: this.puzzle,
      portals: this._checkPortals(this.portals),
      transformations: this.transfo || 0,
      lockedCells: this.lockedCells
    }

    if (options) {
      Object.keys(options).forEach(key => data[key] = options[key]);
    }

    if (this.mode === "solution" || this.mode === "solutionOnly") {
      data["solution"] = this.solution;
    } else {
      this.solution = null;
    }

    this.grid = window.game.setup(data);

    if (this.mode === 'empty') {
      this.puzzle = undefined;
    }

    dojo.style("root", "visibility", "visible");

    if (!this.running || g_archive_mode) {
      window.game.setRunning(false);
    }
  },

  callAction: function (action, args, lock, verb, errorFunction) {
    this.dojoGame.callAction(action, args, lock, verb, errorFunction);
  },

  displayGrid: function () {
    console.info("## Display grid ##");

    if (this.initialized) {
      window.game.resetLaser();
    }

    dojo.style("lrf_seed", "display", "none");

    if (this.soloMode === 100) {
      dojo.style("lrf_spectator_design_text", "display", "flex");
      dojo.style("lrf_main", "display", "none");
    } else if (this.isSpectator && !this.trainingMode && !this.ended) {
      dojo.style("lrf_spectator_text", "display", "flex");
      dojo.style("lrf_main", "display", "none");
    } else {
      dojo.style("lrf_spectator_text", "display", "none");
      dojo.style("lrf_main", "display", "flex");
    }
  },

  hideGrid: function () {
    console.info("## Hide grid ##");

    dojo.style("lrf_main", "display", "none");
  },

  displayProgression: function (playerId, progression, startTime, durationStr) {
    try {
      const divId = "lrf_info_" + playerId;
      const prgId = "lrf_progressbar_" + playerId;
      const cptId = "lrf_counter_" + playerId;
      const subId = "lrf_container_" + playerId;
      const textId = "lrf_textbar_" + playerId;
      const emoticonId = "lrf_emot_" + playerId;
      const labelId = "lrf_label_" + playerId;
      const dispId = "lrf_disp_" + playerId;

      if (!durationStr && startTime && !g_archive_mode) {
        durationStr = this.getDurationStr(this.getDuration(startTime));
      }

      dojo.destroy(divId);
      dojo.place(this.dojoGame.format_block('jstpl_progressbar', {
        iid: divId,
        pid: prgId,
        cid: cptId,
        sid: subId,
        tid: textId,
        eid: emoticonId,
        lid: labelId,
        did: dispId,
        uid: playerId,
        color: this.players[playerId].color,
        progression,
        dec: 100 - progression,
        text_disp: progression > 15 ? "" : "none",
        counter: durationStr ? durationStr + "&nbsp;/&nbsp;" + this.timeLimitStr : ""
      }), 'overall_player_board_' + playerId);
    }
    catch (error) {
      console.error("Error in displayProgression", error)
    }
  },

  displayBars: function () {
    Object.keys(this.players).map(playerId => {
      try {
        const divId = "lrf_progressbar_" + playerId;
        const textId = "lrf_textbar_" + playerId;
        const emoticonId = "lrf_emot_" + playerId;
        const labelId = "lrf_label_" + playerId;

        const playerData = this.players[playerId];

        let playerState = playerData.state;
        if (this.samePuzzle) {
          if (this.isSpectator && this.puzzleUsers && this.puzzleUsers[playerId] == playerId) {
            playerState = "resting";
          }
          if (!this.isSpectator && this.puzzleUser && this.puzzleUser.id === playerId) {
            playerState = "resting";
          }
        }

        document.getElementById(emoticonId).innerHTML = this.stateEmoticons[playerState] || this.stateEmoticons["default"];
        document.getElementById(labelId).innerHTML = this.stateLabels[playerState] || this.stateLabels["default"];

        if ((this.realtime || playerId == this.playerId) && ['creating', 'created', 'playing', 'success'].some(state => state === playerState)) {
          dojo.style(divId, "display", "");
          dojo.style(textId, "display", "none");
        } else {
          dojo.style(divId, "display", "none");
          dojo.style(textId, "display", "");
        }
      }
      catch (error) {
        console.error("Error in displayBars", error)
      }
    });
  },

  _displayDuration: function (playerId, duration) {
    const cptId = "lrf_counter_" + playerId;

    try {
      document.getElementById(cptId).innerHTML = duration + "&nbsp;/&nbsp;" + this.timeLimitStr;
    } catch (error) {
      console.error("Error in _displayDuration", error);
    }
  },

  getDuration: function (startTime, now) {
    const time = now || Math.round(new Date().getTime() / 1000);
    const result = time - startTime - this.serverTimeDec;

    if (result < 0) {
      this.serverTimeDec += result;
      return 0;
    }

    return result;
  },

  getDurationStr: function (duration) {
    if (!duration) {
      return "";
    }

    if (duration === GIVEUP_DURATION) {
      return "0:00";
    }

    const seconds = duration % 60;
    const minutes = (duration - seconds) / 60;
    return minutes.toString() + ":" + seconds.toString().padStart(2, '0');
  },

  /** Should be only calls by spectator */
  spyBoard: function (playerId) {
    if (!this.trainingMode) {
      dojo.style("lrf_spectator_text", "display", "flex");
      dojo.style("lrf_main", "display", "none");
      dojo.style("lrf_spectator", "display", "none");
      return;
    }

    dojo.style("lrf_spectator_text", "display", "none");
    dojo.style("lrf_main", "display", "flex");
    dojo.style("lrf_spectator", "display", this.playersCount > 1 ? "flex" : "none");

    if (playerId) {
      this.playerSpied = playerId;
      this.grid = this.players[playerId].grid;
    }

    if (!this.modeRandom) {
      if (this.puzzleUsers) {
        const otherPlayer = this.puzzleUsers[playerId];
        this.puzzle = this.players[otherPlayer].puzzle;
      } else {
        this.puzzle = undefined;
      }
    }

    if (this.dojoGame) {
      this.setup();
    }
  },

  buildRoundsPuzzleSelect: function () {
    // if there is more than MAX_ROUNDS_DISPLAY rounds, we only display the last MAX_ROUNDS_DISPLAY rounds
    this.resultRoundStart = this.puzzles.length === 10 && this.round > 10 ? this.round - MAX_ROUNDS_DISPLAY : 0;
    for (let i = 0; i < this.puzzles.length; i++) {
      dojo.place("<option value='" + (i + this.resultRoundStart) + "'>" + _('Round') + " " + (i + this.resultRoundStart + 1) + "</option>", "roundSelect");
    }
  },

  buildCopyButton: function (containerId, inputId) {
    const container = document.getElementById(containerId);

    if (!container.title) {
      const copyImg = "<svg aria-hidden='true' height='16' viewBox='0 0 16 16' width='16' data-view-component='true'><path fill-rule='evenodd' d='M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z'></path><path fill-rule='evenodd' d='M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z'></path>";
      const copiedImg = "<svg aria-hidden='true' height='16' viewBox='0 0 16 16' width='16' data-view-component='true'><g fill='#1a7f37'><path fill-rule='evenodd' d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'></path></g></svg>";

      container.title = _("Copy to clipboard");
      container.innerHTML = copyImg;

      container.onclick = function () {
        const text = document.getElementById(inputId).value
        navigator.clipboard.writeText(text).then(() => {
          container.innerHTML = copiedImg;
          setTimeout(function () {
            container.innerHTML = copyImg;
          }, 2000);
        });
      }
    }
  },

  displaySeedArea: function () {
    dojo.style("lrf_main", "display", "none");
    dojo.style("lrf_seed", "display", "flex");
  },

  displayDesignArea: function () {
    dojo.style("lrf_design", "display", "flex");
    dojo.place("lrf_design", "page-title");
    this.buildCopyButton("lrf_design_copy", "lrf_design_input");

    if (this.initialized) {
      try {
        const seedCode = this.grid ? window.game.getSeed(this.grid) : "";
        if (this._isSeedValid(seedCode)) {
          document.getElementById("lrf_design_input").value = seedCode;
        }
      } catch (error) { }
    }
  },

  hideDesignArea: function () {
    dojo.style("lrf_design", "display", "none");
  },

  _isSeedValid: function (seedCode) {
    let ok = true;
    const items = [];
    const portals = [];
    let grid;

    try {
      grid = window.game.getGrid(seedCode);

      if (grid.length < 4) {
        ok = false;
      } else {
        grid.forEach((row, rowIndex) => row.forEach((v, colIndex) => {
          if (v < 0) {
            ok = false;
          } else if (v === 7) {
            portals.push(rowIndex);
            portals.push(colIndex);
          } else if (v > 0) {
            items.push(v);
          }
        }));

        if (portals.length !== 0 && portals.length !== 4) {
          ok = false;
        } else if (grid.length === 4 && items.length > 14) {
          ok = false;
        } else if (grid.length === 5 && items.length > 20) {
          ok = false;
        } else if (items.length > 30 || items.length < 3) {
          ok = false;
        }
      }
    }
    catch (error) {
      console.warn("Invalid seed code", seedCode);
      ok = false;
    }

    return ok ? [grid, items, portals] : [undefined, undefined, undefined];
  },

  seedValidate: function (seedCode) {
    const [grid, items, portals] = this._isSeedValid(seedCode);

    if (grid) {
      this.elements = items;
      this.elementsCount = items.length;
      this.gridSize = grid.length;
      this.portals = this._checkPortals(portals);
      this.callAction("seedValidate", { grid: JSON.stringify(grid) }, true, "post");
    } else {
      this.dojoGame.showMessage(_("This is not a valid seed code"), "error");
    }
  },

  _displaySeed: function () {
    if (!window.game) {
      // waiting for the React application
      setTimeout(function () { gameUI._displaySeed(); }, 500);
      return;
    }
    document.getElementById("lrf_end_seed_input").value = this.grid ? window.game.getSeed(this.grid) : "";
    this.buildCopyButton("lrf_end_seed_copy", "lrf_end_seed_input");
  },

  displayRoundPuzzle: function (round) {
    console.info("## Display puzzle of round " + round + " ##");

    dojo.style("lrf_spectator", "display", "none");

    Object.keys(this.players).forEach(id => {
      const divId = 'lrf_end_' + id;
      document.getElementById(divId).innerHTML = '?';
    });

    const roundStr = String(round).padStart(4, '0');
    const key = 'pd_' + roundStr + '_';

    this.puzzle = undefined;
    this.grid = this.puzzles[round - this.resultRoundStart];
    this._displaySeed();

    this.durations
      .filter(d => d.pdk.startsWith(key))
      .forEach(d => {
        const playerNum = +d.pdk.substring(key.length);
        const player = Object.keys(this.players).map((id) => this.players[id]).find(p => p.num === playerNum);
        const divId = 'lrf_end_' + player.id;
        const durationStr = d.duration === GIVEUP_DURATION_STR ? _('Fail') : this.getDurationStr(+d.duration);

        document.getElementById(divId).innerHTML = durationStr;
      });

    const jsonPuzzle = JSON.stringify(this.grid);

    Object.keys(this.players).forEach(id => {
      const key = 'pg_' + roundStr + '_' + this.players[id].num;
      document.getElementById('board_' + id).checked = false;
      const board = this.boards.find(b => b.pgk === key);
      const jsonPlayerGrid = board && board.grid ? JSON.stringify(board.grid) : undefined;
      const visibility = (jsonPlayerGrid == undefined || jsonPlayerGrid === jsonPuzzle) ? "hidden" : "visible";

      document.getElementById('board_' + id).style.visibility = visibility;
    });

    try {
      dojo.style("lrf_main", "display", "flex");
      dojo.style("lrf_end", "display", "flex");
      dojo.style("lrf_end_players", "display", "none");
      dojo.style("lrf_end_rounds", "display", "flex");

      this.mode = "view";
      this.solution = null;

      if (this.dojoGame) {
        this.setup();
      }
    }
    catch (error) {
      console.error("Error in displayRoundPuzzle", error)
    }
  },

  displayPlayerPuzzle: function (playerId) {
    console.info("## Display puzzle of player " + playerId + " ##");

    try {
      dojo.style("lrf_spectator", "display", "none");
      dojo.style("lrf_main", "display", "flex");
      dojo.style("lrf_end", "display", "flex");
      dojo.style("lrf_end_players", "display", "flex");
      dojo.style("lrf_end_rounds", "display", "none");

      const jsonPuzzle = JSON.stringify(this.players[playerId].grid);

      Object.keys(this.players).forEach(id => {
        const divId = 'lrf_end_' + id;
        document.getElementById(divId).innerHTML = '?';
      });

      Object.keys(this.players).forEach(id => {
        const key = 'pg_' + this.players[playerId].num + '_' + this.players[id].num;
        document.getElementById('board_' + id).checked = false;
        const board = this.boards.find(b => b.pgk === key);
        const jsonPlayerGrid = board && board.grid ? JSON.stringify(board.grid) : undefined;
        const visibility = (jsonPlayerGrid == undefined || jsonPlayerGrid === jsonPuzzle) ? "hidden" : "visible";

        document.getElementById('board_' + id).style.visibility = visibility;
      });

      const key = 'pd_' + this.players[playerId].num + '_';

      Object.keys(this.players).forEach(id => {
        const lineId = 'lrf_end_line_' + id;
        const disp = id == playerId ? "none" : "";

        dojo.style(lineId, "display", disp);
      });

      this.durations
        .filter(d => d.pdk.startsWith(key))
        .forEach(d => {
          const playerNum = +d.pdk.substring(key.length);
          const player = Object.keys(this.players).map((id) => this.players[id]).find(p => p.num === playerNum);
          const divId = 'lrf_end_' + player.id;
          const durationStr = d.duration === GIVEUP_DURATION_STR ? _('Fail') : this.getDurationStr(+d.duration);

          document.getElementById(divId).innerHTML = durationStr;
        });

      this.mode = "view";
      this.solution = null;
      this.grid = this.players[playerId].grid;
      this._displaySeed();

      if (this.dojoGame) {
        this.setup();
      }
    }
    catch (error) {
      console.error("Error in displayPlayerPuzzle", error)
    }
  },

  displayBoard: function (playerId) {
    Object.keys(this.players)
      .filter(id => id != playerId)
      .forEach(id => document.getElementById('board_' + id).checked = false);

    if (this.modeRandom) {
      this._displayBoardRound(playerId);
    } else {
      this._displayBoardPlayer(playerId);
    }
  },

  _displayBoardRound: function (playerId) {
    const round = document.getElementById('roundSelect').value;
    const roundStr = String(round).padStart(4, '0');
    const checked = document.getElementById('board_' + playerId).checked;

    if (checked) {
      const player = this.players[playerId];
      const gridKey = 'pg_' + roundStr + '_' + player.num;
      const durationKey = 'pd_' + roundStr + '_' + player.num;
      const durationElt = this.durations.find(d => d.pdk === durationKey);

      if (durationElt && durationElt.duration != GIVEUP_DURATION_STR) {
        this.mode = "view";
        this.solution = null;
      } else {
        this.mode = "solution";
        this.solution = this.puzzles[round - this.resultRoundStart];
      }

      this.puzzle = undefined;
      this.grid = this.boards.find(b => b.pgk === gridKey).grid;

      if (this.dojoGame) {
        this.setup();
      }
    } else {
      this.displayRoundPuzzle(round);
    }
  },

  _displayBoardPlayer: function (playerId) {
    const puzzlePlayerId = document.getElementById('playerSelect').value;
    const checked = document.getElementById('board_' + playerId).checked;

    if (checked) {
      const player = this.players[playerId];
      const puzzlePlayer = this.players[puzzlePlayerId];
      const gridKey = 'pg_' + puzzlePlayer.num + '_' + player.num;
      const durationKey = 'pd_' + puzzlePlayer.num + '_' + player.num;
      const durationElt = this.durations.find(d => d.pdk === durationKey);

      if (durationElt && durationElt.duration != GIVEUP_DURATION_STR) {
        this.mode = "view";
        this.solution = null;
        this.grid = this.boards.find(b => b.pgk === gridKey).grid;
      } else {
        this.mode = "solution";
        this.solution = puzzlePlayer.grid;
        this.puzzle = undefined;
        this.grid = this.boards.find(b => b.pgk === gridKey).grid;
      }

      if (this.dojoGame) {
        this.setup();
      }
    } else {
      this.displayPlayerPuzzle(puzzlePlayerId);
    }
  },

  refreshPuzzle: function (playerId) {
    try {
      if (!playerId && this.playerSpied) {
        playerId = this.playerSpied;
      }
      if (this.playerSpied === playerId) {
        this.grid = this.players[playerId].grid;

        if (!this.modeRandom) {
          if (this.isSpectator && this.puzzleUsers && !this.ended) {
            const otherPlayer = this.puzzleUsers[playerId];
            this.puzzle = this.players[otherPlayer].puzzle;
          } else {
            this.puzzle = undefined;
          }
        }

        this.setup();
      }
    }
    catch (error) {
      console.error("Error in refreshPuzzle", error)
    }
  },

  displayTeamSelection: function () {
    dojo.style("lrf_main", "display", "none");
    dojo.style("lrf_teams", "display", "flex");

    const team = this.getMyData().team;
    if (team) {
      dojo.addClass("lrf_team_" + team, "lrf_team_selected");
    }

    if (this.teamsCount == 2) {
      dojo.style("lrf_team_3", "display", "none");
    }
  },

  hideTeamSelection: function () {
    dojo.style("lrf_main", "display", "");
    dojo.style("lrf_teams", "display", "none");
  },

  selectTeam: function (team) {
    for (let i = 1; i <= 3; i++) {
      if (team === i) {
        dojo.addClass("lrf_team_" + i, "lrf_team_selected");
      } else {
        dojo.removeClass("lrf_team_" + i, "lrf_team_selected");
      }
    }

    if (team > 0) {
      const myData = this.getMyData();
      if (myData.team !== team) {
        this.callAction("teamSelect", { no: myData.num, team }, true);
      }
    }
  },

  displayPlayerTeam: function (playerId) {
    const divId = "player_name_" + playerId;
    const iconId = "icon_team_" + playerId;
    const icon = ['', '🧙', '🧛', '👽'][this.players[playerId].team];
    dojo.destroy(iconId);
    dojo.place("<span id='" + iconId + "'>" + icon + "&nbsp;</span>", $(divId).firstElementChild, 0);
  },

  displayPlayerHearts: function (hearts, playerId) {
    if (playerId === undefined) {
      playerId = this.isSpectator ? this.playerSpied : this.playerId;
    }
    const divId = "player_board_" + playerId;
    const iconId = "icon_heart_" + playerId;
    const icons = (hearts >= 0) ? hearts + '&nbsp;💗' : '0&nbsp;💔';
    dojo.destroy(iconId);
    dojo.place("<span id='" + iconId + "'>&nbsp;&nbsp;&nbsp;" + icons + "&nbsp;</span>", $(divId).firstElementChild, 4);
  },

  displayPlayerIcons: function () {
    if (this.soloMode && this.soloMode < 100) {
      this.displayPlayerHearts(this.hearts);
    } else if (this.teamsCount) {
      Object.keys(this.players).map((id) => {
        this.displayPlayerTeam(id);
        if (this.cooperativeMode) {
          this.displayPlayerHearts(this.hearts, id);
        }
      });
    }
  },

  getCheckBox: function (checked, color) {
    if (checked) {
      return '<svg width="24px" height="24px" viewBox="0 0 24 24"><g stroke="none" fill="' + color + '" fill-rule="nonzero"><path d="M18.25,3 C19.7687831,3 21,4.23121694 21,5.75 L21,18.25 C21,19.7687831 19.7687831,21 18.25,21 L5.75,21 C4.23121694,21 3,19.7687831 3,18.25 L3,5.75 C3,4.23121694 4.23121694,3 5.75,3 L18.25,3 Z M18.25,4.5 L5.75,4.5 C5.05964406,4.5 4.5,5.05964406 4.5,5.75 L4.5,18.25 C4.5,18.9403559 5.05964406,19.5 5.75,19.5 L18.25,19.5 C18.9403559,19.5 19.5,18.9403559 19.5,18.25 L19.5,5.75 C19.5,5.05964406 18.9403559,4.5 18.25,4.5 Z M10,14.4393398 L16.4696699,7.96966991 C16.7625631,7.6767767 17.2374369,7.6767767 17.5303301,7.96966991 C17.7965966,8.23593648 17.8208027,8.65260016 17.6029482,8.94621165 L17.5303301,9.03033009 L10.5303301,16.0303301 C10.2640635,16.2965966 9.84739984,16.3208027 9.55378835,16.1029482 L9.46966991,16.0303301 L6.46966991,13.0303301 C6.1767767,12.7374369 6.1767767,12.2625631 6.46966991,11.9696699 C6.73593648,11.7034034 7.15260016,11.6791973 7.44621165,11.8970518 L7.53033009,11.9696699 L10,14.4393398 L16.4696699,7.96966991 L10,14.4393398 Z"></path></g></svg>';
    }
    return '<svg width="24px" height="24px" viewBox="0 0 24 24"><g stroke="none" fill="' + color + '" fill-rule="nonzero"><path d="M5.75,3 L18.25,3 C19.7687831,3 21,4.23121694 21,5.75 L21,18.25 C21,19.7687831 19.7687831,21 18.25,21 L5.75,21 C4.23121694,21 3,19.7687831 3,18.25 L3,5.75 C3,4.23121694 4.23121694,3 5.75,3 Z M5.75,4.5 C5.05964406,4.5 4.5,5.05964406 4.5,5.75 L4.5,18.25 C4.5,18.9403559 5.05964406,19.5 5.75,19.5 L18.25,19.5 C18.9403559,19.5 19.5,18.9403559 19.5,18.25 L19.5,5.75 C19.5,5.05964406 18.9403559,4.5 18.25,4.5 L5.75,4.5 Z"></path></g></svg>';
  },

  getUnlockIcon: function () {
    return '<svg width="12px" height="12px" viewBox="0 0 92.179 92.18"><g stroke="none" fill="#ffffff" fill-rule="nonzero"><path d="M73.437,36.54v-9.192C73.437,12.268,61.169,0,46.09,0S18.744,12.268,18.744,27.348h11.355 c0-8.818,7.173-15.992,15.991-15.992c8.817,0,15.991,7.174,15.991,15.992v9.192H9.884v55.64h72.411V36.54H73.437z M50.609,71.115 V83.33h-9.037V71.115c-2.102-1.441-3.482-3.858-3.482-6.6c0-4.418,3.582-8,8-8s8,3.582,8,8 C54.09,67.257,52.71,69.674,50.609,71.115z"/></g></svg>';
  },

  getBrowserSvg: function () {
    const winNav = window.navigator;
    const isFirefox = winNav.userAgent.toLowerCase().includes('firefox');

    if (isFirefox) {
      const language = window.navigator.userLanguage || window.navigator.language;
      const svgContent = '<svg style="padding-top: 40px;" height="80" width="100" viewBox="-4.502953659537916 -1.816370980454367 85.1080168931947 83.43087708452362" xmlns="http://www.w3.org/2000/svg"><linearGradient id="a" x1=".898" x2=".066" y1=".155" y2=".931"><stop offset=".048" stop-color="#fff44f"/><stop offset=".111" stop-color="#ffe847"/><stop offset=".225" stop-color="#ffc830"/><stop offset=".368" stop-color="#ff980e"/><stop offset=".401" stop-color="#ff8b16"/><stop offset=".462" stop-color="#ff672a"/><stop offset=".534" stop-color="#ff3647"/><stop offset=".705" stop-color="#e31587"/></linearGradient><radialGradient id="b" cx="67.813" cy="8.879" gradientUnits="userSpaceOnUse" r="80.797"><stop offset=".129" stop-color="#ffbd4f"/><stop offset=".186" stop-color="#ffac31"/><stop offset=".247" stop-color="#ff9d17"/><stop offset=".283" stop-color="#ff980e"/><stop offset=".403" stop-color="#ff563b"/><stop offset=".467" stop-color="#ff3750"/><stop offset=".71" stop-color="#f5156c"/><stop offset=".782" stop-color="#eb0878"/><stop offset=".86" stop-color="#e50080"/></radialGradient><radialGradient id="c" cx="38.289" cy="41.911" gradientUnits="userSpaceOnUse" r="80.797"><stop offset=".3" stop-color="#960e18"/><stop offset=".351" stop-color="#b11927" stop-opacity=".74"/><stop offset=".435" stop-color="#db293d" stop-opacity=".343"/><stop offset=".497" stop-color="#f5334b" stop-opacity=".094"/><stop offset=".53" stop-color="#ff3750" stop-opacity="0"/></radialGradient><radialGradient id="d" cx="48.03" cy="-9.457" gradientUnits="userSpaceOnUse" r="58.534"><stop offset=".132" stop-color="#fff44f"/><stop offset=".252" stop-color="#ffdc3e"/><stop offset=".506" stop-color="#ff9d12"/><stop offset=".526" stop-color="#ff980e"/></radialGradient><radialGradient id="e" cx="29.352" cy="63.016" gradientUnits="userSpaceOnUse" r="38.471"><stop offset=".353" stop-color="#3a8ee6"/><stop offset=".472" stop-color="#5c79f0"/><stop offset=".669" stop-color="#9059ff"/><stop offset="1" stop-color="#c139e6"/></radialGradient><radialGradient id="f" cx="-7935.62" cy="-8491.546" gradientTransform="matrix(.972 -.235 .275 1.138 10091.302 7833.798)" gradientUnits="userSpaceOnUse" r="20.397"><stop offset=".206" stop-color="#9059ff" stop-opacity="0"/><stop offset=".278" stop-color="#8c4ff3" stop-opacity=".064"/><stop offset=".747" stop-color="#7716a8" stop-opacity=".45"/><stop offset=".975" stop-color="#6e008b" stop-opacity=".6"/></radialGradient><radialGradient id="g" cx="37.269" cy="5.573" gradientUnits="userSpaceOnUse" r="27.676"><stop offset="0" stop-color="#ffe226"/><stop offset=".121" stop-color="#ffdb27"/><stop offset=".295" stop-color="#ffc82a"/><stop offset=".502" stop-color="#ffa930"/><stop offset=".732" stop-color="#ff7e37"/><stop offset=".792" stop-color="#ff7139"/></radialGradient><radialGradient id="h" cx="59.023" cy="-11.981" gradientUnits="userSpaceOnUse" r="118.081"><stop offset=".113" stop-color="#fff44f"/><stop offset=".456" stop-color="#ff980e"/><stop offset=".622" stop-color="#ff5634"/><stop offset=".716" stop-color="#ff3647"/><stop offset=".904" stop-color="#e31587"/></radialGradient><radialGradient id="i" cx="-7927.165" cy="-8522.859" gradientTransform="matrix(.105 .995 -.653 .069 -4684.004 8470.191)" gradientUnits="userSpaceOnUse" r="86.499"><stop offset="0" stop-color="#fff44f"/><stop offset=".06" stop-color="#ffe847"/><stop offset=".168" stop-color="#ffc830"/><stop offset=".304" stop-color="#ff980e"/><stop offset=".356" stop-color="#ff8b16"/><stop offset=".455" stop-color="#ff672a"/><stop offset=".57" stop-color="#ff3647"/><stop offset=".737" stop-color="#e31587"/></radialGradient><radialGradient id="j" cx="36.617" cy="15.824" gradientUnits="userSpaceOnUse" r="73.72"><stop offset=".137" stop-color="#fff44f"/><stop offset=".48" stop-color="#ff980e"/><stop offset=".592" stop-color="#ff5634"/><stop offset=".655" stop-color="#ff3647"/><stop offset=".904" stop-color="#e31587"/></radialGradient><radialGradient id="k" cx="56.077" cy="20.139" gradientUnits="userSpaceOnUse" r="80.686"><stop offset=".094" stop-color="#fff44f"/><stop offset=".231" stop-color="#ffe141"/><stop offset=".509" stop-color="#ffaf1e"/><stop offset=".626" stop-color="#ff980e"/></radialGradient><linearGradient id="l" x1=".888" x2=".18" y1=".151" y2=".835"><stop offset=".167" stop-color="#fff44f" stop-opacity=".8"/><stop offset=".266" stop-color="#fff44f" stop-opacity=".634"/><stop offset=".489" stop-color="#fff44f" stop-opacity=".217"/><stop offset=".6" stop-color="#fff44f" stop-opacity="0"/></linearGradient><path d="M74.62 26.83c-1.7-4.06-5.1-8.43-7.78-9.8a40.27 40.27 0 0 1 3.93 11.75v.07C66.4 17.92 58.97 13.52 52.9 3.92c-.32-.48-.62-.97-.92-1.48-.17-.3-.3-.56-.43-.8A7.05 7.05 0 0 1 50.97.1a.1.1 0 0 0-.08-.1.14.14 0 0 0-.1 0v.02c0 .02-.03 0-.03 0V0c-9.72 5.7-13.03 16.26-13.33 21.53a19.4 19.4 0 0 0-10.67 4.12 11.6 11.6 0 0 0-1-.76 17.97 17.97 0 0 1-.1-9.5 28.7 28.7 0 0 0-9.34 7.22c-1.55-1.94-1.44-8.36-1.35-9.7a6.93 6.93 0 0 0-1.3.68 28.23 28.23 0 0 0-3.8 3.25 33.84 33.84 0 0 0-3.6 4.35 32.73 32.73 0 0 0-5.2 11.74L1 33.2c-.07.33-.34 2.04-.38 2.4v.1A36.94 36.94 0 0 0 0 41.04v.2a38.76 38.76 0 0 0 76.95 6.56c.07-.5.12-1 .18-1.5a39.86 39.86 0 0 0-2.5-19.47zM29.95 57.16c.18.1.35.2.53.27l.03.02q-.27-.14-.55-.3zm40.83-28.32v-.03.04z" fill="url(#a)"/><path d="M74.62 26.83c-1.7-4.06-5.1-8.43-7.78-9.8a40.27 40.27 0 0 1 3.93 11.75v.08a35.1 35.1 0 0 1-1.2 26.16c-4.44 9.53-15.2 19.3-32.03 18.82-18.18-.5-34.2-14-37.2-31.68-.54-2.8 0-4.2.28-6.47A28.88 28.88 0 0 0 0 41.03v.2a38.76 38.76 0 0 0 76.95 6.56c.07-.5.12-1 .18-1.5a39.86 39.86 0 0 0-2.5-19.47z" fill="url(#b)"/><path d="M74.62 26.83c-1.7-4.06-5.1-8.43-7.78-9.8a40.27 40.27 0 0 1 3.93 11.75v.08a35.1 35.1 0 0 1-1.2 26.16c-4.44 9.53-15.2 19.3-32.03 18.82-18.18-.5-34.2-14-37.2-31.68-.54-2.8 0-4.2.28-6.47A28.88 28.88 0 0 0 0 41.03v.2a38.76 38.76 0 0 0 76.95 6.56c.07-.5.12-1 .18-1.5a39.86 39.86 0 0 0-2.5-19.47z" fill="url(#c)"/><path d="M55.78 31.38c.1.06.16.12.24.18a21.1 21.1 0 0 0-3.6-4.7C40.38 14.82 49.27.74 50.77.03V0c-9.72 5.7-13.03 16.26-13.33 21.53.45-.03.9-.06 1.36-.06a19.56 19.56 0 0 1 16.98 9.9z" fill="url(#d)"/><path d="M38.83 33.8c-.07.95-3.47 4.28-4.67 4.28-11.02 0-12.8 6.66-12.8 6.66.48 5.62 4.4 10.24 9.12 12.7l.66.3q.57.25 1.14.47a17.23 17.23 0 0 0 5.04.98c19.32.9 23.06-23.1 9.12-30.07a13.38 13.38 0 0 1 9.34 2.28 19.56 19.56 0 0 0-16.98-9.9c-.46 0-.9.02-1.36.05a19.4 19.4 0 0 0-10.67 4.12c.6.5 1.26 1.16 2.67 2.55 2.63 2.6 9.37 5.27 9.4 5.6z" fill="url(#e)"/><path d="M38.83 33.8c-.07.95-3.47 4.28-4.67 4.28-11.02 0-12.8 6.66-12.8 6.66.48 5.62 4.4 10.24 9.12 12.7l.66.3q.57.25 1.14.47a17.23 17.23 0 0 0 5.04.98c19.32.9 23.06-23.1 9.12-30.07a13.38 13.38 0 0 1 9.34 2.28 19.56 19.56 0 0 0-16.98-9.9c-.46 0-.9.02-1.36.05a19.4 19.4 0 0 0-10.67 4.12c.6.5 1.26 1.16 2.67 2.55 2.63 2.6 9.37 5.27 9.4 5.6z" fill="url(#f)"/><path d="M24.97 24.36c.3.2.57.37.8.53a17.97 17.97 0 0 1-.1-9.5 28.7 28.7 0 0 0-9.34 7.22c.2 0 5.8-.1 8.64 1.74z" fill="url(#g)"/><path d="M.35 42.16c3 17.67 19 31.17 37.2 31.68 16.83.48 27.58-9.3 32.02-18.82a35.1 35.1 0 0 0 1.2-26.16v-.04-.04l.02.07c1.36 8.98-3.2 17.67-10.34 23.55l-.03.05c-13.9 11.33-27.2 6.84-29.9 5q-.3-.13-.57-.28c-8.1-3.87-11.46-11.26-10.74-17.6a9.95 9.95 0 0 1-9.18-5.77 14.62 14.62 0 0 1 14.25-.57 19.3 19.3 0 0 0 14.54.57c-.02-.32-6.76-3-9.4-5.6-1.4-1.38-2.06-2.04-2.66-2.54a11.6 11.6 0 0 0-1-.76c-.23-.16-.48-.33-.8-.53-2.82-1.84-8.44-1.74-8.63-1.74h-.02c-1.53-1.94-1.43-8.36-1.34-9.7a6.93 6.93 0 0 0-1.3.68 28.23 28.23 0 0 0-3.8 3.26 33.84 33.84 0 0 0-3.63 4.34 32.73 32.73 0 0 0-5.2 11.74c-.02.08-1.4 6.1-.72 9.22z" fill="url(#h)"/><path d="M52.43 26.86a21.1 21.1 0 0 1 3.6 4.7c.2.17.4.33.58.48 8.8 8.1 4.2 19.55 3.85 20.37 7.13-5.88 11.7-14.57 10.33-23.55-4.4-10.93-11.82-15.33-17.9-24.93-.3-.48-.6-.97-.9-1.48-.17-.3-.3-.56-.43-.8A7.05 7.05 0 0 1 50.97.1a.1.1 0 0 0-.08-.1.14.14 0 0 0-.1 0v.02c0 .02-.03 0-.03 0-1.5.72-10.4 14.8 1.66 26.84z" fill="url(#i)"/><path d="M56.6 32.04c-.17-.16-.37-.32-.58-.48l-.24-.18a13.38 13.38 0 0 0-9.35-2.27c13.94 6.98 10.2 31-9.12 30.08a17.23 17.23 0 0 1-5.03-.97q-.57-.2-1.14-.46c-.22-.1-.43-.2-.65-.3h.03c2.7 1.84 16 6.34 29.92-5l.02-.04c.35-.8 4.95-12.27-3.84-20.36z" fill="url(#j)"/><path d="M21.35 44.74s1.8-6.66 12.8-6.66c1.2 0 4.6-3.33 4.68-4.3a19.3 19.3 0 0 1-14.56-.56 14.62 14.62 0 0 0-14.25.57 9.95 9.95 0 0 0 9.2 5.76c-.73 6.34 2.62 13.73 10.73 17.6.18.1.35.18.53.27-4.73-2.45-8.64-7.07-9.13-12.7z" fill="url(#k)"/><path d="M74.62 26.83c-1.7-4.06-5.1-8.43-7.78-9.8a40.27 40.27 0 0 1 3.93 11.75v.07C66.4 17.92 58.97 13.52 52.9 3.92c-.32-.48-.62-.97-.92-1.48-.17-.3-.3-.56-.43-.8A7.05 7.05 0 0 1 50.97.1a.1.1 0 0 0-.08-.1.14.14 0 0 0-.1 0v.02c0 .02-.03 0-.03 0V0c-9.72 5.7-13.03 16.26-13.33 21.53.45-.03.9-.06 1.36-.06a19.56 19.56 0 0 1 16.98 9.9 13.38 13.38 0 0 0-9.34-2.26c13.94 6.98 10.2 31-9.12 30.08a17.23 17.23 0 0 1-5.04-.97q-.57-.2-1.14-.46l-.66-.3h.03q-.27-.13-.55-.28c.18.1.35.2.53.27-4.73-2.45-8.64-7.07-9.13-12.7 0 0 1.8-6.65 12.8-6.65 1.2 0 4.6-3.33 4.68-4.3-.02-.3-6.76-3-9.4-5.58-1.4-1.4-2.07-2.05-2.66-2.55a11.6 11.6 0 0 0-1-.76 17.97 17.97 0 0 1-.1-9.5 28.7 28.7 0 0 0-9.34 7.22c-1.55-1.94-1.44-8.36-1.35-9.7a6.93 6.93 0 0 0-1.3.68 28.23 28.23 0 0 0-3.8 3.25 33.84 33.84 0 0 0-3.6 4.35 32.73 32.73 0 0 0-5.2 11.74L1 33.2c-.07.33-.4 2.07-.45 2.44a45.1 45.1 0 0 0-.57 5.4v.2a38.76 38.76 0 0 0 76.95 6.56c.07-.5.12-1 .18-1.5a39.86 39.86 0 0 0-2.5-19.47zm-3.85 2v.03z" fill="url(#l)"/></svg>';
      const text = language && language.startsWith('fr')
        ? 'L\'auteur de ce jeu a également créé une extension Firefox pour BGA. Pour en savoir plus, cliquez <a href="https://addons.mozilla.org/addon/board-game-arena-bga-extension/" target="_blank">ici</a>.</span><a href="#" class="action-button bgabutton bgabutton_blue" onclick="document.getElementById(\'lrf-bga-extension\').style.display=\'none\'" style="position:absolute; bottom:-5px; right:10px;">Non merci</a>'
        : 'The author of this game has also created a Firefox extension for BGA. You can find out more <a href="https://addons.mozilla.org/addon/board-game-arena-bga-extension/" target="_blank">here</a>.</span><a href="#" class="action-button bgabutton bgabutton_blue" onclick="document.getElementById(\'lrf-bga-extension\').style.display=\'none\'" style="position:absolute; bottom:-5px; right:10px;">Nope, thanks</a>';
      return '<div id="lrf-bga-extension" class="roundedbox"><span style="position:absolute; top:0px; left:0px; padding:0.5em">' + text + svgContent + '</div>';
    }

    const isChromium = window.chrome;
    const vendorName = winNav.vendor;
    const isOpera = typeof window.opr !== "undefined";
    const isIOSChrome = winNav.userAgent.match("CriOS");

    if (!isIOSChrome && isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false) {
      const language = window.navigator.userLanguage || window.navigator.language;
      const text = language && language.startsWith('fr')
        ? 'L\'auteur de ce jeu a également créé une extension Chrome pour BGA. Pour en savoir plus, cliquez <a href="https://chrome.google.com/webstore/detail/bga-chrome-extension/kchnhmpeopknjdjejognciimepllkacb" target="_blank">ici</a>.</span><a href="#" class="action-button bgabutton bgabutton_blue" onclick="document.getElementById(\'lrf-bga-extension\').style.display=\'none\'" style="position:absolute; bottom:-5px; right:10px;">Non merci</a>'
        : 'The author of this game has also created a Chrome extension for BGA. You can find out more <a href="https://chrome.google.com/webstore/detail/bga-chrome-extension/kchnhmpeopknjdjejognciimepllkacb" target="_blank">here</a>.</span><a href="#" class="action-button bgabutton bgabutton_blue" onclick="document.getElementById(\'lrf-bga-extension\').style.display=\'none\'" style="position:absolute; bottom:-5px; right:10px;">Nope, thanks</a>';

      return '<div id="lrf-bga-extension" class="roundedbox"><span style="position:absolute; top:0px; left:0px; padding:0.5em">' + text + '<svg height="100" viewBox="20 -20 200 170"><g clip-path="url(#SVGID-00000069372319379759664590000016439136492548043392)"><linearGradient id="SVGID-00000005268409276694585540000015853986965625284781" gradientUnits="userSpaceOnUse" x1="39.16" y1="775.015" x2="152.84" y2="775.015" gradientTransform="matrix(1 0 0 1 0 -650)"><stop offset="0" style="stop-color:#d93025"></stop><stop offset="1" style="stop-color:#ea4335"></stop></linearGradient><path fill="url(#SVGID-00000005268409276694585540000015853986965625284781)" d="M39.16,116.8l9.05,27.61l19.38,21.63 L96,116.81l56.84-0.01C141.49,97.18,120.29,83.99,96,83.99S50.51,97.18,39.16,116.8z"></path><linearGradient id="SVGID-00000175289037886816495430000013271641968500087969" gradientUnits="userSpaceOnUse" x1="-1169.8269" y1="59.7414" x2="-1056.1232" y2="59.7414" gradientTransform="matrix(-0.5 -0.866 0.866 -0.5 -533.5404 -772.0297)"><stop offset="0" style="stop-color:#1e8e3e"></stop><stop offset="1" style="stop-color:#34a853"></stop></linearGradient><path fill="url(#SVGID-00000175289037886816495430000013271641968500087969)" d="M95.99,215.28l19.38-21.64l9.04-27.6H67.58 L39.16,116.8c-11.31,19.64-12.14,44.61,0.01,65.65C51.31,203.49,73.34,215.26,95.99,215.28z"></path><linearGradient id="SVGID-00000025418581839675921930000004546302552040502431" gradientUnits="userSpaceOnUse" x1="56.7071" y1="-664.7747" x2="170.4071" y2="-664.7747" gradientTransform="matrix(-0.5 0.866 -0.866 -0.5 -403.9008 -264.818)"><stop offset="0" style="stop-color:#fbbc04"></stop><stop offset="1" style="stop-color:#fcc934"></stop></linearGradient><path fill="url(#SVGID-00000025418581839675921930000004546302552040502431)" d="M152.84,116.81H96l28.42,49.23L96,215.28 c22.66-0.02,44.69-11.79,56.83-32.83C164.98,161.41,164.15,136.45,152.84,116.81z"></path><ellipse fill="#F1F3F4" cx="96" cy="149.63" rx="32.81" ry="32.82"></ellipse><ellipse fill="#1A73E8" cx="96" cy="149.63" rx="26.66" ry="26.67"></ellipse></g><svg></div>';
    }

    return undefined;
  },

  doAdd: function () {
    const disp = localStorage.getItem('lrx_disp');

    if (!disp) {
      const svgContent = this.getBrowserSvg();

      if (svgContent) {
        const div = document.createElement('DIV');
        div.className = 'log';
        div.style.height = 'auto';
        div.style.display = 'block';
        div.style.color = 'rgb(0,0,0)';
        div.innerHTML = svgContent;
        document.getElementById('chatlogs').prepend(div);
      }

      localStorage.setItem('lrx_disp', new Date().getTime());
    }
  }
};