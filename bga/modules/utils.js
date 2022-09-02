const utils = {
  init: function (dojoGame) {
    this.dojoGame = dojoGame;
  },

  displayGrid: function () {
    console.info("## Display grid ##");

    timer.abort();

    dojo.style("lrf_main", "display", "flex");
    dojo.style("lrf_end", "display", this.dojoGame.isSpectator ? "flex" : "none");
    dojo.style("lrf_timer", "display", "none");
  },

  hideGrid: function () {
    console.info("## Hide grid ##");

    timer.abort();

    dojo.style("lrf_main", "display", "none");
  },

  displayProgression: function (playerId, progression, startTime, durationStr) {
    const divId = "progressbar_" + playerId;
    const cptId = "counter_" + playerId;
    const subId = "container_" + playerId;

    if (!durationStr && startTime && !g_archive_mode) {
      durationStr = this.getDurationStr(this.getDuration(startTime));
    }

    dojo.destroy(divId);
    dojo.place(this.dojoGame.format_block('jstpl_progressbar', {
      pid: divId,
      cid: cptId,
      sid: subId,
      color: gameUI.players[playerId].color,
      progression,
      dec: 100 - progression,
      text_disp: progression > 15 ? "" : "none",
      bar_width: durationStr ? "78%" : "90%",
      counter: durationStr || ""
    }), 'overall_player_board_' + playerId);
  },

  displayDuration: function (playerId, duration) {
    const cptId = "counter_" + playerId;
    const subId = "container_" + playerId;

    document.getElementById(cptId).innerHTML = duration;
    document.getElementById(subId).style.width = duration ? "78%" : "90%";
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
    for (let i = 0; i < gameUI.puzzles.length; i++) {
      dojo.place("<option value='" + i + "'>" + _('Round') + " " + (i + 1) + "</option>", "roundSelect");
    }
  },

  displayRoundPuzzle: function (round) {
    console.info("## Display rounds's puzzles ##");

    dojo.style("lrf_main", "display", "flex");
    dojo.style("lrf_timer", "display", "none");
    dojo.style("lrf_end", "display", "none");
    dojo.style("lrf_end_rnd", "display", "flex");

    gameUI.mode = "view";
    gameUI.grid = gameUI.puzzles[round];

    if (gameUI.dojoGame) {
      gameUI.setup();
    }
  },

  displayPuzzle: function (playerId) {
    console.info("## Display player's puzzles ##");

    dojo.style("lrf_main", "display", "flex");
    dojo.style("lrf_timer", "display", "none");
    dojo.style("lrf_end", "display", "flex");

    if (playerId) {
      gameUI.playerSpied = playerId;
      gameUI.grid = gameUI.players[playerId].grid;
    }

    if (!this.dojoGame.isSpectator || gameUI.ended) {
      gameUI.mode = "view";
    } else if (!gameUI.modeRandom) {
      if (gameUI.puzzleUsers) {
        const otherPlayer = gameUI.puzzleUsers[playerId];
        gameUI.puzzle = gameUI.players[otherPlayer].puzzle;
      } else {
        gameUI.puzzle = undefined;
      }
    }
    if (gameUI.dojoGame) {
      gameUI.setup();
    }
  },

  refreshPuzzle: function (playerId) {
    if (!playerId && gameUI.playerSpied) {
      playerId = gameUI.playerSpied;
    }
    if (gameUI.playerSpied === playerId) {
      gameUI.grid = gameUI.players[playerId].grid;

      if (!gameUI.modeRandom) {
        if (this.dojoGame.isSpectator && gameUI.puzzleUsers && !gameUI.ended) {
          const otherPlayer = gameUI.puzzleUsers[playerId];
          gameUI.puzzle = gameUI.players[otherPlayer].puzzle;
        } else {
          gameUI.puzzle = undefined;
        }
      }

      gameUI.setup();
    }
  },
}