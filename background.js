// background.js

// This event is fired when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or updated.");
});

// Example of a listener for a message from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        // Perform some action and send a response
        sendResponse({ data: "Here is your data!" });
    }
});

// You can add more background tasks or listeners as needed 