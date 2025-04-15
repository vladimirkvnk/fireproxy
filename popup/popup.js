// DOM elements
const enableToggle = document.getElementById("enableToggle");
const statusText = document.getElementById("statusText");
const domainInput = document.getElementById("domainInput");
const addDomainButton = document.getElementById("addDomain");
const domainList = document.getElementById("domainList");
const scanPageButton = document.getElementById("scanPage");
const statusMessageEl = document.getElementById("statusMessage");
const domainCount = document.getElementById("domainCount");
const proxyHostEl = document.getElementById("proxyHost");
const clearAllButton = document.getElementById("clearAllDomains");
const importDomainsButton = document.getElementById("importDomains");
const exportDomainsButton = document.getElementById("exportDomains");

// Scanner elements
const scanResultsContainer = document.getElementById("scanResults");
const discoveredDomainsList = document.getElementById("discoveredDomainsList");
const clearScanResultsButton = document.getElementById("clearScanResults");
const addSelectedDomainsButton = document.getElementById("addSelectedDomains");
const selectAllDomainsButton = document.getElementById("selectAllDomains");
const deselectAllDomainsButton = document.getElementById("deselectAllDomains");
const autoScanToggle = document.getElementById("autoScanToggle");

// Stats elements
const totalRequestsEl = document.getElementById("totalRequests");
const interceptedRequestsEl = document.getElementById("interceptedRequests");
const proxyPercentageEl = document.getElementById("proxyPercentage");
const domainsMatchedEl = document.getElementById("domainsMatched");
const topDomainsListEl = document.getElementById("topDomainsList");
const resetStatsButton = document.getElementById("resetStats");

// Settings elements
const proxyTypeSelect = document.getElementById("proxyType");
const proxyHostInput = document.getElementById("proxyHostInput");
const proxyPortInput = document.getElementById("proxyPortInput");
const proxyDNSCheckbox = document.getElementById("proxyDNS");
const saveSettingsButton = document.getElementById("saveSettings");
const resetSettingsButton = document.getElementById("resetSettings");

// Show status message with timeout
function showStatusMessage(message, isError = false) {
  if (!statusMessageEl) return;
  
  statusMessageEl.textContent = message;
  statusMessageEl.className = isError ? "status-message error" : "status-message success";
  statusMessageEl.style.display = "block";
  
  setTimeout(() => {
    statusMessageEl.style.display = "none";
  }, 3000);
}

// Load current state
function loadState() {
  Promise.all([
    browser.storage.local.get(["enabled"]),
    browser.runtime.sendMessage({ type: "getDomains" }),
    browser.runtime.sendMessage({ type: "getProxyConfig" })
  ])
  .then(([storageData, domainsResponse, proxyConfigResponse]) => {
    // Update toggle state
    const enabled = storageData.enabled || false;
    enableToggle.checked = enabled;
    statusText.textContent = enabled ? "Enabled" : "Disabled";
    
    // Update proxy info
    const proxyConfig = proxyConfigResponse.config.proxyConfig;
    proxyHostEl.textContent = `${proxyConfig.host}:${proxyConfig.port}`;
    
    // Populate domains list
    updateDomainsList(domainsResponse.domains || []);
    
    // Update settings tab
    updateSettingsTab(proxyConfigResponse.config);
  })
  .catch(error => {
    console.error("Error loading state:", error);
    showStatusMessage("Failed to load extension state", true);
  });
  
  // Also load stats if we're on that tab
  if (!document.getElementById("stats-tab").classList.contains("hidden")) {
    loadStats();
  }
}

// Update domains list in UI
function updateDomainsList(domains) {
  domainList.innerHTML = "";
  domainCount.textContent = `${domains.length} domains`;
  
  if (domains.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No domains added yet";
    emptyItem.className = "empty-message";
    domainList.appendChild(emptyItem);
    return;
  }
  
  domains.forEach(domain => {
    addDomainToList(domain);
  });
}

// Add domain to the UI list
function addDomainToList(domain) {
  const li = document.createElement("li");
  
  const domainText = document.createElement("span");
  domainText.textContent = domain;
  domainText.className = "domain-text";
  
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "remove-button";
  removeButton.addEventListener("click", () => {
    removeDomain(domain);
  });
  
  li.appendChild(domainText);
  li.appendChild(removeButton);
  domainList.appendChild(li);
}

// Remove domain using the background API
function removeDomain(domain) {
  browser.runtime.sendMessage({ 
    type: "removeDomain", 
    domain: domain 
  })
  .then(response => {
    if (response.success) {
      updateDomainsList(response.domains);
      showStatusMessage(`Domain ${domain} removed`);
    } else {
      showStatusMessage(response.message || "Failed to remove domain", true);
    }
  })
  .catch(error => {
    console.error("Error removing domain:", error);
    showStatusMessage("Failed to remove domain", true);
  });
}

// Add new domain using the background API
function addDomain() {
  const domain = domainInput.value.trim();
  
  if (!domain) {
    showStatusMessage("Domain cannot be empty", true);
    return;
  }
  
  // First validate the domain
  browser.runtime.sendMessage({ 
    type: "validateDomain", 
    domain: domain 
  })
  .then(validation => {
    if (!validation.isValid) {
      showStatusMessage("Invalid domain format", true);
      return;
    }
    
    // Then add the domain
    return browser.runtime.sendMessage({ 
      type: "addDomain", 
      domain: domain 
    });
  })
  .then(response => {
    if (response && response.success) {
      domainInput.value = "";
      updateDomainsList(response.domains);
      showStatusMessage(`Domain ${response.domains[0]} added`);
    } else if (response) {
      showStatusMessage(response.message || "Failed to add domain", true);
    }
  })
  .catch(error => {
    console.error("Error adding domain:", error);
    showStatusMessage("Failed to add domain", true);
  });
}

// Clear all domains
function clearAllDomains() {
  if (confirm("Are you sure you want to clear all domains?")) {
    browser.runtime.sendMessage({ type: "clearDomains" })
      .then(response => {
        if (response.success) {
          updateDomainsList([]);
          showStatusMessage("All domains cleared");
        } else {
          showStatusMessage(response.message || "Failed to clear domains", true);
        }
      })
      .catch(error => {
        console.error("Error clearing domains:", error);
        showStatusMessage("Failed to clear domains", true);
      });
  }
}

// Export domains to JSON file
function exportDomains() {
  browser.runtime.sendMessage({ type: "getDomains" })
    .then(response => {
      const domains = response.domains || [];
      if (domains.length === 0) {
        showStatusMessage("No domains to export", true);
        return;
      }
      
      const dataStr = JSON.stringify(domains, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileName = `fireproxy-domains-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();
      
      showStatusMessage(`Exported ${domains.length} domains`);
    });
}

// Import domains from JSON file
function importDomains() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    
    reader.onload = readerEvent => {
      try {
        const content = readerEvent.target.result;
        const domains = JSON.parse(content);
        
        if (!Array.isArray(domains)) {
          showStatusMessage("Invalid domains file format", true);
          return;
        }
        
        browser.runtime.sendMessage({ 
          type: "importDomains", 
          domains: domains 
        })
        .then(response => {
          if (response.success) {
            updateDomainsList(response.domains);
            showStatusMessage(`Imported ${domains.length - response.rejected.length} domains`);
            
            if (response.rejected.length > 0) {
              console.warn("Rejected domains:", response.rejected);
            }
          } else {
            showStatusMessage(response.message || "Failed to import domains", true);
          }
        });
      } catch (error) {
        console.error("Error parsing imported domains:", error);
        showStatusMessage("Invalid domains file", true);
      }
    };
  };
  
  input.click();
}

// Load auto-scan setting
function loadAutoScanSetting() {
  browser.storage.local.get('autoScanEnabled').then(result => {
    autoScanToggle.checked = result.autoScanEnabled || false;
  });
}

// Toggle auto-scan setting
function toggleAutoScan() {
  const enabled = autoScanToggle.checked;
  browser.runtime.sendMessage({ 
    type: "toggleAutoScan", 
    enabled: enabled 
  });
}

// Scan current page for domains
function scanCurrentPage() {
  // Show loading state
  scanPageButton.disabled = true;
  scanPageButton.innerHTML = '<span class="loading-spinner"></span> Scanning...';
  scanResultsContainer.classList.add('hidden');
  
  browser.runtime.sendMessage({ type: "scanPageForDomains" })
    .then(response => {
      // Reset button state
      scanPageButton.disabled = false;
      scanPageButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Scan Page Resources';
      
      if (!response || !response.success) {
        showStatusMessage(response?.message || "Failed to scan page", true);
        return;
      }
      
      // Show scan results
      updateDiscoveredDomainsList(response.domains);
      scanResultsContainer.classList.remove('hidden');
      
      if (response.domains.length === 0) {
        showStatusMessage("No external domains found on page");
      } else {
        showStatusMessage(`Found ${response.domains.length} domains on page`);
      }
    })
    .catch(error => {
      // Reset button state
      scanPageButton.disabled = false;
      scanPageButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Scan Page Resources';
      
      console.error("Error scanning page:", error);
      showStatusMessage("Failed to scan page", true);
    });
}

// Load discovered domains
function loadDiscoveredDomains() {
  browser.runtime.sendMessage({ type: "getDiscoveredDomains" })
    .then(response => {
      if (response && response.domains && response.domains.length > 0) {
        updateDiscoveredDomainsList(response.domains);
        scanResultsContainer.classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error("Error loading discovered domains:", error);
    });
}

// Update discovered domains list in UI
function updateDiscoveredDomainsList(domains) {
  discoveredDomainsList.innerHTML = "";
  
  if (domains.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No domains discovered";
    emptyItem.className = "empty-message";
    discoveredDomainsList.appendChild(emptyItem);
    return;
  }
  
  // Sort domains alphabetically
  const sortedDomains = [...domains].sort((a, b) => {
    return a.domain.localeCompare(b.domain);
  });
  
  sortedDomains.forEach(domainData => {
    addDiscoveredDomainToList(domainData);
  });
}

// Add discovered domain to the UI list
function addDiscoveredDomainToList(domainData) {
  const li = document.createElement("li");
  
  // Create checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "domain-checkbox";
  checkbox.setAttribute("data-domain", domainData.domain);
  
  // Create domain info container
  const domainInfo = document.createElement("div");
  domainInfo.className = "domain-info";
  
  // Create domain name element
  const domainName = document.createElement("div");
  domainName.textContent = domainData.domain;
  domainName.className = "domain-name";
  domainInfo.appendChild(domainName);
  
  // Create domain meta info if available
  if (domainData.fromPage) {
    const domainMeta = document.createElement("div");
    domainMeta.className = "domain-meta";
    domainMeta.textContent = `Found on: ${domainData.fromPage}`;
    domainInfo.appendChild(domainMeta);
  }
  
  // Create resource types badges
  if (domainData.types && domainData.types.length > 0) {
    const resourceTypes = document.createElement("div");
    resourceTypes.className = "resource-types";
    
    domainData.types.forEach(type => {
      const badge = document.createElement("span");
      badge.className = "resource-type";
      badge.textContent = type;
      resourceTypes.appendChild(badge);
    });
    
    domainInfo.appendChild(resourceTypes);
  }
  
  li.appendChild(checkbox);
  li.appendChild(domainInfo);
  discoveredDomainsList.appendChild(li);
}

// Clear all discovered domains
function clearDiscoveredDomains() {
  browser.runtime.sendMessage({ type: "clearDiscoveredDomains" })
    .then(() => {
      scanResultsContainer.classList.add('hidden');
      showStatusMessage("Cleared discovered domains");
    })
    .catch(error => {
      console.error("Error clearing discovered domains:", error);
      showStatusMessage("Failed to clear discovered domains", true);
    });
}

// Add selected domains to proxy list
function addSelectedDomains() {
  const checkboxes = discoveredDomainsList.querySelectorAll('input[type="checkbox"]:checked');
  
  if (checkboxes.length === 0) {
    showStatusMessage("No domains selected", true);
    return;
  }
  
  const selectedDomains = Array.from(checkboxes).map(checkbox => {
    return { domain: checkbox.getAttribute("data-domain") };
  });
  
  browser.runtime.sendMessage({ 
    type: "addDiscoveredDomains", 
    domains: selectedDomains 
  })
  .then(response => {
    if (response.success) {
      updateDomainsList(response.domains);
      showStatusMessage(`Added ${response.added.length} domains to proxy list`);
      
      // Uncheck the added domains
      response.added.forEach(domain => {
        const checkbox = discoveredDomainsList.querySelector(`input[data-domain="${domain}"]`);
        if (checkbox) checkbox.checked = false;
      });
      
      if (response.failed.length > 0) {
        console.warn("Failed to add some domains:", response.failed);
      }
    } else {
      showStatusMessage(response.message || "Failed to add domains", true);
    }
  })
  .catch(error => {
    console.error("Error adding domains:", error);
    showStatusMessage("Failed to add domains", true);
  });
}

// Select all domains in the discovered list
function selectAllDomains() {
  const checkboxes = discoveredDomainsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = true);
}

// Deselect all domains in the discovered list
function deselectAllDomains() {
  const checkboxes = discoveredDomainsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
}

// Extract domain from URL
function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error("Failed to extract domain from URL:", error);
    return "";
  }
}

// Load statistics
function loadStats() {
  browser.runtime.sendMessage({ type: "getInterceptorStats" })
    .then(response => {
      const stats = response.stats;
      
      // Update stats UI
      totalRequestsEl.textContent = stats.totalRequests;
      interceptedRequestsEl.textContent = stats.interceptedRequests;
      
      const percentage = stats.totalRequests > 0 
        ? Math.round((stats.interceptedRequests / stats.totalRequests) * 100) 
        : 0;
      proxyPercentageEl.textContent = `${percentage}%`;
      
      const domains = Object.keys(stats.matchedDomains || {});
      domainsMatchedEl.textContent = domains.length;
      
      // Update top domains list
      updateTopDomainsList(stats.matchedDomains || {});
    })
    .catch(error => {
      console.error("Error loading stats:", error);
      showStatusMessage("Failed to load statistics", true);
    });
}

// Update top domains list
function updateTopDomainsList(matchedDomains) {
  topDomainsListEl.innerHTML = "";
  
  // Convert to array and sort by count
  const sortedDomains = Object.entries(matchedDomains)
    .sort((a, b) => b[1] - a[1])  // Sort by count (descending)
    .slice(0, 5);  // Take top 5
  
  if (sortedDomains.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No domains proxied yet";
    emptyItem.className = "empty-message";
    topDomainsListEl.appendChild(emptyItem);
    return;
  }
  
  sortedDomains.forEach(([domain, count]) => {
    const li = document.createElement("li");
    
    const domainText = document.createElement("span");
    domainText.textContent = domain;
    domainText.className = "domain-text";
    
    const countBadge = document.createElement("span");
    countBadge.textContent = count;
    countBadge.className = "domain-count-badge";
    
    li.appendChild(domainText);
    li.appendChild(countBadge);
    topDomainsListEl.appendChild(li);
  });
}

// Reset statistics
function resetStats() {
  browser.runtime.sendMessage({ type: "resetInterceptorStats" })
    .then(() => {
      loadStats();
      showStatusMessage("Statistics reset");
    })
    .catch(error => {
      console.error("Error resetting stats:", error);
      showStatusMessage("Failed to reset statistics", true);
    });
}

// Update settings tab
function updateSettingsTab(config) {
  const proxyConfig = config.proxyConfig;
  
  proxyTypeSelect.value = proxyConfig.type;
  proxyHostInput.value = proxyConfig.host;
  proxyPortInput.value = proxyConfig.port;
  proxyDNSCheckbox.checked = config.proxyDNS !== undefined ? config.proxyDNS : true;
}

// Save proxy settings
function saveSettings() {
  const proxyConfig = {
    type: proxyTypeSelect.value,
    host: proxyHostInput.value.trim(),
    port: parseInt(proxyPortInput.value, 10)
  };
  
  // Validate settings
  if (!proxyConfig.host) {
    showStatusMessage("Proxy host cannot be empty", true);
    return;
  }
  
  if (isNaN(proxyConfig.port) || proxyConfig.port <= 0 || proxyConfig.port > 65535) {
    showStatusMessage("Invalid proxy port", true);
    return;
  }
  
  // Update proxy config
  browser.runtime.sendMessage({ 
    type: "updateProxyConfig", 
    config: proxyConfig
  })
  .then(() => {
    // Update proxy DNS setting
    return browser.runtime.sendMessage({ 
      type: "updateProxyDNS", 
      proxyDNS: proxyDNSCheckbox.checked
    });
  })
  .then(() => {
    proxyHostEl.textContent = `${proxyConfig.host}:${proxyConfig.port}`;
    showStatusMessage("Proxy settings saved");
  })
  .catch(error => {
    console.error("Error saving proxy settings:", error);
    showStatusMessage("Failed to save proxy settings", true);
  });
}

// Reset proxy settings to defaults
function resetSettings() {
  browser.runtime.sendMessage({ type: "resetProxyConfig" })
    .then(response => {
      updateSettingsTab(response.config);
      proxyHostEl.textContent = `${response.config.proxyConfig.host}:${response.config.proxyConfig.port}`;
      showStatusMessage("Proxy settings reset to defaults");
    })
    .catch(error => {
      console.error("Error resetting proxy settings:", error);
      showStatusMessage("Failed to reset proxy settings", true);
    });
}

// Tab switching functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all buttons and hide all contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Activate the clicked button and show the corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
      
      // If stats tab is selected, load the stats
      if (tabId === 'stats') {
        loadStats();
      }
    });
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupTabs();
  loadAutoScanSetting();
  loadDiscoveredDomains();
});

enableToggle.addEventListener("change", () => {
  const enabled = enableToggle.checked;
  statusText.textContent = enabled ? "Enabled" : "Disabled";
  browser.storage.local.set({ enabled });
});

addDomainButton.addEventListener("click", addDomain);

domainInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addDomain();
  }
});

scanPageButton.addEventListener("click", scanCurrentPage);

if (clearAllButton) {
  clearAllButton.addEventListener("click", clearAllDomains);
}

if (importDomainsButton) {
  importDomainsButton.addEventListener("click", importDomains);
}

if (exportDomainsButton) {
  exportDomainsButton.addEventListener("click", exportDomains);
}

if (resetStatsButton) {
  resetStatsButton.addEventListener("click", resetStats);
}

if (saveSettingsButton) {
  saveSettingsButton.addEventListener("click", saveSettings);
}

if (resetSettingsButton) {
  resetSettingsButton.addEventListener("click", resetSettings);
}

// Scanner event listeners
if (autoScanToggle) {
  autoScanToggle.addEventListener("change", toggleAutoScan);
}

if (clearScanResultsButton) {
  clearScanResultsButton.addEventListener("click", clearDiscoveredDomains);
}

if (addSelectedDomainsButton) {
  addSelectedDomainsButton.addEventListener("click", addSelectedDomains);
}

if (selectAllDomainsButton) {
  selectAllDomainsButton.addEventListener("click", selectAllDomains);
}

if (deselectAllDomainsButton) {
  deselectAllDomainsButton.addEventListener("click", deselectAllDomains);
}