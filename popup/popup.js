// DOM elements
const enableToggle = document.getElementById('enableToggle');
const statusText = document.getElementById('statusText');
const domainInput = document.getElementById('domainInput');
const addDomainButton = document.getElementById('addDomain');
const domainList = document.getElementById('domainList');
const scanPageButton = document.getElementById('scanPage');

// Load current state
function loadState() {
  browser.storage.local.get(['enabled', 'domains']).then(result => {
    enableToggle.checked = result.enabled || false;
    statusText.textContent = result.enabled ? 'Enabled' : 'Disabled';
    
    // Populate domain list
    domainList.innerHTML = '';
    const domains = result.domains || [];
    
    domains.forEach(domain => {
      addDomainToList(domain);
    });
  });
}

// Add domain to the UI list
function addDomainToList(domain) {
  const li = document.createElement('li');
  
  const domainText = document.createElement('span');
  domainText.textContent = domain;
  
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    removeDomain(domain);
  });
  
  li.appendChild(domainText);
  li.appendChild(removeButton);
  domainList.appendChild(li);
}

// Remove domain from storage and UI
function removeDomain(domain) {
  browser.storage.local.get('domains').then(result => {
    const domains = result.domains || [];
    const updatedDomains = domains.filter(d => d !== domain);
    
    browser.storage.local.set({ domains: updatedDomains }).then(() => {
      loadState();
    });
  });
}

// Add new domain
function addDomain() {
  const domain = domainInput.value.trim();
  
  if (!domain) {
    return;
  }
  
  browser.storage.local.get('domains').then(result => {
    const domains = result.domains || [];
    
    if (!domains.includes(domain)) {
      domains.push(domain);
      browser.storage.local.set({ domains }).then(() => {
        domainInput.value = '';
        loadState();
      });
    }
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadState);

enableToggle.addEventListener('change', () => {
  const enabled = enableToggle.checked;
  statusText.textContent = enabled ? 'Enabled' : 'Disabled';
  browser.storage.local.set({ enabled });
});

addDomainButton.addEventListener('click', addDomain);

domainInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    addDomain();
  }
});

scanPageButton.addEventListener('click', () => {
  // This will be implemented later
  alert('Scan functionality will be implemented in a future update');
});