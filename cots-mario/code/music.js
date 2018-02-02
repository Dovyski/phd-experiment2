/*
* Play music using the machinery provided by Enjine.
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
	"background": "music_background",
	"overground": "music_overground",
	"underground": "music_underground",
	"castle": "music_castle",
	"overground_hurryup": "music_overground_hurryup",
	"underground_hurryup": "music_underground_hurryup",
	"castle_hurryup": "music_castle_hurryup"
};

Mario.PlayMusic = function(name) {
	if(name in availableMusic) {
		// Stop anything currently playing then play the requested music
		Mario.StopMusic();
		Enjine.Resources.PlaySound(availableMusic[name], true, 0.5);
	} else {
		console.error("Cannot play music track " + name + " as it has no data.");
	}
};

Mario.PlayTitleMusic = function() {
	Mario.PlayMusic("title");
};

Mario.PlayMapMusic = function() {
	Mario.PlayMusic("map");
};

Mario.PlayOvergroundMusic = function(hurry) {
	Mario.PlayMusic(hurry ? "overground_hurryup" : "overground");
};

Mario.PlayUndergroundMusic = function(hurry) {
	Mario.PlayMusic(hurry ? "underground_hurryup" : "underground");
};

Mario.PlayCastleMusic = function(hurry) {
	Mario.PlayMusic(hurry ? "castle_hurryup" : "castle");
};

Mario.StopMusic = function() {
	for(var name in availableMusic) {
		Enjine.Resources.PauseSound(availableMusic[name]);
		Enjine.Resources.ResetSound(availableMusic[name]);
	}
};
