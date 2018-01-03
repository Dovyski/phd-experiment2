/* Made by Nambiar - Game Dolphin

Feel free to use and learn from */

Game = {};

var w = 400;
var h = 600;
var score = 0;
var width = 30;
var height = 30;
var force_down_max_time = 500;

Game.Load = function(game){

};

Game.Load.prototype = {
	preload : function(){
		this.stage.backgroundColor = "#000";
		this.game.stage.disableVisibilityChange = true; // Prevent pause when browser window loses focus

		this.preloadtext = this.add.text(this.game.world.centerX,this.game.world.centerY,"Loading..."+this.load.progress+"%",{ font: "20px Arial", fill: "#ff0044", align: "center" });
		this.preloadtext.anchor.setTo(0.5,0.5);

		this.load.audio('music','assets/music.ogg'); // CC-BY-3.0 http://opengameart.org/content/crystal-cave-mysterious-ambience-seamless-loop
		this.load.audio('sfx-snap','assets/mouseclick.ogg'); // CC-0 http://opengameart.org/content/mouse-click
		this.load.audio('sfx-move','assets/move.mp3'); // CC-BY-3.0 http://opengameart.org/content/ui-sound-effects-library
		this.load.audio('sfx-rotate','assets/rotate.mp3'); // CC-BY-3.0 http://opengameart.org/content/ui-sound-effects-library

		this.load.spritesheet('play','assets/play.png',100,80);
		this.load.spritesheet('next','assets/next.png',100,80);
		this.load.image('pause','assets/Pause.png');
		this.load.image('reset','assets/refresh.png');
		this.load.image('lose','assets/lose.png');
		this.load.image('arrow','assets/arrow.png?3');
		this.load.image('title','assets/Title.png?1');
		this.load.image('logo','assets/logo2.png');
		this.load.image('win','assets/win.png');
		this.load.spritesheet('blocks','assets/blocks.png?1',30,30);
		this.load.image('bck','assets/Bck.png');
		this.load.image('ingame-controls','assets/ingame-controls.png');

		// Assets required by setup state, etc.
		this.load.spritesheet('blue-button', '../card-flipper/assets/blue_button.png', 190, 49); // UI pack, by Kenney Vleugels (www.kenney.nl), CC0, http://www.kenney.nl

		// Load all JS required to make the experiment work
		this.load.script('ftg.collector.js', '../js/ftg.collector.js?3');
	},

	create : function(){
        this.game.state.start('setup');
	}
};
