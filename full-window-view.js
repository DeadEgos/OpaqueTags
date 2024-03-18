
document.addEventListener('DOMContentLoaded', function () {
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
      fetchAndDisplayBookmarks();
    };

    request.onerror = function (event) {
      console.error("IndexedDB error: ", event.target.errorCode);
    };
  }

  openDB();
  function fetchAndDisplayBookmarks() {
    const transaction = db.transaction(["bookmarks"], "readonly");
    const objectStore = transaction.objectStore("bookmarks");
    const request = objectStore.getAll(); // Use getAll() to fetch all records

    request.onsuccess = function (event) {
      const bookmarks = event.target.result; // Array of bookmarks
      displayBookmarks(bookmarks); // Call function to display these bookmarks
    };

    request.onerror = function (event) {
      console.error("Error fetching bookmarks: ", event.target.errorCode);
    };
  }
  function displayBookmarks(bookmarks) {
    const bookmarksList = document.getElementById('bookmarksList'); // Your container for bookmarks
    bookmarksList.innerHTML = ''; // Clear existing content

    bookmarks.forEach(bookmark => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = bookmark.url;
      link.textContent = bookmark.url; // Set the link text or use a title if available
      link.target = "_blank"; // Open in new tab

      listItem.appendChild(link);
      bookmarksList.appendChild(listItem);
    });

    if (bookmarks.length === 0) {
      bookmarksList.textContent = "No bookmarks saved.";
    }
  }
});

