const STORAGE_TTL = 1000 * 60 * 20; // 20 minutes

const gameUI = {
  init: function (dojoGame) {
    if (!window.game) {
      setTimeout(function () { gameUI.init(dojoGame); }, 100);
      return;
    }

    window.game.onStandaloneStart = function (grid, puzzle) {
      gameUI.defaultPuzzleGrid = grid;
      gameUI.defaultPuzzle = puzzle;
      gameUI.mode = 'puzzleCreation';
      gameUI.setup();
      utils.displayGrid();
    }
    window.game.onGridChange = function (grid) {
      const gridChanged = JSON.stringify(gameUI.grid) !== JSON.stringify(grid);
      if (gridChanged) {
        gameUI.setGrid(grid);

        const item = { grid, expires: new Date().getTime() + STORAGE_TTL };
        localStorage.setItem(gameUI.storageKey, JSON.stringify(item));

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

    this.dojoGame = dojoGame;
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

  live: function () {
    this.liveLoop = (this.liveLoop + 1) % 4;

    if (this.giveUp) {
      this.giveUp = false;
      this.shouldSendProgression = false;
      localStorage.removeItem(this.storageKey);
    }

    if (this.resolved) {
      this.resolved = false;
      this.shouldSendProgression = false;
      this.callAction("puzzleResolve", { grid: JSON.stringify(this.grid) }, true);
      localStorage.removeItem(this.storageKey);
    }

    if (this.puzzleCreationEnd) {
      this.puzzleCreationEnd = false;
      this.shouldSendProgression = false;
      this.callAction("creationEnd", { grid: JSON.stringify(this.grid), puzzle: JSON.stringify(this.puzzle) }, true);
      localStorage.removeItem(this.storageKey);
    }

    if (this.shouldSendProgression && (this.liveLoop === 0 || this.progression === 100)) {
      this.shouldSendProgression = false;

      if (this.running && !g_archive_mode && (this.mode === "puzzleCreation" || this.mode === "play")) {
        const data = {
          grid: JSON.stringify(this.grid),
          progression: this.progression || 0
        };

        if (this.defaultPuzzleGrid && this.defaultPuzzle) {
          data.defGrid = JSON.stringify(this.defaultPuzzleGrid);
          data.defPuzzle = JSON.stringify(this.defaultPuzzle);

          this.defaultPuzzleGrid = null;
          this.defaultPuzzle = null;
        }

        this.callAction("gridChange", data, false);
      }
    }

    if (this.shouldRefreshProgression) {
      Object.keys(this.players).map((playerId) => {
        utils.displayProgression(
          playerId,
          this.players[playerId].progression,
          this.players[playerId].startTime,
          this.players[playerId].duration
        );
      });
      this.shouldRefreshProgression = false;
    } else {
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

    window.game.setup(data);
    dojo.style("root", "visibility", "visible");

    if (!this.running || g_archive_mode) {
      console.log("set running false");
      window.game.setRunning(false);
    }
  },

  callAction: function (action, args, lock, handler) {
    this.dojoGame.callAction(action, args, lock, handler);
  },
};