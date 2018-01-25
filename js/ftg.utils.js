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

FTG.Utils.preventedProblematicKeyboardKey = function(theKeyEvent) {
    var aKey = theKeyEvent.which || theKeyEvent.keyCode;

    var aIsRefresh = aKey == 116 || aKey == 82;
    var aIsTabFocus = aKey == 9;
    var aIsFSomething = aKey >= 112 && aKey <= 123;
    var aIsAltRelated = aKey == 17 || aKey == 18 || aKey == 36; // apparently it takes you to the browser's default/home page.

    if (aIsRefresh || aIsTabFocus || aIsFSomething || aIsAltRelated) {
        console.warn('Problematic key behavior has been prevented.');
        theKeyEvent.preventDefault();
		return true;
    }

	return false;
};

// Polyfill for older browsers...
if (!Date.now) {
	Date.now = function now() {
		return new Date().getTime();
	};
}
