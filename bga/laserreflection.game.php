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
  * laserreflection.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class LaserReflection extends Table {
	function __construct( ) {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels([
            "ended" => 10,
            "round" => 11,
            "rounds" => 12,
            "portal_1_row" => 20,
            "portal_1_col" => 21,
            "portal_2_row" => 22,
            "portal_2_col" => 23,
            "solo" => 30,
            "grid_size" => 120,
            "items_count" => 121,
            "black_hole" => 122,
            "light_warp" => 123,
            "auto_start" => 190,
            "clock_mode" => 200,
        ]);
	}

    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "laserreflection";
    }

    /*
        setupNewGame:

        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() ) {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
        $count_players = count($players);

        $grid_size = $this->getGameStateValue('grid_size');
        $items_count = $this->getGameStateValue('items_count');
        $black_hole = $this->getGameStateValue('black_hole') == 1;
        $light_warp = $this->getGameStateValue('light_warp') == 1;
        $auto_start = $this->getGameStateValue('auto_start');
        $items = $this->getRandomItems($black_hole, $items_count);

        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('elements', '".json_encode($items)."')";
        self::DbQuery($sql);
        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('grid_size', '".$grid_size."')";
        self::DbQuery($sql);
        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('auto_start', '".$auto_start."')";
        self::DbQuery($sql);

        // Create players
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach ($players as $player_id => $player) {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();

        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue('solo', ($count_players == 1) ? 1 : 0);
        self::setGameStateInitialValue('ended', 0);
        self::setGameStateInitialValue('round', 1);
        self::setGameStateInitialValue('rounds', $count_players - 1);
        self::setGameStateInitialValue('portal_1_row', -1);
        self::setGameStateInitialValue('portal_1_col', -1);
        self::setGameStateInitialValue('portal_2_row', -1);
        self::setGameStateInitialValue('portal_2_col', -1);

        if ($light_warp) {
            $this->getPortalsPositions();
        }
        if ($count_players == 1) {
            $grid = $this->getRandomGrid($items);
            $this->savePuzzleGrid($grid);
            $puzzle = $this->getGridPuzzle($grid);
            $this->savePuzzle($puzzle);
        }

        // Init game statistics
        self::initStat("table", "total_duration", 0);
        self::initStat("table", "avg_duration", 0);

        foreach( $players as $player_id => $player ) {
            self::initStat("player", "total_duration", 0, $player_id);
            self::initStat("player", "avg_duration", 0, $player_id);
        }
    }

    /*
        getAllDatas:

        Gather all informations about current game situation (visible by the current player).

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = array();

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        if ($this->getGameStateValue('ended') == 1) {
            $sql = "SELECT player_id id, player_score score, player_puzzle_grid grid, player_progression progression, player_start start, player_round_duration duration FROM player";
        } else if ($this->isSpectator()) {
            $sql = "SELECT player_id id, player_score score, player_grid grid, player_puzzle puzzle, player_progression progression, player_start start, player_round_duration duration FROM player";
        } else {
            $sql = "SELECT player_id id, player_score score, player_grid grid, player_progression progression, player_start start, player_round_duration duration FROM player";
        }

        $result['players'] = self::getCollectionFromDb($sql);

        $sql = "SELECT game_param, game_value FROM gamestatus";
        $result['params'] = self::getCollectionFromDb($sql);

        $startDate = new DateTime();
        $start = $startDate->getTimestamp();
        $result['server_time'] = $start;

        return $result;
    }

    function stGameInit() {
        if ($this->getGameStateValue('solo') == 1) {
            $this->gamestate->nextState("solo");
        } else {
            $this->gamestate->nextState("normal");
        }
    }

    function stCreatePuzzleInit() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();
    }

    function stCreatePuzzlePrivate() {
    }

    function argPlayPuzzleInit() {
        $result = array('_private' => array());
        $result = array('_public' => array());

        $round = $this->getGameStateValue('round');

        $sql = "SELECT player_id id, player_name name, player_grid grid, player_puzzle puzzle, player_puzzle_grid puzzle_grid, player_state state FROM player ORDER BY player_no";
        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);

        $jsonEmptyGrid = json_encode($this->getEmptyGrid());

        if ($cpt > 1) {
            for ($i=0; $i<$cpt; $i++) {
                $other_player_index = ($i + $round) % $cpt;
                $isStarted = $players[$i]['state'] == STATE_PLAY_PUZZLE_PRIVATE;
                $result['_private'][$players[$i]['id']] = array(
                    'grid' => ($isStarted) ? $players[$i]["grid"] : $jsonEmptyGrid,
                    'id' => $players[$other_player_index]["id"],
                    'name' => $players[$other_player_index]["name"],
                    'puzzle' => $players[$other_player_index]["puzzle"],
                    'started' => $isStarted,
                );
                $result['_public'][$players[$i]['id']] = array(
                    'id'=> $players[$other_player_index]["id"],
                );
            }
        } else {
            $sql = "SELECT game_value val FROM gamestatus WHERE game_param='puzzle'";
            $data = self::getObjectFromDB($sql);
            $jsonPuzzle = $data['val'];

            for ($i=0; $i<$cpt; $i++) {
                $isStarted = $players[$i]['state'] == STATE_PLAY_PUZZLE_PRIVATE;
                $result['_private'][$players[$i]['id']] = array(
                    'grid' => ($isStarted) ? $players[$i]["grid"] : $jsonEmptyGrid,
                    'puzzle' => $jsonPuzzle,
                    'started' => $isStarted,
                );
            }
        }

        return $result;
    }

    function stPlayPuzzleInit() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();

        $jsonGrid = json_encode($this->getEmptyGrid());

        foreach ($this->gamestate->getActivePlayerList() as $playerId) {
            $this->giveExtraTime($playerId, 60);

            self::notifyAllPlayers("progression", "", array(
                'player_id' => $playerId,
                'player_progression' => 0
            ));

            self::notifyAllPlayers("gridChange", "", array(
                'player_id' => $playerId,
                'player_grid' => $jsonGrid
            ));
        }

        $round = $this->getGameStateValue('round');
        $rounds = $this->getGameStateValue('rounds');

        self::notifyAllPlayers("log", clienttranslate('Start of round ${round} of ${rounds}'), array (
            'round' => $round,
            'rounds' => $rounds
        ));
    }

    function stEndRound() {
        $grid = $this->getEmptyGrid();

        if ($this->getGameStateValue('solo') == 1) {
            $playerId = $this->getCurrentPlayerId();
            $playerScore = 1;

            self::notifyAllPlayers("log", clienttranslate('${player_name} scores ${points} points'), array (
                'player_name' => self::getCurrentPlayerName(),
                'points' => $playerScore
            ));

            $sql = "UPDATE player SET player_grid='".json_encode($grid)."', player_round_score=".$playerScore.", player_score = player_score + ".$playerScore." WHERE player_id = ".$playerId;
            self::DbQuery($sql);

            $this->gamestate->nextState("next");
        } else {
            $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_grid grid FROM player ORDER BY player_round_duration";
            $players = self::getObjectListFromDB($sql);
            $cpt = count($players);
            $rounds = $this->getGameStateValue('rounds');
            $scorePart = (120 / $rounds) / $cpt;

            $prevScore = 0;
            $prevDuration = 0;

            for ($i=0; $i<$cpt; $i++) {
                $playerId = $players[$i]['id'];
                $duration =  $players[$i]['duration'];
                $playerName = $players[$i]['name'];

                if ($duration == $prevDuration) {
                    $playerScore = $prevScore;
                } else if ($duration >= 6666) {
                    $playerScore = -floor($scorePart);
                } else {
                    $playerScore = floor(($cpt - $i) * $scorePart);
                    $prevDuration = $duration;
                    $prevScore = $playerScore;
                }

                if ($playerScore < 0) {
                    self::notifyAllPlayers("log", clienttranslate('${player_name} loses ${points} points'), array (
                        'player_name' => $playerName,
                        'points' => -$playerScore
                    ));
                } else {
                    self::notifyAllPlayers("log", clienttranslate('${player_name} scores ${points} points'), array (
                        'player_name' => $playerName,
                        'points' => $playerScore
                    ));
                }

                $sql = "UPDATE player SET player_grid='".json_encode($grid)."', player_round_score=".$playerScore.", player_score = player_score + ".$playerScore.", player_score_aux = player_score_aux - ".$duration." WHERE player_id = ".$playerId;
                self::DbQuery($sql);
            }

            $this->sendRoundScore();

            $round = $this->getGameStateValue('round') + 1;

            if ($round > $rounds) {
                // end of game !
                $this->setGameStateValue('ended', 1);
                $this->calcStats();
                $this->sendPlayersPuzzle();
                $this->gamestate->nextState("endGame");
            } else {
                $this->setGameStateValue('round', $round);

                $clock_mode = $this->getGameStateValue('clock_mode');
                if ($clock_mode > 9) {
                    // turn-based mode, skip the display of round score
                    foreach($players as $player) {
                        self::notifyAllPlayers("progression", "", array(
                            'player_id' => $player["id"],
                            'player_progression' => 0
                        ));
                    }

                    $sql = "UPDATE player SET player_progression=0, player_start=0, player_round_duration=0";
                    self::DbQuery($sql);

                    $this->gamestate->nextState("next");
                } else {
                    $this->gamestate->setAllPlayersMultiactive();
                    $this->gamestate->initializePrivateStateForAllActivePlayers();
                }
            }
        }
    }

    /* Player actions */

    function action_changeGrid($grid, $progression) {
        $jsonGrid = json_encode($grid);
        $playerId = $this->getCurrentPlayerId();

        /*
        $sql = "UPDATE player SET player_grid='".$jsonGrid."', player_progression=".$progression." WHERE player_id='".$playerId."'";
        self::DbQuery($sql);
        */

        self::notifyAllPlayers("progression", "", array(
            'player_id' => $playerId,
            'player_progression' => $progression
        ));

        self::notifyAllPlayers("gridChange", "", array(
            'player_id' => $playerId,
            'player_grid' => $jsonGrid
        ));

        if ($progression == 100) {
            $this->gamestate->nextPrivateState($playerId, 'continue');
        }
    }

    function action_setDefaultPuzzle($puzzleGrid, $puzzle) {
        $playerId = $this->getCurrentPlayerId();
        $jsonPuzzle = json_encode($puzzle);

        $sql = "UPDATE player SET player_puzzle_grid='".json_encode($puzzleGrid)."', player_puzzle='".$jsonPuzzle."' WHERE player_id='".$playerId."' OR player_puzzle_grid is null";
        self::DbQuery($sql);

        self::notifyAllPlayers("puzzleChange", "", array(
            'player_id' => $playerId,
            'player_puzzle' => $jsonPuzzle,
            'default' => true
        ));
    }

    function action_creationEnd($puzzleGrid, $puzzle) {
        $playerId = $this->getCurrentPlayerId();
        $jsonGrid = json_encode($puzzleGrid);
        $jsonPuzzle = json_encode($puzzle);

        $sql = "UPDATE player SET player_grid='".$jsonGrid."', player_puzzle_grid='".$jsonGrid."', player_puzzle='".$jsonPuzzle."', player_progression=100, player_start=0 WHERE player_id='".$playerId."'";
        self::DbQuery($sql);

        self::notifyAllPlayers("log", clienttranslate('${player_name} submitted their puzzle'), array (
            'player_name' => self::getCurrentPlayerName()
        ));

        self::notifyAllPlayers("puzzleChange", "", array(
            'player_id' => $playerId,
            'player_puzzle' => $jsonPuzzle,
            'default' => false
        ));

        self::notifyAllPlayers("progression", "", array(
            'player_id' => $playerId,
            'player_progression' => 100
        ));

        self::notifyAllPlayers("gridChange", "", array(
            'player_id' => $playerId,
            'player_grid' => $jsonGrid
        ));

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_start() {
        $startDate = new DateTime();
        $playerId = $this->getCurrentPlayerId();
        $start = $startDate->getTimestamp();
        $grid = $this->getEmptyGrid();

        $sql = "UPDATE player SET player_progression=0, player_start=".$start.", player_grid='".json_encode($grid)."' WHERE player_id='".$playerId."' AND player_start=0";
        self::DbQuery($sql);

        $this->sendPlayerStartNotification($start);

        $this->gamestate->nextPrivateState($playerId, 'continue');
    }

    function action_resolve($grid) {
        $endDate = new DateTime();
        $playerId = $this->getCurrentPlayerId();
        $end = $endDate->getTimestamp();

        $sql = "SELECT player_start start, player_total_duration total FROM player WHERE player_id='".$playerId."'";
        $player = self::getObjectFromDB($sql);

        $duration = $end - $player["start"];
        $durationStr = $this->getDurationStr($duration);
        $total = $player["total"] + $duration;
        $jsonGrid = json_encode($grid);

        $sql = "UPDATE player SET player_grid='".$jsonGrid."', player_rounds=player_rounds+1, player_progression=100, player_start=0, player_round_duration=".$duration.", player_total_duration=".$total." WHERE player_id='".$playerId."'";
        self::DbQuery($sql);

        self::notifyAllPlayers("progression", "", array(
            'player_id' => $playerId,
            'player_progression' => 100
        ));

        self::notifyAllPlayers("gridChange", "", array(
            'player_id' => $playerId,
            'player_grid' => $jsonGrid
        ));

        self::notifyAllPlayers("stop", clienttranslate('${player_name} solved their puzzle in ${duration}'), array (
            'player_name' => self::getCurrentPlayerName(),
            'duration' => $durationStr,
            'player_id' => $playerId
        ));

        self::notifyPlayer($playerId, "gridStatus", "", array(
            'grid' => $jsonGrid
        ));

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_giveup() {
        $playerId = $this->getCurrentPlayerId();

        $this->giveUp($playerId);

        self::notifyAllPlayers("stop", clienttranslate('${player_name} found the puzzle too hard and give up'), array (
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $playerId
        ));

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_hideScore() {
        $playerId = $this->getCurrentPlayerId();

        if ($this->getGameStateValue('ended') == 0) {
            self::notifyAllPlayers("log", clienttranslate('${player_name} is ready for the next round'), array (
                'player_name' => self::getCurrentPlayerName()
            ));

            self::notifyAllPlayers("progression", "", array(
                'player_id' => $playerId,
                'player_progression' => 0
            ));

            $sql = "UPDATE player SET player_progression=0, player_start=0, player_round_duration=0 WHERE player_id='".$playerId."'";
            self::DbQuery($sql);
        }

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    /*
        getGameProgression:

        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).

        This method is called each time we are in a game state with the "updateGameProgression" property set to true
        (see states.inc.php)
    */
    function getGameProgression() {
        $state = $this->gamestate->state();
        $stateName = $state['name'];

        if ($stateName == "endRound") {
            $round = $this->getGameStateValue('round');
            $rounds = $this->getGameStateValue('rounds');

            if ($round >= $rounds) {
                return 100;
            }
        }

        if ($this->getGameStateValue('ended') == 1) {
            return 100;
        }

        $cpt = self::getPlayersNumber();
        $round = $this->getGameStateValue('round');
        return round(100 * $round / $cpt);
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function getRandomItems($black_hole, $items_count) {
        $max = ($black_hole) ? 209 : 199;
        $quality = 0;
        $items = array();

        while ($quality <= ($items_count/2)) {
            $i = 0;
            $quality = 0;
            $items = array();

            if ($items_count > 5) {
                $quality = 2;
                $items[$i++] = 1;
                $items[$i++] = 2;
                $items[$i++] = 3 + rand(0, 2);
                if ($black_hole) {
                    $items[$i++] = 6;
                }
            }

            while ($i < $items_count) {
                $r = rand(0, $max);
                if ($r < 60) {
                    $quality++;
                    $items[$i] = 1; // slash
                } else if ($r < 120) {
                    $quality++;
                    $items[$i] = 2; // backslash
                } else if ($r < 150) {
                    $items[$i] = 3; // vertical
                } else if ($r < 180) {
                    $items[$i] = 4; // horizontal
                } else if ($r < 200) {
                    $items[$i] = 5; // square
                } else {
                    $items[$i] = 6; // black hole
                }
                $i++;
            }
        }

        return $items;
    }

    function getPortalsPositions() {
        $grid_size = $this->getGameStateValue('grid_size');

        $row1 = -1;
        $col1 = -1;
        $row2 = -1;
        $col2 = -1;

        while ($row1 ==  $row2 && $col1 == $col2) {
            $row1 = rand(0, $grid_size - 1);
            $col1 = rand(0, $grid_size - 1);
            $row2 = rand(0, $grid_size - 1);
            $col2 = rand(0, $grid_size - 1);
        }

        $portals[] = $row1;
        $portals[] = $col1;
        $portals[] = $row2;
        $portals[] = $col2;

        $sql = "DELETE FROM gamestatus WHERE game_param='portals'";
        self::DbQuery($sql);

        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('portals', '".json_encode($portals)."')";
        self::DbQuery($sql);

        self::setGameStateValue('portal_1_row', $row1);
        self::setGameStateValue('portal_1_col', $col1);
        self::setGameStateValue('portal_2_row', $row2);
        self::setGameStateValue('portal_2_col', $col2);

        return $portals;
    }

    function getEmptyGrid() {
        $grid_size = $this->getGameStateValue('grid_size');
        $grid = array();
        for ($i=0; $i<$grid_size; $i++) {
            $grid[$i] = array_fill(0, $grid_size, 0);
        }

        if ($this->getGameStateValue('light_warp') == 1) {
            $row1 = $this->getGameStateValue('portal_1_row');
            $col1 = $this->getGameStateValue('portal_1_col');
            $row2 = $this->getGameStateValue('portal_2_row');
            $col2 = $this->getGameStateValue('portal_2_col');

            $grid[$row1][$col1] = 7;
            $grid[$row2][$col2] = 7;
        }

        return $grid;
    }

    function getRandomGrid($items) {
        $grid = $this->getEmptyGrid();
        $grid_size = count($grid);
        $items_count = count($items);
        $index = 0;

        while ($index < $items_count) {
            $row = rand(0, $grid_size - 1);
            $col = rand(0, $grid_size - 1);

            if ($grid[$row][$col] == 0) {
                $grid[$row][$col] = $items[$index];
                ++$index;
            }
        }

        return $grid;
    }

    function savePuzzleGrid($grid) {
        $sql = "DELETE FROM gamestatus WHERE game_param='grid'";
        self::DbQuery($sql);

        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('grid', '".json_encode($grid)."')";
        self::DbQuery($sql);
    }

    function getGridPuzzle($grid) {
        $grid_size = count($grid);
        $puzzle = [];

        for ($position=0; $position<4; $position++) {
            $puzzle[$position] = [];

            for ($index=0; $index<$grid_size; $index++) {
                $puzzle[$position][$index] = $this->getExit($grid, $position, $index);
            }
        }

        return $puzzle;
    }

    function savePuzzle($puzzle) {
        $sql = "DELETE FROM gamestatus WHERE game_param='puzzle'";
        self::DbQuery($sql);

        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('puzzle', '".json_encode($puzzle)."')";
        self::DbQuery($sql);
    }

    function getExit($grid, $position, $index) {
        $grid_size = count($grid);
        $incRow = [-1, 0, 1, 0];
        $incCol = [0, 1, 0, -1];
        $transMatrice = [[0, 1, 2, 3], [1, 0, 3, 2], [3, 2, 1, 0], [0, 3, 2, 1], [2, 1, 0, 3], [2, 3, 0, 1], [-1, -1, -1, -1], [0, 1, 2, 3]];
        $distance = 1;
        $exited = false;

        switch ($position) {
            case 0: // top
                $row = 0;
                $col = $index;
                $direction = 2;
                break;
            case 1: // right
                $row = $index;
                $col = $grid_size - 1;
                $direction = 3;
                break;
            case 2: // bottom
                $row = $grid_size - 1;
                $col = $index;
                $direction = 0;
                break;
            case 3: // left
                $row = $index;
                $col = 0;
                $direction = 1;
                break;
        }

        while (!$exited) {
            $eltType = $grid[$row][$col];
            $direction = $transMatrice[$eltType][$direction];

            if ($direction < 0) {
                return $distance.'a';
            }

            if ($eltType == 7) {
                if ($this->getGameStateValue('portal_1_row') == $row && $this->getGameStateValue('portal_1_col') == $col) {
                    $row = $this->getGameStateValue('portal_2_row');
                    $col = $this->getGameStateValue('portal_2_col');
                } else {
                    $row = $this->getGameStateValue('portal_1_row');
                    $col = $this->getGameStateValue('portal_1_col');
                }
                ++$distance;
            }

            $row += $incRow[$direction];
            $col += $incCol[$direction];

            if ($row < 0) {
                $exited = true;
                $exit_side = 0;
                $exit_index = $col;
            } else if ($row >= $grid_size) {
                $exited = true;
                $exit_side = 2;
                $exit_index = $col;
            } else if ($col < 0) {
                $exited = true;
                $exit_side = 3;
                $exit_index = $row;
            } else if ($col >= $grid_size) {
                $exited = true;
                $exit_side = 1;
                $exit_index = $row;
            } else {
                ++$distance;
            }
        }

        if ($exit_side == $position && $exit_index == $index) {
            return $distance.'r';
        }

        return $distance.'s';
    }

    function getDurationStr($duration) {
        if ($duration >= 6666) {
            return clienttranslate("Give up");
          }
          $seconds = $duration % 60;
          $minutes = ($duration - $seconds) / 60;

          return str_pad($minutes, 2, "0", STR_PAD_LEFT).":".str_pad($seconds, 2, "0", STR_PAD_LEFT);
    }

    function sendRoundScore() {
        $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_round_score score FROM player ORDER BY player_round_score DESC";
        $players = self::getObjectListFromDB($sql);

        $roundScoreText = clienttranslate("Round score");
        $roundDurationText = clienttranslate("Round duration");

        $firstRow = array('');
        $secondRow = array($roundDurationText);
        $thirdRow = array($roundScoreText);
        $roundScores = array();

        foreach ($players as $player_id => $player) {
            $firstRow[] = array(
                'str' => '${player_name}',
                'args' => array('player_name' => $player['name']),
                'type' => 'header'
            );
            $secondRow[] = array(
                'str' => '${player_duration}',
                'args' => array('player_duration' =>  $this->getDurationStr($player['duration']))
            );
            $thirdRow[] = array(
                'str' => '${player_score}',
                'args' => array('player_score' => $player['score'])
            );
            $roundScores[$player['id']] = $player['score'];
        }

        $table[] = $firstRow;
        $table[] = $secondRow;
        $table[] = $thirdRow;

        $this->notifyAllPlayers("tableWindow", '', array(
            "id" => 'roundScoring',
            "title" => $roundScoreText,
            "table" => $table,
            "closing" => clienttranslate("Close")
        ));

        self::notifyAllPlayers("roundScores", '', array('roundScores' => $roundScores));
    }

    function calcStats() {
        $sql = "SELECT player_id id, player_total_duration duration, player_rounds rounds FROM player";
        $players = self::getObjectListFromDB($sql);

        $tableDuration = 0;
        $tableRounds = 0;

        foreach ($players as $player_id => $player) {
            $playerId = $player['id'];
            $playerDuration = $player['duration'];
            $playerRounds = $player['rounds'];

            if ($playerRounds > 0) {
                $avg = round($playerDuration / $playerRounds);

                $tableDuration = $tableDuration + $playerDuration;
                $tableRounds = $tableRounds + $playerRounds;

                self::setStat($playerDuration, "total_duration", $playerId);
                self::setStat($avg, "avg_duration", $playerId);
            }
        }

        if ($tableRounds > 0) {
            $avg = round($tableDuration / $tableRounds);
            self::setStat($tableDuration, "total_duration");
            self::setStat($avg, "avg_duration");
        }
    }

    function giveUp($playerId) {
        $sql = "UPDATE player SET player_start=0, player_round_duration=6666 WHERE player_id='".$playerId."'";
        self::DbQuery($sql);
    }

    function sendPlayersPuzzle() {
        $sql = "SELECT player_id id, player_puzzle_grid grid FROM player";
        $players = self::getObjectListFromDB($sql);

        $puzzles = array();
        foreach ($players as $player_id => $player) {
            $playerId = $player['id'];
            $puzzles[$playerId] = $player['grid'];
        }

        self::notifyAllPlayers("playersPuzzle", '', array('puzzles' => $puzzles));
    }

    function sendPlayerStartNotification($start) {
        $round = $this->getGameStateValue('round');
        $playerId = $this->getCurrentPlayerId();

        $sql = "SELECT player_id id, player_name name FROM player ORDER BY player_no";
        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);

        for ($i=0; $i<$cpt; $i++) {
            if ($players[$i]["id"] == $playerId) {
                $other_player_index = ($i + $round) % $cpt;
                self::notifyAllPlayers("start", clienttranslate('${player_name} has started to work on ${other_player_name}\'s puzzle'), array (
                    'player_name' => self::getCurrentPlayerName(),
                    'other_player_name' => $players[$other_player_index]["name"],
                    'player_id' => $playerId,
                    'start' => $start
                ));
                break;
            }
        }
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:

        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).

        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message.
    */

    function zombieTurn($state, $active_player) {
    	$statename = $state['name'];

        $sql = "UPDATE player SET player_start=0, player_round_duration=6666 WHERE player_zombie=1 AND player_round_duration=0";
        self::DbQuery($sql);

        if ($state['type'] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, 'next');
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }

///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:

        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.

    */

    function upgradeTableDb( $from_version ) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB($sql);
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB($sql);
//        }
//        // Please add your future database scheme changes here
//
//


    }
}
