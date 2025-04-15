/**
 * Page Scanner Content Script
 * Scans the current page for all resources and extracts domains
 */

// Function to extract domain from URL
function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Failed to extract domain from URL:', error);
    return '';
  }
}

// Get all domains from different resource types
function scanPageForDomains() {
  const domains = new Set();
  const resources = {};
  
  // Add the main page domain
  const pageDomain = extractDomainFromUrl(window.location.href);
  if (pageDomain) {
    domains.add(pageDomain);
    resources[pageDomain] = ['document'];
  }
  
  // Scan all <a> tags (links)
  document.querySelectorAll('a[href]').forEach(link => {
    try {
      // Only process absolute URLs with http/https protocols
      if (link.href && (link.href.startsWith('http://') || link.href.startsWith('https://'))) {
        const domain = extractDomainFromUrl(link.href);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('link')) resources[domain].push('link');
        }
      }
    } catch (error) {
      console.error('Error processing link:', error);
    }
  });
  
  // Scan all <img> tags
  document.querySelectorAll('img[src]').forEach(img => {
    try {
      if (img.src && (img.src.startsWith('http://') || img.src.startsWith('https://'))) {
        const domain = extractDomainFromUrl(img.src);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('image')) resources[domain].push('image');
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  });
  
  // Scan all <script> tags
  document.querySelectorAll('script[src]').forEach(script => {
    try {
      if (script.src && (script.src.startsWith('http://') || script.src.startsWith('https://'))) {
        const domain = extractDomainFromUrl(script.src);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('script')) resources[domain].push('script');
        }
      }
    } catch (error) {
      console.error('Error processing script:', error);
    }
  });
  
  // Scan all <link> tags (stylesheets, favicons, etc.)
  document.querySelectorAll('link[href]').forEach(link => {
    try {
      if (link.href && (link.href.startsWith('http://') || link.href.startsWith('https://'))) {
        const domain = extractDomainFromUrl(link.href);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('stylesheet')) resources[domain].push('stylesheet');
        }
      }
    } catch (error) {
      console.error('Error processing link tag:', error);
    }
  });
  
  // Scan all <iframe> tags
  document.querySelectorAll('iframe[src]').forEach(iframe => {
    try {
      if (iframe.src && (iframe.src.startsWith('http://') || iframe.src.startsWith('https://'))) {
        const domain = extractDomainFromUrl(iframe.src);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('iframe')) resources[domain].push('iframe');
        }
      }
    } catch (error) {
      console.error('Error processing iframe:', error);
    }
  });
  
  // Scan all <video> and <source> tags
  document.querySelectorAll('video[src], audio[src], source[src]').forEach(media => {
    try {
      if (media.src && (media.src.startsWith('http://') || media.src.startsWith('https://'))) {
        const domain = extractDomainFromUrl(media.src);
        if (domain && domain !== pageDomain) {
          domains.add(domain);
          resources[domain] = resources[domain] || [];
          if (!resources[domain].includes('media')) resources[domain].push('media');
        }
      }
    } catch (error) {
      console.error('Error processing media tag:', error);
    }
  });
  
  // Additional scan for background images in computed styles
  try {
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < Math.min(allElements.length, 500); i++) { // Limit to 500 elements to avoid performance issues
      const element = allElements[i];
      const style = window.getComputedStyle(element);
      const backgroundImage = style.backgroundImage;
      
      if (backgroundImage && backgroundImage !== 'none' && backgroundImage.includes('url(')) {
        // Extract the URL from the background-image property
        const match = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1]) {
          const url = match[1];
          if (url.startsWith('http://') || url.startsWith('https://')) {
            const domain = extractDomainFromUrl(url);
            if (domain && domain !== pageDomain) {
              domains.add(domain);
              resources[domain] = resources[domain] || [];
              if (!resources[domain].includes('css-image')) resources[domain].push('css-image');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scanning for CSS background images:', error);
  }
  
  // Scan for websocket connections - not directly visible in DOM
  // This is a bit experimental and may not catch all cases
  try {
    if (window.performance && window.performance.getEntries) {
      const entries = window.performance.getEntries();
      entries.forEach(entry => {
        if (entry.name && (entry.name.startsWith('http://') || entry.name.startsWith('https://'))) {
          const domain = extractDomainFromUrl(entry.name);
          if (domain && domain !== pageDomain) {
            domains.add(domain);
            resources[domain] = resources[domain] || [];
            if (!resources[domain].includes('resource')) resources[domain].push('resource');
          }
        }
      });
    }
  } catch (error) {
    console.error('Error scanning performance entries:', error);
  }
  
  // Convert results to array format for sending
  const results = Array.from(domains).map(domain => {
    return {
      domain,
      types: resources[domain] || []
    };
  });
  
  return {
    pageDomain,
    domains: results
  };
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scanPage') {
    const domainData = scanPageForDomains();
    sendResponse(domainData);
  }
  return true; // Indicate we'll send a response asynchronously
});

// Automatically scan page when loaded if auto-scan is enabled
browser.storage.local.get('autoScanEnabled').then(result => {
  if (result.autoScanEnabled) {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      browser.runtime.sendMessage({
        type: 'pageScanned',
        data: scanPageForDomains()
      });
    } else {
      window.addEventListener('load', () => {
        browser.runtime.sendMessage({
          type: 'pageScanned',
          data: scanPageForDomains()
        });
      });
    }
  }
});