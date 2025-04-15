/**
 * Domain Management Module
 * 
 * Handles all domain-related operations including:
 * - Domain validation
 * - Domain storage operations
 * - Domain list CRUD functions
 */

// State management for domains
let _domains = [];

/**
 * Initialize the domain management module
 * @returns {Promise<void>}
 */
export async function initDomainManagement() {
  const { domains } = await browser.storage.local.get({
    domains: []
  });
  
  _domains = Array.isArray(domains) ? domains : [];
  console.log('Domain management initialized with domains:', _domains);
}

/**
 * Get all domains currently managed
 * @returns {Array<string>} Array of domains
 */
export function getAllDomains() {
  return [..._domains];
}

/**
 * Validate if a string is a properly formatted domain
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if domain is valid
 */
export function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  // Remove any protocol and get only the domain part
  let domainOnly = domain.trim();
  
  // Remove leading dots
  domainOnly = domainOnly.replace(/^\./, '');
  
  // Special case for localhost
  if (domainOnly === 'localhost') {
    return true;
  }
  
  // If it's an IP address
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipRegex.test(domainOnly)) {
    // Validate each octet is between 0-255
    const octets = domainOnly.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // Check for Internationalized Domain Names (IDN) in Punycode format (xn--...)
  if (domainOnly.includes('xn--')) {
    // Simple check for IDN format - more validation could be added if needed
    const idnRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9\-]{2,}$/;
    return idnRegex.test(domainOnly);
  }
  
  // Regular domain validation
  // This regex checks for valid domain format: example.com, sub.example.com
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domainOnly);
}

/**
 * Normalize a domain string (remove protocols, trailing slashes, etc.)
 * @param {string} domain - Domain to normalize
 * @returns {string} Normalized domain
 */
export function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return '';
  }
  
  // Remove any protocol and path
  let normalized = domain.trim();
  
  // Remove protocol (http://, https://, etc.)
  normalized = normalized.replace(/^(https?:\/\/|ftp:\/\/|wss?:\/\/)/i, '');
  
  // Remove path, query parameters, and hash
  normalized = normalized.split(/[\/\?\#]/)[0];
  
  // Remove leading dots
  normalized = normalized.replace(/^\./, '');
  
  // Remove port number if present
  normalized = normalized.replace(/:\d+$/, '');
  
  // Convert to lowercase
  normalized = normalized.toLowerCase();
  
  return normalized;
}

/**
 * Add a new domain to the managed list
 * @param {string} domain - Domain to add
 * @returns {Promise<{success: boolean, message: string, domains: Array<string>}>} Result with updated domains
 */
export async function addDomain(domain) {
  const normalizedDomain = normalizeDomain(domain);
  
  if (!normalizedDomain) {
    return { success: false, message: 'Domain cannot be empty', domains: _domains };
  }
  
  if (!isValidDomain(normalizedDomain)) {
    return { success: false, message: 'Invalid domain format', domains: _domains };
  }
  
  if (_domains.includes(normalizedDomain)) {
    return { success: false, message: 'Domain already exists', domains: _domains };
  }
  
  // Add new domain to the beginning of the array (instead of the end)
  _domains.unshift(normalizedDomain);
  await saveDomains();
  
  return { 
    success: true, 
    message: `Domain ${normalizedDomain} added successfully`, 
    domains: _domains 
  };
}

/**
 * Remove a domain from the managed list
 * @param {string} domain - Domain to remove
 * @returns {Promise<{success: boolean, message: string, domains: Array<string>}>} Result with updated domains
 */
export async function removeDomain(domain) {
  const normalizedDomain = normalizeDomain(domain);
  
  if (!_domains.includes(normalizedDomain)) {
    return { success: false, message: 'Domain not found', domains: _domains };
  }
  
  _domains = _domains.filter(d => d !== normalizedDomain);
  await saveDomains();
  
  return { 
    success: true, 
    message: `Domain ${normalizedDomain} removed successfully`, 
    domains: _domains 
  };
}

/**
 * Update a domain in the managed list
 * @param {string} oldDomain - Domain to update
 * @param {string} newDomain - New domain value
 * @returns {Promise<{success: boolean, message: string, domains: Array<string>}>} Result with updated domains
 */
export async function updateDomain(oldDomain, newDomain) {
  const normalizedOldDomain = normalizeDomain(oldDomain);
  const normalizedNewDomain = normalizeDomain(newDomain);
  
  if (!normalizedNewDomain) {
    return { success: false, message: 'New domain cannot be empty', domains: _domains };
  }
  
  if (!isValidDomain(normalizedNewDomain)) {
    return { success: false, message: 'Invalid domain format', domains: _domains };
  }
  
  if (!_domains.includes(normalizedOldDomain)) {
    return { success: false, message: 'Original domain not found', domains: _domains };
  }
  
  if (_domains.includes(normalizedNewDomain) && normalizedOldDomain !== normalizedNewDomain) {
    return { success: false, message: 'New domain already exists', domains: _domains };
  }
  
  _domains = _domains.map(d => d === normalizedOldDomain ? normalizedNewDomain : d);
  await saveDomains();
  
  return { 
    success: true, 
    message: `Domain updated from ${normalizedOldDomain} to ${normalizedNewDomain}`, 
    domains: _domains 
  };
}

/**
 * Clear all domains from the managed list
 * @returns {Promise<{success: boolean, message: string, domains: Array<string>}>} Result with updated domains
 */
export async function clearAllDomains() {
  _domains = [];
  await saveDomains();
  
  return { 
    success: true, 
    message: 'All domains cleared', 
    domains: _domains 
  };
}

/**
 * Import domains from an array
 * @param {Array<string>} domains - Array of domains to import
 * @returns {Promise<{success: boolean, message: string, domains: Array<string>, rejected: Array<string>}>} Result with updated domains
 */
export async function importDomains(domains) {
  if (!Array.isArray(domains)) {
    return { 
      success: false, 
      message: 'Invalid domains format', 
      domains: _domains,
      rejected: []
    };
  }
  
  const validDomains = [];
  const rejectedDomains = [];
  
  domains.forEach(domain => {
    const normalizedDomain = normalizeDomain(domain);
    if (normalizedDomain && isValidDomain(normalizedDomain) && !_domains.includes(normalizedDomain)) {
      validDomains.push(normalizedDomain);
    } else if (normalizedDomain) {
      rejectedDomains.push(normalizedDomain);
    }
  });
  
  if (validDomains.length > 0) {
    // Add new domains to the beginning of the array
    _domains = [...validDomains, ..._domains];
    await saveDomains();
  }
  
  return { 
    success: validDomains.length > 0, 
    message: `${validDomains.length} domains imported, ${rejectedDomains.length} rejected`, 
    domains: _domains,
    rejected: rejectedDomains
  };
}

/**
 * Save domains to storage
 * @private
 * @returns {Promise<void>}
 */
async function saveDomains() {
  await browser.storage.local.set({ domains: _domains });
  // Dispatch an event that domains have changed
  const event = new CustomEvent('domainsUpdated', { detail: { domains: _domains } });
  document.dispatchEvent(event);
  
  console.log('Domains saved:', _domains);
}

/**
 * Extract domains from a URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Extracted domain
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

/**
 * Check if a domain or URL matches any domain in the managed list
 * @param {string} domainOrUrl - Domain or URL to check
 * @returns {boolean} True if domain matches any managed domain
 */
export function isDomainMatched(domainOrUrl) {
  const domain = domainOrUrl.includes('://') ? extractDomainFromUrl(domainOrUrl) : normalizeDomain(domainOrUrl);
  
  if (!domain) {
    return false;
  }
  
  return _domains.some(managedDomain => {
    // Check if domain equals managed domain or is a subdomain of managed domain
    return domain === managedDomain || domain.endsWith(`.${managedDomain}`);
  });
}