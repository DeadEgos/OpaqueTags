
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
      const row = 
      `<tr>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:pl-0">${bookmark.title}</td>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:pl-0"><a href="${bookmark.url}">${bookmark.url}</a></td>
      </tr>`;
      bookmarksList.innerHTML = bookmarksList.innerHTML.concat(row);
    });

    if (bookmarks.length === 0) {
      bookmarksList.textContent = "No bookmarks saved.";
    }
  }
});

