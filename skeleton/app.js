/**
 * This is a bare minimum file containing logic to "fake" a game
 * during the experiment. A researcher can use this game to log
 * actions performed by a subject during the interaction with an
 * external game, e.g. COTS played in a mobile.
 */

var SKELETON = new function() {
	this.testA = function() {
		console.log('testA');
	};

	this.handleAction = function(theAction) {
		if(typeof SKELETON[theAction] != "function") {
			console.error('Unable to find action: ' + theAction);
			return;
		}

		SKELETON[theAction].call(this);
	};

	this.init = function() {
		// The base class SetupState which controls the setup of every game
		// during the experiment has already been loaded at this point. Let's
		// instantiate it and initialize everything.
		var aSetupState = new SetupState();
		aSetupState.initialize(false);

		$('button').click(function() {
			var aAction = $(this).data('action');
			SKELETON.handleAction(aAction);
		});
	};
}

$(function() {
	SKELETON.init();
});
