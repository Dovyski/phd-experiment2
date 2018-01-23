/**
 * This file makes several adjustments to the original code of the game
 * to make it work in experiment mode.
 */

var EXPERIMENT_GAME_PROFILES = {
	'a': {levelName: 'A1', levelWidth: 340, seed: 200, marioLives: 3, marioLarge: false, levelDifficulty: 1, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0},
	'b': {levelName: 'B2', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 1, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0},
	'c': {levelName: 'C3', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 1, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0},
	'd': {levelName: 'D4', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 2},
	'e': {levelName: 'E5', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 2},
	'f': {levelName: 'F6', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 3},
	'g': {levelName: 'G7', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 3},
	'h': {levelName: 'H8', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 4},
	'i': {levelName: 'I9', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 5},
	'j': {levelName: 'J10', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 5},
	'k': {levelName: 'K11', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 5},
	'l': {levelName: 'L12', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 6},
	'm': {levelName: 'M13', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 6},
	'n': {levelName: 'N14', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 7},
	'o': {levelName: 'O15', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 7},
	'p': {levelName: 'P16', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 8},
	'q': {levelName: 'Q17', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 8},
	'r': {levelName: 'R18', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 9},
	's': {levelName: 'S19', levelWidth: 340, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 9},
	't': {levelName: 'T20', levelWidth: 340, seed: 201, marioLives: 5, marioLarge: true, levelDifficulty: 10}
};

var Experiment = {
	// Global game configuration related to the experiment
	profile: EXPERIMENT_GAME_PROFILES['a'], // use first one by default
	ENABLE_DATA_LOG: true,

	// Some utility methods to ensure JS sanity
	config: function(theName) {
		if(theName in this.profile) {
			return this.profile[theName];
		} else {
			console.error('Unknown experiment game profile named "' + theName + '"');
			return undefined;
		}
	}
};

if(GlobalInfo.experiment) {
	// We are running in experiment mode.

	// The base class SetupState which controls the setup of every game
	// during the experiment has already been loaded at this point. Let's
	// instantiate it and initialize everything.
	var aSetupState = new SetupState();
	aSetupState.initialize(false);

	var aGameProfile = FTG.Utils.getURLParamByName('profile') || 'a';
	aGameProfile = aGameProfile.toLocaleLowerCase();

	if(aGameProfile in EXPERIMENT_GAME_PROFILES) {
		console.log('Adjusting game to work in experiment mode (profile: ' + aGameProfile + ')');
		Experiment.profile = EXPERIMENT_GAME_PROFILES[aGameProfile];
	} else {
		console.error('Unknown game profile: ' + aGameProfile);
	}

	// Create a global, seeded PRNG.
	var gMersennem = new MersenneTwister(Experiment.config('seed'));

	// Override Math.random() with the global PRNG, so we have control
	// over the randomness in the game
	Math.random = function() {
		return gMersennem.random();
	};
} else {
	// No experiment. Null all log calls
	GlobalInfo.data = { log: function() {}, send: function() {} };
}
