/**
 * This file makes several adjustments to the original code of the game
 * to make it work in experiment mode.
 */

var EXPERIMENT_GAME_PROFILES = {
	'a': {levelName: 'A1', sessionMaxDurationSeconds: 0, levelWidth: 1000, seed: 200, marioLives: 3, marioLarge: true, levelDifficulty: 0, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0, ValueMinOddsJump: 0, ValueMultiOddsJump: 0, CoinsMinLineStartOffset: 10, CoinsMinLineEndOffset: 10, BlocksMinLineStartOffset: 10, BlocksMinLineEndOffset: 10, ValueOddsStraight: 10, ValueOddsHillStraight: 0, EnemyCreationCeilControl: 400},
	'b': {levelName: 'B2', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 201, marioLives: 3, marioLarge: false, levelDifficulty: 1, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0, ValueMinOddsJump: 0, ValueMultiOddsJump: 0, CoinsMinLineStartOffset: 2, CoinsMinLineEndOffset: 2, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, ValueOddsStraight: 20, ValueOddsHillStraight: 3, EnemyCreationCeilControl: 150},
	'c': {levelName: 'C3', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 202, marioLives: 3, marioLarge: false, levelDifficulty: 1, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0},
	'd': {levelName: 'D4', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 203, marioLives: 3, marioLarge: false, levelDifficulty: 2},
	'e': {levelName: 'E5', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 204, marioLives: 3, marioLarge: false, levelDifficulty: 2},
	'f': {levelName: 'F6', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 205, marioLives: 3, marioLarge: false, levelDifficulty: 3},
	'g': {levelName: 'G7', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 206, marioLives: 3, marioLarge: false, levelDifficulty: 3},
	'h': {levelName: 'H8', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 207, marioLives: 3, marioLarge: false, levelDifficulty: 4},
	'i': {levelName: 'I9', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 208, marioLives: 3, marioLarge: false, levelDifficulty: 4},
	'j': {levelName: 'J10', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 209, marioLives: 3, marioLarge: false, levelDifficulty: 5},
	'k': {levelName: 'K11', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 210, marioLives: 3, marioLarge: false, levelDifficulty: 10},
	'l': {levelName: 'L12', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 211, marioLives: 3, marioLarge: false, levelDifficulty: 10},
	'm': {levelName: 'M13', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 212, marioLives: 3, marioLarge: false, levelDifficulty: 12},
	'n': {levelName: 'N14', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 213, marioLives: 3, marioLarge: false, levelDifficulty: 12},
	'o': {levelName: 'O15', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 214, marioLives: 3, marioLarge: false, levelDifficulty: 13},
	'p': {levelName: 'P16', sessionMaxDurationSeconds: 0, levelWidth: 800, seed: 215, marioLives: 3, marioLarge: false, levelDifficulty: 13},
	'q': {levelName: 'Q17', sessionMaxDurationSeconds: 0, levelWidth: 500, seed: 216, marioLives: 5, marioLarge: false, levelDifficulty: 14},
	'r': {levelName: 'R18', sessionMaxDurationSeconds: 0, levelWidth: 500, seed: 217, marioLives: 5, marioLarge: false, levelDifficulty: 14},
	's': {levelName: 'S19', sessionMaxDurationSeconds: 0, levelWidth: 500, seed: 218, marioLives: 5, marioLarge: true, levelDifficulty: 15, JumpLengthVariation: 3},
	't': {levelName: 'T20', sessionMaxDurationSeconds: 0, levelWidth: 500, seed: 219, marioLives: 5, marioLarge: true, levelDifficulty: 15, JumpMinLength: 3, JumpLengthVariation: 3}
};

var Experiment = {
	// Global game configuration related to the experiment
	startTime: Date.now(),
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
	},

	shouldHaveEndedByNow: function() {
		var aHasTimeLimit = 'sessionMaxDurationSeconds' in this.profile;

		if(aHasTimeLimit) {
			var aSessionMaxDurationMs = this.profile.sessionMaxDurationSeconds * 1000.0;
			var aElapsedTime = Date.now() - this.startTime;

			if(aSessionMaxDurationMs > 0 && aElapsedTime >= aSessionMaxDurationMs) {
				return true;
			}
		} else {
			return false;
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

	// Prevent abrupt termination of experiment because of weird keys
	document.addEventListener('keydown', FTG.Utils.preventedProblematicKeyboardKey);

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
