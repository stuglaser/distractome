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

// ====================  Distraction tracking

var sessionStarted = new Date().getTime();
var distractionStarted = 0;
var distractionVerified = 0;
var lastDistractionEnded = sessionStarted;

// Calls this function when a distraction event occurs.  A distraction
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

function stillDistracted()
{
    distractionVerified = new Date().getTime();
}

function zeroPad(s, num)
{
    s = "" + s;
    if (s.length >= num)
	return s;
    return "00000000".slice(0, num - s.length) + s;
}

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


// ====================  Listening to browser actions

chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log("Completed (" + details.url + ") in [" + details.frameId + ", " + details.tabId + "]");
    //console.log(details);
});

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //console.log("tab.onUpdated: " + tabId);
    checkOnTab(tabId);
});
chrome.tabs.onActiveChanged.addListener(function(tabId, info) {
    //console.log("tab.onActiveChanged");
    checkOnTab(tabId);
});