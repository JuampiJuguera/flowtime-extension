chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ 'elapsedSeconds': 0 });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startTimer') {
        chrome.storage.sync.get(['elapsedSeconds'], function(result) {
            const startTime = new Date().getTime() - (result.elapsedSeconds || 0) * 1000;
            const intervalId = setInterval(function() {
                const currentTime = new Date().getTime();
                const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                chrome.storage.sync.set({ 'elapsedSeconds': elapsedSeconds });
            }, 1000);
            sendResponse({ intervalId });
        });
    } else if (request.action === 'stopTimer') {
        clearInterval(request.intervalId);
        sendResponse({});
    }
    return true;
});
