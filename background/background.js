import { generatePACScript, DEFAULT_PROXY } from './pac-generator.js';

// Remove duplicate DEFAULT_PROXY declaration
console.log("Fireproxy background script loaded with proxy config:", DEFAULT_PROXY);

// Initialize extension state
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    enabled: false,
    domains: []
  });
});

async function updateProxySettings() {
  const { domains, enabled } = await browser.storage.local.get(['domains', 'enabled']);
  console.log("Updating proxy settings. Enabled:", enabled, "Domains:", domains);

  if (enabled && domains.length > 0) {
    const pacScript = generatePACScript(domains, DEFAULT_PROXY);
    const dataUrl = `data:application/x-ns-proxy-autoconfig;charset=utf-8,${encodeURIComponent(pacScript)}`;
    
    console.log("Generated PAC script:\n", pacScript);
    console.log("Data URL:", dataUrl);
    
    try {
      await browser.proxy.settings.set({ 
        value: {
          proxyType: "autoConfig",
          autoConfigUrl: dataUrl
        }
      });
      console.log("Proxy settings successfully updated");
    } catch (error) {
      console.error("Failed to update proxy settings:", error);
    }
  } else {
    await browser.proxy.settings.set({ value: { proxyType: 'system' } });
    console.log('Proxy settings reset to system defaults');
  }
}

// Add this to ensure proxy settings are cleared on extension disable
browser.runtime.onSuspend.addListener(async () => {
  await browser.proxy.settings.set({ value: { proxyType: 'system' } });
});

// Listen to storage changes
browser.storage.onChanged.addListener(changes => {
  if (changes.domains || changes.enabled) {
    updateProxySettings();
  }
});

// Initial setup
browser.runtime.onStartup.addListener(updateProxySettings);
browser.runtime.onInstalled.addListener(updateProxySettings);