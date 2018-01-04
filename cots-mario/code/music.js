/*
* using cross platform MIDI library MIDI.js http://www.midijs.net/
*/

var midifiles = {
	"title" : "midi/title.mid",
	"map" : "midi/map.mid",
	"background" : "midi/background.mid",
	"overground" : "midi/overground.mid",
	"underground" : "midi/underground.mid",
	"castle" : "midi/castle.mid",
};

var availableMusic = {
	"title": "music_title",
	"map": "music_map",
	"background": "music_background"
};

Mario.PlayMusic = function(name) {
	if(name in availableMusic)
	{
		// Stop anything currently playing then play the requested music
		Enjine.Resources.ResetSounds();
		Enjine.Resources.PlaySound(availableMusic[name], true);
	}else{
		console.error("Cannot play music track " + name + " as it has no data.");
	}
};

Mario.PlayTitleMusic = function() {
	Mario.PlayMusic("title");
};

Mario.PlayMapMusic = function() {
	Mario.PlayMusic("map");
};

Mario.PlayOvergroundMusic = function() {
	Mario.PlayMusic("background");
};

Mario.PlayUndergroundMusic = function() {
	Mario.PlayMusic("underground");
};

Mario.PlayCastleMusic = function() {
	Mario.PlayMusic("castle");
};

Mario.StopMusic = function() {
	Enjine.Resources.ResetSounds();
};
