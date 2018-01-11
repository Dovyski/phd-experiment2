/**
 * This is a bare minimum file containing logic to "fake" a game
 * during the experiment. A researcher can use this game to log
 * actions performed by a subject during the interaction with an
 * external game, e.g. COTS played in a mobile.
 */

var SKELETON = new function() {
	this.handleButtonClick = function(theButton) {
		var aAction = theButton.data('action');
		var aMilestone = theButton.data('milestone');

		if(aAction != undefined) {
			GlobalInfo.data.log({a: aAction}, true);
			GlobalInfo.data.send(GlobalInfo.user, GlobalInfo.game, true);

		} else if (aMilestone != undefined) {
			GlobalInfo.data.logMilestone(GlobalInfo.user, GlobalInfo.game, aMilestone);
		} else {
			console.error('Button has no data to be sent.');
		}
	};

	this.init = function() {
		// The base class SetupState which controls the setup of every game
		// during the experiment has already been loaded at this point. Let's
		// instantiate it and initialize everything.
		var aSetupState = new SetupState();
		aSetupState.initialize(false);

		// TODO: register callback for GlobalInfo.data

		$('button').click(function() {
			SKELETON.handleButtonClick($(this));
		});
	};
}

$(function() {
	SKELETON.init();
});
