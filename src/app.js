
document.addEventListener('DOMContentLoaded', function () {
    getCurrentTabUrl((url, title) => renderPageDetails(url, title));
    addListeners();
    openDB();
});

let db;

function sendMetaMessages() {
    // Trigger content script to send meta tag data when the popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'fetchMetaTags' });
        chrome.tabs.sendMessage(tabs[0].id, { action: "getMetaTags" });
    });
}

function addListeners() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === 'metaKeywords') {
            document.getElementById('tagsField').value = message.keywords;
        }
    });
    saveButton.addEventListener('click', toggleBookmark)
    // Example: Listen for a click in the popup and open the full-window view
    document.getElementById('openFullViewButton').addEventListener('click', openFullWindowView);
}

function getCurrentTabUrl(callback) {
    let queryInfo = { active: true, currentWindow: true };
    // Use the Chrome or Firefox API to query the current tab
    chrome.tabs.query(queryInfo, (tabs) => {
        let tab = tabs[0];
        let url = tab.url;
        let title = tab.title;
        callback(url, title);
    });
}

function renderPageDetails(url, title) {
    document.getElementById('urlField').value = url;
    document.getElementById('titleField').value = title; // Set title in its input field
}

function openFullWindowView() {
    browser.tabs.create({ url: "/full-window-view.html" });
}

function openDB() {
    const request = indexedDB.open("bookmarksDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('bookmarks')) {
            db.createObjectStore('bookmarks', { keyPath: 'url' });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        checkBookmarkStatus();
    };

    request.onerror = function (event) {
        console.error("IndexedDB error: ", event.target.errorCode);
    };
}

function checkBookmarkStatus() {
    const currentUrl = document.getElementById('urlField').value;

    const transaction = db.transaction(["bookmarks"], "readonly");
    const objectStore = transaction.objectStore("bookmarks");
    const request = objectStore.get(currentUrl);

    request.onsuccess = function (event) {
        const result = event.target.result;
        if (result) {
            console.debug(result)
            // URL is bookmarked
            document.getElementById('tagsField').value = result.tags
            savedBookMarkText();
        } else {
            // URL is not bookmarked
            unsavedBookMarkText();
            sendMetaMessages()
        }
    };
}

function toggleBookmark() {
    const currentUrl = document.getElementById('urlField').value;
    const currentTitle = document.getElementById('titleField').value;
    const currentTags = document.getElementById('tagsField').value.split(',').map(tag => tag.trim()); // Split tags by comma and trim spaces

    const transaction = db.transaction(["bookmarks"], "readwrite");
    const objectStore = transaction.objectStore("bookmarks");
    const request = objectStore.get(currentUrl);
    request.onsuccess = function (event) {
        const result = event.target.result;
        if (result) {
            // URL is bookmarked, remove it
            objectStore.delete(currentUrl).onsuccess = function () {
                // Update UI to reflect removal
                unsavedBookMarkText();
            };
        } else {
            // URL is not bookmarked, add it
            objectStore.add({ url: currentUrl, title: currentTitle, tags: currentTags }).onsuccess = function () {
                // Update UI to reflect addition
                savedBookMarkText();
            };
        }
    };
}

function unsavedBookMarkText(){
    document.getElementById('buttonText').textContent = "Save URL";
    document.getElementById('svgIcon').classList.add('hidden');
    document.getElementById('saveButton').classList.remove('bg-green-500', 'hover:bg-green-600');
    document.getElementById('saveButton').classList.add('bg-blue-500', 'hover:bg-blue-600');
}

function savedBookMarkText(){
    document.getElementById('buttonText').textContent = "URL is Saved";
    document.getElementById('svgIcon').classList.remove('hidden');
    document.getElementById('saveButton').classList.add('bg-green-500', 'hover:bg-green-600');
    document.getElementById('saveButton').classList.remove('bg-blue-500', 'hover:bg-blue-600');
}
