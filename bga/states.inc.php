<?php

// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
    define("STATE_GAME_SETUP", 1);
    define("STATE_MODE_INIT", 2);
    define("STATE_CREATE_PUZZLE_INIT", 3);
    define("STATE_CREATE_PUZZLE_PRIVATE", 30);
    define("STATE_CREATE_PUZZLE_PRIVATE_END", 31);
    define("STATE_CREATE_PUZZLE_END", 4);
    define("STATE_PLAY_PUZZLE_INIT", 5);
    define("STATE_PLAY_PUZZLE_WAIT_PRIVATE", 50);
    define("STATE_PLAY_PUZZLE_PRIVATE", 51);
    define("STATE_SOLUTION_PRIVATE", 52);
    define("STATE_PLAY_PUZZLE_WAIT_TEAM", 53);
    define("STATE_PLAY_PUZZLE_RESOLVED_TEAM", 54);
    define("STATE_PLAY_COPY_TEAM", 55);
    define("STATE_SEED_PUZZLE", 6);
    define("STATE_PLAY_PUZZLE_END", 7);
    define("STATE_END_ROUND", 8);
    define("STATE_END_ROUND_PRIVATE", 80);
    define("STATE_TEAM_SELECTION", 9);
    define("STATE_TEAM_SELECTION_PRIVATE", 90);
    define("STATE_TEAM_SELECTED", 91);
    define("STATE_TEAM_SELECTED_TB", 92);
    define("STATE_DESIGN_PUZZLE", 10);
    define("STATE_BEFORE_END_GAME", 98);
    define("STATE_END_GAME", 99);
 }

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * LaserReflection game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


$machinestates = array(

    // The initial state. Please do not modify.
    STATE_GAME_SETUP => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => STATE_MODE_INIT]
    ),

    STATE_MODE_INIT => array(
        "name" => "modeInit",
        "description" => "",
        "type" => "manager",
        "action" => "stGameInit",
        "transitions" => [
            "solo" => STATE_PLAY_PUZZLE_INIT,
            "cooperative" => STATE_PLAY_PUZZLE_INIT,
            "normal" => STATE_CREATE_PUZZLE_INIT,
            "random" => STATE_PLAY_PUZZLE_INIT,
            "team_selection" => STATE_TEAM_SELECTION,
            "seed" => STATE_SEED_PUZZLE,
            "design" => STATE_DESIGN_PUZZLE
        ]
    ),

    STATE_TEAM_SELECTION => [
        "name" => "teamSelectionInit",
        "description" => clienttranslate('Some players are selecting their team'),
        "descriptionmyturn" => "",
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_TEAM_SELECTION_PRIVATE,
        "action" => "stTeamSelectionInit",
        "transitions" => ["next" => STATE_PLAY_PUZZLE_INIT, "wait" => STATE_TEAM_SELECTED_TB, "previous" => STATE_TEAM_SELECTION ]
    ],

    STATE_TEAM_SELECTION_PRIVATE => [
        "name" => "teamSelection",
        "description" => clienttranslate('Some players are selecting their team'),
        "descriptionmyturn" => clienttranslate('${you} must select a team'),
        "type" => "private",
        "possibleactions" => ["teamSelect", "teamValidate"],
        "transitions" => [ "continue" => STATE_TEAM_SELECTION_PRIVATE, "next" => STATE_TEAM_SELECTED ]
    ],

    STATE_TEAM_SELECTED => [
        "name" => "teamSelected",
        "description" => clienttranslate('Some players are selecting their team'),
        "descriptionmyturn" => clienttranslate('Some players are selecting their team'),
        "type" => "private",
        "possibleactions" => ["teamCancel"],
        "transitions" => [ "continue" => STATE_TEAM_SELECTED, "previous" => STATE_TEAM_SELECTION_PRIVATE ]
    ],

    STATE_TEAM_SELECTED_TB => [
        "name" => "teamSelectedTb",
        "description" => clienttranslate('Some players are selecting their team'),
        "descriptionmyturn" => clienttranslate('Some players are selecting their team'),
        "type" => "multipleactiveplayer",
        "transitions" => [
            "previous" => STATE_TEAM_SELECTION,
            "next" => STATE_PLAY_PUZZLE_INIT
        ]
    ],

    STATE_SEED_PUZZLE => [
        "name" => "createFromSeed",
        "description" => clienttranslate('You should provide the seed code of a puzzle'),
        "descriptionmyturn" => clienttranslate('You should provide the seed code of a puzzle'),
        "type" => "activeplayer",
        "possibleactions" => ["seedValidate", "stopGame"],
        "transitions" => [ "next" => STATE_PLAY_PUZZLE_INIT, "endGame" => STATE_END_GAME ]
    ],

    STATE_DESIGN_PUZZLE => [
        "name" => "design",
        "description" => clienttranslate('Create a puzzle to share with other players'),
        "descriptionmyturn" => clienttranslate('Create a puzzle to share with other players'),
        "type" => "activeplayer",
        "args" => "argDesignPuzzle",
        "possibleactions" => ["resetDesign", "stopGame"],
        "transitions" => [ "continue" => STATE_DESIGN_PUZZLE, "endGame" => STATE_END_GAME ]
    ],

    STATE_CREATE_PUZZLE_INIT => [
        "name" => "puzzleCreationInit",
        "description" => clienttranslate('Some players are creating their puzzle'),
        "descriptionmyturn" => "",
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_CREATE_PUZZLE_PRIVATE,
        "action" => "stCreatePuzzleInit",
        "transitions" => [ "next" => STATE_CREATE_PUZZLE_END ]
    ],

    STATE_CREATE_PUZZLE_PRIVATE => [
        "name" => "puzzleCreation",
        "description" => clienttranslate('Some players are creating their puzzle'),
        "descriptionmyturn" => clienttranslate('${you} must place the elements on the grid to create a puzzle for the other players'),
        "type" => "private",
        "possibleactions" => ["gridChange", "creationEnd"],
        "action" => "stCreatePuzzlePrivate",
        "transitions" => [ "continue" => STATE_CREATE_PUZZLE_PRIVATE, "next" => STATE_CREATE_PUZZLE_PRIVATE_END ]
    ],

    STATE_CREATE_PUZZLE_PRIVATE_END => [
        "name" => "puzzleCreationEnd",
        "description" => clienttranslate('Some players are creating their puzzle'),
        "descriptionmyturn" => clienttranslate('${you} must place the elements on the grid to create a puzzle for the other players'),
        "type" => "private",
    ],

    STATE_CREATE_PUZZLE_END => array(
        "name" => "puzzleCreationInitEnd",
        "description" => "",
        "type" => "manager",
        "action" => "stCreatePuzzleEnd",
        "transitions" => ["next" => STATE_PLAY_PUZZLE_INIT]
    ),

    STATE_PLAY_PUZZLE_INIT => [
        "name" => "puzzlePlayInit",
        "description" => clienttranslate('Some players are solving their puzzle'),
        "descriptionmyturn" => clienttranslate('Some players are solving their puzzle'),
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_PLAY_PUZZLE_WAIT_PRIVATE,
        "action" => "stPlayPuzzleInit",
        "args" => "argPlayPuzzleInit",
        "transitions" => ["next" => STATE_END_ROUND, "endGame" => STATE_BEFORE_END_GAME],
        "updateGameProgression" => true
    ],

    STATE_PLAY_PUZZLE_WAIT_PRIVATE => [
        "name" => "puzzlePlayWait",
        "description" => "",
        "descriptionmyturn" => clienttranslate('Get ready to solve your puzzle!'),
        "type" => "private",
        "possibleactions" => ["puzzleStart", "displayDurations"],
        "transitions" => [
            "stay" => STATE_PLAY_PUZZLE_WAIT_PRIVATE,
            "continue" => STATE_PLAY_PUZZLE_PRIVATE,
            "teamWait" => STATE_PLAY_PUZZLE_WAIT_TEAM,
        ]
    ],

    STATE_PLAY_PUZZLE_WAIT_TEAM => [
        "name" => "puzzlePlayWaitTeam",
        "description" => "",
        "descriptionmyturn" => clienttranslate('Some of your teammates are not ready yet, the game will start soon...'),
        "type" => "private",
        "transitions" => ["continue" => STATE_PLAY_PUZZLE_PRIVATE]
    ],

    STATE_PLAY_PUZZLE_PRIVATE => [
        "name" => "puzzlePlay",
        "description" => clienttranslate('Waiting for other players'),
        "descriptionmyturn" => clienttranslate('${you} must resolve the puzzle of ${otherplayer}'),
        "type" => "private",
        "args" => "argPlayPuzzleInitPrivate",
        "possibleactions" => ["gridChange", "puzzleResolve", "giveUp", "timeout", "giveUpPropose", "giveUpRefuse"],
        "transitions" => [
            "continue" => STATE_PLAY_PUZZLE_PRIVATE,
            "solution" => STATE_SOLUTION_PRIVATE,
            "teamWait" => STATE_PLAY_PUZZLE_RESOLVED_TEAM,
            "copy" => STATE_PLAY_COPY_TEAM,
        ]
    ],

    STATE_PLAY_COPY_TEAM => [
        "name" => "puzzleCopy",
        "description" => clienttranslate('Waiting for other players'),
        "descriptionmyturn" => clienttranslate('At least one of your teammates has solved the puzzle!'),
        "type" => "private",
        "possibleactions" => ["gridChange", "puzzleResolve", "giveUp", "timeout", "giveUpPropose", "giveUpRefuse"],
        "transitions" => [
            "continue" => STATE_PLAY_COPY_TEAM,
            "solution" => STATE_SOLUTION_PRIVATE,
            "teamWait" => STATE_PLAY_PUZZLE_RESOLVED_TEAM,
            "copy" => STATE_PLAY_COPY_TEAM,
        ]
    ],

    STATE_PLAY_PUZZLE_RESOLVED_TEAM => [
        "name" => "puzzleResolvedWaitTeam",
        "description" => "",
        "descriptionmyturn" => clienttranslate('Some of your teammates have not yet solved the puzzle.'),
        "type" => "private",
        "possibleactions" => ["timeout", "giveUpPropose", "giveUpRefuse"],
        "transitions" => [
            "continue" => STATE_PLAY_PUZZLE_RESOLVED_TEAM,
        ]
    ],

    STATE_SOLUTION_PRIVATE => [
        "name" => "puzzleSolution",
        "description" => clienttranslate('Go to next round'),
        "descriptionmyturn" => clienttranslate('Go to next round'),
        "type" => "private",
        "args" => "argSolutionDisplay",
        "possibleactions" => ["hideSolution", "stopGame"],
    ],

    STATE_END_ROUND => [
        "name" => "endRound",
        "description" => clienttranslate('Waiting for the start of the next round'),
        "descriptionmyturn" => "",
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_END_ROUND_PRIVATE,
        "action" => "stEndRound",
        "possibleactions" => [],
        "transitions" => ["next" => STATE_PLAY_PUZZLE_INIT, "endGame" => STATE_BEFORE_END_GAME, "seed" => STATE_SEED_PUZZLE]
    ],

    STATE_END_ROUND_PRIVATE => [
        "name" => "scoreDisplay",
        "description" => clienttranslate('Go to next round'),
        "descriptionmyturn" => clienttranslate('Go to next round'),
        "type" => "private",
        "possibleactions" => ["hideScore", "stopGame"],
        "transitions" => ['continue' => STATE_END_ROUND_PRIVATE]
    ],

    STATE_BEFORE_END_GAME => [
        "name" => "beforeGameEnd",
        "description" => clienttranslate('End of game'),
        "type" => "private",
        "action" => "stEndGame",
        "possibleactions" => [],
        "transitions" => ["endGame" => STATE_END_GAME],
        "updateGameProgression" => true
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEndCustom",
        "args" => "argGameEndCustom"
    )

);
