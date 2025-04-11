// Fireproxy background script
console.log("Fireproxy background script loaded");

// Default proxy configuration
const DEFAULT_PROXY = {
  type: "socks",
  host: "127.0.0.1",
  port: 8080,
  proxyDNS: true
};

// Initialize extension state
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    enabled: false,
    domains: []
  });
});