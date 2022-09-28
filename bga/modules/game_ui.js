const STORAGE_TTL = 1000 * 60 * 20; // 20 minutes

const gameUI = {
  teamData: [],
  history: [],
  init: function (dojoGame) {
    if (!this.dojoGame) {
      this.dojoGame = dojoGame;
      this.playerId = dojoGame.player_id;
      this.isSpectator = dojoGame.isSpectator;
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

        if (dojoGame.isCurrentPlayerActive() && gameUI.getMyData().state === "playing") {
          gameUI.resolved = true;
        }
      }
    }

    const securedLive = function () {
      try {
        gameUI.live();
      }
      catch (error) {
        console.error("Error in gameUI.live", error)
      }
    }

    securedLive();
    setInterval(securedLive, 500);

    this.liveLoop = 0;
    this.initialized = true;
  },

  getMyData: function () {
    return this.players[this.playerId];
  },

  initLocalStorage: function (tableId, playerId) {
    this.storageKey = "lr_" + tableId + "_" + playerId;
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
      this.setup({ keepLock: true });
      this.saveGrid();
      this.shouldSendProgression = true;
    }
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
      } else if (playerData.state === "52") {
        result.state = "failed";
      } else if (playerData.state === "51" && result.progression === 100) {
        result.state = "success";
      } else if (playerData.state === "80" && playerData.duration === "6666") {
        result.state = "failed";
      } else if (playerData.state === "80" && result.progression === 100) {
        result.state = "success";
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
    if (this.teamsCount > 0) {
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
        window.game.setTeam(this.teamData);
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
      this.callAction("puzzleResolve", { grid: JSON.stringify(this.grid) }, true, "post");
      this.clearSavedGrid();
    }

    if (this.giveUpPropose) {
      this.giveUpPropose = false;
      this.shouldSendProgression = false;

      this.callAction("giveUpPropose", { grid: JSON.stringify(gameUI.grid) }, true, "post");
    } else if (this.giveUpRefuse) {
      this.giveUpRefuse = true;
      this.shouldSendProgression = false;

      this.callAction("giveUpRefuse", null, true);
    } else if (this.timeout || this.giveUp) {
      const action = this.timeout ? "timeout" : "giveUp";
      this.giveUp = false;
      this.timeout = false;
      this.shouldSendProgression = false;
      this.mode = 'solution';

      this.callAction(action, { grid: JSON.stringify(this.grid) }, true, "post");
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

        this.callAction("gridChange", data, data.give_time, "post");
      }
    }

    if (this.shouldRefreshProgression) {
      this.buildProgressionBars();
      this.displayBars();
      this.shouldRefreshProgression = false;
    } else if (!this.ended) {
      const time = Math.round(new Date().getTime() / 1000);

      Object.keys(this.players).map((playerId) => {
        const playerData = this.players[playerId];

        if (playerData.startTime || playerData.duration) {
          let durationStr = playerData.duration;
          if (!durationStr && !g_archive_mode) {
            durationStr = gameUI.getDurationStr(gameUI.getDuration(playerData.startTime, time));
          }

          gameUI.displayDuration(
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
          button.innerHTML = _('Give up') + " (" + remainingTime + " " + _('seconds') + ")";
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

  setup: function (options) {
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
      portals: this.portals,
      transformations: this.transfo || 0
    }

    if (options) {
      Object.keys(options).forEach(key => data[key] = options[key]);
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

  callAction: function (action, args, lock, verb) {
    this.dojoGame.callAction(action, args, lock, verb);
  },

  displayGrid: function () {
    console.info("## Display grid ##");

    timer.abort();

    if (this.isSpectator && !this.trainingMode && !this.ended) {
      dojo.style("lrf_spectator_text", "display", "flex");
      dojo.style("lrf_main", "display", "none");
    } else {
      dojo.style("lrf_spectator_text", "display", "none");
      dojo.style("lrf_main", "display", "flex");
      dojo.style("lrf_end", "display", this.isSpectator ? "flex" : "none");
      dojo.style("lrf_timer", "display", "none");
    }
  },

  hideGrid: function () {
    console.info("## Hide grid ##");

    timer.abort();

    dojo.style("lrf_main", "display", "none");
  },

  displayProgression: function (playerId, progression, startTime, durationStr) {
    try {
      const divId = "info_" + playerId;
      const prgId = "progressbar_" + playerId;
      const cptId = "counter_" + playerId;
      const subId = "container_" + playerId;
      const rstId = "resting_" + playerId;
      const falId = "fail_" + playerId;
      const afkId = "afkId_" + playerId;
      const selId = "selectingId_" + playerId;
      const okId = "selectedId_" + playerId;

      if (!durationStr && startTime && !g_archive_mode) {
        durationStr = this.getDurationStr(this.getDuration(startTime));
      }

      dojo.destroy(divId);
      dojo.place(this.dojoGame.format_block('jstpl_progressbar', {
        iid: divId,
        pid: prgId,
        cid: cptId,
        sid: subId,
        rid: rstId,
        fid: falId,
        aid: afkId,
        tid: selId,
        oid: okId,
        my_puzzle: _("It's my puzzle"),
        failed: _("Failed to solve the puzzle"),
        sleeping: _("Not yet started"),
        selecting: _("Team selection"),
        selected: _("Team selected"),
        color: this.players[playerId].color,
        progression,
        dec: 100 - progression,
        text_disp: progression > 15 ? "" : "none",
        bar_width: durationStr ? "78%" : "90%",
        counter: durationStr || ""
      }), 'overall_player_board_' + playerId);
    }
    catch (error) {
      console.error("Error in displayProgression", error)
    }
  },

  displayBars: function () {
    Object.keys(this.players).map(playerId => {
      try {
        const divId = "progressbar_" + playerId;
        const rstId = "resting_" + playerId;
        const falId = "fail_" + playerId;
        const afkId = "afkId_" + playerId;
        const selId = "selectingId_" + playerId;
        const okId = "selectedId_" + playerId;

        const playerData = this.players[playerId];

        dojo.style(divId, "display", "none");
        dojo.style(falId, "display", "none");
        dojo.style(rstId, "display", "none");
        dojo.style(afkId, "display", "none");
        dojo.style(selId, "display", "none");
        dojo.style(okId, "display", "none");

        const playerState = (this.puzzleUser && this.puzzleUser.id === playerId) ? "resting" : playerData.state;

        switch (playerState) {
          case "teamSelecting":
            dojo.style(selId, "display", "");
            break;
          case "teamSelected":
            dojo.style(okId, "display", "");
            break;
          case "failed":
            dojo.style(falId, "display", "");
            break;
          case "resting":
            dojo.style(rstId, "display", "");
            break;
          case "playing":
          case "success":
          case "creating":
            dojo.style(divId, "display", "");
            break;
          default:
            dojo.style(afkId, "display", "");
            break;
        }
      }
      catch (error) {
        console.error("Error in displayBars", error)
      }
    });
  },

  displayDuration: function (playerId, duration) {
    const cptId = "counter_" + playerId;
    const subId = "container_" + playerId;

    try {
      document.getElementById(cptId).innerHTML = duration;
      document.getElementById(subId).style.width = duration ? "78%" : "90%";
    } catch (error) {
      console.error("Error in displayDuration", error);
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

    if (duration === 6666) {
      return "0:00";
    }

    const seconds = duration % 60;
    const minutes = (duration - seconds) / 60;
    return minutes.toString() + ":" + seconds.toString().padStart(2, "0");
  },

  displayTimer: function (callbackFunc) {
    console.info("## Display timer ##");

    dojo.style("lrf_main", "display", "none");
    dojo.style("lrf_timer", "display", "block");

    timer.start(callbackFunc);
  },

  buildRoundsPuzzleSelect: function () {
    for (let i = 0; i < this.puzzles.length; i++) {
      dojo.place("<option value='" + i + "'>" + _('Round') + " " + (i + 1) + "</option>", "roundSelect");
    }
  },

  spyBoard: function (playerId) {
    if (this.isSpectator) {
      if (!this.trainingMode && !this.ended) {
        dojo.style("lrf_spectator_text", "display", "flex");
        dojo.style("lrf_main", "display", "none");
        dojo.style("lrf_spectator", "display", "none");
      } else {
        dojo.style("lrf_spectator_text", "display", "none");
        dojo.style("lrf_main", "display", "flex");
        dojo.style("lrf_spectator", "display", "flex");

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
      }
    }
  },

  displayRoundPuzzle: function (round) {
    console.info("## Display rounds' puzzles ##");

    const key = 'pd_' + round + '_';
    this.durations
      .filter(d => d.pdk.startsWith(key))
      .forEach(d => {
        const playerNum = +d.pdk.substring(key.length);
        const player = Object.keys(this.players).map((id) => this.players[id]).find(p => p.num === playerNum);
        const divId = 'lrf_end_' + player.id;
        const durationStr = d.duration === "6666" ? _('Give up') : this.getDurationStr(+d.duration);

        document.getElementById(divId).innerHTML = durationStr;
      });

    const jsonPuzzle = JSON.stringify(this.puzzles[round]);

    Object.keys(this.players).forEach(id => {
      const key = 'pg_' + round + '_' + this.players[id].num;
      document.getElementById('board_' + id).checked = false;
      const board = this.boards.find(b => b.pgk === key);
      const jsonPlayerGrid = board && board.grid ? JSON.stringify(board.grid) : undefined;
      const visibility = (jsonPlayerGrid == undefined || jsonPlayerGrid === jsonPuzzle) ? "hidden" : "visible";

      document.getElementById('board_' + id).style.visibility = visibility;
    });

    try {
      dojo.style("lrf_main", "display", "flex");
      dojo.style("lrf_timer", "display", "none");
      dojo.style("lrf_end", "display", "flex");
      dojo.style("lrf_end_players", "display", "none");
      dojo.style("lrf_end_rounds", "display", "flex");

      this.mode = "view";
      this.solution = null;
      this.grid = this.puzzles[round];

      if (this.dojoGame) {
        this.setup();
      }
    }
    catch (error) {
      console.error("Error in displayPuzzle", error)
    }
  },

  displayBoard: function (playerId) {
    const round = document.getElementById('roundSelect').value;
    const checked = document.getElementById('board_' + playerId).checked;

    if (checked) {
      const player = this.players[playerId];
      const gridKey = 'pg_' + round + '_' + player.num;
      const durationKey = 'pd_' + round + '_' + player.num;
      const durationElt = this.durations.find(d => d.pdk === durationKey);

      if (durationElt && durationElt.duration != "6666") {
        this.mode = "view";
        this.solution = null;
        this.grid = this.boards.find(b => b.pgk === gridKey).grid;
      } else {
        this.mode = "solution";
        this.solution = this.puzzles[round];
        this.grid = this.boards.find(b => b.pgk === gridKey).grid;
      }

      Object.keys(this.players)
        .filter(id => id != playerId)
        .forEach(id => document.getElementById('board_' + id).checked = false);

      if (this.dojoGame) {
        this.setup();
      }
    } else {
      this.displayRoundPuzzle(round);
    }
  },

  displayPuzzle: function (playerId) {
    console.info("## Display player's puzzles ##");

    try {
      dojo.style("lrf_spectator", "display", "none");
      dojo.style("lrf_main", "display", "flex");
      dojo.style("lrf_timer", "display", "none");
      dojo.style("lrf_end", "display", "flex");
      dojo.style("lrf_end_players", "display", "flex");
      dojo.style("lrf_end_rounds", "display", "none");

      if (this.dojoGame) {
        this.setup();
      }
    }
    catch (error) {
      console.error("Error in displayPuzzle", error)
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
    const iconId = "icon_" + playerId;
    const icon = ['', '🧙', '🧛', '👽'][this.players[playerId].team];

    dojo.destroy(iconId);
    dojo.place("<span id='" + iconId + "'>" + icon + "&nbsp;</span>", $(divId).firstElementChild, 0);
  },

  displayPlayerTeams: function () {
    Object.keys(this.players).map((id) => {
      this.displayPlayerTeam(id);
    });
  }
};