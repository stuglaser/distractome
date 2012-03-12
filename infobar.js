// Copyright (c) 2012 Stuart Glaser
// Distractome may be freely distributed under the MIT license

var bgpage = chrome.extension.getBackgroundPage();
var bgc = chrome.extension.getBackgroundPage().console;
var readout = $("#readout");

function updateReadout()
{
    bgpage.stillDistracted();
    readout.html(bgpage.prettyDistractedFor());
}
updateReadout();
setInterval(updateReadout, 1000);

