/**
 * Domain Scanner Module
 * 
 * Handles scanning pages for domains and manages discovered domains
 */

import { normalizeDomain, isValidDomain } from './domain-management.js';

// Store discovered domains
let _discoveredDomains = new Map(); // domain -> { types, count, timestamp }

/**
 * Initialize the domain scanner
 * @returns {Promise<void>}
 */
export async function initDomainScanner() {
  const { scannedDomains } = await browser.storage.local.get({
    scannedDomains: {}
  });
  
  // Convert from storage format to Map
  _discoveredDomains = new Map(Object.entries(scannedDomains || {}));
  
  console.log('Domain scanner initialized with domains:', _discoveredDomains.size);
}

/**
 * Process discovered domains from a page scan
 * @param {Object} scanData - The data returned from the content script scan
 * @returns {Array<Object>} - Processed domain data
 */
export function processScannedDomains(scanData) {
  const pageDomain = scanData.pageDomain;
  const domains = scanData.domains || [];
  
  const timestamp = Date.now();
  const processedDomains = [];
  
  domains.forEach(domainData => {
    const domain = normalizeDomain(domainData.domain);
    
    // Skip invalid domains or the main page domain
    if (!domain || !isValidDomain(domain) || domain === pageDomain) {
      return;
    }
    
    // Update discovered domains map
    if (_discoveredDomains.has(domain)) {
      const existing = _discoveredDomains.get(domain);
      _discoveredDomains.set(domain, {
        types: [...new Set([...existing.types, ...domainData.types])],
        count: existing.count + 1,
        timestamp
      });
    } else {
      _discoveredDomains.set(domain, {
        types: domainData.types,
        count: 1,
        timestamp
      });
    }
    
    processedDomains.push({
      domain,
      types: domainData.types,
      fromPage: pageDomain
    });
  });
  
  // Save to storage
  saveDiscoveredDomains();
  
  return processedDomains;
}

/**
 * Get all discovered domains
 * @returns {Array<Object>} - List of discovered domains with metadata
 */
export function getDiscoveredDomains() {
  // Convert Map to array of objects with domain name included
  return Array.from(_discoveredDomains.entries()).map(([domain, data]) => {
    return {
      domain,
      ...data
    };
  });
}

/**
 * Clear all discovered domains
 * @returns {Promise<void>}
 */
export async function clearDiscoveredDomains() {
  _discoveredDomains.clear();
  await saveDiscoveredDomains();
}

/**
 * Remove a domain from discovered domains
 * @param {string} domain - Domain to remove
 * @returns {Promise<boolean>} - Whether the domain was removed
 */
export async function removeDiscoveredDomain(domain) {
  const result = _discoveredDomains.delete(domain);
  await saveDiscoveredDomains();
  return result;
}

/**
 * Save discovered domains to storage
 * @private
 * @returns {Promise<void>}
 */
async function saveDiscoveredDomains() {
  // Convert Map to object for storage
  const scannedDomains = Object.fromEntries(_discoveredDomains);
  await browser.storage.local.set({ scannedDomains });
  console.log('Saved discovered domains:', _discoveredDomains.size);
}