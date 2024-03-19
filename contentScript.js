function getMetaContentByName(name, content = 'content') {
  const meta = document.querySelector(`meta[name="${name}"]`);
  console.debug(meta);
  return meta ? meta.getAttribute(content) : '';
}

// Example: Get content of the "keywords" meta tag
const keywords = getMetaContentByName('Keywords');

// Send the keywords back to the extension, e.g., background script or popup
chrome.runtime.sendMessage({type: 'metaKeywords', keywords: keywords});

// Listen for the message from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.debug("FML!!")
  if (request.action === "getMetaTags") {
      // The same function to fetch and send meta tags
      const keywords = getMetaContentByName('Keywords');
      chrome.runtime.sendMessage({type: 'metaKeywords', keywords: keywords});
  }
});