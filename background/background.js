import { 
  initProxyConfig,
  updateProxySettings,
  clearProxySettings,
  getProxyState,
  setProxyDomains
} from './proxy-config.js';

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

console.log("Fireproxy background script loaded");

// Initialize extension state
browser.runtime.onInstalled.addListener(async () => {
  // Initialize both modules
  await initDomainManagement();
  await initProxyConfig();
  
  // Sync the domains between domain management and proxy config
  const domains = getAllDomains();
  await setProxyDomains(domains);
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