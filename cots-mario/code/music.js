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
	"castle": "music_castle"
};

Mario.PlayMusic = function(name) {
	if(name in availableMusic) {
		// Stop anything currently playing then play the requested music
		Mario.StopMusic();
		Enjine.Resources.PlaySound(availableMusic[name], true);
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

Mario.PlayOvergroundMusic = function() {
	Mario.PlayMusic("overground");
};

Mario.PlayUndergroundMusic = function() {
	Mario.PlayMusic("underground");
};

Mario.PlayCastleMusic = function() {
	Mario.PlayMusic("castle");
};

Mario.StopMusic = function() {
	for(var name in availableMusic) {
		Enjine.Resources.PauseSound(availableMusic[name]);
		Enjine.Resources.ResetSound(availableMusic[name]);
	}
};
