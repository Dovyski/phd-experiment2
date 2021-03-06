/**
	Generates a psuedo-random procedural level.
	Code by Rob Kleffner, 2011
*/

Mario.LevelGenerator = function(width, height) {
    this.Width = width;
    this.Height = height;
    this.Odds = [];
    this.TotalOdds = 0;
    this.Difficulty = 0;

    this.CoinsMinLineStartOffset = 0;                // min amount of tiles that will be occupied before placing coins in a line of coins
    this.CoinsMinLineEndOffset = 0;                  // min amount of tiles that will be occupied before stop placing coins in a line of coins
    this.CoinsVariationLineStartOffset = 4;          // variation of tiles that will be occupied before placing coins in a line of coins
    this.CoinsVariationLineEndOffset = 4;            // variation of tiles that will be occupied before stop placing coins in a line of coins
    this.CoinsLineAdditionalHeight = 2;              // additional height to be added to a coin position. Recommended 0 to 2 (inclusive). Values grater than 2 will interfer with blocks.

    this.BlocksMinLineStartOffset = 0;               // min amount of tiles that will be occupied before placing blocks in a line of blocks
    this.BlocksMinLineEndOffset = 0;                 // min amount of tiles that will be occupied before stop placing blocks in a line of blocks
    this.BlocksVariationLineStartOffset = 4;         // variation of tiles that will be occupied before placing blocks in a line of blocks
    this.BlocksVariationLineEndOffset = 4;           // variation of tiles that will be occupied before stop placing blocks in a line of blocks
    this.BlocksQuestionChance = 0.3;                 // how likely a block is to be a question mark block
    this.BlocksQuestionSpecialRewardChance = 0.1;    // how likely a question mark block is to give something
    this.BlocksGoldenChance = 0.25;                  // how likely a block is to be a (special) golden block
    this.BlocksGoldenSpecialRewardChance = 0.25;     // how likely a golden block is to give something

    this.EnemyCreationCeilControl = 35;              // enemy is added if (rand() * EnemyCreationCeilControl) < difficulty + 1), so a high EnemyCreationCeilControl value means less enemies.

    this.JumpMinLength = 2;                          // minimum length of any jump (gap), in tiles
    this.JumpLengthVariation = 2;                    // a random value from 0 to JumpLengthVariation (exclusive) will be added to JumpMinLength to define the length of any jump (gap). Recommended value is 2.

    this.ValueOddsStraight = 20;
    this.ValueOddsHillStraight = 10;
    this.ValueMinOddsTubes = 2;
    this.ValueMultiOddsTubes = 1;
    this.ValueMinOddsJump = 0;
    this.ValueMultiOddsJump = 2;
    this.ValueMinOddsCannon = -10;
    this.ValueMultiOddsCannon = 5;

    this.Type = 0;
    this.PRNG = null;
};

Mario.LevelGenerator.prototype = {
    AdjustOddsValues: function() {
        if(!GlobalInfo.experiment) {
            return;
        }

        for(var prop in this) {
            if(typeof(this[prop]) == "function") {
                continue;
            }

            if(Experiment.profile[prop] !== undefined && Experiment.profile[prop] != null) {
                this[prop] = Experiment.profile[prop];
                console.log('levelGenerator.' + prop + ' = ' + Experiment.profile[prop]);
            }
        }
    },

    Random: function() {
        if(this.PRNG == null) {
            return Math.random();
        } else {
            return this.PRNG.random();
        }
    },

    SetSeed: function(seed) {
        this.PRNG = new MersenneTwister(seed);
    },

    CreateLevel: function(type, difficulty, seed) {
        var i = 0, length = 0, floor = 0, x = 0, y = 0, ceiling = 0, run = 0, level = null;

        if(seed) {
            this.SetSeed(seed);
            console.log('Level will be generated using seed=' + seed);
        } else {
            console.log('Level generation will not use any seed');
        }

        this.Type = type;
        this.Difficulty = difficulty;

        this.AdjustOddsValues();
        this.Odds[Mario.Odds.Straight]     = this.ValueOddsStraight;
        this.Odds[Mario.Odds.HillStraight] = this.ValueOddsHillStraight;
        this.Odds[Mario.Odds.Tubes]        = this.ValueMinOddsTubes  + this.ValueMultiOddsTubes  * difficulty;
        this.Odds[Mario.Odds.Jump]         = this.ValueMinOddsJump   + this.ValueMultiOddsJump   * difficulty;
        this.Odds[Mario.Odds.Cannon]       = this.ValueMinOddsCannon + this.ValueMultiOddsCannon * difficulty;

        if (this.Type !== Mario.LevelType.Overground) {
            this.Odds[Mario.Odds.HillStraight] = 0;
        }

        for (i = 0; i < this.Odds.length; i++) {
            if (this.Odds[i] < 0) {
                this.Odds[i] = 0;
            }
            this.TotalOdds += this.Odds[i];
            this.Odds[i] = this.TotalOdds - this.Odds[i];
        }

        level = new Mario.Level(this.Width, this.Height);
        length += this.BuildStraight(level, 0, level.Width, true);
        while (length < level.Width - 64) {
            length += this.BuildZone(level, length, level.Width - length);
        }

        floor = this.Height - 1 - (this.Random() * 4) | 0;
        level.ExitX = length + 8;
        level.ExitY = floor;

        for (x = length; x < level.Width; x++) {
            for (y = 0; y < this.Height; y++) {
                if (y >= floor) {
                    level.SetBlock(x, y, 1 + 9 * 16);
                }
            }
        }

        if (type === Mario.LevelType.Castle || type === Mario.LevelType.Underground) {
            for (x = 0; x < level.Width; x++) {
                if (run-- <= 0 && x > 4) {
                    ceiling = (this.Random() * 4) | 0;
                    run = ((this.Random() * 4) | 0) + 4;
                }
                for (y = 0; y < level.Height; y++) {
                    if ((x > 4 && y <= ceiling) || x < 1) {
                        level.SetBlock(x, y, 1 + 9 * 16);
                    }
                }
            }
        }

        this.FixWalls(level);

        return level;
    },

    BuildZone: function(level, x, maxLength) {
        var t = (this.Random() * this.TotalOdds) | 0, type = 0, i = 0;
        for (i = 0; i < this.Odds.length; i++) {
            if (this.Odds[i] <= t) {
                type = i;
            }
        }

        switch (type) {
            case Mario.Odds.Straight:
                return this.BuildStraight(level, x, maxLength, false);
            case Mario.Odds.HillStraight:
                return this.BuildHillStraight(level, x, maxLength);
            case Mario.Odds.Tubes:
                return this.BuildTubes(level, x, maxLength);
            case Mario.Odds.Jump:
                return this.BuildJump(level, x, maxLength);
            case Mario.Odds.Cannons:
                return this.BuildCannons(level, x, maxLength);
        }
        return 0;
    },

    BuildJump: function(level, xo, maxLength) {
        var js = ((this.Random() * 4) | 0) + 2, jl = ((this.Random() * this.JumpLengthVariation) | 0) + this.JumpMinLength, length = js * 2 + jl, x = 0, y = 0,
            hasStairs = ((this.Random() * 3) | 0) === 0, floor = this.Height - 1 - ((this.Random() * 4) | 0);

        for (x = xo; x < xo + length; x++) {
            if (x < xo + js || x > xo + length - js - 1) {
                for (y = 0; y < this.Height; y++) {
                    if (y >= floor) {
                        level.SetBlock(x, y, 1 + 9 * 16);
                    } else if (hasStairs) {
                        if (x < xo + js) {
                            if (y >= floor - (x - xo) + 1) {
                                level.SetBlock(x, y, 9);
                            }
                        } else {
                            if (y >= floor - ((xo + length) - x) + 2) {
                                level.SetBlock(x, y, 9);
                            }
                        }
                    }
                }
            }
        }

        return length;
    },

    BuildCannons: function(level, xo, maxLength) {
        var length = ((this.Random() * 10) | 0) + 2, floor = this.Height - 1 - (this.Random() * 4) | 0,
            xCannon = xo + 1 + (this.Random() * 4) | 0, x = 0, y = 0, cannonHeight = 0;

        if (length > maxLength) {
            length = maxLength;
        }

        for (x = xo; x < xo + length; x++) {
            if (x > xCannon) {
                xCannon += 2 * (this.Random() * 4) | 0;
            }
            if (xCannon === xo + length - 1) {
                xCannon += 10;
            }
            cannonHeight = floor - ((this.Random() * 4) | 0) - 1;

            for (y = 0; y < this.Height; y++) {
                if (y >= floor) {
                    level.SetBlock(x, y, 1 + 9 * 16);
                } else {
                    if (x === xCannon && y >= cannonHeight) {
                        if (y === cannonHeight) {
                            level.SetBlock(x, y, 14);
                        } else if (y === cannonHeight + 1) {
                            level.SetBlock(x, y, 14 + 16);
                        } else {
                            level.SetBlock(x, y, 14 + 2 * 16);
                        }
                    }
                }
            }
        }

        return length;
    },

    BuildHillStraight: function(level, xo, maxLength) {
        var length = ((this.Random() * 10) | 0) + 10, floor = this.Height - 1 - (this.Random() * 4) | 0,
            x = 0, y = 0, h = floor, keepGoing = true, l = 0, xxo = 0, occupied = [], xx = 0, yy = 0;

        if (length > maxLength) {
            length = maxLength;
        }

        for (x = xo; x < xo + length; x++) {
            for (y = 0; y < this.Height; y++) {
                if (y >= floor) {
                    level.SetBlock(x, y, 1 + 9 * 16);
                }
            }
        }

        this.AddEnemyLine(level, xo + 1, xo + length - 1, floor - 1);

        while (keepGoing) {
            h = h - 2 - (this.Random() * 3) | 0;
            if (h <= 0) {
                keepGoing = false;
            } else {
                l = ((this.Random() * 5) | 0) + 3;
                xxo = ((this.Random() * (length - l - 2)) | 0) + xo + 1;

                if (occupied[xxo - xo] || occupied[xxo - xo + l] || occupied[xxo - xo - 1] || occupied[xxo - xo + l + 1]) {
                    keepGoing = false;
                } else {
                    occupied[xxo - xo] = true;
                    occupied[xxo - xo + l] = true;
                    this.AddEnemyLine(level, xxo, xxo + l, h - 1);
                    if (((this.Random() * 4) | 0) === 0) {
                        this.Decorate(level, xxo - 1, xxo + l + 1, h);
                        keepGoing = false;
                    }

                    for (x = xxo; x < xxo + l; x++) {
                        for (y = h; y < floor; y++) {
                            xx = 5;
                            yy = 9;
                            if (x === xxo) {
                                xx = 4;
                            }
                            if (x === xxo + l - 1) {
                                xx = 6;
                            }
                            if (y === h) {
                                yy = 8;
                            }

                            if (level.GetBlock(x, y) === 0) {
                                level.SetBlock(x, y, xx + yy * 16);
                            } else {
                                if (level.GetBlock(x, y) === (4 + 8 * 16)) {
                                    level.SetBlock(x, y, 4 + 11 * 16);
                                }
                                if (level.GetBlock(x, y) === (6 + 8 * 16)) {
                                    level.SetBlock(x, y, 6 + 11 * 16);
                                }
                            }
                        }
                    }
                }
            }
        }

        return length;
    },

    AddEnemyLine: function(level, x0, x1, y) {
        var x = 0, type = 0;
        for (x = x0; x < x1; x++) {
            if (((this.Random() * this.EnemyCreationCeilControl) | 0) < this.Difficulty + 1) {
                type = (this.Random() * 4) | 0;
                if (this.Difficulty < 1) {
                    type = Mario.Enemy.Goomba;
                } else if (this.Difficulty < 3) {
                    type = (this.Random() * 3) | 0;
                }
                level.SetSpriteTemplate(x, y, new Mario.SpriteTemplate(type, ((this.Random() * 35) | 0) < this.Difficulty));
            }
        }
    },

    BuildTubes: function(level, xo, maxLength) {
        var length = ((this.Random() * 10) | 0) + 5, floor = this.Height - 1 - (this.Random() * 4) | 0,
            xTube = xo + 1 + (this.Random() * 4) | 0, tubeHeight = floor - ((this.Random() * 2) | 0) - 2,
            x = 0, y = 0, xPic = 0;

        if (length > maxLength) {
            length = maxLength;
        }

        for (x = xo; x < xo + length; x++) {
            if (x > xTube + 1) {
                xTube += 3 + ((this.Random() * 4) | 0);
                tubeHeight = floor - ((this.Random() * 2) | 0) - 2;
            }
            if (xTube >= xo + length - 2) {
                xTube += 10;
            }

            if (x === xTube && ((this.Random() * 11) | 0) < this.Difficulty + 1) {
                level.SetSpriteTemplate(x, tubeHeight, new Mario.SpriteTemplate(Mario.Enemy.Flower, false));
            }

            for (y = 0; y < this.Height; y++) {
                if (y >= floor) {
                    level.SetBlock(x, y, 1 + 9 * 16);
                } else {
                    if ((x === xTube || x === xTube + 1) && y >= tubeHeight) {
                        xPic = 10 + x - xTube;
                        if (y === tubeHeight) {
                            level.SetBlock(x, y, xPic);
                        } else {
                            level.SetBlock(x, y, xPic + 16);
                        }
                    }
                }
            }
        }

        return length;
    },

    BuildStraight: function(level, xo, maxLength, safe) {
        var length = ((this.Random() * 10) | 0) + 2, floor = this.Height - 1 - ((this.Random() * 4) | 0), x = 0, y = 0;

        if (safe) {
            length = 10 + ((this.Random() * 5) | 0);
        }
        if (length > maxLength) {
            length = maxLength;
        }

        for (x = xo; x < xo + length; x++) {
            for (y = 0; y < this.Height; y++) {
                if (y >= floor) {
                    level.SetBlock(x, y, 1 + 9 * 16);
                }
            }
        }

        if (!safe) {
            if (length > 5) {
                this.Decorate(level, xo, xo + length, floor);
            }
        }

        return length;
    },

    Decorate: function(level, x0, x1, floor) {
        if (floor < 1) {
            return;
        }

        var rocks = true,
            s = (this.CoinsMinLineStartOffset + this.Random() * this.CoinsVariationLineStartOffset) | 0,
            e = (this.CoinsMinLineEndOffset + this.Random() * this.CoinsVariationLineEndOffset) | 0,
            h = (this.Random() * this.CoinsLineAdditionalHeight) | 0,
            x = 0;

        this.AddEnemyLine(level, x0 + 1, x1 - 1, floor - 1);

        if (floor - 2 > 0) {
            if ((x1 - 1 - e) - (x0 + 1 + s) > 1) {
                for (x = x0 + 1 + s; x < x1 - 1 - e; x++) {
                    level.SetBlock(x, floor - 2 - h, 2 + 2 * 16);
                }
            }
        }

        s = (this.BlocksMinLineStartOffset + this.Random() * this.BlocksVariationLineStartOffset) | 0;
        e = (this.BlocksMinLineEndOffset + this.Random() * this.BlocksVariationLineEndOffset) | 0;

        if (floor - 4 > 0) {
            if ((x1 - 1 - e) - (x0 + 1 + s) > 2) {
                for (x = x0 + 1 + s; x < x1 - 1 - e; x++) {
                    if (rocks) {
                        if (x !== x0 + 1 && x !== x1 - 2 && (this.Random() <= this.BlocksQuestionChance)) {
                            if (this.Random() <= this.BlocksQuestionSpecialRewardChance) {
                                level.SetBlock(x, floor - 4, 4 + 2 + 16);
                            } else {
                                level.SetBlock(x, floor - 4, 4 + 1 + 16);
                            }
                        } else if (this.Random() <= this.BlocksGoldenChance) {
                            if (this.Random() <= this.BlocksGoldenSpecialRewardChance) {
                                level.SetBlock(x, floor - 4, 2 + 16);
                            } else {
                                level.SetBlock(x, floor - 4, 1 + 16);
                            }
                        } else {
                            level.SetBlock(x, floor - 4, 16);
                        }
                    }
                }
            }
        }
    },

    FixWalls: function(level) {
        var blockMap = [], x = 0, y = 0, xx = 0, yy = 0, blocks = 0;

        for (x = 0; x < this.Width + 1; x++) {
            blockMap[x] = [];

            for (y = 0; y < this.Height + 1; y++) {
                blocks = 0;
                for (xx = x - 1; xx < x + 1; xx++) {
                    for (yy = y - 1; yy < y + 1; yy++) {
                        if (level.GetBlockCapped(xx, yy) === (1 + 9 * 16)) {
                            blocks++;
                        }
                    }
                }
                blockMap[x][y] = blocks === 4;
            }
        }

        this.Blockify(level, blockMap, this.Width + 1, this.Height + 1);
    },

    Blockify: function(level, blocks, width, height) {
        var to = 0, b = [], x = 0, y = 0, xx = 0, yy = 0, i = 0, _xx = 0, _yy = 0;

        for (i = 0; i < 2; i++) {
            b[i] = [];
        }

        if (this.Type === Mario.LevelType.Castle) {
            to = 8;
        } else if (this.Type === Mario.LevelType.Underground) {
            to = 12;
        }

        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                for (xx = x; xx <= x + 1; xx++) {
                    for (yy = y; yy <= y + 1; yy++) {
                        _xx = xx;
                        _yy = yy;
                        if (_xx < 0) {
                            _xx = 0;
                        }
                        if (_yy < 0) {
                            _yy = 0;
                        }
                        if (_xx > width - 1) {
                            _xx = width - 1;
                        }
                        if (_yy > height - 1) {
                            _yy = height - 1;
                        }

                        b[xx - x][yy - y] = blocks[_xx][_yy];
                    }
                }

                if (b[0][0] === b[1][0] && b[0][1] === b[1][1]) {
                    if (b[0][0] === b[0][1]) {
                        if (b[0][0]) {
                            level.SetBlock(x, y, 1 + 9 * 16 + to);
                        }
                    } else {
                        if (b[0][0]) {
                            level.SetBlock(x, y, 1 + 10 * 16 + to);
                        } else {
                            level.SetBlock(x, y, 1 + 8 * 16 + to);
                        }
                    }
                } else if (b[0][0] === b[0][1] && b[1][0] === b[1][1]) {
                    if (b[0][0]) {
                        level.SetBlock(x, y, 2 + 9 * 16 + to);
                    } else {
                        level.SetBlock(x, y, 9 * 16 + to);
                    }
                } else if (b[0][0] === b[1][1] && b[0][1] === b[1][0]) {
                    level.SetBlock(x, y, 1 + 9 * 16 + to);
                } else if (b[0][0] === b[1][0]) {
                    if (b[0][0]) {
                        if (b[0][1]) {
                            level.SetBlock(x, y, 3 + 10 * 16 + to);
                        } else {
                            level.SetBlock(x, y, 3 + 11 * 16 + to);
                        }
                    } else {
                        if (b[0][1]) {
                            level.SetBlock(x, y, 2 + 8 * 16 + to);
                        } else {
                            level.SetBlock(x, y, 8 * 16 + to);
                        }
                    }
                } else if (b[0][1] === b[1][1]) {
                    if (b[0][1]) {
                        if (b[0][0]) {
                            level.SetBlock(x, y, 3 + 9 * 16 + to);
                        } else {
                            level.SetBlock(x, y, 3 + 8 * 16 + to);
                        }
                    } else {
                        if (b[0][0]) {
                            level.SetBlock(x, y, 2 + 10 * 16 + to);
                        } else {
                            level.SetBlock(x, y, 10 * 16 + to);
                        }
                    }
                } else {
                    level.SetBlock(x, y, 1 + 16 * to);
                }
            }
        }
    }
};
