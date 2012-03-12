// Copyright (c) 2012 Stuart Glaser
// Distractome may be freely distributed under the MIT license

function restoreDefaultOptions() {
    $("#distractions_list").val([
	"reddit.com",
	"news.ycombinator.com",
	"stumbleupon.com"].join("\n"));
    saveOptions();
}

function restoreOptions() {
    if (!localStorage.distractions_list) {
	restoreDefaultOptions();
	return;
    }
    $("#distractions_list").val(localStorage.distractions_list);
    console.log("restored");
}

function saveOptions() {
    console.log("Saved");
    localStorage.distractions_list = $("#distractions_list").val();
    chrome.extensions.getBackgroundPage().updateDistractionsList();
}

// Saves whenever the list changes
$("#distractions_list").bind('input paste', saveOptions);

$(restoreOptions);
