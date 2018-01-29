/**
 * A set of useful utilities.
 */

var FTG = FTG || {};

FTG.Utils = function() {
};

FTG.Utils.getURLParamByName = function(theName) {
	var aRegex;

    theName = theName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    aRegex = new RegExp('[\\?&]' + theName + '=([^&#]*)'),
    aResults = aRegex.exec(location.search);

    return aResults === null ? null : decodeURIComponent(aResults[1].replace(/\+/g, ' '));
};

FTG.Utils.preventProblematicKeyboardKey = function(theKeyEvent) {
    var aKey = theKeyEvent.which || theKeyEvent.keyCode;

    var aIsRefresh = aKey == 116 || (aKey == 82 && theKeyEvent.ctrlKey);
    var aIsTabFocus = aKey == 9;
    var aIsFSomething = aKey >= 112 && aKey <= 123;
	var aIsCtrl = aKey == 17 || (aKey == 83 && theKeyEvent.ctrlKey);
    var aIsAltRelated = aKey == 17 || aKey == 18 || (aKey == 36 && theKeyEvent.altKey); // apparently Alt+Home takes you to the browser's default/home page.

    if (aIsRefresh || aIsTabFocus || aIsFSomething || aIsCtrl || aIsAltRelated) {
        theKeyEvent.preventDefault();
    }
};

// Polyfill for older browsers...
if (!Date.now) {
	Date.now = function now() {
		return new Date().getTime();
	};
}
