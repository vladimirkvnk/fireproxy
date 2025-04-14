import { generatePACScript, DEFAULT_PROXY } from './pac-generator.js';

/**
 * Proxy Configuration Module
 * Handles all proxy-related settings and operations
 */

// Store the current proxy state
let _proxyState = {
  enabled: false,
  domains: [],
  proxyConfig: DEFAULT_PROXY,
  // DNS proxy settings
  proxyDNS: true
};

/**
 * Initialize the proxy configuration
 * @returns {Promise<void>}
 */
export async function initProxyConfig() {
  const { enabled, domains, proxyConfig, proxyDNS } = await browser.storage.local.get({
    enabled: false,
    domains: [],
    proxyConfig: DEFAULT_PROXY,
    proxyDNS: true
  });
  
  _proxyState = {
    enabled,
    domains,
    proxyConfig: proxyConfig || DEFAULT_PROXY,
    proxyDNS: proxyDNS !== undefined ? proxyDNS : true
  };
  
  console.log('Proxy configuration initialized:', _proxyState);
  return updateProxySettings();
}

/**
 * Update the proxy settings based on current state
 * @returns {Promise<void>}
 */
export async function updateProxySettings() {
  const { enabled, domains, proxyConfig, proxyDNS } = _proxyState;
  
  console.log("Updating proxy settings:", { enabled, domains, proxyConfig, proxyDNS });
  
  if (enabled && domains.length > 0) {
    const pacScript = generatePACScript(domains, proxyConfig);
    const dataUrl = `data:application/x-ns-proxy-autoconfig;charset=utf-8,${encodeURIComponent(pacScript)}`;
    
    try {
      await browser.proxy.settings.set({ 
        value: {
          proxyType: "autoConfig",
          autoConfigUrl: dataUrl,
          // Configure DNS proxy settings
          proxyDNS: proxyDNS
        }
      });
      console.log("Proxy settings successfully updated with DNS proxy:", proxyDNS);
    } catch (error) {
      console.error("Failed to update proxy settings:", error);
      throw error;
    }
  } else {
    // Disable proxy and reset to system defaults
    await browser.proxy.settings.set({ 
      value: { 
        proxyType: 'system',
        proxyDNS: false 
      } 
    });
    console.log('Proxy settings reset to system defaults');
  }
}

/**
 * Update the enabled state of the proxy
 * @param {boolean} enabled - Whether to enable the proxy
 * @returns {Promise<void>}
 */
export async function setProxyEnabled(enabled) {
  _proxyState.enabled = enabled;
  await browser.storage.local.set({ enabled });
  return updateProxySettings();
}

/**
 * Update the domains list for proxy routing
 * @param {Array<string>} domains - List of domains to route through proxy
 * @returns {Promise<void>}
 */
export async function setProxyDomains(domains) {
  _proxyState.domains = domains;
  await browser.storage.local.set({ domains });
  return updateProxySettings();
}

/**
 * Update the proxy server configuration
 * @param {Object} proxyConfig - Configuration for the proxy server
 * @param {string} proxyConfig.host - Proxy server host
 * @param {number} proxyConfig.port - Proxy server port
 * @param {string} proxyConfig.type - Proxy type (socks, http, etc.)
 * @returns {Promise<void>}
 */
export async function setProxyConfig(proxyConfig) {
  _proxyState.proxyConfig = proxyConfig;
  await browser.storage.local.set({ proxyConfig });
  return updateProxySettings();
}

/**
 * Set whether DNS requests should be proxied
 * @param {boolean} proxyDNS - Whether to proxy DNS requests
 * @returns {Promise<void>}
 */
export async function setProxyDNS(proxyDNS) {
  _proxyState.proxyDNS = proxyDNS;
  await browser.storage.local.set({ proxyDNS });
  return updateProxySettings();
}

/**
 * Get the current proxy configuration state
 * @returns {Object} The current proxy state
 */
export function getProxyState() {
  return {..._proxyState};
}

/**
 * Clear all proxy settings and reset to system defaults
 * @returns {Promise<void>}
 */
export async function clearProxySettings() {
  await browser.proxy.settings.set({ 
    value: { 
      proxyType: 'system',
      proxyDNS: false 
    } 
  });
  console.log('Proxy settings cleared and reset to system defaults');
}