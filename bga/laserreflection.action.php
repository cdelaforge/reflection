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
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    } else {
            $this->view = "laserreflection_laserreflection";
            self::trace( "Complete reinitialization of board game" );
      }
  	}

  	/* Player actions */

    public function gridChange() {
      self::setAjaxMode();

      $grid = self::getArg( "grid", AT_json, true );
      self::trace("gridChange");
      self::dump("grid", $grid);
      $this->validateJsonGrid($grid);

      try {
        $puzzle = self::getArg("defPuzzle", AT_json, true);
        $this->validateJsonPuzzle($puzzle);

        $defGrid = self::getArg("defGrid", AT_json, true);
        $this->validateJsonGrid($defGrid);

        $this->game->action_setDefaultPuzzle($defGrid, $puzzle);
      } catch (Exception $e) {} // normal if the player doesn't send default puzzle

      $progression = self::getArg("progression", AT_posint, true);

      $this->game->action_changeGrid($grid, $progression);

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

      $this->game->action_giveup();

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

    public function scoreDisplayEnd() {
      self::setAjaxMode();
      $this->game->action_hideScore();
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