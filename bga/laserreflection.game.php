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
    public function __construct( ) {
        parent::__construct();

        self::initGameStateLabels([
            "game_state" => 1,
            "ended" => 10,
            "round" => 11,
            "rounds" => 12,
            "portal_1_row" => 20,
            "portal_1_col" => 21,
            "portal_2_row" => 22,
            "portal_2_col" => 23,
            "solo" => 30,
            "count_players" => 31,
            "prev_resting" => 39,
            "resting" => 40,
            "player_team_1" => 50,
            "player_team_2" => 51,
            "player_team_3" => 52,
            "player_team_4" => 53,
            "player_team_5" => 54,
            "player_team_6" => 55,
            "giveup_propose_1" => 60,
            "giveup_propose_2" => 61,
            "giveup_propose_3" => 62,
            "giveup_agree_1" => 70,
            "giveup_agree_2" => 71,
            "giveup_agree_3" => 72,
            "giveup_agree_4" => 73,
            "giveup_agree_5" => 74,
            "giveup_agree_6" => 75,
            "multi_mode" => 103,
            "solo_mode" => 104,
            "teams" => 106,
            "rounds_param" => 108,
            "compete_same" => 109,
            "time_limit" => 119,
            "grid_size" => 120,
            "items_count" => 121,
            "black_hole" => 122,
            "light_warp" => 123,
            "auto_start" => 190,
            "training_mode" => 201,
        ]);


	}

    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "laserreflection";
    }

    /*
        setupNewGame:

        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = []) {
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
        $multi_mode = $this->getGameStateValue('multi_mode');
        $compete_same = $this->getGameStateValue('compete_same');
        $items = $this->getRandomItems($black_hole, $items_count);
        $jsonItems = json_encode($items);

        $this->setGameDbValue('elements', $jsonItems);
        $this->setGameDbValue('grid_size', $grid_size);
        $this->setGameDbValue('auto_start', $auto_start);

        // Create players
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
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

        self::setGameStateInitialValue('count_players', $count_players);
        self::setGameStateInitialValue('solo', ($count_players == 1) ? 1 : 0);
        self::setGameStateInitialValue('ended', 0);
        self::setGameStateInitialValue('round', 1);
        self::setGameStateInitialValue('prev_resting', 0);
        self::setGameStateInitialValue('resting', 0);

        for ($i=1; $i<=3; $i++) {
            self::setGameStateInitialValue('giveup_propose_'.$i, 0);
        }

        for ($i=1; $i<=6; $i++) {
            self::setGameStateInitialValue('player_team_'.$i, 0);
            self::setGameStateInitialValue('giveup_agree_'.$i, 0);
        }

        if ($count_players == 1) {
            self::setGameStateInitialValue('rounds', 0);
        } else if ($multi_mode == 10) {
            self::setGameStateInitialValue('rounds', $this->getGameStateValue('rounds_param'));
        } else if ($compete_same == 1) {
            self::setGameStateInitialValue('rounds', $count_players);
        } else {
            self::setGameStateInitialValue('rounds', $count_players - 1);
        }

        self::setGameStateInitialValue('portal_1_row', -1);
        self::setGameStateInitialValue('portal_1_col', -1);
        self::setGameStateInitialValue('portal_2_row', -1);
        self::setGameStateInitialValue('portal_2_col', -1);

        if ($light_warp) {
            $this->getPortalsPositions();
        }

        if ($count_players == 1 || $multi_mode == 10) {
            $puzzle = $this->getRandomGridAndPuzzle($items);
            $this->setGameDbValue('grid', $puzzle['grid']);
            $this->setGameDbValue('puzzle', $puzzle['puzzle']);
            $this->setGameDbValue('rg_0', $puzzle['grid']);
        }

        if ($multi_mode == 0 && $compete_same == 1 && $count_players > 2) {
            // calc the first resting player
            $restingPlayer = $this->getRestingPlayer();
            $this->setRestingPlayerId($restingPlayer['id']);
        }

        // Init game statistics
        self::initStat("table", "total_duration", 0);
        self::initStat("table", "avg_duration", 0);

        foreach ($players as $player_id => $player) {
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
        $result = [];

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
        $gameEnded = $this->isGameEnded();

        if ($gameEnded) {
            $sql = "SELECT player_id id, player_no num, player_score score, player_puzzle_grid grid, player_progression progression, player_start start, player_round_duration duration, player_state state FROM player";
        } else if ($this->isSpectator() && $this->isTrainingMode()) {
            $sql = "SELECT player_id id, player_no num, player_score score, player_grid grid, player_puzzle puzzle, player_progression progression, player_start start, player_round_duration duration, player_state state FROM player";
        } else if ($this->isSpectator()) {
            $sql = "SELECT player_id id, player_no num, player_score score, player_progression progression, player_start start, player_round_duration duration, player_state state FROM player";
        } else {
            $sql = "SELECT player_id id, player_no num, player_score score, CASE WHEN player_id=$current_player_id THEN player_grid else NULL end grid, player_progression progression, player_start start, player_round_duration duration, player_state state FROM player";
        }

        $players = self::getCollectionFromDb($sql);
        foreach ($players as $id => $player) {
            $players[$id]['team'] = $this->getPlayerTeam($players[$id]['num']);
        }
        $result['players'] = $players;

        $sql = "SELECT game_param 'key', game_value val FROM gamestatus WHERE game_param IN ('auto_start', 'elements', 'grid_size', 'portals')";
        $result['params'] = self::getObjectListFromDB($sql);
        $result['params'][] = ['key' => 'random', 'val' => $this->isModeRandom()];
        $result['params'][] = ['key' => 'ended', 'val' => $this->isGameEnded()];
        $result['params'][] = ['key' => 'time_limit', 'val' => $this->getGameStateValue('time_limit')];
        $result['params'][] = ['key' => 'training_mode', 'val' => $this->isTrainingMode()];
        $result['params'][] = ['key' => 'teams', 'val' => $this->getTeamsCount()];

        $collectiveGiveup = [
            'teams' => [
                $this->getGameStateValue('giveup_propose_1'),
                $this->getGameStateValue('giveup_propose_2'),
                $this->getGameStateValue('giveup_propose_3')
            ],
            'players' => [
                $this->getGameStateValue('giveup_agree_1'),
                $this->getGameStateValue('giveup_agree_2'),
                $this->getGameStateValue('giveup_agree_3'),
                $this->getGameStateValue('giveup_agree_4'),
                $this->getGameStateValue('giveup_agree_5'),
                $this->getGameStateValue('giveup_agree_6')
            ]
        ];
        $result['params'][] = ['key' => 'giveup', 'val' => $collectiveGiveup];

        if ($this->isModeResting()) {
            $restingPlayerId = $gameEnded ?  $this->getRestingPlayerId() : $this->getPreviouslyRestingPlayerId();
            $result['params'][] = ['key' => 'same_puzzle', 'val' => true];
            $result['params'][] = ['key' => 'resting_player', 'val' => $restingPlayerId];
        }

        if ($this->isModeRandom()) {
            if ($this->isGameEnded()) {
                $sql = "SELECT game_value grid FROM gamestatus WHERE game_param LIKE 'rg_%' ORDER BY game_param";
                $grids = self::getObjectListFromDB($sql);

                $puzzles = [];
                foreach ($grids as $grid_id => $elt) {
                    $puzzles[] = $elt['grid'];
                }
                $result['puzzles'] = $puzzles;
            } else {
                $result['round_puzzle'] = $this->getGameDbValue('puzzle');
            }
        }

        $startDate = new DateTime();
        $start = $startDate->getTimestamp();
        $result['server_time'] = $start;

        return $result;
    }

    function stGameInit() {
        if ($this->isModeSolo()) {
            $this->gamestate->nextState("solo");
        } else if ($this->getTeamsCount() > 0) {
            $this->gamestate->nextState("team_selection");
        } else if ($this->isModeMultiRandom()) {
            $this->gamestate->nextState("random");
        } else {
            $this->gamestate->nextState("normal");
        }
    }

    function stTeamSelectionInit() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();
    }

    function stCreatePuzzleInit() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();
    }

    function stCreatePuzzlePrivate() {
    }

    function stCreatePuzzleEnd() {
        $sql = "UPDATE player SET player_grid=NULL";
        self::DbQuery($sql);

        $this->gamestate->nextState("next");
    }

    function argPlayPuzzleInit() {
        $result = [];

        $round = $this->getRound();

        $sql = "SELECT player_id id, player_name name, player_grid grid, player_puzzle puzzle, player_state state FROM player ORDER BY player_no";
        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);

        if ($this->isModeRandom()) {
            $jsonPuzzle = $this->getGameDbValue('puzzle');
            $jsonElements = $this->getGameDbValue('elements');
            $light_warp = $this->getGameStateValue('light_warp') == 1;
            $jsonPortals = $light_warp ? $this->getGameDbValue('portals') : null;

            for ($i=0; $i<$cpt; $i++) {
                $result['_private'][$players[$i]['id']] = [
                    'grid' => $players[$i]["grid"],
                    'puzzle' => $jsonPuzzle,
                    'elements' => $jsonElements,
                    'portals' => $jsonPortals,
                ];
                $result['_public'][$players[$i]['id']] = [
                    'id'=> $players[$i]["id"],
                ];
            }
        } else if ($this->isModeResting()) {
            $restingPlayerId = $this->getRestingPlayerId();
            $jsonPuzzle = null;
            $restingPlayerName = null;

            for ($i=0; $i<$cpt; $i++) {
                if ($players[$i]["id"] == $restingPlayerId) {
                    $jsonPuzzle = $players[$i]["puzzle"];
                    $restingPlayerName = $players[$i]["name"];
                    break;
                }
            }

            for ($i=0; $i<$cpt; $i++) {
                $other_player_index = ($i + $round) % $cpt;
                $result['_private'][$players[$i]['id']] = [
                    'grid' => $players[$i]["grid"],
                    'id' => $restingPlayerId,
                    'name' => $restingPlayerName,
                    'puzzle' => $jsonPuzzle,
                ];
                $result['_public'][$players[$i]['id']] = [
                    'id'=> $restingPlayerId,
                ];
            }
        } else {
            for ($i=0; $i<$cpt; $i++) {
                $other_player_index = ($i + $round) % $cpt;
                $result['_private'][$players[$i]['id']] = [
                    'grid' => $players[$i]["grid"],
                    'id' => $players[$other_player_index]["id"],
                    'name' => $players[$other_player_index]["name"],
                    'puzzle' => $players[$other_player_index]["puzzle"],
                ];
                $result['_public'][$players[$i]['id']] = [
                    'id'=> $players[$other_player_index]["id"],
                ];
            }
        }

        return $result;
    }

    function argSolutionDisplay() {
        $playerId = $this->getCurrentPlayerId();

        if ($this->isModeRandom()) {
            $jsonGrid = $this->getGameDbValue('grid');
        } else {
            $owner = $this->getPuzzleOwner($playerId);
            $jsonGrid = $owner["puzzleGrid"];
        }

        $result = ['grid' => $jsonGrid];

        return $result;
    }

    function stPlayPuzzleInit() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();

        $jsonGrid = json_encode($this->getEmptyGrid());

        foreach ($this->gamestate->getActivePlayerList() as $playerId) {
            $this->giveExtraTime($playerId);

            $this->notifyProgression($playerId, 0);

            self::notifyPlayer($playerId, "gridChange", "", [
                'player_id' => $playerId,
                'player_grid' => $jsonGrid
            ]);
        }

        $round = $this->getRound();
        $rounds = $this->getRounds();

        if ($rounds == 0) {
            self::notifyAllPlayers("roundStart", clienttranslate('Start of round ${round}'), ['round' => $round]);
        } else {
            self::notifyAllPlayers("roundStart", clienttranslate('Start of round ${round} of ${rounds}'), [
                'round' => $round,
                'rounds' => $rounds
            ]);

            $restingPlayer = $this->getRestingPlayer();
            if ($restingPlayer != null) {
                self::notifyAllPlayers("log", clienttranslate('In this round, all players will work on ${player_name}\'s puzzle.'), [
                    'player_name' => $restingPlayer['name']
                ]);

                $this->gamestate->setPlayerNonMultiactive($restingPlayer['id'], 'next');
            }
        }
    }

    function stEndRound() {
        if ($this->isRealtimeTeamMode()) {
            $this->stEndRound_TeamRealtime();
        } else if ($this->getTeamsCount() > 0) {
            $this->stEndRound_TeamTurnBased();
        } else if ($this->isModeSolo()) {
            $this->stEndRound_Solo();
        } else {
            $this->stEndRound_Classic();
        }
    }

    function stEndRound_TeamRealtime() {
        $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_grid grid FROM player ORDER BY player_round_duration";

        $players = self::getObjectListFromDB($sql);
        $playersCpt = count($players);
        $teamsCpt = $this->getTeamsCount();
        $rounds = $this->getRounds();
        $scorePart = (120 / $rounds) / $teamsCpt;

        $prevScore = 0;
        $prevDuration = 0;
        $teamIndex = 0;
        $teamScore = [0, 0, 0, 0];
        $teamDuration = [0, 0, 0, 0];

        for ($i=0; $i<$playersCpt; $i++) {
            $player = $players[$i];
            $playerId = $player['id'];
            $duration =  $player['duration'];
            $playerName = $player['name'];
            $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);

            if ($duration == $prevDuration) {
                $playerScore = $prevScore;
            } else if ($duration >= 6666) {
                $playerScore = -floor($scorePart);
            } else {
                $playerScore = floor(($teamsCpt - $teamIndex) * $scorePart);
                $prevDuration = $duration;
                $prevScore = $playerScore;
            }

            if ($teamScore[$playerTeam['team']] == 0) {
                $teamScore[$playerTeam['team']] = $playerScore;
                $teamDuration[$playerTeam['team']] = $duration;
                ++$teamIndex;

                if ($playerScore < 0) {
                    self::notifyAllPlayers("log", clienttranslate('The ${team_name} team loses ${points} points'), [
                        'team_name' => [
                            'log' => '${name} ${icon}',
                            'args'=> [
                                'name' => clienttranslate($playerTeam['name']),
                                'icon' => $playerTeam['icon'],
                                'i18n' => ['name']
                            ]
                        ],
                        'points' => -$playerScore
                    ]);
                } else {
                    self::notifyAllPlayers("log", clienttranslate('The ${team_name} team scores ${points} points'), [
                        'team_name' => [
                            'log' => '${name} ${icon}',
                            'args'=> [
                                'name' => clienttranslate($playerTeam['name']),
                                'icon' => $playerTeam['icon'],
                                'i18n' => ['name']
                            ]
                        ],
                        'points' => $playerScore
                    ]);
                }
            }

            $sql = "UPDATE player SET player_grid=NULL, player_round_score=$playerScore, player_score = player_score + $playerScore, player_score_aux = player_score_aux - $duration WHERE player_id=$playerId";
            self::DbQuery($sql);
        }

        $this->sendTeamRoundScore($teamScore, $teamDuration);

        $round = $this->getRound() + 1;

        if ($round > $rounds) {
            // end of game !
            $this->setGameStateValue('ended', 1);
            $this->calcStats();
            $this->sendAllPuzzles();
            $this->gamestate->nextState("endGame");
        } else {
            // create a new puzzle
            $this->updatePuzzle();
            $this->setRound($round);

            $this->gamestate->setAllPlayersMultiactive();
            $this->gamestate->initializePrivateStateForAllActivePlayers();
        }
    }

    function stEndRound_TeamTurnBased() {
        $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_grid grid FROM player ORDER BY player_round_duration";

        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);
        $rounds = $this->getRounds();
        $scorePart = (120 / $rounds) / $cpt;

        $prevScore = 0;
        $prevDuration = 0;
        $teamScore = [0, 0, 0, 0];
        $teamsDuration = [0, 0, 0, 0];
        $teamsPlayers = [0, 0, 0, 0];
        $playersScore = [];
        $playersTeam = [];

        for ($i=0; $i<$cpt; $i++) {
            $playerId = $players[$i]['id'];
            $playerTeamData = $this->getPlayerTeamNameAndIcon($playerId);
            $playerTeamNum = $playerTeamData['team'];
            $duration =  $players[$i]['duration'];

            if ($duration == $prevDuration) {
                $playerScore = $prevScore;
            } else if ($duration >= 6666) {
                $duration = 6666;
                $playerScore = -floor($scorePart);
            } else {
                $playerScore = floor(($cpt - $i) * $scorePart);
                $prevDuration = $duration;
                $prevScore = $playerScore;
            }

            $playersScore[] = $playerScore;
            $playersTeam[] = $playerTeamNum;
            $teamsPlayers[$playerTeamNum] = $teamsPlayers[$playerTeamNum] + 1;
            $teamScore[$playerTeamNum] = $teamScore[$playerTeamNum] + $playerScore;
            $teamsDuration[$playerTeamNum] = $teamsDuration[$playerTeamNum] + $duration;
        }

        for ($i=0; $i<$cpt; $i++) {
            $playerId = $players[$i]['id'];
            $playerName = $players[$i]['name'];
            $playerScore = $playersScore[$i];
            $playerTeamNum = $playersTeam[$i];
            $playerTeamPoints = floatval($playerScore) / $teamsPlayers[$playerTeamNum];
            $teamPoints = $teamScore[$playerTeamNum] / $teamsPlayers[$playerTeamNum];
            $duration = $teamsDuration[$playerTeamNum];
            $explanation = '('.$playerScore.' / '.$teamsPlayers[$playerTeamNum].')';

            self::notifyAllPlayers("log", $playerId." ".$playerName." ".$playerScore." ".$playerTeamNum." ".$playerTeamPoints." ".$teamPoints." ".$duration, []);

            if ($playerScore < 0) {
                self::notifyAllPlayers("log", clienttranslate('${player_name} makes his team lose ${player_points} points. ${explanation}'), [
                    'player_name' => $playerName,
                    'player_points' => -number_format($playerTeamPoints, 1),
                    'explanation' => $explanation
                ]);
            } else {
                self::notifyAllPlayers("log", clienttranslate('${player_name} makes his team win ${player_points} points. ${explanation}'), [
                    'player_name' => $playerName,
                    'player_points' => number_format($playerTeamPoints, 1),
                    'explanation' => $explanation
                ]);
            }

            $sql = "UPDATE player SET player_grid=NULL, player_round_score=$teamPoints, player_score = player_score + $teamPoints, player_score_aux = player_score_aux - $duration WHERE player_id=$playerId";
            self::DbQuery($sql);
        }

        //$this->sendRoundScore(0);

        $round = $this->getRound() + 1;

        if ($round > $rounds) {
            // end of game !
            $this->setGameStateValue('ended', 1);
            $this->calcStats();
            $this->sendAllPuzzles();
            $this->gamestate->nextState("endGame");
        } else {
            // create a new puzzle
            $this->updatePuzzle();
            $this->setRound($round);

            // turn-based mode, skip the display of round score
            foreach ($players as $player) {
                $this->notifyProgression($player["id"], 0);
            }

            $sql = "UPDATE player SET player_progression=0, player_start=0, player_round_duration=0";
            self::DbQuery($sql);

            $this->gamestate->nextState("next");
        }
    }

    function stEndRound_Solo() {
        $playerId = $this->getCurrentPlayerId();

        $sql = "SELECT player_round_duration duration FROM player WHERE player_id=$playerId";
        $player = self::getObjectFromDB($sql);
        $playerScore = $player["duration"] >= 6666 ? 0 : 1;

        // create a new puzzle
        $this->updatePuzzle();

        $round = $this->getRound() + 1;
        $this->setRound($round);

        if ($playerScore > 0) {
            self::notifyAllPlayers("log", clienttranslate('${player_name} scores ${points} points'), [
                'player_name' => self::getCurrentPlayerName(),
                'points' => $playerScore
            ]);

            $roundScores = [];
            $roundScores[$playerId] = $playerScore;
            self::notifyAllPlayers("roundScores", '', ['type' => 'teams', 'roundScores' => $roundScores]);

            $sql = "UPDATE player SET player_grid=NULL, player_round_score=$playerScore, player_score = player_score + $playerScore WHERE player_id=$playerId";
            self::DbQuery($sql);

            $this->gamestate->setAllPlayersMultiactive();
            $this->gamestate->initializePrivateStateForAllActivePlayers();
        } else {
            $sql = "UPDATE player SET player_progression=0, player_start=0, player_round_duration=0, player_grid=NULL, player_round_score=$playerScore, player_score = player_score + $playerScore WHERE player_id=$playerId";
            self::DbQuery($sql);

            $this->gamestate->nextState("next");
        }
    }

    function stEndRound_Classic() {
        $restingPlayerId = $this->getRestingPlayerId();

        if ($restingPlayerId > 0) {
            $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_grid grid FROM player WHERE player_id<>$restingPlayerId ORDER BY player_round_duration";
        } else {
            $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_grid grid FROM player ORDER BY player_round_duration";
        }

        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);
        $rounds = $this->getRounds();
        $scorePart = ($restingPlayerId > 0) ? (120 / ($rounds - 1)) / $cpt : (120 / $rounds) / $cpt;

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
                self::notifyAllPlayers("log", clienttranslate('${player_name} loses ${points} points'), [
                    'player_name' => $playerName,
                    'points' => -$playerScore
                ]);
            } else {
                self::notifyAllPlayers("log", clienttranslate('${player_name} scores ${points} points'), [
                    'player_name' => $playerName,
                    'points' => $playerScore
                ]);
            }

            $sql = "UPDATE player SET player_grid=NULL, player_round_score=$playerScore, player_score = player_score + $playerScore, player_score_aux = player_score_aux - $duration WHERE player_id=$playerId";
            self::DbQuery($sql);
        }

        $this->sendRoundScore($restingPlayerId);

        $round = $this->getRound() + 1;

        if ($round > $rounds) {
            // end of game !
            $this->setGameStateValue('ended', 1);
            $this->calcStats();
            $this->sendAllPuzzles();
            $this->gamestate->nextState("endGame");
        } else {
            if ($this->isModeRandom()) {
                // create a new puzzle
                $this->updatePuzzle();
            }

            $this->setRound($round);

            if ($restingPlayerId > 0) {
                // set next resting player id
                $restingPlayer = $this->getRestingPlayer();
                $this->setRestingPlayerId($restingPlayer['id']);
                $this->setPreviouslyRestingPlayerId($restingPlayerId);
            }

            if ($this->isAsync()) {
                // turn-based mode, skip the display of round score
                foreach ($players as $player) {
                    $this->notifyProgression($player["id"], 0);
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

    /* Player actions */

    function action_teamSelect($player_no, $team) {
        self::checkAction("teamSelect");

        $playerId = $this->getCurrentPlayerId();

        $this->setPlayerTeam($player_no, $team);

        self::notifyAllPlayers("teamSelection", "", [
            'player_id' => $playerId,
            'action' => 'selected',
            'player_team' => $team
        ]);

        $this->gamestate->nextPrivateState($playerId, 'continue');
    }

    function action_teamValidate() {
        self::checkAction("teamValidate");

        $playerId = $this->getCurrentPlayerId();
        $this->gamestate->nextPrivateState($playerId, 'next');

        $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);
        self::notifyAllPlayers("log", clienttranslate('${player_name} joined the ${team_name} team'), [
            'player_name' => self::getCurrentPlayerName(),
            'team_name' => [
                'log' => '${name} ${icon}',
                'args'=> [
                    'name' => clienttranslate($playerTeam['name']),
                    'icon' => $playerTeam['icon'],
                    'i18n' => ['name']
                ]
            ]
        ]);

        $allPlayersSelectSameTeam = true;
        $allPlayersSelectTeam = true;
        $prevTeam = -1;

        $sql = "SELECT player_id id, player_no num, player_state state FROM player";
        $players = self::getObjectListFromDB($sql);

        foreach ($players as $player_id => $player) {
            $playerTeam = $this->getPlayerTeam($player['num']);
            $playerState = $player['state'];

            if ($playerTeam == 0) {
                $allPlayersSelectTeam = false;
            } else {
                if ($prevTeam != -1 && $prevTeam != $playerTeam) {
                    $allPlayersSelectSameTeam = false;
                }
                if ($playerState == STATE_TEAM_SELECTION_PRIVATE) {
                    $allPlayersSelectTeam = false;
                }

                $prevTeam = $playerTeam;
            }
        }

        if ($allPlayersSelectTeam && $allPlayersSelectSameTeam) {
            self::notifyAllPlayers(
                "teamSelection",
                clienttranslate('All players have selected the same team, we must restart.'),
                [ 'action' => 'devalidated' ]
            );
            $this->gamestate->nextPrivateStateForAllActivePlayers("previous");
        } else if ($allPlayersSelectTeam) {
            self::notifyAllPlayers("log", clienttranslate('All players have selected a team, we can start.'), []);
            $this->gamestate->setAllPlayersNonMultiactive("next");
        } else {
            self::notifyAllPlayers("teamSelection", "", [
                'player_id' => $playerId,
                'action' => 'validated'
            ]);
        }
    }

    function action_teamCancel() {
        self::checkAction("teamCancel");
        $playerId = $this->getCurrentPlayerId();

        $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);
        self::notifyAllPlayers("log", clienttranslate('${player_name} left the ${team_name} team'), [
            'player_name' => self::getCurrentPlayerName(),
            'team_name' => [
                'log' => '${name} ${icon}',
                'args'=> [
                    'name' => clienttranslate($playerTeam["name"]),
                    'icon' => $playerTeam["icon"],
                    'i18n' => ['name']
                ]
            ]
        ]);

        self::notifyAllPlayers("teamSelection", "", [
            'player_id' => $playerId,
            'action' => 'devalidated'
        ]);

        $this->gamestate->nextPrivateState($playerId, 'previous');
    }

    function action_changeGrid($grid, $progression, $give_time) {
        self::checkAction("gridChange");

        $jsonGrid = json_encode($grid);
        $playerId = $this->getCurrentPlayerId();

        /*
        $sql = "UPDATE player SET player_grid='".$jsonGrid."', player_progression=".$progression." WHERE player_id='".$playerId."'";
        self::DbQuery($sql);
        */

        $this->notifyProgression($playerId, $progression);
        $this->notifyPlayerGridChange($playerId, $jsonGrid);

        if ($give_time) {
            $this->giveExtraTime($playerId, 60);
        }

        if ($progression == 100) {
            $this->gamestate->nextPrivateState($playerId, 'continue');
        }
    }

    function action_creationEnd($puzzleGrid, $puzzle) {
        self::checkAction("creationEnd");

        $playerId = $this->getCurrentPlayerId();
        $jsonGrid = json_encode($puzzleGrid);
        $jsonPuzzle = json_encode($puzzle);

        $sql = "UPDATE player SET player_grid='$jsonGrid', player_puzzle_grid='$jsonGrid', player_puzzle='$jsonPuzzle', player_progression=100, player_start=0 WHERE player_id=$playerId";
        self::DbQuery($sql);

        self::notifyAllPlayers("log", clienttranslate('${player_name} submitted their puzzle'), [
            'player_name' => self::getCurrentPlayerName()
        ]);

        if ($this->isTrainingMode()) {
            self::notifyAllPlayers("puzzleChange", "", [
                'player_id' => $playerId,
                'player_puzzle' => $jsonPuzzle,
                'default' => false
            ]);
        }

        $this->notifyProgression($playerId, 100);
        $this->notifyPlayerGridChange($playerId, $jsonGrid);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_start() {
        self::checkAction("puzzleStart");

        $currentPlayerId = $this->getCurrentPlayerId();

        if (!$this->isRealtimeTeamMode()) {
            $startDate = new DateTime();
            $start = $startDate->getTimestamp();
            $grid = $this->getEmptyGrid();
            $jsonGrid = json_encode($grid);

            $sql = "UPDATE player SET player_progression=0, player_start=$start, player_grid='$jsonGrid' WHERE player_id=$currentPlayerId AND player_start=0";
            self::DbQuery($sql);

            $this->sendPlayerStartNotification($currentPlayerId, $start);

            $this->gamestate->nextPrivateState($currentPlayerId, 'continue');
            return;
        }

        // team management
        $this->gamestate->nextPrivateState($currentPlayerId, 'teamWait');

        $currentPlayerTeam = $this->getPlayerTeam(self::getPlayerNoById($currentPlayerId));
        $teamData = $this->getTeammatesAndCheckState($currentPlayerTeam, STATE_PLAY_PUZZLE_WAIT_TEAM);

        if ($teamData['result']) {
            $startDate = new DateTime();
            $start = $startDate->getTimestamp();
            $grid = $this->getEmptyGrid();
            $jsonGrid = json_encode($grid);

            $teammates = $teamData['teammates'];
            $teammatesStr = implode(",", $teammates);
            $sql = "UPDATE player SET player_progression=0, player_start=$start, player_grid='$jsonGrid' WHERE player_id IN ($teammatesStr) AND player_start=0";
            self::DbQuery($sql);

            $this->sendPlayerStartNotification($currentPlayerId, $start);

            foreach ($teammates as $playerId) {
                $this->gamestate->nextPrivateState($playerId, 'continue');
            }
        }
    }

    function action_resolve($grid) {
        self::checkAction("puzzleResolve");

        $endDate = new DateTime();
        $currentPlayerId = $this->getCurrentPlayerId();
        $end = $endDate->getTimestamp();

        $sql = "SELECT player_start start, player_total_duration total FROM player WHERE player_id=$currentPlayerId";
        $player = self::getObjectFromDB($sql);

        $duration = $end - $player["start"];
        $durationStr = $this->getDurationStr($duration);
        $total = $player["total"] + $duration;
        $jsonGrid = json_encode($grid);

        if ($this->isRealtimeTeamMode()) {
            $sql = "UPDATE player SET player_grid='$jsonGrid', player_rounds=player_rounds+1, player_progression=100 WHERE player_id=$currentPlayerId";
        } else {
            $sql = "UPDATE player SET player_grid='$jsonGrid', player_rounds=player_rounds+1, player_progression=100, player_start=0, player_round_duration=$duration, player_total_duration=$total WHERE player_id=$currentPlayerId";
        }
        self::DbQuery($sql);

        $this->notifyProgression($currentPlayerId, 100);
        $this->notifyPlayerGridChange($currentPlayerId, $jsonGrid);

        if ($this->isRealtimeTeamMode()) {
            $this->gamestate->nextPrivateState($currentPlayerId, 'teamWait');

            $currentPlayerTeam = $this->getPlayerTeam(self::getPlayerNoById($currentPlayerId));
            $teamData = $this->getTeammatesAndCheckState($currentPlayerTeam, STATE_PLAY_PUZZLE_RESOLVED_TEAM);

            if ($teamData['result']) {
                $teammates = $teamData['teammates'];
                $teammatesStr = implode(",", $teammates);

                $sql = "UPDATE player SET player_start=0, player_round_duration=$duration, player_total_duration=$total WHERE player_id IN ($teammatesStr)";
                self::DbQuery($sql);

                $this->sendPlayerResolveNotification($currentPlayerId, $durationStr);

                foreach ($teammates as $playerId) {
                    $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
                }
            }
        } else {
            $this->sendPlayerResolveNotification($currentPlayerId, $durationStr);
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, 'next');
        }
    }

    function action_giveupPropose() {
        self::checkAction("giveUpPropose");

        $playerId = $this->getCurrentPlayerId();
        $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);

        $everybodyAgree = true;

        for ($i=1; $i<=6; $i++) {
            if ($playerTeam['num'] != $i
                && $this->getPlayerTeam($i) == $playerTeam['team']
                && $this->getGameStateValue('giveup_agree_'.$i) == 0) {
                    $everybodyAgree = false;
                    break;
            }
        }

        if ($everybodyAgree) {
            self::notifyAllPlayers("stop", clienttranslate('The ${team_name} team found the puzzle too hard and give up'), [
                'team_name' => [
                    'log' => '${name} ${icon}',
                    'args'=> [
                        'name' => clienttranslate($playerTeam['name']),
                        'icon' => $playerTeam['icon'],
                        'i18n' => ['name']
                    ]
                ],
                'player_team' => $playerTeam['team']
            ]);

            $teamData = $this->getTeammatesAndCheckState($playerTeam['team'], STATE_PLAY_PUZZLE_PRIVATE);
            $teammates = $teamData['teammates'];
            $teammatesStr = implode(",", $teammates);

            $sql = "UPDATE player SET player_start=0, player_round_duration=6666 WHERE player_id IN ($teammatesStr)";
            self::DbQuery($sql);

            self::setGameStateValue('giveup_propose_'.$playerTeam['team'], 0);

            foreach ($teammates as $id) {
                $num = self::getPlayerNoById($id);
                self::setGameStateValue('giveup_agree_'.$num, 0);
                $this->gamestate->nextPrivateState($id, 'solution');
            }
        } else {
            self::setGameStateValue('giveup_propose_'.$playerTeam['team'], $playerId);
            self::setGameStateValue('giveup_agree_'.$playerTeam['num'], 1);

            self::notifyAllPlayers('collectiveGiveup', '', [
                'action' => 'propose',
                'player_id' => $playerId,
                'player_num' => $playerTeam['num'],
                'player_team' => $playerTeam['team'],
            ]);

            $this->gamestate->nextPrivateState($playerId, 'continue');
        }
    }

    function action_giveupRefuse() {
        self::checkAction("giveUpRefuse");

        $playerId = $this->getCurrentPlayerId();
        $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);
        $teamData = $this->getTeammatesAndCheckState($playerTeam['team'], STATE_PLAY_PUZZLE_PRIVATE);
        $teammates = $teamData['teammates'];

        foreach ($teammates as $id) {
            $num = self::getPlayerNoById($id);
            self::setGameStateValue('giveup_agree_'.$num, 0);
        }

        self::notifyAllPlayers('collectiveGiveup', '', [
            'action' => 'cancel',
            'player_id' => $playerId,
            'player_num' => $playerTeam['num'],
            'player_team' => $playerTeam['team'],
        ]);

        $this->gamestate->nextPrivateState($playerId, 'continue');
    }

    function action_giveup($timeout) {
        self::checkAction("giveUp");

        $playerId = $this->getCurrentPlayerId();

        $sql = "UPDATE player SET player_start=0, player_round_duration=6666 WHERE player_id=$playerId";
        self::DbQuery($sql);

        $this->gamestate->nextPrivateState($playerId, 'solution');

        if ($timeout) {
            self::notifyAllPlayers("stop", clienttranslate('The time limit for solving the puzzle ran out and ${player_name} was forced to give up.'), [
                'player_name' => self::getCurrentPlayerName(),
                'player_id' => $playerId
            ]);
        } else {
            self::notifyAllPlayers("stop", clienttranslate('${player_name} found the puzzle too hard and give up'), [
                'player_name' => self::getCurrentPlayerName(),
                'player_id' => $playerId
            ]);
        }
    }

    function action_hideScore() {
        $playerId = $this->getCurrentPlayerId();

        if ($this->isGameEnded()) {
            self::notifyAllPlayers("log", clienttranslate('${player_name} is ready for the next round'), [
                'player_name' => self::getCurrentPlayerName()
            ]);

            $this->notifyProgression($playerId, 0);

            $sql = "UPDATE player SET player_progression=0, player_start=0, player_round_duration=0 WHERE player_id=$playerId";
            self::DbQuery($sql);
        }

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_hideSolution() {
        $playerId = $this->getCurrentPlayerId();
        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function action_stopGame() {
        $playerId = $this->getCurrentPlayerId();

        $this->setGameStateValue('ended', 1);
        $this->calcStats();

        $this->sendAllPuzzles();

        $this->gamestate->nextState("endGame");
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
        $round = $this->getRound();

        if ($stateName == "endRound") {
            $rounds = $this->getRounds();

            if ($round >= $rounds) {
                return 100;
            }
        }

        if ($this->isGameEnded()) {
            return 100;
        }

        $cpt = self::getPlayersNumber();

        if ($this->isModeResting()) {
            return round(100 * $round / ($cpt + 1));
        }

        return round(100 * $round / $cpt);
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function isModeSolo() {
        return $this->getGameStateValue('solo') == 1;
    }

    function isModeMultiRandom() {
        return !$this->isModeSolo() && $this->getGameStateValue('multi_mode') == 10;
    }

    function isModeRandom() {
        return $this->isModeSolo() || $this->getGameStateValue('multi_mode') == 10;
    }

    function isTrainingMode() {
        return $this->getGameStateValue('training_mode') == 1;
    }

    function isGameEnded() {
        return $this->getGameStateValue('ended') == 1 || $this->getGameStateValue('game_state') == 99;
    }

    function isModeResting() {
        return $this->getGameStateValue('multi_mode') == 0
            && $this->getGameStateValue('compete_same') == 1
            && $this->getGameStateValue('count_players') > 2;
    }

    function getTeamsCount() {
        $teamsCount = $this->getGameStateValue('teams');

        if ($teamsCount > 0 && $this->isModeRandom()) {
            $countPLayers = $this->getGameStateValue('count_players');
            return ($countPLayers > 3) ? $teamsCount : 2;
        }
        return 0;
    }

    function getTeammatesAndCheckState($currentPlayerTeam, $state) {
        $sql = "SELECT player_id id, player_no num, player_state state FROM player";
        $players = self::getObjectListFromDB($sql);
        $teammates = [];
        $result = true;

        foreach ($players as $playerId => $player) {
            $playerTeam = $this->getPlayerTeam($player['num']);

            if ($currentPlayerTeam == $playerTeam) {
                $teammates[] = $player['id'];
                $playerState = $player['state'];

                if ($playerState != $state) {
                    // the player is not in the right state
                    $result = false;
                }
            }
        }

        return [ 'teammates' => $teammates, 'result' => $result ];
    }

    function isRealtimeTeamMode() {
        return !$this->isAsync() && $this->getTeamsCount() > 0;
    }

    function notifyProgression($playerId, $val) {
        self::notifyAllPlayers("progression", "", [
            'player_id' => $playerId,
            'player_progression' => $val
        ]);
    }

    function notifyPlayerGridChange($playerId, $jsonGrid) {
        if ($this->getTeamsCount() == 0) {
            $player_team = 0;
        } else {
            $player_no = self::getPlayerNoById($playerId);
            $player_team = $this->getPlayerTeam($player_no);
        }

        if ($this->isTrainingMode()) {
            // training mode, we can send the information to everyone
            self::notifyAllPlayers("gridChange", "", [
                'player_id' => $playerId,
                'player_grid' => $jsonGrid,
                'player_team' => $player_team,
            ]);
            return;
        }

        if (!$this->isRealtimeTeamMode()) {
            // no team mode, or turn-based mode, only the concerned player should receive the event
            self::notifyPlayer($playerId, "gridChange", "", [
                'player_id' => $playerId,
                'player_grid' => $jsonGrid,
                'player_team' => $player_team,
            ]);
            return;
        }

        // realtime team mode management !

        foreach ($this->gamestate->getActivePlayerList() as $active_id) {
            $shouldSend = false;

            if ($active_id == $playerId) {
                // the concerned player should received the event (for replay)
                $shouldSend = true;
            } else {
                // the teammates as well
                $other_player_no = self::getPlayerNoById($active_id);
                $other_player_team = $this->getPlayerTeam($other_player_no);
                $shouldSend = $other_player_team == $player_team;
            }

            if ($shouldSend) {
                self::notifyPlayer($active_id, "gridChange", "", [
                    'player_id' => $playerId,
                    'player_grid' => $jsonGrid,
                    'player_team' => $player_team,
                ]);
            }
        }
    }

    function setPlayerTeam($player_no, $team) {
        return $this->setGameStateValue('player_team_'.$player_no, $team);
    }

    function getPlayerTeam($player_no) {
        return $this->getGameStateValue('player_team_'.$player_no);
    }

    function getPlayerTeamNameAndIcon($playerId) {
        $player_no = self::getPlayerNoById($playerId);
        $player_team = $this->getPlayerTeam($player_no);
        $names = ['', 'Mages', 'Vampires', 'Aliens'];
        $icons = ['', '🧙', '🧛', '👽'];

        return [
            'name' => $names[$player_team],
            'icon' => $icons[$player_team],
            'team' => $player_team,
            'num' => $player_no,
        ];
    }

    function getRestingPlayer() {
        if ($this->isModeResting()) {
            $round = $this->getRound() - 1;
            $sql = "SELECT player_id id, player_name name FROM player ORDER BY player_no LIMIT $round,1";
            $players = self::getObjectListFromDB($sql);
            return $players[0];
        }

        return null;
    }

    function setRestingPlayerId($playerId) {
        $this->setGameStateValue('resting', $playerId);
    }
    function getRestingPlayerId() {
        return $this->getGameStateValue('resting');
    }

    function setPreviouslyRestingPlayerId($playerId) {
        $this->setGameStateValue('prev_resting', $playerId);
    }
    function getPreviouslyRestingPlayerId() {
        return $this->getGameStateValue('prev_resting');
    }

    function setRound($round) {
        $this->setGameStateValue('round', $round);
    }

    function getRound() {
        return $this->getGameStateValue('round');
    }

    function getRounds() {
        return $this->getGameStateValue('rounds');
    }

    function getRandomItems($black_hole, $items_count) {
        $max = ($black_hole) ? 209 : 199;
        $quality = 0;
        $items = [];

        while ($quality <= ($items_count/2)) {
            $i = 0;
            $quality = 0;
            $items = [];

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

        while ($row1 == $row2 && $col1 == $col2) {
            $row1 = rand(0, $grid_size - 1);
            $col1 = rand(0, $grid_size - 1);
            $row2 = rand(0, $grid_size - 1);
            $col2 = rand(0, $grid_size - 1);
        }

        $portals[] = $row1;
        $portals[] = $col1;
        $portals[] = $row2;
        $portals[] = $col2;

        $this->setGameDbValue('portals', json_encode($portals));
        self::setGameStateValue('portal_1_row', $row1);
        self::setGameStateValue('portal_1_col', $col1);
        self::setGameStateValue('portal_2_row', $row2);
        self::setGameStateValue('portal_2_col', $col2);

        return $portals;
    }

    function getEmptyGrid() {
        $grid_size = $this->getGameStateValue('grid_size');
        $grid = [];
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

    function getGameDbValue($key) {
        $sql = "SELECT game_value val FROM gamestatus WHERE game_param='$key'";
        $data = self::getObjectFromDB($sql);
        return $data['val'];
    }

    function setGameDbValue($key, $val) {
        $sql = "DELETE FROM gamestatus WHERE game_param='$key'";
        self::DbQuery($sql);

        $sql = "INSERT INTO gamestatus (game_param, game_value) VALUES ('$key', '$val')";
        self::DbQuery($sql);
    }

    function updatePuzzle() {
        $items_count = $this->getGameStateValue('items_count');
        $black_hole = $this->getGameStateValue('black_hole') == 1;
        $light_warp = $this->getGameStateValue('light_warp') == 1;
        $round = $this->getRound();

        if ($light_warp) {
            $this->getPortalsPositions();
        }

        $items = $this->getRandomItems($black_hole, $items_count);
        $this->setGameDbValue('elements', json_encode($items));

        $puzzle = $this->getRandomGridAndPuzzle($items);
        $this->setGameDbValue('grid', $puzzle['grid']);
        $this->setGameDbValue('puzzle', $puzzle['puzzle']);
        $this->setGameDbValue('rg_'.$round, $puzzle['grid']);

        self::notifyAllPlayers("puzzleChange", "", [ 'round_puzzle' => $puzzle['puzzle'] ]);
    }

    function getRandomGridAndPuzzle($items) {
        $searching = true;
        $grid = null;
        $jsonPuzzle = null;
        $try = 0;

        while ($searching && $try < 20) {
            $grid = $this->getRandomGrid($items);
            $grid_size = count($grid);
            $puzzle = $this->getGridPuzzle($grid);
            $jsonPuzzle = json_encode($puzzle);
            $searching = false;

            for ($row=0; $row<$grid_size; $row++) {
                for ($col=0; $col<$grid_size; $col++) {
                    $val = $grid[$row][$col];

                    if ($val > 0 && $val < 7) {
                        $grid[$row][$col] = 0;
                        $puzzle = $this->getGridPuzzle($grid);
                        $grid[$row][$col] = $val;

                        if ($jsonPuzzle == json_encode($puzzle)) {
                            // one item is useless
                            $searching = true;
                            break;
                        }
                    }
                }

                if ($searching) {
                    break;
                }
            }

            ++$try;
        }

        return [ 'grid' => json_encode($grid), 'puzzle' => $jsonPuzzle];
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
            return "-";
          }
          $seconds = $duration % 60;
          $minutes = ($duration - $seconds) / 60;

          return str_pad($minutes, 2, "0", STR_PAD_LEFT).":".str_pad($seconds, 2, "0", STR_PAD_LEFT);
    }

    function sendTeamRoundScore($teamScore, $teamDuration) {
        $firstRow = [];
        $secondRow = [];
        $thirdRow = [];
        $roundScores = [];

        $firstRow[] = '';
        $secondRow[] = ['str' => clienttranslate("Round duration"), 'args' => []];
        $thirdRow[] = ['str' => clienttranslate("Round score"), 'args' => []];

        $names = ['', 'Mages', 'Vampires', 'Aliens'];
        $icons = ['', '🧙', '🧛', '👽'];

        for ($i=1; $i<4; $i++) {
            $score = $teamScore[$i];

            if ($score == 0) {
                break;
            }

            $firstRow[] = [
                'str' => '${team_name} ${team_icon}',
                'args' => [
                    'team_name' => clienttranslate($names[$i]),
                    'team_icon' => $icons[$i],
                    'i18n' => ['team_name']
                ],
                'type' => 'header'
            ];
            $secondRow[] = [
                'str' => '${team_duration}',
                'args' => ['team_duration' =>  $this->getDurationStr($teamDuration[$i])]
            ];
            $thirdRow[] = [
                'str' => '${team_score}',
                'args' => ['team_score' => $teamScore[$i]]
            ];

            $roundScores[$i] = $teamScore[$i];
        }

        $table[] = $firstRow;
        $table[] = $secondRow;
        $table[] = $thirdRow;

        $this->notifyAllPlayers("tableWindow", '', [
            "id" => 'roundScoring',
            "title" => clienttranslate("Round score"),
            "table" => $table,
            "closing" => clienttranslate("Close")
        ]);

        self::notifyAllPlayers("roundScores", '', ['type' => 'teams', 'roundScores' => $roundScores]);
    }

    function sendRoundScore($restingPlayerId) {
        if ($restingPlayerId > 0) {
            $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_round_score score FROM player WHERE player_id<>$restingPlayerId ORDER BY player_round_score DESC";
        } else {
            $sql = "SELECT player_id id, player_name name, player_round_duration duration, player_round_score score FROM player ORDER BY player_round_score DESC";
        }

        $players = self::getObjectListFromDB($sql);

        $firstRow = [];
        $secondRow = [];
        $thirdRow = [];
        $roundScores = [];

        $firstRow[] = '';
        $secondRow[] = ['str' => clienttranslate("Round duration"), 'args' => []];
        $thirdRow[] = ['str' => clienttranslate("Round score"), 'args' => []];

        foreach ($players as $player_id => $player) {
            $firstRow[] = [
                'str' => '${player_name}',
                'args' => ['player_name' => $player['name']],
                'type' => 'header'
            ];
            $secondRow[] = [
                'str' => '${player_duration}',
                'args' => ['player_duration' =>  $this->getDurationStr($player['duration'])]
            ];
            $thirdRow[] = [
                'str' => '${player_score}',
                'args' => ['player_score' => $player['score']]
            ];
            $roundScores[$player['id']] = $player['score'];
        }

        $table[] = $firstRow;
        $table[] = $secondRow;
        $table[] = $thirdRow;

        $this->notifyAllPlayers("tableWindow", '', [
            "id" => 'roundScoring',
            "title" => clienttranslate("Round score"),
            "table" => $table,
            "closing" => clienttranslate("Close")
        ]);

        self::notifyAllPlayers("roundScores", '', ['type' => 'players', 'roundScores' => $roundScores]);
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

    function sendAllPuzzles() {
        $puzzles = [];

        if ($this->isModeRandom()) {
            $sql = "SELECT game_value grid FROM gamestatus WHERE game_param LIKE 'rg_%' ORDER BY game_param";
            $grids = self::getObjectListFromDB($sql);

            foreach ($grids as $grid_id => $elt) {
                $puzzles[] = $elt['grid'];
            }

            self::notifyAllPlayers("roundsPuzzle", '', [ 'puzzles' => $puzzles ]);
        } else {
            $sql = "SELECT player_id id, player_puzzle_grid grid FROM player";
            $players = self::getObjectListFromDB($sql);

            foreach ($players as $player_id => $player) {
                $playerId = $player['id'];
                $puzzles[$playerId] = $player['grid'];
            }

            self::notifyAllPlayers("playersPuzzle", '', [ 'puzzles' => $puzzles ]);
        }
    }

    function getPuzzleOwner($playerId) {
        $restingPlayerId = $this->getRestingPlayerId();

        if ($restingPlayerId > 0) {
            // all players are working on this player puzzle
            $sql = "SELECT player_id id, player_name name, player_puzzle_grid puzzleGrid FROM player WHERE player_id=$restingPlayerId";
            $player = self::getObjectFromDB($sql);
            return $player;
        }

        // all players are working on another player puzzle, depending on the current round
        $round = $this->getRound();
        $sql = "SELECT player_id id, player_name name, player_puzzle_grid puzzleGrid FROM player ORDER BY player_no";
        $players = self::getObjectListFromDB($sql);
        $cpt = count($players);

        for ($i=0; $i<$cpt; $i++) {
            if ($players[$i]["id"] == $playerId) {
                $other_player_index = ($i + $round) % $cpt;
                return $players[$other_player_index];
            }
        }

        return null;
    }

    function sendPlayerStartNotification($playerId, $start) {
        $ownerName = null;

        if ($this->isModeRandom()) {
            $ownerName = 'Robby';
        } else {
            $owner = $this->getPuzzleOwner($playerId);
            if ($owner != null) {
                $ownerName = $owner["name"];
            }
        }

        if ($ownerName == null) {
            return;
        }

        if ($this->isRealtimeTeamMode()) {
            $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);
            self::notifyAllPlayers("start", clienttranslate('The ${team_name} team has started to work on ${other_player_name}\'s puzzle'), [
                'team_name' => [
                    'log' => '${name} ${icon}',
                    'args'=> [
                        'name' => clienttranslate($playerTeam['name']),
                        'icon' => $playerTeam['icon'],
                        'i18n' => ['name']
                    ]
                ],
                'other_player_name' => $ownerName,
                'player_team' => $playerTeam['team'],
                'start' => $start
            ]);
        } else {
            self::notifyAllPlayers("start", clienttranslate('${player_name} has started to work on ${other_player_name}\'s puzzle'), [
                'player_name' => self::getCurrentPlayerName(),
                'other_player_name' => $ownerName,
                'player_id' => $playerId,
                'start' => $start
            ]);
        }
    }

    function sendPlayerResolveNotification($playerId, $durationStr) {
        if ($this->isRealtimeTeamMode()) {
            $playerTeam = $this->getPlayerTeamNameAndIcon($playerId);

            self::notifyAllPlayers("stop", clienttranslate('The ${team_name} team solved their puzzle in ${duration}'), [
                'team_name' => [
                    'log' => '${name} ${icon}',
                    'args'=> [
                        'name' => clienttranslate($playerTeam['name']),
                        'icon' => $playerTeam['icon'],
                        'i18n' => ['name']
                    ]
                ],
                'duration' => $durationStr,
                'player_team' => $playerTeam['team']
            ]);
        } else {
            self::notifyAllPlayers("stop", clienttranslate('${player_name} solved their puzzle in ${duration}'), [
                'player_name' => self::getCurrentPlayerName(),
                'duration' => $durationStr,
                'player_id' => $playerId
            ]);
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

        if ($this->isModeMultiRandom()) {
            // create puzzles for all zombie players that don't have any :
            $sql = "SELECT player_id id FROM player WHERE player_zombie=1 AND player_puzzle is null";
            $players = self::getObjectListFromDB($sql);
            $cpt = count($players);

            if ($cpt > 0) {
                $items = json_decode($this->getGameDbValue('elements'));

                foreach ($players as $player_id => $player) {
                    $playerId = $player['id'];

                    $puzzle = $this->getRandomGridAndPuzzle($items);
                    $jsonPuzzleGrid = $puzzle['grid'];
                    $jsonPuzzle = $puzzle['puzzle'];

                    $sql = "UPDATE player SET player_puzzle_grid='$jsonPuzzleGrid', player_puzzle='$jsonPuzzle' WHERE player_id=$playerId";
                    self::DbQuery($sql);

                    self::notifyAllPlayers("puzzleChange", "", [
                        'player_id' => $playerId,
                        'player_puzzle' => $jsonPuzzle,
                        'default' => true
                    ]);
                }
            }
        }

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
