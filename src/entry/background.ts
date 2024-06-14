// Sent trigger to content script
function triggerContentScriptFunction(tabId: number) {
  chrome.tabs.sendMessage(tabId, { action: "attachPolybrain" }, (response) => {
    if (response && response.status === "Function executed") {
      console.log("Content script function executed successfully.");
    }
  });
}


/// Wait for OnShape to open
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("got tab update")
  if (changeInfo.status === 'complete' && tab.url?.includes("cad.onshape.com")) {
    console.log("background listener found cad.onshape.com opened")
    triggerContentScriptFunction(tabId);
  }
});