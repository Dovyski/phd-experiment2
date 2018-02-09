/**
	Represents a very basic game timer.
	Code by Rob Kleffner, 2011
*/

Enjine.GameTimer = function() {
    this.FramesPerSecond = 33;
    this.FrameDuration = 1.0 / this.FramesPerSecond;
    this.FrameWaiting = 0;
	this.LastTime = 0;
    this.IntervalFunc = null;
    this.UpdateObject = null;
};

Enjine.GameTimer.prototype = {
    Start: function() {
        this.LastTime = Date.now();
        this.IntervalFunc = requestAnimationFrame(this.Tick.bind(this));
    },

    Tick: function() {
        if (this.UpdateObject != null) {
            var newTime = Date.now();
    		var delta = (newTime - this.LastTime) / 1000;
    		this.LastTime = newTime;
            this.FrameWaiting += delta;

            // Is it time to update according to fixed FPS?
            if(this.FrameWaiting >= this.FrameDuration) {
                this.UpdateObject.Update(delta);
                this.FrameWaiting = 0;
            }
        }

        this.IntervalFunc = requestAnimationFrame(this.Tick.bind(this));
    },

    Stop: function() {
        cancelAnimationFrame(this.IntervalFunc);
    }
};
