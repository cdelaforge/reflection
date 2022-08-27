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
 * gameoptions.inc.php
 *
 * LaserReflection game options description
 *
 * In this file, you can define your game options (= game variants).
 *
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in laserreflection.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = array(
    100 => array(
        'name' => totranslate('Grid size'),
        'values' => array(
            4 => array( 'name' => totranslate('4 x 4'), 'tmdisplay' => totranslate('Grid size : 4 x 4') ),
            5 => array( 'name' => totranslate('5 x 5'), 'tmdisplay' => totranslate('Grid size : 5 x 5') ),
            6 => array( 'name' => totranslate('6 x 6'), 'tmdisplay' => totranslate('Grid size : 6 x 6') ),
            7 => array( 'name' => totranslate('7 x 7'), 'tmdisplay' => totranslate('Grid size : 7 x 7') ),
            8 => array( 'name' => totranslate('8 x 8'), 'tmdisplay' => totranslate('Grid size : 8 x 8') ),
            9 => array( 'name' => totranslate('9 x 9'), 'tmdisplay' => totranslate('Grid size : 9 x 9') ),
            10 => array( 'name' => totranslate('10 x 10'), 'tmdisplay' => totranslate('Grid size : 10 x 10') ),
        ),
        'default' => 8
    ),
    101 => array(
        'name' => totranslate('Items'),
        'values' => array(
            3 => array( 'name' => totranslate('3 items'), 'tmdisplay' => totranslate('3 items') ),
            4 => array( 'name' => totranslate('4 items'), 'tmdisplay' => totranslate('4 items') ),
            5 => array( 'name' => totranslate('5 items'), 'tmdisplay' => totranslate('5 items') ),
            6 => array( 'name' => totranslate('6 items'), 'tmdisplay' => totranslate('6 items') ),
            7 => array( 'name' => totranslate('7 items'), 'tmdisplay' => totranslate('7 items') ),
            8 => array( 'name' => totranslate('8 items'), 'tmdisplay' => totranslate('8 items') ),
            9 => array( 'name' => totranslate('9 items'), 'tmdisplay' => totranslate('9 items') ),
            10 => array( 'name' => totranslate('10 items'), 'tmdisplay' => totranslate('10 items') ),
            11 => array( 'name' => totranslate('11 items'), 'tmdisplay' => totranslate('11 items') ),
            12 => array( 'name' => totranslate('12 items'), 'tmdisplay' => totranslate('12 items') ),
            13 => array( 'name' => totranslate('13 items'), 'tmdisplay' => totranslate('13 items') ),
            14 => array( 'name' => totranslate('14 items'), 'tmdisplay' => totranslate('14 items') ),
            15 => array( 'name' => totranslate('15 items'), 'tmdisplay' => totranslate('15 items') ),
            16 => array( 'name' => totranslate('16 items'), 'tmdisplay' => totranslate('16 items') ),
            17 => array( 'name' => totranslate('17 items'), 'tmdisplay' => totranslate('17 items') ),
            18 => array( 'name' => totranslate('18 items'), 'tmdisplay' => totranslate('18 items') ),
            19 => array( 'name' => totranslate('19 items'), 'tmdisplay' => totranslate('19 items') ),
            20 => array( 'name' => totranslate('20 items'), 'tmdisplay' => totranslate('20 items') )
        ),
        'startcondition' => array(
            15 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            ),
            16 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            ),
            17 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            ),
            18 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            ),
            19 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            ),
            20 => array(
                array(
                    'type' => 'otheroptionisnot',
                    'id' => 100,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                )
            )
        ),
        'default' => 10
    ),
    102 => array(
        'name' => totranslate('Black holes'),
        'values' => array(
            1 => array( 'name' => totranslate('yes'), 'tmdisplay' => totranslate('Black holes') ),
            2 => array( 'name' => totranslate('no') )
        ),
        'default' => 1
    ),
    103 => array(
        'name' => totranslate('Light warps'),
        'values' => array(
            1 => array( 'name' => totranslate('yes'), 'tmdisplay' => totranslate('Light warps') ),
            2 => array( 'name' => totranslate('no') )
        ),
        'default' => 2
    ),
    110 => array(
        'name' => totranslate('Auto. start rounds'),
        'values' => array(
            1 => array( 'name' => totranslate('yes') ),
            2 => array( 'name' => totranslate('no') )
        ),
        'default' => 2,
        'displaycondition' => [
            [
             'type' => 'otheroption',
             'id' => GAMESTATE_CLOCK_MODE,
             'value' => [0,1,2,9],
           ],
        ]
    )
);


