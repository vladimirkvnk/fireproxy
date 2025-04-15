import { 
  initProxyConfig,
  updateProxySettings,
  clearProxySettings,
  getProxyState,
  setProxyDomains,
  setProxyConfig,
  setProxyDNS
} from './proxy-config.js';

import { DEFAULT_PROXY } from './pac-generator.js';

import {
  initDomainManagement,
  getAllDomains,
  addDomain,
  removeDomain,
  updateDomain,
  clearAllDomains,
  importDomains,
  isValidDomain,
  normalizeDomain,
  isDomainMatched
} from './domain-management.js';

import {
  initRequestInterceptor,
  setInterceptorEnabled,
  updateInterceptorOptions,
  getInterceptorStats,
  resetInterceptorStats
} from './request-interceptor.js';

import {
  initDomainScanner,
  processScannedDomains,
  getDiscoveredDomains,
  clearDiscoveredDomains,
  removeDiscoveredDomain
} from './domain-scanner.js';

console.log("Fireproxy background script loaded");

// Initialize extension state
browser.runtime.onInstalled.addListener(async () => {
  // Initialize all modules
  await initDomainManagement();
  await initProxyConfig();
  await initRequestInterceptor();
  await initDomainScanner();
  
  // Sync the domains between domain management and proxy config
  const domains = getAllDomains();
  await setProxyDomains(domains);
  
  // Initialize default auto-scan setting if not set
  browser.storage.local.get('autoScanEnabled').then(result => {
    if (result.autoScanEnabled === undefined) {
      browser.storage.local.set({ autoScanEnabled: false });
    }
  });
});

// Add this to ensure proxy settings are cleared on extension disable
browser.runtime.onSuspend.addListener(async () => {
  await clearProxySettings();
});

// Listen to storage changes
browser.storage.onChanged.addListener(changes => {
  if (changes.domains || changes.enabled || changes.proxyConfig || changes.proxyDNS) {
    // The proxy-config module will handle updating from storage
    updateProxySettings();
  }
});

// Initial setup
browser.runtime.onStartup.addListener(async () => {
  await initDomainManagement();
  await initProxyConfig();
  await initRequestInterceptor();
  await initDomainScanner();
});

// Set up message handlers for popup and content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  // Handle different message types
  switch (message.type) {
    case 'getDomains':
      sendResponse({ domains: getAllDomains() });
      break;
      
    case 'addDomain':
      addDomain(message.domain).then(result => {
        if (result.success) {
          // Update proxy settings with new domains
          setProxyDomains(result.domains);
        }
        sendResponse(result);
      });
      return true; // Indicate we'll send response asynchronously
      
    case 'removeDomain':
      removeDomain(message.domain).then(result => {
        if (result.success) {
          // Update proxy settings with new domains
          setProxyDomains(result.domains);
        }
        sendResponse(result);
      });
      return true;
      
    case 'updateDomain':
      updateDomain(message.oldDomain, message.newDomain).then(result => {
        if (result.success) {
          // Update proxy settings with new domains
          setProxyDomains(result.domains);
        }
        sendResponse(result);
      });
      return true;
      
    case 'clearDomains':
      clearAllDomains().then(result => {
        if (result.success) {
          // Update proxy settings with empty domains
          setProxyDomains([]);
        }
        sendResponse(result);
      });
      return true;
      
    case 'importDomains':
      importDomains(message.domains).then(result => {
        if (result.success) {
          // Update proxy settings with new domains
          setProxyDomains(result.domains);
        }
        sendResponse(result);
      });
      return true;
      
    case 'validateDomain':
      sendResponse({ 
        isValid: isValidDomain(message.domain),
        normalized: normalizeDomain(message.domain)
      });
      break;
      
    case 'getProxyConfig':
      sendResponse({ config: getProxyState() });
      break;
      
    case 'updateProxyConfig':
      setProxyConfig(message.config).then(() => {
        sendResponse({ success: true, config: getProxyState() });
      });
      return true;
      
    case 'updateProxyDNS':
      setProxyDNS(message.proxyDNS).then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'resetProxyConfig':
      setProxyConfig(DEFAULT_PROXY).then(() => {
        setProxyDNS(true).then(() => {
          sendResponse({ success: true, config: getProxyState() });
        });
      });
      return true;
      
    case 'getInterceptorStats':
      sendResponse({ stats: getInterceptorStats() });
      break;
      
    case 'resetInterceptorStats':
      resetInterceptorStats();
      sendResponse({ success: true });
      break;
      
    case 'updateInterceptorOptions':
      updateInterceptorOptions(message.options);
      sendResponse({ success: true });
      break;
      
    case 'getDiscoveredDomains':
      sendResponse({ domains: getDiscoveredDomains() });
      break;
      
    case 'clearDiscoveredDomains':
      clearDiscoveredDomains().then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'removeDiscoveredDomain':
      removeDiscoveredDomain(message.domain).then(removed => {
        sendResponse({ success: removed });
      });
      return true;
      
    case 'scanPageForDomains':
      // This message comes from the popup and triggers scanning the active tab
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length === 0) {
          sendResponse({ success: false, message: 'No active tab found' });
          return;
        }
        
        // Send message to content script to scan the page
        browser.tabs.sendMessage(tabs[0].id, { type: 'scanPage' })
          .then(scanData => {
            if (!scanData) {
              sendResponse({ success: false, message: 'Failed to scan page' });
              return;
            }
            
            // Process the scanned domains
            const processedDomains = processScannedDomains(scanData);
            sendResponse({ success: true, domains: processedDomains });
          })
          .catch(error => {
            console.error('Error scanning page:', error);
            sendResponse({ success: false, message: 'Error scanning page' });
          });
      });
      return true;  // Will respond asynchronously
      
    case 'pageScanned':
      // This message comes from content script automatic scan
      if (message.data) {
        processScannedDomains(message.data);
      }
      sendResponse({ success: true });
      break;
      
    case 'toggleAutoScan':
      browser.storage.local.set({ autoScanEnabled: message.enabled });
      sendResponse({ success: true });
      break;
      
    case 'addDiscoveredDomains':
      if (!Array.isArray(message.domains) || message.domains.length === 0) {
        sendResponse({ success: false, message: 'No domains to add' });
        return;
      }
      
      // Process domains sequentially using promises
      const processDomainsSequentially = async () => {
        let addedDomains = [];
        let failedDomains = [];
        
        for (const domainObj of message.domains) {
          try {
            const result = await addDomain(domainObj.domain);
            if (result.success) {
              addedDomains.push(domainObj.domain);
            } else {
              failedDomains.push({ domain: domainObj.domain, reason: result.message });
            }
          } catch (error) {
            console.error('Error adding domain:', error);
            failedDomains.push({ domain: domainObj.domain, reason: 'Error processing domain' });
          }
        }
        
        // Update proxy with the full domain list
        const allDomains = getAllDomains();
        await setProxyDomains(allDomains);
        
        return { 
          success: addedDomains.length > 0, 
          added: addedDomains,
          failed: failedDomains,
          domains: allDomains
        };
      };
      
      // Call the async function and send response when done
      processDomainsSequentially().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('Error processing domains:', error);
        sendResponse({ success: false, message: 'Error processing domains' });
      });
      
      return true;  // Will respond asynchronously
      
    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// Export the current state for the popup
export function getProxyConfiguration() {
  return getProxyState();
}

// Export domain management functions for direct use
export const domainManagement = {
  getAllDomains,
  addDomain,
  removeDomain,
  updateDomain,
  clearAllDomains,
  importDomains,
  isValidDomain,
  normalizeDomain,
  isDomainMatched
};

// Export request interceptor functions
export const requestInterceptor = {
  getInterceptorStats,
  resetInterceptorStats,
  updateInterceptorOptions,
  getDiscoveredDomains,
  setInterceptorEnabled
};