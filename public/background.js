let activeTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener(({ tabId }) => {
  trackTime(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete') {
    trackTime(tabId);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Lost focus
    saveTime();
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) trackTime(tabs[0].id);
    });
  }
});

function trackTime(tabId) {
  if (activeTabId !== null) saveTime(); // Save time for previous tab
  activeTabId = tabId;
  startTime = Date.now();
}

function saveTime() {
  if (activeTabId === null || startTime === null) return;

  const duration = Math.floor((Date.now() - startTime) / 1000); // in seconds

  chrome.tabs.get(activeTabId, (tab) => {
    if (!tab || !tab.url) return;
    const url = new URL(tab.url);
    const domain = url.hostname;

    chrome.storage.local.get(["usage"], (result) => {
      const usage = result.usage || {};
      usage[domain] = (usage[domain] || 0) + duration;

      chrome.storage.local.set({ usage });
    });
  });

  activeTabId = null;
  startTime = null;
}
