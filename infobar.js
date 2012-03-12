var bgpage = chrome.extension.getBackgroundPage();
var bgc = chrome.extension.getBackgroundPage().console;
var readout = $("#readout");
bgc.log("Readout:");
bgc.log(readout);

function updateReadout()
{
    bgpage.stillDistracted();
    readout.html(bgpage.prettyDistractedFor());
}


updateReadout();
setInterval(updateReadout, 1000);

