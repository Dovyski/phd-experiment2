<?php

/**
 * Initializes the database.
 */

require_once(dirname(__FILE__) . '/config.php');

$aDb = new PDO('sqlite:' . DB_FILE);
$aDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$aDb->query('CREATE TABLE logs (fk_game INTEGER, timestamp INTEGER, uuid VARCHAR(36), data TEXT)');
$aDb->query('CREATE TABLE questionnaires (fk_game INTEGER, timestamp INTEGER, uuid VARCHAR(36), data TEXT)');
$aDb->query('CREATE TABLE games (id PRIMARY KEY, name VARCHAR(100))');
$aDb->query('CREATE INDEX idx_logs_fk_game ON logs (fk_game)');
$aDb->query('CREATE INDEX idx_questionnaire_fk_game ON questionnaires (fk_game)');

$aDb->query('INSERT INTO games (id, name) VALUES (1, \'Mushroom\')');
$aDb->query('INSERT INTO games (id, name) VALUES (2, \'Tetris\')');
$aDb->query('INSERT INTO games (id, name) VALUES (3, \'Platformer\')');
$aDb->query('INSERT INTO games (id, name) VALUES (4, \'Mario-A1\')');
$aDb->query('INSERT INTO games (id, name) VALUES (5, \'Mario-A2\')');
$aDb->query('INSERT INTO games (id, name) VALUES (6, \'Mario-A3\')');
$aDb->query('INSERT INTO games (id, name) VALUES (7, \'Mario-B1\')');
$aDb->query('INSERT INTO games (id, name) VALUES (8, \'Mario-B2\')');
$aDb->query('INSERT INTO games (id, name) VALUES (9, \'Mario-B3\')');
$aDb->query('INSERT INTO games (id, name) VALUES (10, \'Mario-C1\')');

echo 'Ok, database initialized';

?>
