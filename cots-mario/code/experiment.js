/**
 * This file makes several adjustments to the original code of the game
 * to make it work in an experimental environment.
 */

// Experiment settings
var EXPERIMENT_SEED = 200;

Mario.Experiment = {

};

console.log('Adjusting game to work in experiment mode.');

// Create a global, seeded PRNG.
var gMersennem = new MersenneTwister(EXPERIMENT_SEED);

// Override Math.random() with the global PRNG, so we have control
// over the randomness in the game
Math.random = function() {
	return gMersennem.random();
}
