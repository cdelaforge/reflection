<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * laserreflection.action.php
 *
 * LaserReflection main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/laserreflection/laserreflection/myAction.html", ...)
 *
 */


  class action_laserreflection extends APP_GameAction {
    // Constructor: please do not modify
   	public function __default() {
  	    if( self::isArg( 'notifwindow') ) {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
  	    } else {
            $this->view = "laserreflection_laserreflection";
            self::trace( "Complete reinitialization of board game" );
      }
  	}

  	/* Player actions */

    public function teamSelect() {
      self::setAjaxMode();

      $player_no = self::getArg("no", AT_posint, true);
      $team = self::getArg("team", AT_posint, true);
      $this->game->action_teamSelect($player_no, $team);

      self::ajaxResponse();
    }

    public function teamValidate() {
      self::setAjaxMode();

      $this->game->action_teamValidate();

      self::ajaxResponse();
    }

    public function teamCancel() {
      self::setAjaxMode();

      $this->game->action_teamCancel();

      self::ajaxResponse();
    }

    public function gridChange() {
      self::setAjaxMode();

      $grid = self::getArg("grid", AT_json, true);
      self::trace("gridChange");
      self::dump("grid", $grid);
      $this->validateJsonGrid($grid);

      $progression = self::getArg("progression", AT_posint, true);
      $give_time = self::getArg("give_time", AT_bool, false, false);

      $this->game->action_changeGrid($grid, $progression, $give_time);

      self::ajaxResponse();
    }

    public function creationEnd() {
      self::setAjaxMode();

      $grid = self::getArg("grid", AT_json, true);
      $this->validateJsonGrid($grid);

      $puzzle = self::getArg("puzzle", AT_json, true);
      $this->validateJsonPuzzle($puzzle);

      $this->game->action_creationEnd($grid, $puzzle);

      self::ajaxResponse();
    }

    public function puzzleStart() {
      self::setAjaxMode();

      $this->game->action_start();

      self::ajaxResponse();
    }

    public function giveUp() {
      self::setAjaxMode();

      $this->game->action_giveup(false);

      self::ajaxResponse();
    }

    public function giveUpPropose() {
      self::setAjaxMode();

      $this->game->action_giveupPropose(false);

      self::ajaxResponse();
    }

    public function giveUpRefuse() {
      self::setAjaxMode();

      $this->game->action_giveupRefuse(false);

      self::ajaxResponse();
    }

    public function timeout() {
      self::setAjaxMode();

      $this->game->action_giveup(true);

      self::ajaxResponse();
    }

    public function puzzleResolve() {
      self::setAjaxMode();

      $grid = self::getArg( "grid", AT_json, true );
      self::trace("puzzleResolve");
      self::dump("grid", $grid);
      $this->validateJsonGrid($grid);
      $this->game->action_resolve($grid);

      self::ajaxResponse();
    }

    public function hideScore() {
      self::setAjaxMode();
      $this->game->action_hideScore();
      self::ajaxResponse();
    }

    public function hideSolution() {
      self::setAjaxMode();
      $this->game->action_hideSolution();
      self::ajaxResponse();
    }

    public function stopGame() {
      self::setAjaxMode();
      $this->game->action_stopGame();
      self::ajaxResponse();
    }

    /* Data verifications functions */

    private function validateJsonGrid($grid) {
      if (is_array($grid)) {
        foreach ($grid as $rowIndex => $row) {
          if (!is_int($rowIndex)) {
            throw new BgaSystemException("Bad grid value", true, true, FEX_bad_input_argument);
          }
          $this->validateJsonIntArray($row);
        }
      }
    }

    private function validateJsonIntArray($row) {
      if (is_array($row)) {
        foreach ($row as $index => $cellValue) {
          if (!is_int($index) || !is_int($cellValue)) {
            throw new BgaSystemException("Bad grid value", true, true, FEX_bad_input_argument);
          }
        }
      }
    }

    private function validateJsonPuzzle($puzzle) {
      if (is_array($puzzle)) {
        foreach ($puzzle as $rowIndex => $row) {
          if (!is_int($rowIndex)) {
            throw new BgaSystemException("Bad puzzle value", true, true, FEX_bad_input_argument);
          }
          $this->validateJsonStringArray($row);
        }
      }
    }

    private function validateJsonStringArray($row) {
      if (is_array($row)) {
        foreach ($row as $index => $cellValue) {
          if (!is_int($index) || !is_string($cellValue)) {
            throw new BgaSystemException("Bad grid value", true, true, FEX_bad_input_argument);
          }
        }
      }
    }
  }