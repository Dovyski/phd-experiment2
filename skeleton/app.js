/**
 * This is a bare minimum file containing logic to "fake" a game
 * during the experiment. A researcher can use this game to log
 * actions performed by a subject during the interaction with an
 * external game, e.g. COTS played in a mobile.
 */

var SKELETON = new function() {
	this.console = function(theMessage) {
		var aNow = new Date();
		$('#console').prepend('<p>[' + aNow.toLocaleString('pt-BR') + '] ' + theMessage + '</p>');
	};

	this.handleButtonClick = function(theButton) {
		var aAction = theButton.data('action');
		var aMilestone = theButton.data('milestone');

		if(aAction != undefined) {
			this.console('ACTION: ' + aAction);
			GlobalInfo.data.log({a: aAction}, true);
			GlobalInfo.data.send(GlobalInfo.user, GlobalInfo.game, true);

		} else if (aMilestone != undefined) {
			this.console('MILESTONE: ' + aMilestone);
			GlobalInfo.data.logMilestone(GlobalInfo.user, GlobalInfo.game, aMilestone);
		} else {
			console.error('Button has no data to be sent.');
		}
	};

	this.onDataSent = function(theTextResponse) {
		SKELETON.console('<strong>Data sent! ' + theTextResponse + '</strong>');
	};

	this.init = function() {
		// The base class SetupState which controls the setup of every game
		// during the experiment has already been loaded at this point. Let's
		// instantiate it and initialize everything.
		var aSetupState = new SetupState();
		aSetupState.initialize(false);

		// Listen to events regarding data being sent
		GlobalInfo.data.onDataSent = this.onDataSent;

		$('button').click(function() {
			SKELETON.handleButtonClick($(this));
		});
	};
}

$(function() {
	SKELETON.init();
});
