/**
	State for actually playing a randomly generated level.
	Code by Rob Kleffner, 2011
*/

Mario.LevelState = function(difficulty, type, seed, width, autoScrolling, autoScrollingSpeed) {
    this.LevelDifficulty = difficulty;
    this.LevelType = type;
    this.LevelSeed = seed;
    this.LevelWidth = width;
    this.LevelAutoScrolling = autoScrolling === undefined ? false : autoScrolling;
    this.AutoScrollingSpeed = autoScrollingSpeed || 0.7;
    this.Level = null;
    this.Layer = null;
    this.BgLayer = [];

    this.Paused = false;
    this.Sprites = null;
    this.SpritesToAdd = null;
    this.SpritesToRemove = null;
    this.Camera = null;
    this.ShellsToCheck = null;
    this.FireballsToCheck = null;

    this.CollectedMushrooms = 0;
    this.CollectedFlowers = 0;
    this.AllowedFlowers = 400;    // max amount of flowers allowed to be collected in this level
    this.AllowedMushrooms = 400;  // max amount of mushroom allowed to be collected in this level

    this.FontShadow = null;
    this.Font = null;

    this.MusicSilenceTimer = 0;
    this.MusicIsInSilence = false;
    this.InHurryUp = false;
    this.HurryUpLimit = 61;

    this.TimeLeft = 0;
    this.StartTime = 0;
    this.FireballsOnScreen = 0;
    this.Tick = 0;

    this.Delta = 0;

    this.LoseStateMessage = "Game Over!";
	this.GotoMapState = false;
	this.GotoLoseState = false;
};

Mario.LevelState.prototype = new Enjine.GameState();

Mario.LevelState.prototype.Enter = function() {
    var levelGenerator = new Mario.LevelGenerator(this.LevelWidth, 15), i = 0, scrollSpeed = 0, w = 0, h = 0, bgLevelGenerator = null;
    this.Level = levelGenerator.CreateLevel(this.LevelType, this.LevelDifficulty, this.LevelSeed);

    this.PlayLevelMusic();

    this.Paused = false;
    this.Layer = new Mario.LevelRenderer(this.Level, 320, 240);
    this.Sprites = new Enjine.DrawableManager();
    this.Camera = new Enjine.Camera();
    this.Tick = 0;

    this.ShellsToCheck = [];
    this.FireballsToCheck = [];
    this.SpritesToAdd = [];
    this.SpritesToRemove = [];

    this.FontShadow = Mario.SpriteCuts.CreateBlackFont();
    this.Font = Mario.SpriteCuts.CreateWhiteFont();

    this.MusicSilenceTimer = 0;
    this.MusicIsInSilence = false;
    this.InHurryUp = false;

    for (i = 0; i < 2; i++) {
        scrollSpeed = 4 >> i;
        w = ((((this.Level.Width * 16) - 320) / scrollSpeed) | 0) + 320;
        h = ((((this.Level.Height * 16) - 240) / scrollSpeed) | 0) + 240;
        bgLevelGenerator = new Mario.BackgroundGenerator(w / 32 + 1, h / 32 + 1, i === 0, this.LevelType);
        this.BgLayer[i] = new Mario.BackgroundRenderer(bgLevelGenerator.CreateLevel(), 320, 240, scrollSpeed);
    }

    this.CollectedMushrooms = 0;
    this.CollectedFlowers = 0;

    // If in experimet mode, adjust mario according to instructions
    if(GlobalInfo.experiment) {
        Mario.MarioCharacter.Large = Experiment.config('marioLarge', false);
        this.AllowedFlowers = Experiment.config('levelAllowedFlowers', 400);
        this.AllowedMushrooms = Experiment.config('levelAllowedMushrooms', 400);
    }

    Mario.MarioCharacter.Initialize(this);

    this.Sprites.Add(Mario.MarioCharacter);
    this.StartTime = 1;
    this.TimeLeft = 200;

	this.GotoMapState = false;
	this.GotoLoseState = false;

    if(GlobalInfo.experiment) {
        this.TimeLeft = Experiment.config('levelTimeLeft', 200);
    }

    GlobalInfo.data.log({a: 'level_start', n: Experiment.config('levelName')}, true);
};

Mario.LevelState.prototype.Exit = function() {

    delete this.Level;
    delete this.Layer;
    delete this.BgLayer;
    delete this.Sprites;
    delete this.Camera;
    delete this.ShellsToCheck;
    delete this.FireballsToCheck;
    delete this.FontShadow;
    delete this.Font;
};

Mario.LevelState.prototype.CheckShellCollide = function(shell) {
    this.ShellsToCheck.push(shell);
};

Mario.LevelState.prototype.CheckFireballCollide = function(fireball) {
    this.FireballsToCheck.push(fireball);
};

Mario.LevelState.prototype.PlayLevelMusic = function(hurryup) {
    hurryup = hurryup === undefined ? false : hurryup;

    if (this.LevelType === Mario.LevelType.Overground) {
        Mario.PlayOvergroundMusic(hurryup);
    } else if (this.LevelType === Mario.LevelType.Underground) {
        Mario.PlayUndergroundMusic(hurryup);
    } else if (this.LevelType === Mario.LevelType.Castle) {
        Mario.PlayCastleMusic(hurryup);
    }
};

Mario.LevelState.prototype.UpdateHurryUpAlert = function(delta) {
    if(this.MusicIsInSilence) {
        this.MusicSilenceTimer -= delta;

        if(this.MusicSilenceTimer <= 0) {
            this.MusicIsInSilence = false;
            this.PlayLevelMusic(this.InHurryUp);
        }
    }

    if(!this.InHurryUp && this.TimeLeft <= this.HurryUpLimit) {
        this.InHurryUp = true;
        this.MusicIsInSilence = true;
        this.MusicSilenceTimer = 2.5;

        Mario.StopMusic();
        Enjine.Resources.PlaySound("hurryup");
    }
};

Mario.LevelState.prototype.Update = function(delta) {
    var i = 0, j = 0, xd = 0, yd = 0, sprite = null, hasShotCannon = false, xCannon = 0, x = 0, y = 0,
        dir = 0, st = null, b = 0;

    this.Delta = delta;

    this.TimeLeft -= delta;
    if ((this.TimeLeft | 0) === 0) {
        if(Mario.MarioCharacter.DeathTime == 0) {
            GlobalInfo.data.log({a: 'mario_hurt', t: 'timeout', x: (Mario.MarioCharacter.X | 0)}, true);
        }
        Mario.MarioCharacter.Die();
    }

    if (this.StartTime > 0) {
        this.StartTime++;
    }

    this.UpdateHurryUpAlert(delta);

    if(!this.LevelAutoScrolling) {
        this.Camera.X = Mario.MarioCharacter.X - 160;
    }

    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }

    this.FireballsOnScreen = 0;

    for (i = 0; i < this.Sprites.Objects.length; i++) {
        sprite = this.Sprites.Objects[i];
        if (sprite !== Mario.MarioCharacter) {
            xd = sprite.X - this.Camera.X;
            yd = sprite.Y - this.Camera.Y;
            if (xd < -64 || xd > 320 + 64 || yd < -64 || yd > 240 + 64) {
                this.Sprites.RemoveAt(i);
            } else {
                if (sprite instanceof Mario.Fireball) {
                    this.FireballsOnScreen++;
                }
            }
        }
    }

    if (this.Paused) {
        for (i = 0; i < this.Sprites.Objects.length; i++) {
            if (this.Sprites.Objects[i] === Mario.MarioCharacter) {
                this.Sprites.Objects[i].Update(delta);
            } else {
                this.Sprites.Objects[i].UpdateNoMove(delta);
            }
        }
    } else {
        this.Layer.Update(delta);
        this.Level.Update();

        hasShotCannon = false;
        xCannon = 0;
		this.Tick++;

        for (x = ((this.Camera.X / 16) | 0) - 1; x <= (((this.Camera.X + this.Layer.Width) / 16) | 0) + 1; x++) {
            for (y = ((this.Camera.Y / 16) | 0) - 1; y <= (((this.Camera.Y + this.Layer.Height) / 16) | 0) + 1; y++) {
                dir = 0;

                if (x * 16 + 8 > Mario.MarioCharacter.X + 16) {
                    dir = -1;
                }
                if (x * 16 + 8 < Mario.MarioCharacter.X - 16) {
                    dir = 1;
                }

                st = this.Level.GetSpriteTemplate(x, y);

                if (st !== null) {
                    if (st.LastVisibleTick !== this.Tick - 1) {
                        if (st.Sprite === null || !this.Sprites.Contains(st.Sprite)) {
                            st.Spawn(this, x, y, dir);
                        }
                    }

                    st.LastVisibleTick = this.Tick;
                }

                if (dir !== 0) {
                    b = this.Level.GetBlock(x, y);
                    if (((Mario.Tile.Behaviors[b & 0xff]) & Mario.Tile.Animated) > 0) {
                        if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                            if ((this.Tick - x * 2) % 100 === 0) {
                                xCannon = x;
                                for (i = 0; i < 8; i++) {
                                    this.AddSprite(new Mario.Sparkle(this, x * 16 + 8, y * 16 + ((Math.random() * 16) | 0), Math.random() * dir, 0, 0, 1, 5));
                                }
                                this.AddSprite(new Mario.BulletBill(this, x * 16 + 8 + dir * 8, y * 16 + 15, dir));
                                hasShotCannon = true;
                            }
                        }
                    }
                }
            }
        }

        if (hasShotCannon) {
            Enjine.Resources.PlaySound("cannon");
        }

        for (i = 0; i < this.Sprites.Objects.length; i++) {
            this.Sprites.Objects[i].Update(delta);
        }

        for (i = 0; i < this.Sprites.Objects.length; i++) {
            this.Sprites.Objects[i].CollideCheck();
        }

        for (i = 0; i < this.ShellsToCheck.length; i++) {
            for (j = 0; j < this.Sprites.Objects.length; j++) {
                if (this.Sprites.Objects[j] !== this.ShellsToCheck[i] && !this.ShellsToCheck[i].Dead) {
                    if (this.Sprites.Objects[j].ShellCollideCheck(this.ShellsToCheck[i])) {
                        if (Mario.MarioCharacter.Carried === this.ShellsToCheck[i] && !this.ShellsToCheck[i].Dead) {
                            Mario.MarioCharacter.Carried = null;
                            this.ShellsToCheck[i].Die();
                        }
                    }
                }
            }
        }
        this.ShellsToCheck.length = 0;

        for (i = 0; i < this.FireballsToCheck.length; i++) {
            for (j = 0; j < this.Sprites.Objects.length; j++) {
                if (this.Sprites.Objects[j] !== this.FireballsToCheck[i] && !this.FireballsToCheck[i].Dead) {
                    if (this.Sprites.Objects[j].FireballCollideCheck(this.FireballsToCheck[i])) {
                        this.FireballsToCheck[i].Die();
                    }
                }
            }
        }

        this.FireballsToCheck.length = 0;
    }

    this.Sprites.AddRange(this.SpritesToAdd);
    this.Sprites.RemoveList(this.SpritesToRemove);
    this.SpritesToAdd.length = 0;
    this.SpritesToRemove.length = 0;

    if(this.LevelAutoScrolling) {
        this.UpdateAutoScrolling();
    } else {
        this.Camera.X = (Mario.MarioCharacter.XOld + (Mario.MarioCharacter.X - Mario.MarioCharacter.XOld) * delta) - 160;
        this.Camera.Y = (Mario.MarioCharacter.YOld + (Mario.MarioCharacter.Y - Mario.MarioCharacter.YOld) * delta) - 120;
    }

    if(GlobalInfo.experiment && Experiment.ENABLE_DATA_LOG) {
        GlobalInfo.data.send(GlobalInfo.user, GlobalInfo.game);
    }
};

Mario.LevelState.prototype.UpdateAutoScrolling = function() {
    var marioScreenX = 0;

    if(Mario.MarioCharacter.DeathTime > 0) {
        return;
    }

    this.Camera.X += this.AutoScrollingSpeed;
    marioScreenX = Mario.MarioCharacter.X - this.Camera.X;

    if(marioScreenX < 9) {
        Mario.MarioCharacter.X = this.Camera.X + 10;

        if(this.WasMarioCrushed()) {
            if(Mario.MarioCharacter.DeathTime == 0) {
                GlobalInfo.data.log({a: 'mario_hurt', t: 'crushed', x: (Mario.MarioCharacter.X | 0)}, true);
            }
            Mario.MarioCharacter.Die();
        }
    } else if (marioScreenX >= (320 - 8)) {
        Mario.MarioCharacter.X = this.Camera.X + 320 - 8;
    }
};

Mario.LevelState.prototype.WasMarioCrushed = function() {
    var block = 0, x = Mario.MarioCharacter.X, y = Mario.MarioCharacter.Y;

    x = (x / 16) | 0;
    y = (y / 16) | 0;

    block = Mario.MarioCharacter.World.Level.GetBlock(x, y);

    if (((Mario.Tile.Behaviors[block & 0xff]) & Mario.Tile.BlockAll) > 0) {
        return true;
    }

    return false;
};

Mario.LevelState.prototype.Draw = function(context) {
    var i = 0, time = 0, t = 0;

    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.Y < 0) {
        this.Camera.Y = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }
    if (this.Camera.Y > this.Level.Height * 16 - 240) {
        this.Camera.Y = this.Level.Height * 16 - 240;
    }

    for (i = 0; i < 2; i++) {
        this.BgLayer[i].Draw(context, this.Camera);
    }

    context.save();
    context.translate(-this.Camera.X, -this.Camera.Y);
    for (i = 0; i < this.Sprites.Objects.length; i++) {
        if (this.Sprites.Objects[i].Layer === 0) {
            this.Sprites.Objects[i].Draw(context, this.Camera);
        }
    }
    context.restore();

    this.Layer.Draw(context, this.Camera);
    this.Layer.DrawExit0(context, this.Camera, Mario.MarioCharacter.WinTime === 0);

    context.save();
    context.translate(-this.Camera.X, -this.Camera.Y);
    for (i = 0; i < this.Sprites.Objects.length; i++) {
        if (this.Sprites.Objects[i].Layer === 1) {
            this.Sprites.Objects[i].Draw(context, this.Camera);
        }
    }
    context.restore();

    this.Layer.DrawExit1(context, this.Camera);

    this.DrawStringShadow(context, "MARIO " + Mario.MarioCharacter.Lives, 0, 0);
    this.DrawStringShadow(context, this.PadString(8, "0", Mario.MarioCharacter.Score), 0, 1);
    this.DrawStringShadow(context, "COIN", 14, 0);
    this.DrawStringShadow(context, " " + Mario.MarioCharacter.Coins, 14, 1);
    this.DrawStringShadow(context, "WORLD", 24, 0);
    this.DrawStringShadow(context, " " + Mario.MarioCharacter.LevelString, 24, 1);
    this.DrawStringShadow(context, "TIME", 34, 0);
    time = this.TimeLeft | 0;
    if (time < 0) {
        time = 0;
    }
    this.DrawStringShadow(context, " " + time, 34, 1);

    if (this.StartTime > 0) {
        t = this.StartTime + this.Delta - 2;
        t = t * t * 0.6;
        this.RenderBlackout(context, 160, 120, t | 0);
    }

    if (Mario.MarioCharacter.WinTime > 0) {
    	Mario.StopMusic();
        t = Mario.MarioCharacter.WinTime + this.Delta;
        t = t * t * 0.2;

        if (t > 900) {
			Mario.GlobalMapState.LevelWon();
            Mario.MarioCharacter.AddScore(time * 2);

            // If in experiment mode, go to the lose state even when player won.
            // Only the message will be different there
            if(GlobalInfo.experiment) {
    			this.GotoLoseState = true;
                this.LoseStateMessage = "You WIN!";
                GlobalInfo.data.log({a: 'level_end', t: 'won'}, true);
            } else {
                this.GotoMapState = true;
            }
        }

        this.RenderBlackout(context, ((Mario.MarioCharacter.XDeathPos - this.Camera.X) | 0), ((Mario.MarioCharacter.YDeathPos - this.Camera.Y) | 0), (320 - t) | 0);
    }

    if (Mario.MarioCharacter.DeathTime > 0) {
    	Mario.StopMusic();
        t = Mario.MarioCharacter.DeathTime + this.Delta;
        t = t * t * 0.1;

        if (t > 900) {
            //TODO: goto map with level lost
			Mario.MarioCharacter.Lives--;
			this.GotoMapState = true;
			if (Mario.MarioCharacter.Lives <= 0) {
				this.GotoLoseState = true;
                this.LoseStateMessage = "You lose!";
                GlobalInfo.data.log({a: 'level_end', t: 'lose'}, true);
			}
        }

        this.RenderBlackout(context, ((Mario.MarioCharacter.XDeathPos - this.Camera.X) | 0), ((Mario.MarioCharacter.YDeathPos - this.Camera.Y) | 0), (320 - t) | 0);
    }
};

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
Mario.LevelState.prototype.PadString = function(targetLength, padString, text) {
    targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    text = String(text);

    if (text.length > targetLength) {
        return text;
    } else {
        targetLength = targetLength - text.length;

        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }

        return padString.slice(0, targetLength) + text;
    }
};

Mario.LevelState.prototype.DrawStringShadow = function(context, string, x, y) {
    this.Font.Strings[0] = { String: string, X: x * 8 + 4, Y: y * 8 + 4 };
    this.FontShadow.Strings[0] = { String: string, X: x * 8 + 5, Y: y * 8 + 5 };
    this.FontShadow.Draw(context, this.Camera);
    this.Font.Draw(context, this.Camera);
};

Mario.LevelState.prototype.RenderBlackout = function(context, x, y, radius) {
    if (radius > 320) {
        return;
    }

    var xp = [], yp = [], i = 0;
    for (i = 0; i < 16; i++) {
        xp[i] = x + (Math.cos(i * Math.PI / 15) * radius) | 0;
        yp[i] = y + (Math.sin(i * Math.PI / 15) * radius) | 0;
    }
    xp[16] = 0;
    yp[16] = y;
    xp[17] = 0;
    yp[17] = 240;
    xp[18] = 320;
    yp[18] = 240;
    xp[19] = 320;
    yp[19] = y;

    context.fillStyle = "#000";
    context.beginPath();
    context.moveTo(xp[19], yp[19]);
    for (i = 18; i >= 0; i--) {
        context.lineTo(xp[i], yp[i]);
    }
    context.closePath();
    context.fill();

    for (i = 0; i < 16; i++) {
        xp[i] = x - (Math.cos(i * Math.PI / 15) * radius) | 0;
        yp[i] = y - (Math.sin(i * Math.PI / 15) * radius) | 0;
    }
    //cure a strange problem where the circle gets cut
    yp[15] += 5;

    xp[16] = 320;
    yp[16] = y;
    xp[17] = 320;
    yp[17] = 0;
    xp[18] = 0;
    yp[18] = 0;
    xp[19] = 0;
    yp[19] = y;

    context.fillStyle = "#000";
    context.beginPath();
    context.moveTo(xp[0], yp[0]);
    for (i = 0; i <= xp.length - 1; i++) {
        context.lineTo(xp[i], yp[i]);
    }
    context.closePath();
    context.fill();
};

Mario.LevelState.prototype.AddSprite = function(sprite) {
    this.Sprites.Add(sprite);
};

Mario.LevelState.prototype.RemoveSprite = function(sprite) {
    this.Sprites.Remove(sprite);
};

Mario.LevelState.prototype.Bump = function(x, y, canBreakBricks) {
    var block = this.Level.GetBlock(x, y), xx = 0, yy = 0, canCollectPowerups = true, canCollectMushrooms = true, canCollectFlowers = true;

    if ((Mario.Tile.Behaviors[block & 0xff] & Mario.Tile.Bumpable) > 0) {
        this.BumpInto(x, y - 1);
        this.Level.SetBlock(x, y, 4);
        this.Level.SetBlockData(x, y, 4);

        canCollectMushrooms = !Mario.MarioCharacter.Large && this.CollectedMushrooms < this.AllowedMushrooms;
        canCollectFlowers = this.CollectedFlowers < this.AllowedFlowers;
        canCollectPowerups = canCollectMushrooms || canCollectFlowers;

        if ((Mario.Tile.Behaviors[block & 0xff] & Mario.Tile.Special) > 0 && canCollectPowerups) {
            Enjine.Resources.PlaySound("sprout");

            if (canCollectMushrooms) {
                this.AddSprite(new Mario.Mushroom(this, x * 16 + 8, y * 16 + 8));
                GlobalInfo.data.log({a: 'mario_bump', t: 'mushroom'}, true);
                this.CollectedMushrooms++;
            } else if(canCollectFlowers) {
                this.AddSprite(new Mario.FireFlower(this, x * 16 + 8, y * 16 + 8));
                GlobalInfo.data.log({a: 'mario_bump', t: 'fireflower'}, true);
                this.CollectedFlowers++;
            }
        } else {
            Mario.MarioCharacter.GetCoin();
            Enjine.Resources.PlaySound("coin");
            this.AddSprite(new Mario.CoinAnim(this, x, y));
            GlobalInfo.data.log({a: 'mario_bump', t: 'coin'}, true);
        }
    }

    if ((Mario.Tile.Behaviors[block & 0xff] & Mario.Tile.Breakable) > 0) {
        this.BumpInto(x, y - 1);
        if (canBreakBricks) {
            Enjine.Resources.PlaySound("breakblock", false, 0.4);
            Mario.MarioCharacter.AddScore(1);
            GlobalInfo.data.log({a: 'mario_bump', t: 'breakblock'}, true);
            this.Level.SetBlock(x, y, 0);
            for (xx = 0; xx < 2; xx++) {
                for (yy = 0; yy < 2; yy++) {
                    this.AddSprite(new Mario.Particle(this, x * 16 + xx * 8 + 4, y * 16 + yy * 8 + 4, (xx * 2 - 1) * 4, (yy * 2 - 1) * 4 - 8));
                }
            }
        }
    }
};

Mario.LevelState.prototype.BumpInto = function(x, y) {
    var block = this.Level.GetBlock(x, y), i = 0;
    if (((Mario.Tile.Behaviors[block & 0xff]) & Mario.Tile.PickUpable) > 0) {
        Mario.MarioCharacter.GetCoin();
        Enjine.Resources.PlaySound("coin");
        this.Level.SetBlock(x, y, 0);
        this.AddSprite(new Mario.CoinAnim(x, y + 1));
    }

    for (i = 0; i < this.Sprites.Objects.length; i++) {
        this.Sprites.Objects[i].BumpCheck(x, y);
    }
};

Mario.LevelState.prototype.CheckForChange = function(context) {
    if(GlobalInfo.experiment && Experiment.shouldHaveEndedByNow()) {
        console.log('Limit for game session duration reached. Moving on with the experiment.');
        context.ChangeState(new Mario.LoseState("The time to test this level is over.", "Sorry!", false));
    }

	if (this.GotoLoseState) {
		context.ChangeState(new Mario.LoseState(this.LoseStateMessage));
	}
	else {
		if (this.GotoMapState) {
			context.ChangeState(Mario.GlobalMapState);
		}
	}
};
