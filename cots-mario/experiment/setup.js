/**
 * This file makes several adjustments to the original code of the game
 * to make it work in experiment mode.
 */

var Experiment = {
	SEED: 200,
	LEVEL_DIFFICULTY: 2,
	ENABLE_DATA_LOG: true
};

if(GlobalInfo.experiment) {
	// We are running in experiment mode.

	// The base class SetupState which controls the setup of every game
	// during the experiment has already been loaded at this point. Let's
	// instantiate it and initialize everything.
	var aSetupState = new SetupState();
	aSetupState.initialize(false);

	// Create a global, seeded PRNG.
	var gMersennem = new MersenneTwister(Experiment.SEED);

	console.log('Adjusting game to work in experiment mode.');

	// Override Math.random() with the global PRNG, so we have control
	// over the randomness in the game
	Math.random = function() {
		return gMersennem.random();
	};
}
