
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
    const bookmarksList = document.getElementById('bookmarksList');
    // Clear existing content efficiently
    while (bookmarksList.firstChild) {
      bookmarksList.removeChild(bookmarksList.firstChild);
    }

    if (bookmarks.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.textContent = "No bookmarks saved.";
      cell.setAttribute('colspan', '3');
      cell.classList.add('text-center');
      row.appendChild(cell);
      bookmarksList.appendChild(row);
    } else {
      bookmarks.forEach(bookmark => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-sm', 'font-medium', 'text-zinc-800', 'dark:text-zinc-200', 'sm:pl-0');
        titleCell.textContent = bookmark.title;
        row.appendChild(titleCell);

        const urlCell = document.createElement('td');
        urlCell.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-sm', 'font-medium', 'text-zinc-800', 'dark:text-zinc-200', 'sm:pl-0');
        const link = document.createElement('a');
        link.setAttribute('href', bookmark.url);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = bookmark.url;
        urlCell.appendChild(link);
        row.appendChild(urlCell);

        const tagsCell = document.createElement('td');
        tagsCell.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-sm', 'font-medium', 'text-zinc-800', 'dark:text-zinc-200', 'sm:pl-0');
        // Assuming tags is an array; join them for display. If it's a string, you might not need to join.
        tagsCell.textContent = Array.isArray(bookmark.tags) ? bookmark.tags.join(', ') : bookmark.tags;
        row.appendChild(tagsCell);

        bookmarksList.appendChild(row);
      });
    }
  }

});

