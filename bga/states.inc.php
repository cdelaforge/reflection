<?php

// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
    define("STATE_GAME_SETUP", 1);
    define("STATE_MODE_INIT", 2);
    define("STATE_CREATE_PUZZLE_INIT", 3);
    define("STATE_CREATE_PUZZLE_PRIVATE", 30);
    define("STATE_PLAY_PUZZLE_INIT", 5);
    define("STATE_PLAY_PUZZLE_WAIT_PRIVATE", 50);
    define("STATE_PLAY_PUZZLE_PRIVATE", 51);
    define("STATE_PLAY_PUZZLE_END", 7);
    define("STATE_END_ROUND", 8);
    define("STATE_END_ROUND_PRIVATE", 80);
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
        "transitions" => array( "" => STATE_MODE_INIT)
    ),

    STATE_MODE_INIT => array(
        "name" => "modeInit",
        "description" => "",
        "type" => "manager",
        "action" => "stGameInit",
        "transitions" => array(
            "solo" => STATE_PLAY_PUZZLE_INIT,
            "normal" => STATE_CREATE_PUZZLE_INIT
        )
    ),

    STATE_CREATE_PUZZLE_INIT => [
        "name" => "puzzleCreationInit",
        "description" => clienttranslate('Some players are creating their puzzle'),
        "descriptionmyturn" => "",
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_CREATE_PUZZLE_PRIVATE,
        "action" => "stCreatePuzzleInit",
        "transitions" => ["next" => STATE_PLAY_PUZZLE_INIT]
    ],

    STATE_CREATE_PUZZLE_PRIVATE => [
        "name" => "puzzleCreation",
        "description" => clienttranslate('Some players are creating their puzzle'),
        "descriptionmyturn" => clienttranslate('${you} must place the elements on the grid to create a puzzle for the other players'),
        "type" => "private",
        "possibleactions" => ["gridChange", "creationEnd"],
        "action" => "stCreatePuzzlePrivate",
        "transitions" => [ 'continue' => STATE_CREATE_PUZZLE_PRIVATE ]
    ],

    STATE_PLAY_PUZZLE_INIT => [
        "name" => "puzzlePlayInit",
        "description" => clienttranslate('Some players are solving their puzzle'),
        "descriptionmyturn" => clienttranslate('${you} must resolve the puzzle of'),
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_PLAY_PUZZLE_WAIT_PRIVATE,
        "action" => "stPlayPuzzleInit",
        "args" => "argPlayPuzzleInit",
        "transitions" => ["next" => STATE_END_ROUND, "end" => STATE_END_GAME],
        "updateGameProgression" => true
    ],

    STATE_PLAY_PUZZLE_WAIT_PRIVATE => [
        "name" => "puzzlePlayWait",
        "description" => "",
        "descriptionmyturn" => clienttranslate('Get ready ! ${you} prepare to resolve the puzzle !'),
        "type" => "private",
        "possibleactions" => ["gridChange", "puzzleStart"],
        "transitions" => [
            'continue' => STATE_PLAY_PUZZLE_PRIVATE,
        ]
    ],

    STATE_PLAY_PUZZLE_PRIVATE => [
        "name" => "puzzlePlay",
        "description" => clienttranslate('Waiting for other players'),
        "descriptionmyturn" => clienttranslate('${you} must resolve the puzzle of'),
        "type" => "private",
        "possibleactions" => ["gridChange", "puzzleResolve", "giveUp"],
        "transitions" => [
            'continue' => STATE_PLAY_PUZZLE_PRIVATE,
        ]
    ],

    STATE_END_ROUND => [
        "name" => "endRound",
        "description" => clienttranslate('Waiting for other players'),
        "descriptionmyturn" => "",
        "type" => "multipleactiveplayer",
        "initialprivate" => STATE_END_ROUND_PRIVATE,
        "action" => "stEndRound",
        "possibleactions" => [],
        "transitions" => ["next" => STATE_PLAY_PUZZLE_INIT, "endGame" => STATE_END_GAME],
        "updateGameProgression" => true
    ],

    STATE_END_ROUND_PRIVATE =>  [
        "name" => "scoreDisplay",
        "description" => clienttranslate('Go to next round'),
        "descriptionmyturn" => clienttranslate('Go to next round'),
        "type" => "private",
        "possibleactions" => ["scoreDisplayEnd", "stopGame"],
        "transitions" => [ 'continue' => STATE_END_ROUND_PRIVATE ]
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
