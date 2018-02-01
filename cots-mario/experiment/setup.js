/**
 * This file makes several adjustments to the original code of the game
 * to make it work in experiment mode.
 */

var EXPERIMENT_GAME_PROFILES = {
	'a1': {levelName: 'A1', sessionMaxDurationSeconds: 150, levelWidth: 800, levelTimeLeft: 200, seed: 203, marioLives: 3, marioLarge: true, levelDifficulty: 0, levelType: 0, levelAllowedFlowers: 0, levelAllowedMushrooms: 2, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0, ValueMinOddsJump: 1, ValueMultiOddsJump: 1, JumpMinLength: 1, JumpLengthVariation: 2, CoinsMinLineStartOffset: 1, CoinsMinLineEndOffset: 1, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, ValueOddsStraight: 20, ValueOddsHillStraight: 10, EnemyCreationCeilControl: 120},
	'a2': {levelName: 'A2', sessionMaxDurationSeconds: 150, levelWidth: 700, levelTimeLeft: 200, seed: 204, marioLives: 3, marioLarge: false, levelDifficulty: 1, levelType: 1, levelAllowedFlowers: 1, levelAllowedMushrooms: 2, CoinsMinLineStartOffset: 1, CoinsMinLineEndOffset: 1, BlocksMinLineStartOffset: 1, BlocksMinLineEndOffset: 0},
	'a3': {levelName: 'A3', sessionMaxDurationSeconds: 150, levelWidth: 600, levelTimeLeft: 200, seed: 205, marioLives: 5, marioLarge: false, levelDifficulty: 3, levelType: 2, levelAllowedFlowers: 0, levelAllowedMushrooms: 1, JumpMinLength: 2, JumpLengthVariation: 2, CoinsMinLineStartOffset: 2, CoinsMinLineEndOffset: 2, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, EnemyCreationCeilControl: 35},

	'b1': {levelName: 'B1', sessionMaxDurationSeconds: 150, levelWidth: 800, levelTimeLeft: 145, seed: 2203, marioLives: 3, marioLarge: true, levelDifficulty: 1, levelType: 0, levelAllowedFlowers: 0, levelAllowedMushrooms: 2, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0, ValueMinOddsJump: 1, ValueMultiOddsJump: 1, JumpMinLength: 1, JumpLengthVariation: 2, CoinsMinLineStartOffset: 1, CoinsMinLineEndOffset: 1, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, ValueOddsStraight: 20, ValueOddsHillStraight: 10, EnemyCreationCeilControl: 100},
	'b2': {levelName: 'B2', sessionMaxDurationSeconds: 150, levelWidth: 700, levelTimeLeft: 145, seed: 2042, marioLives: 3, marioLarge: false, levelDifficulty: 2, levelType: 1, levelAllowedFlowers: 1, levelAllowedMushrooms: 2},
	'b3': {levelName: 'B3', sessionMaxDurationSeconds: 150, levelWidth: 600, levelTimeLeft: 145, seed: 2052, marioLives: 5, marioLarge: false, levelDifficulty: 4, levelType: 2, levelAllowedFlowers: 0, levelAllowedMushrooms: 1, JumpMinLength: 2, JumpLengthVariation: 2, CoinsMinLineStartOffset: 2, CoinsMinLineEndOffset: 2, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, EnemyCreationCeilControl: 35},

	'c1': {levelName: 'C1', sessionMaxDurationSeconds: 150, levelWidth: 700, levelTimeLeft: 145, seed: 3203, marioLives: 3, marioLarge: true, levelDifficulty: 1, levelType: 0, levelAllowedFlowers: 0, levelAllowedMushrooms: 2, ValueMinOddsTubes: 0, ValueMultiOddsTubes: 0, ValueMinOddsJump: 1, ValueMultiOddsJump: 1, JumpMinLength: 1, JumpLengthVariation: 2, CoinsMinLineStartOffset: 1, CoinsMinLineEndOffset: 1, BlocksMinLineStartOffset: 2, BlocksMinLineEndOffset: 2, ValueOddsStraight: 20, ValueOddsHillStraight: 10, EnemyCreationCeilControl: 80},
	'c2': {levelName: 'C2', sessionMaxDurationSeconds: 150, levelWidth: 600, levelTimeLeft: 145, seed: 3204, marioLives: 3, marioLarge: false, levelDifficulty: 3, levelType: 1, levelAllowedFlowers: 1, levelAllowedMushrooms: 2},
	'c3': {levelName: 'C3', sessionMaxDurationSeconds: 150, levelWidth: 500, levelTimeLeft: 145, seed: 3205, marioLives: 3, marioLarge: false, levelDifficulty: 5, levelType: 2, levelAllowedFlowers: 0, levelAllowedMushrooms: 1, JumpMinLength: 3, JumpLengthVariation: 2}
};

var Experiment = {
	// Global game configuration related to the experiment
	startTime: Date.now(),
	profile: EXPERIMENT_GAME_PROFILES['a1'], // use first one by default
	ENABLE_DATA_LOG: true,

	// Some utility methods to ensure JS sanity
	config: function(theName, theDefault) {
		if(theName in this.profile) {
			return this.profile[theName];

		} else if (theDefault !== undefined) {
			return theDefault;

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
	document.addEventListener('keydown', FTG.Utils.preventProblematicKeyboardKey);

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
