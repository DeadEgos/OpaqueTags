document.addEventListener('DOMContentLoaded', function () {
  function getCurrentTabUrl(callback) {
      let queryInfo = { active: true, currentWindow: true };
      
      // Use the Chrome or Firefox API to query the current tab
      chrome.tabs.query(queryInfo, (tabs) => {
          let tab = tabs[0];
          let url = tab.url;
          callback(url);
      });
  }

  // Function to set the URL in the input field
  function renderURL(url) {
      document.getElementById('urlField').value = url;
  }

  // Fetch and display the URL
  getCurrentTabUrl(function(url) {
      renderURL(url);
  });

  // const saveButton = document.getElementById('saveButton');
  // const buttonText = document.getElementById('buttonText');

  // saveButton.addEventListener('click', function() {
  //     if (buttonText.textContent === "Save URL") {
  //         buttonText.textContent = "URL is Saved";
  //         svgIcon.classList.remove('hidden'); // Show the SVG icon
  //     } else {
  //         buttonText.textContent = "Save URL";
  //         svgIcon.classList.add('hidden'); // Hide the SVG icon
  //     }
  // });

  saveButton.addEventListener('click', toggleBookmark)


  function openFullWindowView() {
    browser.tabs.create({url: "/full-window-view.html"});

  }

  // Example: Listen for a click in the popup and open the full-window view
  document.getElementById('openFullViewButton').addEventListener('click', openFullWindowView);

  let db;

  function openDB() {
      const request = indexedDB.open("bookmarksDB", 1);
  
      request.onupgradeneeded = function(event) {
          db = event.target.result;
          if (!db.objectStoreNames.contains('bookmarks')) {
              db.createObjectStore('bookmarks', {keyPath: 'url'});
          }
      };
  
      request.onsuccess = function(event) {
          db = event.target.result;
          checkBookmarkStatus();
      };
  
      request.onerror = function(event) {
          console.error("IndexedDB error: ", event.target.errorCode);
      };
  }
  
  openDB();

  function checkBookmarkStatus() {
    const currentUrl = document.getElementById('urlField').value; // Assuming this is your input field
    const transaction = db.transaction(["bookmarks"], "readonly");
    const objectStore = transaction.objectStore("bookmarks");
    const request = objectStore.get(currentUrl);

    request.onsuccess = function(event) {
        const result = event.target.result;
        const saveButton = document.getElementById('saveButton'); // Your button's ID
        const svgIcon = document.getElementById('svgIcon'); // Get the SVG icon span

        if (result) {
            // URL is bookmarked
            saveButton.textContent = "URL is Saved"; // Update button text or state
            svgIcon.classList.remove('hidden');
        } else {
            // URL is not bookmarked
            saveButton.textContent = "Save URL"; // Update button text or state
            svgIcon.classList.add('hidden'); 
        }
    };
  }

  function toggleBookmark() {
    const currentUrl = document.getElementById('urlField').value; // Assuming this is your input field
    const transaction = db.transaction(["bookmarks"], "readwrite");
    const objectStore = transaction.objectStore("bookmarks");
    const request = objectStore.get(currentUrl);
    request.onsuccess = function(event) {
        const result = event.target.result;

        if (result) {
            // URL is bookmarked, remove it
            objectStore.delete(currentUrl).onsuccess = function() {
                // Update UI to reflect removal
                document.getElementById('saveButton').textContent = "Save URL";
                // svgIcon.classList.add('hidden');

            };
        } else {
            // URL is not bookmarked, add it
            objectStore.add({url: currentUrl}).onsuccess = function() {
                // Update UI to reflect addition
                document.getElementById('saveButton').textContent = "URL is Saved";
                // svgIcon.classList.remove('hidden');
            };
        }
    };
  }

});

