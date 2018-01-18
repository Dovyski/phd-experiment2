/**
 * This file makes several adjustments to the original code of the game
 * to make it work in experiment mode.
 */

var EXPERIMENT_GAME_PROFILES = {
	'a': {seed: 200, levelDifficulty: 2},
	'b': {seed: 201, levelDifficulty: 10},
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

	var aGameProfile = FTG.Utils.getURLParamByName('profile');

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
