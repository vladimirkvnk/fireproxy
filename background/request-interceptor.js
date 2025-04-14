/**
 * Request Interception Module
 * 
 * Handles monitoring web requests and extracting domains for potential proxying.
 * - Sets up webRequest API listeners
 * - Extracts domains from requests
 * - Filters requests based on domain lists
 */

import { isDomainMatched, addDomain, normalizeDomain } from './domain-management.js';

// State management for interceptor
let _isEnabled = false;
let _interceptOptions = {
  autoDiscover: false,  // Automatically discover new domains
  collectStats: true,   // Collect statistics on requests
  notifyOnMatch: false  // Send notification when a match is found
};

// Statistics for intercepted requests
let _stats = {
  totalRequests: 0,
  interceptedRequests: 0,
  matchedDomains: new Map(), // Domain -> count
  lastReset: Date.now()
};

/**
 * Initialize the request interceptor
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
export async function initRequestInterceptor(options = {}) {
  const { enabled, interceptOptions } = await browser.storage.local.get({
    enabled: false,
    interceptOptions: _interceptOptions
  });
  
  _isEnabled = enabled;
  _interceptOptions = { ..._interceptOptions, ...interceptOptions };
  
  setupRequestListeners();
  console.log('Request interceptor initialized:', { enabled: _isEnabled, options: _interceptOptions });
}

/**
 * Set up the webRequest API listeners
 */
function setupRequestListeners() {
  // Remove any existing listeners
  try {
    browser.webRequest.onBeforeRequest.removeListener(handleRequest);
  } catch (error) {
    // Listener wasn't registered yet
  }
  
  // Set up listener for all requests
  browser.webRequest.onBeforeRequest.addListener(
    handleRequest,
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
  
  console.log('Request listeners set up');
}

/**
 * Handle an intercepted request
 * @param {Object} requestDetails - The details of the request
 * @returns {Object|undefined} - WebRequest API response
 */
function handleRequest(requestDetails) {
  if (!_isEnabled) return;
  
  _stats.totalRequests++;
  
  try {
    const url = new URL(requestDetails.url);
    const domain = url.hostname;
    
    // Skip browser internal requests
    if (
      domain === 'moz-extension:' || 
      domain.includes('mozilla.net') ||
      domain.includes('firefox') ||
      !domain ||
      domain === 'localhost' ||
      /^\d+\.\d+\.\d+\.\d+$/.test(domain) // IP address
    ) {
      return;
    }
    
    // Check if this domain should be proxied
    const shouldProxy = isDomainMatched(domain);
    
    // Update statistics
    if (shouldProxy) {
      _stats.interceptedRequests++;
      
      // Update matched domains count
      const normalizedDomain = normalizeDomain(domain);
      if (_stats.matchedDomains.has(normalizedDomain)) {
        _stats.matchedDomains.set(
          normalizedDomain, 
          _stats.matchedDomains.get(normalizedDomain) + 1
        );
      } else {
        _stats.matchedDomains.set(normalizedDomain, 1);
      }
      
      // Notify if needed
      if (_interceptOptions.notifyOnMatch) {
        notifyMatchedDomain(domain, requestDetails);
      }
    }
    
    // Auto-discover new domains if enabled
    if (_interceptOptions.autoDiscover && !shouldProxy) {
      // This would be handled by a more sophisticated domain discovery algorithm
      // For now, we're not implementing auto-discovery
    }
    
    // The actual proxy routing is handled by the PAC script, so we don't need to
    // return anything special here. The browser will apply the proxy settings
    // based on the PAC script configuration.
    return;
  } catch (error) {
    console.error('Error handling request:', error, requestDetails);
    return;
  }
}

/**
 * Notify the user that a domain was matched
 * @param {string} domain - The matched domain
 * @param {Object} requestDetails - The details of the request
 */
function notifyMatchedDomain(domain, requestDetails) {
  // This would show a browser notification
  // Not implementing for now as it might be annoying
  console.log(`Matched domain: ${domain}`, requestDetails);
}

/**
 * Enable or disable the request interceptor
 * @param {boolean} isEnabled - Whether to enable the interceptor
 */
export function setInterceptorEnabled(isEnabled) {
  _isEnabled = isEnabled;
  browser.storage.local.set({ interceptorEnabled: isEnabled });
  console.log(`Request interceptor ${isEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Update the interceptor options
 * @param {Object} options - New options
 */
export function updateInterceptorOptions(options) {
  _interceptOptions = { ..._interceptOptions, ...options };
  browser.storage.local.set({ interceptOptions: _interceptOptions });
  console.log('Request interceptor options updated:', _interceptOptions);
}

/**
 * Get the current stats for intercepted requests
 * @returns {Object} - Stats object
 */
export function getInterceptorStats() {
  return {
    ..._stats,
    matchedDomains: Object.fromEntries(_stats.matchedDomains),
  };
}

/**
 * Reset the interceptor stats
 */
export function resetInterceptorStats() {
  _stats = {
    totalRequests: 0,
    interceptedRequests: 0,
    matchedDomains: new Map(),
    lastReset: Date.now()
  };
  console.log('Request interceptor stats reset');
}

/**
 * Get discovered domains that aren't in the managed list
 * @returns {Array<string>} - Array of discovered domains
 */
export function getDiscoveredDomains() {
  // In a future version, this would return domains discovered through the auto-discovery feature
  return [];
}

/**
 * Extract domain from a URL
 * @param {string} url - URL to extract domain from
 * @returns {string} - Extracted domain
 */
export function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Failed to extract domain from URL:', error);
    return '';
  }
}