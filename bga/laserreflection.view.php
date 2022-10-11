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
        $this->tpl['SEED'] = self::_("Seed code of the puzzle");
        $this->tpl['ROUND_DURATION'] = self::_("Duration");
        $this->tpl['PLAYER_BOARD'] = self::_("Board");
        $this->tpl['ROUND_PUZZLES'] = self::_("Puzzles of each round");
        $this->tpl['TEAM_SELECTION'] = self::_("Team selection");
        $this->tpl['TEAM_1'] = self::_("Mages");
        $this->tpl['TEAM_2'] = self::_("Vampires");
        $this->tpl['TEAM_3'] = self::_("Aliens");

        $this->tpl['BTN_COPY'] = "<svg aria-hidden='true' height='16' viewBox='0 0 16 16' width='16' data-view-component='true'>
            <path fill-rule='evenodd' d='M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z'></path>
            <path fill-rule='evenodd' d='M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z'></path>
        </svg>";
        $this->tpl['BTN_COPIED'] = "<svg aria-hidden='true' height='16' viewBox='0 0 16 16' width='16' data-view-component='true'>
            <g fill='#1a7f37'>
                <path fill-rule='evenodd' d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'></path>
            </g>
        </svg>";

        /*********** Do not change anything below this line  ************/
  	}
  }
