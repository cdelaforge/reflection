const STORAGE_TTL = 1000 * 60 * 20; // 20 minutes

const gameUI = {
  teamData: [],
  history: [],
  init: function (dojoGame) {
    if (!this.dojoGame) {
      this.dojoGame = dojoGame;
      this.playerId = dojoGame.player_id;
    }

    if (!window.game) {
      setTimeout(function () { gameUI.init(dojoGame); }, 100);
      return;
    }

    window.game.onGridChange = function (grid) {
      const gridChanged = JSON.stringify(gameUI.grid) !== JSON.stringify(grid);
      if (gridChanged) {
        if (gameUI.grid) {
          gameUI.history.push(gameUI.grid);
        }
        gameUI.setGrid(grid);
        gameUI.saveGrid();

        gameUI.shouldSendProgression = true;
      }
    }
    window.game.onProgression = function (progression) {
      gameUI.progression = progression;
    }
    window.game.onPuzzleChange = function (puzzle) {
      if (gameUI.mode === "puzzleCreation") {
        gameUI.puzzle = puzzle;
      }
    }
    window.game.onPuzzleResolve = function (grid) {
      if (gameUI.mode === "play") {
        gameUI.setGrid(grid);

        if (dojoGame.isCurrentPlayerActive()) {
          gameUI.resolved = true;
        }
      }
    }

    gameUI.live();
    setInterval(function () { gameUI.live(); }, 500);

    this.liveLoop = 0;
    this.initialized = true;
  },

  initLocalStorage: function (tableId, playerId) {
    this.storageKey = "lr_" + tableId + "_" + playerId;

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

  reset: function () {
    this.setGrid(undefined);
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

  saveGrid: function () {
    const item = { grid: this.grid, expires: new Date().getTime() + STORAGE_TTL };
    localStorage.setItem(this.storageKey, JSON.stringify(item));
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

  clearSavedGrid: function () {
    localStorage.removeItem(this.storageKey);
    this.history = [];
  },

  savePlayerData: function (playerData, playerId) {
    const result = {
      id: playerId,
      color: playerData.color,
      progression: parseInt(playerData.progression, 10),
      grid: JSON.parse(playerData.grid),
      puzzle: playerData.puzzle ? JSON.parse(playerData.puzzle) : undefined,
      name: playerData.name,
      startTime: parseInt(playerData.start, 10),
      team: playerData.team,
    };

    result.running = result.startTime > 0;

    if (!result.running) {
      result.duration = utils.getDurationStr(parseInt(playerData.duration, 10));

      if (playerData.state === "30") {
        result.creating = true;
      } else if (playerData.state === "52") {
        result.failed = true;
      } else if (playerData.state === "51" && result.progression === 100) {
        result.success = true;
      } else if (playerData.state === "80" && playerData.duration === "6666") {
        result.failed = true;
      } else if (playerData.state === "80" && result.progression === 100) {
        result.success = true;
      }
    }

    this.players[playerId] = result;
  },

  shouldAddTime: function () {
    if (!this.realtime || this.mode !== "play") {
      return false;
    }

    const timerTxt = document.getElementById('timeToThink_' + this.playerId).innerHTML;
    /* If timer starts with - or 0, then it remains less than 1 minute */
    return timerTxt[0] == '-' || timerTxt[0] == '0';
  },

  buildProgressionBars: function () {
    Object.keys(this.players).map((playerId) => {
      utils.displayProgression(
        playerId,
        this.players[playerId].progression,
        this.players[playerId].startTime,
        this.players[playerId].duration
      );
    });
  },

  buildTeamDataAndRegister: function () {
    const team = this.players[this.playerId].team;

    if (team && !this.teamData.length) {
      Object.keys(this.players).map((id) => {
        if (this.playerId !== +id && this.players[id].team === team) {
          this.teamData.push({ id, color: this.players[id].color });
          this.dojoGame.subscribe('gridChange_' + id, "notif_gridChange");
        }
      });
    }
  },

  live: function () {
    this.liveLoop = (this.liveLoop + 1) % 4;

    if (this.refreshTeamData) {
      try {
        window.game.setTeam(this.teamData);
      }
      catch (error) {
        console.error("Error in setTeam", error, this.teamData);
      }
      this.refreshTeamData = false;
    }

    if (this.resolved) {
      this.resolved = false;
      this.giveUp = false;
      this.timeout = false;
      this.shouldSendProgression = false;
      this.callAction("puzzleResolve", { grid: JSON.stringify(this.grid) }, true);
      this.clearSavedGrid();
    }

    if (this.timeout || this.giveUp) {
      const action = this.timeout ? "timeout" : "giveUp";
      this.giveUp = false;
      this.timeout = false;
      this.shouldSendProgression = false;
      this.callAction(action, null, true);
    }

    if (this.puzzleCreationEnd) {
      this.puzzleCreationEnd = false;
      this.shouldSendProgression = false;
      this.callAction("creationEnd", { grid: JSON.stringify(this.grid), puzzle: JSON.stringify(this.puzzle) }, true);
      this.clearSavedGrid();
    }

    if (this.shouldSendProgression && (this.liveLoop === 0 || this.progression === 100)) {
      this.shouldSendProgression = false;

      if (this.running && !g_archive_mode && (this.mode === "puzzleCreation" || this.mode === "play")) {
        const data = {
          grid: JSON.stringify(this.grid),
          progression: this.progression || 0,
          give_time: this.shouldAddTime(),
        };

        this.callAction("gridChange", data, data.give_time);
      }
    }

    if (this.shouldRefreshProgression) {
      this.buildProgressionBars();
      utils.displayBars();
      this.shouldRefreshProgression = false;
    } else if (!gameUI.ended) {
      const time = Math.round(new Date().getTime() / 1000);

      Object.keys(this.players).map((playerId) => {
        const playerData = this.players[playerId];

        if (playerData.startTime || playerData.duration) {
          let durationStr = playerData.duration;
          if (!durationStr && !g_archive_mode) {
            durationStr = utils.getDurationStr(utils.getDuration(playerData.startTime, time));
          }

          utils.displayDuration(
            playerId,
            durationStr
          );
        }
      });
    }

    if ((this.liveLoop === 0 || this.liveLoop === 2) && this.mode === "play") {
      this.manageTimeLimit();
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

    if (this.prevAreaWidth !== areaWidth) {
      this.prevAreaWidth = areaWidth;
      const self = this;
      setTimeout(() => { self.setRootMargin(titleBar); }, 100);
    } else {
      this.setRootMargin(titleBar);
    }

    try {
      dojo.query(".replay_last_move_button")[0].parentNode.parentNode.style.display = "none";
    }
    catch (error) { }
  },

  manageTimeLimit: function () {
    const button = document.getElementById('giveUp');

    if (button) {
      const playerData = this.players[this.playerId];

      if (playerData.startTime) {
        const duration = utils.getDuration(playerData.startTime);
        const remainingTime = this.timeLimit * 60 - duration;

        if (remainingTime <= 0) {
          this.timeout = true;
        } else if (remainingTime <= 30) {
          button.innerHTML = _('Give up') + " (" + remainingTime + " " + _('seconds') + ")";
        }
      }
    }
  },

  setRootMargin: function (titleBar) {
    const rootDiv = document.getElementById("root");
    if (rootDiv.offsetWidth) {
      const margin = Math.floor((titleBar.offsetWidth - rootDiv.offsetWidth) / 2);
      rootDiv.style.marginLeft = margin + "px";
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

  setup: function () {
    if (!this.initialized) {
      setTimeout(function () { gameUI.setup(); }, 100);
      return;
    }

    const data = {
      mode: this.mode,
      elements: this.elements,
      gridSize: this.gridSize,
      grid: this.grid,
      puzzle: this.puzzle,
      portals: this.portals
    }

    if (this.mode === "solution") {
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

  callAction: function (action, args, lock, handler) {
    this.dojoGame.callAction(action, args, lock, handler);
  },
};