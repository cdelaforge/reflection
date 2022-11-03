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
    100 => [
        'name' => totranslate('Solo mode'),
        'values' => [
            0 => [ 'name' => totranslate('No challenge'), 'description' => totranslate('Play as much as you want') ],
            3 => [ 'name' => totranslate('Challenge 1 - Easy'), 'description' => totranslate('Solve 3 puzzles to win') ],
            6 => [ 'name' => totranslate('Challenge 2 - Medium'), 'description' => totranslate('Solve 6 puzzles to win (10 items min. and 15 minutes max. per round)') ],
            10 => [ 'name' => totranslate('Challenge 3 - Hard'), 'description' => totranslate('Solve 10 puzzles to win (15 items min. and 10 minutes max. per round)') ],
            100 => [ 'name' => totranslate('Design a puzzle'), 'description' => totranslate('Create a puzzle to share with other players') ],
            101 => [ 'name' => totranslate('Solve a puzzle designed by another player'), 'description' => totranslate('You will need the seed code of a puzzle') ],
        ],
        'default' => 0,
        'displaycondition' => [
            [
                'type' => 'maxplayers',
                'value' => 1,
            ],
        ],
    ],
    103 => [
        'name' => totranslate('Multiplayer mode'),
        'values' => [
            0 => [
                'name' => totranslate('Puzzles created by players'),
                'description' => totranslate('Lower the number of players to "1" to select a solo game mode.'),
                'tmdisplay' => totranslate('Puzzles created by players')
            ],
            10 => [
                'name' => totranslate('Randomly generated puzzles'),
                'description' => totranslate('Lower the number of players to "1" to select a solo game mode.'),
                'tmdisplay' => totranslate('Randomly generated puzzles')
            ],
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
    107 => [
        'name' => totranslate('Ensure balanced teams'),
        'values' => [
            1 => [ 'name' => totranslate('Yes') ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 1,
        'displaycondition' => [
            [
                'type' => 'otheroption',
                'id' => 106,
                'value' => [2, 3],
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
                'nobeginner' => true
            ],
            5 => [
                'name' => totranslate('5 minutes'),
                'description' => totranslate('After this time, the player will be forced to give up'),
                'tmdisplay' => totranslate('5 minutes max. per round'),
                'nobeginner' => true
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
            4 => [ 'name' => totranslate('4×4'), 'tmdisplay' => totranslate('Grid 4×4') ],
            5 => [ 'name' => totranslate('5×5'), 'tmdisplay' => totranslate('Grid 5×5') ],
            6 => [ 'name' => totranslate('6×6'), 'tmdisplay' => totranslate('Grid 6×6') ],
            7 => [ 'name' => totranslate('7×7'), 'tmdisplay' => totranslate('Grid 7×7') ],
            8 => [ 'name' => totranslate('8×8'), 'tmdisplay' => totranslate('Grid 8×8') ],
            9 => [ 'name' => totranslate('9×9'), 'tmdisplay' => totranslate('Grid 9×9') ],
            10 => [ 'name' => totranslate('10×10'), 'tmdisplay' => totranslate('Grid 10×10') ],
            11 => [ 'name' => totranslate('11×11'), 'tmdisplay' => totranslate('Grid 11×11') ],
            12 => [ 'name' => totranslate('12×12'), 'tmdisplay' => totranslate('Grid 12×12') ],
        ],
        'default' => 8,
        'displayconditionoperand' => 'or',
        'displaycondition' => [
            [
                'type' => 'otheroptionisnot',
                'id' => 100,
                'value' => 101,
            ],
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
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
            13 => [ 'name' => totranslate('13 items'), 'tmdisplay' => totranslate('13 items'), 'nobeginner' => true ],
            14 => [ 'name' => totranslate('14 items'), 'tmdisplay' => totranslate('14 items'), 'nobeginner' => true ],
            15 => [ 'name' => totranslate('15 items'), 'tmdisplay' => totranslate('15 items'), 'nobeginner' => true ],
            16 => [ 'name' => totranslate('16 items'), 'tmdisplay' => totranslate('16 items'), 'nobeginner' => true ],
            17 => [ 'name' => totranslate('17 items'), 'tmdisplay' => totranslate('17 items'), 'nobeginner' => true ],
            18 => [ 'name' => totranslate('18 items'), 'tmdisplay' => totranslate('18 items'), 'nobeginner' => true ],
            19 => [ 'name' => totranslate('19 items'), 'tmdisplay' => totranslate('19 items'), 'nobeginner' => true ],
            20 => [ 'name' => totranslate('20 items'), 'tmdisplay' => totranslate('20 items'), 'nobeginner' => true ],
            21 => [ 'name' => totranslate('21 items'), 'tmdisplay' => totranslate('21 items'), 'nobeginner' => true ],
            22 => [ 'name' => totranslate('22 items'), 'tmdisplay' => totranslate('22 items'), 'nobeginner' => true ],
            23 => [ 'name' => totranslate('23 items'), 'tmdisplay' => totranslate('23 items'), 'nobeginner' => true ],
            24 => [ 'name' => totranslate('24 items'), 'tmdisplay' => totranslate('24 items'), 'nobeginner' => true ],
            25 => [ 'name' => totranslate('25 items'), 'tmdisplay' => totranslate('25 items'), 'nobeginner' => true ],
            26 => [ 'name' => totranslate('26 items'), 'tmdisplay' => totranslate('26 items'), 'nobeginner' => true ],
            27 => [ 'name' => totranslate('27 items'), 'tmdisplay' => totranslate('27 items'), 'nobeginner' => true ],
            28 => [ 'name' => totranslate('28 items'), 'tmdisplay' => totranslate('28 items'), 'nobeginner' => true ],
            29 => [ 'name' => totranslate('29 items'), 'tmdisplay' => totranslate('29 items'), 'nobeginner' => true ],
            30 => [ 'name' => totranslate('30 items'), 'tmdisplay' => totranslate('30 items'), 'nobeginner' => true ]
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
            ],
            21 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            22 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            23 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            24 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            25 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            26 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            27 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            28 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            29 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ],
            30 => [
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 4,
                    'message' => totranslate('There are too many items for the selected grid size')
                ],
                [
                    'type' => 'otheroptionisnot',
                    'id' => 120,
                    'value' => 5,
                    'message' => totranslate('There are too many items for the selected grid size')
                ]
            ]
        ],
        'default' => 10,
        'displayconditionoperand' => 'or',
        'displaycondition' => [
            [
                'type' => 'otheroptionisnot',
                'id' => 100,
                'value' => 101,
            ],
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
    ],
    122 => [
        'name' => totranslate('Black holes'),
        'values' => [
            1 => [ 'name' => totranslate('Yes'), 'tmdisplay' => totranslate('Black holes') ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 1,
        'displayconditionoperand' => 'or',
        'displaycondition' => [
            [
                'type' => 'otheroptionisnot',
                'id' => 100,
                'value' => 101,
            ],
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
    ],
    123 => [
        'name' => totranslate('Light warps'),
        'values' => [
            1 => [ 'name' => totranslate('Yes'), 'tmdisplay' => totranslate('Light warps'), 'nobeginner' => true ],
            2 => [ 'name' => totranslate('No') ]
        ],
        'default' => 2,
        'displayconditionoperand' => 'or',
        'displaycondition' => [
            [
                'type' => 'otheroptionisnot',
                'id' => 100,
                'value' => 101,
            ],
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
    ],
    124 => [
        'name' => totranslate('Special shapes'),
        'values' => [
            0 => [ 'name' => totranslate('No') ],
            1 => [ 'name' => totranslate('Squares') ],
            2 => [ 'name' => totranslate('Triangles'), 'nobeginner' => true ],
            3 => [ 'name' => totranslate('Squares and triangles'), 'nobeginner' => true ],
        ],
        'default' => 1,
        'displayconditionoperand' => 'or',
        'displaycondition' => [
            [
                'type' => 'otheroptionisnot',
                'id' => 100,
                'value' => 101,
            ],
            [
                'type' => 'minplayers',
                'value' => [2, 3, 4, 5, 6]
            ],
        ]
    ],
    191 => [
        'name' => totranslate("Allow solutions that don't use all the items"),
        'values' => [
            1 => [ 'name' => totranslate('Yes') ],
            2 => [ 'name' => totranslate('No'), 'tmdisplay' => totranslate('All items must be used') ]
        ],
        'default' => 1
    ]
];

$game_preferences = [
    100 => array(
        'name' => totranslate('Stack items in the stock'),
        'needReload' => false,
        'values' => [
            1 => [ 'name' => totranslate( 'Yes' ) ],
            2 => [ 'name' => totranslate( 'No' ) ]
        ],
        'default' => 1
    ),
    110 => array(
        'name' => totranslate('Background'),
        'needReload' => false,
        'values' => [
            0 => [ 'name' => 'BoardGameArena' ],
            10 => [ 'name' => 'Space', 'cssPref' => 'space' ]
        ],
        'default' => 10
    ),
];
