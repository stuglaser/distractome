// Copyright (c) 2012 Stuart Glaser
// Distractome may be freely distributed under the MIT license

function getDefaultOptions() {
    return {
	"distractionsList": [
	    "reddit.com",
	    "news.ycombinator.com",
	    "stumbleupon.com"].join("\n")
    };
    saveOptions();

    $("#distractions_list").val()
}

function getOptions() {
    if (localStorage.distractionsList) {
	return {
	    "distractionsList": localStorage.distractionsList
	};
    }
    else {
	var options = getDefaultOptions();
	setOptions(options);
	return options;
    }
}

function setOptions(options) {
    localStorage.distractionsList = options.distractionsList;
}

function populateOptionsPage() {
    var options = getOptions();
    $("#distractions_list").val(options.distractionsList);
    console.log("restored");
}

function saveOptions() {
    var options = {
	"distractionsList": $("#distractions_list").val()
    };
    setOptions(options);
    chrome.extensions.getBackgroundPage().updateDistractionsList();
    console.log("Saved");
}
