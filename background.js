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

var distractionStarted = new Date().getTime();
var distractionVerified = new Date().getTime();
var distractionEnded = new Date().getTime();

function onDistracted()
{
    distractionEnded = null;
    distractionStarted = new Date().getTime();
    distractionVerified = distractionStarted;
    console.log("Distraction started");
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

function prettyTime(t)
{
    s = "";
    t /= 1000;
    var seconds = t % 60;
    t /= 60;
    var minutes = t % 60;
    t /= 60;
    var hours = t;

    if (hours > 0)
	return "" + hours + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds);
    else
	return "" + minutes + ":" + zeroPad(seconds, 2);
}

function prettyDistractedFor()
{
    var now = new Date().getTime();
    return "Distracted for " + prettyTime(now - distractionStarted);
}


// ====================  Listening to browser actions

chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log("Completed");
    console.log(details);
});
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    if (details.frameId == 0) {
	console.log("Navigation in the bar.  Ignoring");
	return;
    }
    if (details.transitionType != "auto_subframe") {
	console.log("Navigated: " + details.url + " (because " + details.transitionType + ")");
	console.log(details);

	// Checks if the url should be blocked
	var is_blocked = false;
	for (var i = 0; i < blocked_list.length; ++i) {
	    if (blocked_list[i].test(details.url)) {
		is_blocked = true;
		break;
	    }
	}

	if (is_blocked) {
	    onDistracted();
	    var ib = {};
	    ib.tabId = details.tabId;
	    ib.path = "infobar.html";
	    chrome.experimental.infobars.show(ib);
	}
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log("tab.onUpdated: " + tabId);
    console.log(changeInfo);
});