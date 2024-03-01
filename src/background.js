chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'elapsedSeconds': 0 });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startTimer') {
        chrome.storage.local.get(['elapsedSeconds'], function(result) {
            const startTime = new Date().getTime() - (result.elapsedSeconds || 0) * 1000;
            const backgroundInterval = setInterval(function() {
                const currentTime = new Date().getTime();
                const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                chrome.storage.local.set({ 'elapsedSeconds': elapsedSeconds });
            }, 1000);
            chrome.storage.local.set({'backgroundInterval': backgroundInterval});
            sendResponse({});
        });
    } else if (request.action === 'stopTimer') {
        clearInterval(request.intervalId);
        chrome.storage.local.remove('backgroundInterval');
        sendResponse({});
    }
    return true;
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (request.action === 'pauseTimer') {
        clearInterval(request.intervalId);
        sendResponse({});
    }
    return true;
});

