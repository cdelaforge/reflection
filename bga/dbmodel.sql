
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
--
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

ALTER TABLE `player` ADD `player_puzzle_grid` TEXT NULL;
ALTER TABLE `player` ADD `player_puzzle` TEXT NULL;
ALTER TABLE `player` ADD `player_grid` TEXT NULL;
ALTER TABLE `player` ADD `player_progression` INT NOT NULL default '0';
ALTER TABLE `player` ADD `player_start` INT NOT NULL default '0';
ALTER TABLE `player` ADD `player_round_duration` INT NOT NULL default '0';
ALTER TABLE `player` ADD `player_rounds` INT NOT NULL default '0';
ALTER TABLE `player` ADD `player_round_score` INT NOT NULL default '0';
ALTER TABLE `player` ADD `player_total_duration` INT NOT NULL default '0';

CREATE TABLE IF NOT EXISTS `gamestatus` (
  `game_param` varchar(10) NOT NULL,
  `game_value` text NOT NULL,
  PRIMARY KEY (`game_param`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



