/**
	Class that helps to manage mouse input.
	Code by Fernando Bevilacqua, 2018
*/

Enjine.MouseInput = {
    CanvasElement: null,
    Down: false,

    Initialize: function(canvasId) {
        var self = this;
        this.CanvasElement = document.getElementById(canvasId);

        this.CanvasElement.addEventListener("mousedown", function(event) {
            self.MouseDownEvent(event);
        });
        this.CanvasElement.addEventListener("mouseup", function(event) {
            self.MouseUpEvent(event);
        });
    },

    IsMouseDown: function() {
        return this.Down;
    },

    MouseDownEvent: function(event) {
        this.Down = true;
    },

    MouseUpEvent: function(event) {
        this.Down = false;
    }
};
