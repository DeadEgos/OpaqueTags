document.addEventListener('DOMContentLoaded', function () {
    function getCurrentTabUrl(callback) {
        let queryInfo = { active: true, currentWindow: true };

        // Use the Chrome or Firefox API to query the current tab
        chrome.tabs.query(queryInfo, (tabs) => {
            let tab = tabs[0];
            let url = tab.url;
            let title = tab.title; // Also retrieve the title of the current tab
            callback(url, title); // Pass both url and title to the callback
        });
    }
    // Function to set the URL and title in the input fields
    function renderPageDetails(url, title) {
        document.getElementById('urlField').value = url;
        document.getElementById('titleField').value = title; // Set title in its input field
    }

    // Fetch and display the URL
    getCurrentTabUrl(function (url, title) {
        renderPageDetails(url, title);
    });

    saveButton.addEventListener('click', toggleBookmark)


    function openFullWindowView() {
        browser.tabs.create({ url: "/full-window-view.html" });

    }

    // Example: Listen for a click in the popup and open the full-window view
    document.getElementById('openFullViewButton').addEventListener('click', openFullWindowView);

    let db;

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

    openDB();

    function checkBookmarkStatus() {
        const currentUrl = document.getElementById('urlField').value; // Assuming this is your input field
    
        const transaction = db.transaction(["bookmarks"], "readonly");
        const objectStore = transaction.objectStore("bookmarks");
        const request = objectStore.get(currentUrl);

        request.onsuccess = function (event) {
            const result = event.target.result;
            const saveButton = document.getElementById('saveButton'); // Your button's ID
            // const svgIcon = document.getElementById('svgIcon'); // Get the SVG icon span

            if (result) {
                // URL is bookmarked
                saveButton.textContent = "URL is Saved"; // Update button text or state
                // svgIcon.classList.remove('hidden');
            } else {
                // URL is not bookmarked
                saveButton.textContent = "Save URL"; // Update button text or state
                // svgIcon.classList.add('hidden'); 
            }
        };
    }

    function toggleBookmark() {
        const currentUrl = document.getElementById('urlField').value; // Assuming this is your input field
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
                    document.getElementById('saveButton').textContent = "Save URL";
                    // svgIcon.classList.add('hidden');

                };
            } else {
                // URL is not bookmarked, add it
                objectStore.add({ url: currentUrl , title: currentTitle, tags: currentTags}).onsuccess = function () {
                    // Update UI to reflect addition
                    document.getElementById('saveButton').textContent = "URL is Saved";
                    // svgIcon.classList.remove('hidden');
                };
            }
        };
    }

    // app.js - Inside your DOMContentLoaded event listener or similar initialization function
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.type === 'metaKeywords') {
            console.log('Keywords:', message.keywords);
            // Do something with the keywords, like displaying them in the popup
            document.getElementById('tagsField').value = message.keywords; // Example usage
        }
    });

    // Trigger content script to send meta tag data when the popup is opened
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'fetchMetaTags'});
    });

    // Request meta tags from the content script when the popup is loaded
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getMetaTags"});
    });



});

