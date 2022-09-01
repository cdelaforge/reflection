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

$game_options = [
    103 => [
        'name' => totranslate('Multi-player mode'),
        'values' => [
            0 => [ 'name' => totranslate('Puzzles created by players'), 'tmdisplay' => totranslate('Puzzles created by players') ],
            10 => [ 'name' => totranslate('Randomly generated puzzles'), 'tmdisplay' => totranslate('Randomly generated puzzles') ],
        ],
        'default' => 0,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => 2,
            ],
        ],
    ],
    104 => [
        'name' => totranslate('Solo mode'),
        'values' => [
            0 => [ 'name' => totranslate('The NeverEnding Story'), 'description' => totranslate('You stop when you want') ],
            3 => [ 'name' => totranslate('Stroll in the Shire'), 'description' => totranslate('Complete 3 rounds to win') ],
            6 => [ 'name' => totranslate('Expedition to the caves of Moria'), 'description' => totranslate('Complete 6 rounds to win') ],
            10 => [ 'name' => totranslate('Journey to Mordor'), 'description' => totranslate('Complete 10 rounds to win') ],
        ],
        'default' => 0,
        'displaycondition' => [
            [
                'type' => 'maxplayers',
                'value' => 1,
            ],
        ],
    ],
    108 => [
        'name' => totranslate('Rounds'),
        'values' => [
            1 => [ 'name' => totranslate('1 round') ],
            3 => [ 'name' => totranslate('3 rounds') ],
            5 => [ 'name' => totranslate('5 rounds') ],
        ],
        'default' => 3,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => 2,
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 10,
            ],
        ],
    ],
    110 => [
        'name' => totranslate('Time limit'),
        'values' => [
            0 => [ 'name' => totranslate('No limit') ],
            2 => [ 'name' => totranslate('2 minutes') ],
            5 => [ 'name' => totranslate('5 minutes') ],
            10 => [ 'name' => totranslate('10 minutes') ],
            15 => [ 'name' => totranslate('15 minutes') ],
            20 => [ 'name' => totranslate('20 minutes') ],
        ],
        'default' => 10,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => 2,
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 10,
            ],
        ],
    ],
    120 => [
        'name' => totranslate('Grid size'),
        'values' => [
            4 => [ 'name' => totranslate('4 x 4'), 'tmdisplay' => totranslate('Grid size : 4 x 4') ],
            5 => [ 'name' => totranslate('5 x 5'), 'tmdisplay' => totranslate('Grid size : 5 x 5') ],
            6 => [ 'name' => totranslate('6 x 6'), 'tmdisplay' => totranslate('Grid size : 6 x 6') ],
            7 => [ 'name' => totranslate('7 x 7'), 'tmdisplay' => totranslate('Grid size : 7 x 7') ],
            8 => [ 'name' => totranslate('8 x 8'), 'tmdisplay' => totranslate('Grid size : 8 x 8') ],
            9 => [ 'name' => totranslate('9 x 9'), 'tmdisplay' => totranslate('Grid size : 9 x 9') ],
            10 => [ 'name' => totranslate('10 x 10'), 'tmdisplay' => totranslate('Grid size : 10 x 10') ],
        ],
        'default' => 8
    ],
    121 => [
        'name' => totranslate('Items'),
        'values' => [
            3 => [ 'name' => totranslate('3 items'), 'tmdisplay' => totranslate('3 items') ],
            4 => [ 'name' => totranslate('4 items'), 'tmdisplay' => totranslate('4 items') ],
            5 => [ 'name' => totranslate('5 items'), 'tmdisplay' => totranslate('5 items') ],
            6 => [ 'name' => totranslate('6 items'), 'tmdisplay' => totranslate('6 items') ],
            7 => [ 'name' => totranslate('7 items'), 'tmdisplay' => totranslate('7 items') ],
            8 => [ 'name' => totranslate('8 items'), 'tmdisplay' => totranslate('8 items') ],
            9 => [ 'name' => totranslate('9 items'), 'tmdisplay' => totranslate('9 items') ],
            10 => [ 'name' => totranslate('10 items'), 'tmdisplay' => totranslate('10 items') ],
            11 => [ 'name' => totranslate('11 items'), 'tmdisplay' => totranslate('11 items') ],
            12 => [ 'name' => totranslate('12 items'), 'tmdisplay' => totranslate('12 items') ],
            13 => [ 'name' => totranslate('13 items'), 'tmdisplay' => totranslate('13 items') ],
            14 => [ 'name' => totranslate('14 items'), 'tmdisplay' => totranslate('14 items') ],
            15 => [ 'name' => totranslate('15 items'), 'tmdisplay' => totranslate('15 items') ],
            16 => [ 'name' => totranslate('16 items'), 'tmdisplay' => totranslate('16 items') ],
            17 => [ 'name' => totranslate('17 items'), 'tmdisplay' => totranslate('17 items') ],
            18 => [ 'name' => totranslate('18 items'), 'tmdisplay' => totranslate('18 items') ],
            19 => [ 'name' => totranslate('19 items'), 'tmdisplay' => totranslate('19 items') ],
            20 => [ 'name' => totranslate('20 items'), 'tmdisplay' => totranslate('20 items') ]
        ],
        'startcondition' => [
            15 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            16 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            17 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            18 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            19 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            20 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ]
        ],
        'default' => 10
    ],
    122 => [
        'name' => totranslate('Black holes'),
        'values' => [
            1 => [ 'name' => totranslate('yes'), 'tmdisplay' => totranslate('Black holes') ],
            2 => [ 'name' => totranslate('no') ]
        ],
        'default' => 1
    ],
    123 => [
        'name' => totranslate('Light warps'),
        'values' => [
            1 => [ 'name' => totranslate('yes'), 'tmdisplay' => totranslate('Light warps') ],
            2 => [ 'name' => totranslate('no') ]
        ],
        'default' => 2
    ],
    190 => [
        'name' => totranslate('Auto. start rounds'),
        'values' => [
            1 => [ 'name' => totranslate('yes') ],
            2 => [ 'name' => totranslate('no') ]
        ],
        'default' => 2,
        'displaycondition' => [
            [
             'type' => 'otheroption',
             'id' => GAMESTATE_CLOCK_MODE,
             'value' => [0,1,2,9],
           ],
        ]
    ]
];


