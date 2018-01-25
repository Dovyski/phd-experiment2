/**
	State shown when the player loses!
	Code by Rob Kleffner, 2011
*/

Mario.LoseState = function(message) {
    this.message = message;
    this.drawManager = null;
    this.camera = null;
    this.gameOver = null;
    this.font = null;
    this.wasKeyDown = false;
    this.ended = false;
};

Mario.LoseState.prototype = new Enjine.GameState();

Mario.LoseState.prototype.Enter = function() {
    this.drawManager = new Enjine.DrawableManager();
    this.camera = new Enjine.Camera();

    this.gameOver = new Enjine.AnimatedSprite();
    this.gameOver.Image = Enjine.Resources.Images["gameOverGhost"];
    this.gameOver.SetColumnCount(9);
    this.gameOver.SetRowCount(1);
    this.gameOver.AddNewSequence("turnLoop", 0, 0, 0, 8);
    this.gameOver.PlaySequence("turnLoop", true);
    this.gameOver.FramesPerSecond = 1/15;
    this.gameOver.X = 112;
    this.gameOver.Y = 68;

    this.font = Mario.SpriteCuts.CreateBlackFont();
    this.font.Strings[0] = { String: this.message, X: 160 - ((this.message.length * 8 / 2) | 0), Y: 160 };
    this.font.Strings[1] = { String: "Click HERE to continue", X: 70, Y: 175 };

    this.drawManager.Add(this.font);
    this.drawManager.Add(this.gameOver);

    if(GlobalInfo.experiment) {
        GlobalInfo.data.logMilestone(GlobalInfo.user, GlobalInfo.game, 'game_end');
        console.log('Game duration: ' + ((Date.now() - Experiment.startTime) / 1000) + ' seconds');
    }
};

Mario.LoseState.prototype.Exit = function() {
    this.drawManager.Clear();
    delete this.drawManager;
    delete this.camera;
    delete this.gameOver;
    delete this.font;
};

Mario.LoseState.prototype.Update = function(delta) {
    this.drawManager.Update(delta);
    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S)) {
        this.wasKeyDown = true;
    }
};

Mario.LoseState.prototype.Draw = function(context) {
    this.drawManager.Draw(context, this.camera);
};

Mario.LoseState.prototype.CheckForChange = function(context) {
    if(GlobalInfo.experiment) {
        if(Enjine.MouseInput.IsMouseDown() && !this.ended) {
            this.ended = true;
            GlobalInfo.experiment.concludeCurrentGame();
        }
    } else {
        if(this.wasKeyDown && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S)) {
            context.ChangeState(new Mario.TitleState());
        }
    }
};
