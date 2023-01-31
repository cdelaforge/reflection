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

  savePlayerData: function (playerData, playerId) {
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
        result.state = "teamSelecting";
      } else if (playerData.state === "91") {
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
    if (!this.portals || !this.grid) {
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

    const myData = this.getMyData();
    if (myData.team !== team) {
      this.callAction("teamSelect", { no: myData.num, team }, true);
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
  }
};