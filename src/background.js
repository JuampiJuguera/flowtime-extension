let backgroundInterval = null;
let timerCount = 0;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'elapsedSeconds': 0 });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.storage.local.get(['elapsedSeconds'], function(result) {
        if (request.action === 'startTimer') {
            const startTime = new Date().getTime() - (result.elapsedSeconds || 0) * 1000;
            if (!backgroundInterval) {
                backgroundInterval = setInterval(function() {
                    const currentTime = new Date().getTime();
                    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                    timerCount = timerCount + 1;
                    chrome.storage.local.set({ 'elapsedSeconds': elapsedSeconds });
                }, 1000);
            }
        }
        if (request.action === 'stopTimer') {
            if (backgroundInterval) {
                clearInterval(backgroundInterval);
                backgroundInterval = null;
            }
        }
        if (request.action === 'startRestTimer') {
            let restingElapsedSeconds = result.elapsedSeconds;
            if (!backgroundInterval) {
                backgroundInterval = setInterval(function() {
                    restingElapsedSeconds = Math.max(0, restingElapsedSeconds - 1);
                    chrome.storage.local.set({ 'elapsedSeconds': restingElapsedSeconds });
                    if (restingElapsedSeconds === 0) {
                        clearInterval(backgroundInterval);
                    }
                }, 1000);
            }
        }
    });
});

