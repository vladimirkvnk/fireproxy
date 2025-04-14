import { 
  initProxyConfig,
  updateProxySettings,
  clearProxySettings,
  getProxyState
} from './proxy-config.js';

console.log("Fireproxy background script loaded");

// Initialize extension state
browser.runtime.onInstalled.addListener(() => {
  // Default settings will be loaded from storage or initialized in proxy-config module
  initProxyConfig();
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
browser.runtime.onStartup.addListener(() => initProxyConfig());

// Export the current state for the popup
export function getProxyConfiguration() {
  return getProxyState();
}