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
        'name' => totranslate('Multiplayer mode'),
        'values' => [
            0 => [ 'name' => totranslate('Puzzles created by players'), 'tmdisplay' => totranslate('Puzzles created by players') ],
            10 => [ 'name' => totranslate('Randomly generated puzzles'), 'tmdisplay' => totranslate('Randomly generated puzzles') ],
        ],
        'default' => 0,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
    ],
    106 => [
        'name' => totranslate('Team mode'),
        'values' => [
            0 => [ 'name' => totranslate('No team') ],
            2 => [
                'name' => totranslate('2 teams'),
                'tmdisplay' => totranslate('2 teams'),
                'description' => totranslate('In "Real Time" mode, players see the items of their teammates.')
            ],
            3 => [
                'name' => totranslate('3 teams'),
                'tmdisplay' => totranslate('3 teams'),
                'description' => totranslate('In "Real Time" mode, players see the items of their teammates.')
             ],
        ],
        'default' => 0,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => [3, 4, 5, 6]
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 10,
            ],
        ]
    ],
    108 => [
        'name' => totranslate('Rounds'),
        'values' => [
            1 => [ 'name' => totranslate('1 round'), 'tmdisplay' => totranslate('1 round') ],
            3 => [ 'name' => totranslate('3 rounds'), 'tmdisplay' => totranslate('3 rounds') ],
            5 => [ 'name' => totranslate('5 rounds'), 'tmdisplay' => totranslate('5 rounds') ],
        ],
        'default' => 3,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 10,
            ],
        ],
    ],
    109 => [
        'name' => totranslate('Players compete on the same puzzles'),
        'values' => [
            1 => [
                'name' => totranslate('Yes'),
                'description' => totranslate('There are as many rounds as there are players, but for each round the player who proposed the current puzzle does not play.'),
                'tmdisplay' => totranslate('Players compete on the same puzzles')
            ],
            2 => [
                'name' => totranslate('No'),
                'description' => totranslate('There is one less round than there are players. In each round each player works on a different player\'s puzzle.')
            ]
        ],
        'default' => 2,
        'displaycondition' => [
            [
                'type' => 'minplayers',
                'value' => [3, 4, 5, 6]
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 0,
            ],
        ]
    ],
    119 => [
        'name' => totranslate('Maximum time to solve a puzzle'),
        'values' => [
            2 => [
                'name' => totranslate('2 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('2 minutes max. per round'),
            ],
            5 => [
                'name' => totranslate('5 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('5 minutes max. per round'),
            ],
            10 => [
                'name' => totranslate('10 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('10 minutes max. per round'),
            ],
            15 => [
                'name' => totranslate('15 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('15 minutes max. per round'),
            ],
            20 => [
                'name' => totranslate('20 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('20 minutes max. per round'),
            ],
            25 => [
                'name' => totranslate('25 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('25 minutes max. per round'),
            ],
            30 => [
                 'name' => totranslate('30 minutes'),
                 'description' => totranslate('After this time, the player will be forced to give up'),
                 'tmdisplay' => totranslate('30 minutes max. per round'),
            ],
            60 => [
                'name' => totranslate('1 hour (Recommended only with friends or in turn-based mode)'),
                'description' => totranslate('After this time, the player will be forced to give up'),
            ],
        ],
        'default' => 10,
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
            1 => [ 'name' => totranslate('Yes'), 'tmdisplay' => totranslate('Black holes') ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 1
    ],
    123 => [
        'name' => totranslate('Light warps'),
        'values' => [
            1 => [ 'name' => totranslate('Yes'), 'tmdisplay' => totranslate('Light warps') ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 2
    ],
    190 => [
        'name' => totranslate('Auto. start rounds'),
        'values' => [
            1 => [ 'name' => totranslate('Yes') ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 2,
        'displaycondition' => [
            [
             'type' => 'otheroption',
             'id' => GAMESTATE_CLOCK_MODE,
             'value' => [0,1,2,9],
            ],
            [
                'type' => 'otheroption',
                'id' => 103,
                'value' => 666,
            ],

        ]
    ]
];


