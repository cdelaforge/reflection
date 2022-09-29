<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * laserreflection.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in laserreflection_laserreflection.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */

  require_once( APP_BASE_PATH."view/common/game.view.php" );

  class view_laserreflection_laserreflection extends game_view {
    function getGameName() {
        return "laserreflection";
    }
  	function build_page($viewArgs) {
  	    // Get players
        $players = $this->game->loadPlayersBasicInfos();

        /*********** Place your code below:  ************/
        global $g_user;

        $this->tpl['SPECTATOR_TEXT'] = self::_("As a spectator, you can only see the players' boards if the game is in training mode.");
        $this->tpl['BOARDS'] = self::_("Players' boards");
        $this->tpl['PUZZLES'] = self::_("Players' puzzles");

        $this->page->begin_block("laserreflection_laserreflection", "player_puzzle");
        foreach ($players as $player) {
            $data = array(
                "PLAYER_NAME" => $player['player_name'],
                "PLAYER_ID" => $player['player_id'],
                "PLAYER_SELECTED" => $player['player_id'] == $g_user->get_id() ? "selected" : ""
            );
            $this->page->insert_block("player_puzzle", $data);
        }

        $this->page->begin_block("laserreflection_laserreflection", "player_board");
        foreach ($players as $player) {
            $data = array(
                "PLAYER_NAME" => $player['player_name'],
                "PLAYER_ID" => $player['player_id'],
            );
            $this->page->insert_block("player_board", $data);
        }

        $this->page->begin_block("laserreflection_laserreflection", "player_duration");
        foreach ($players as $player) {
            $data = array(
                "PLAYER_NAME" => $player['player_name'],
                "PLAYER_ID" => $player['player_id'],
                "PLAYER_COLOR" => $player['player_color'],
            );
            $this->page->insert_block("player_duration", $data);
        }

        $this->tpl['ASTERISK'] = self::_("if the content of the grid is different from the expected one");
        $this->tpl['ROUND_DURATION'] = self::_("Duration");
        $this->tpl['PLAYER_BOARD'] = self::_("Board");
        $this->tpl['ROUND_PUZZLES'] = self::_("Puzzles of each round");
        $this->tpl['TEAM_SELECTION'] = self::_("Team selection");
        $this->tpl['TEAM_1'] = self::_("Mages");
        $this->tpl['TEAM_2'] = self::_("Vampires");
        $this->tpl['TEAM_3'] = self::_("Aliens");

        /*********** Do not change anything below this line  ************/
  	}
  }
