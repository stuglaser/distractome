// Issues that kill us:
//   32699 - Reloading extensions is broken
//   116379 - onUpdate not fired when loading page from cache
console.log("background.js loaded 9");

var blocked_expressions = [
    "reddit.com"
];

var blocked_list = [];
for (var i = 0; i < blocked_expressions.length; ++i) {
    blocked_list[i] = new RegExp(blocked_expressions[i]);
}

// Returns true if the url is a distraction.
function urlIsDistraction(url)
{
    // Checks if the url should be blocked
    for (var i = 0; i < blocked_list.length; ++i) {
	if (blocked_list[i].test(url)) {
	    return true;
	}
    }
    return false;
}

// ====================  Distraction tracking

// Tracks when the browser/extension was loaded, Necessary for
// tracking the first distraction.
var sessionStarted = new Date().getTime();

// Tracks the time at which the current distraction started.
var distractionStarted = 0;

// Tracks the last time that the current distraction was verified.
var distractionVerified = 0;

// Tracks when the previous distraction ended (was last verified) so
// we can compute how long the user was undistracted.
var lastDistractionEnded = sessionStarted;

// Call this function when a distraction event occurs.  A distraction
// will be started, or the existing distraction continued.
function onDistracted()
{
    var now = new Date().getTime();
    if (now - distractionVerified > (60*1000)) {
	lastDistractionEnded = Math.max(distractionVerified, sessionStarted);
	distractionStarted = now;
    }
    else {
    }

    distractionVerified = now;
}

// Call this function to verify that a distraction is still occuring.
function stillDistracted()
{
    distractionVerified = new Date().getTime();
}

// Left-pads string s with zeros so the result has length num.
function zeroPad(s, num)
{
    s = "" + s;
    if (s.length >= num)
	return s;
    return "00000000".slice(0, num - s.length) + s;
}

// Converts time/duration t into H:MM:SS
function prettyTimeShort(t)
{
    s = "";
    t /= 1000;
    var seconds = Math.floor(t) % 60;
    t /= 60;
    var minutes = Math.floor(t) % 60;
    t /= 60;
    var hours = Math.floor(t);

    if (hours > 0)
	return "" + hours + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds);
    else
	return "" + minutes + ":" + zeroPad(seconds, 2);
}

// Returns a string that informs the user how distracted he is.
function prettyDistractedFor()
{
    var now = new Date().getTime();

    // Adds an "undistracted for" clause if we were just distracted.
    var undistractedClause = "";
    if (now - distractionStarted < (60*1000)) {
	undistractedClause = " (was undistracted for " + 
	    prettyTimeShort(distractionStarted - lastDistractionEnded) + ")";
    }
    return "Distracted for " + prettyTimeShort(now - distractionStarted) +
	undistractedClause;
}


// ====================  Listening to browser actions

// Checks if a particular tab contains distracting material.
function checkOnTab(tabId)
{
    chrome.tabs.get(tabId, function(tab) {
	console.log("Checking tab " + tabId + " (" + tab.url + ")");

	// Pops up the infobar if the url is a distraction.
	if (urlIsDistraction(tab.url)) {
	    onDistracted();
	    var ib = {};
	    ib.tabId = tabId;
	    ib.path = "infobar.html";
	    chrome.experimental.infobars.show(ib);
	}
    });
}

// Registers listeners to track what pages the user visits.  Note:
// onUpdated is broken in chrome (#116379) so we listen to
// onActiveChanged as well.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //console.log("tab.onUpdated: " + tabId);
    checkOnTab(tabId);
});
chrome.tabs.onActiveChanged.addListener(function(tabId, info) {
    //console.log("tab.onActiveChanged");
    checkOnTab(tabId);
});