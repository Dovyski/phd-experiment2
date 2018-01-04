/**
 * This file makes several adjustments to the original code of the game
 * to make it work in an experimental environment.
 */

var Experiment = {
	SEED: 200,
	active: true
};

// Create a global, seeded PRNG.
var gMersennem = new MersenneTwister(Experiment.SEED);

if(Experiment.active) {
	console.log('Adjusting game to work in experiment mode.');

	// Override Math.random() with the global PRNG, so we have control
	// over the randomness in the game
	Math.random = function() {
		return gMersennem.random();
	};
}
