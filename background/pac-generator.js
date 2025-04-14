/**
 * Generate a Proxy Auto-Configuration (PAC) script for dynamic proxy routing
 * @param {Array<string>} domains - List of domains to route through proxy
 * @param {Object} proxyConfig - Configuration for the proxy server
 * @param {string} proxyConfig.host - Proxy server host
 * @param {number} proxyConfig.port - Proxy server port
 * @param {string} proxyConfig.type - Proxy type (socks, http, etc.)
 * @returns {string} - The generated PAC script
 */
export function generatePACScript(domains, proxyConfig) {
  // Format the proxy string based on proxy type
  let proxyString;
  switch (proxyConfig.type.toLowerCase()) {
    case 'socks':
    case 'socks5':
      proxyString = `SOCKS5 ${proxyConfig.host}:${proxyConfig.port}`;
      break;
    case 'socks4':
      proxyString = `SOCKS ${proxyConfig.host}:${proxyConfig.port}`;
      break;
    case 'http':
      proxyString = `PROXY ${proxyConfig.host}:${proxyConfig.port}`;
      break;
    case 'https':
      proxyString = `HTTPS ${proxyConfig.host}:${proxyConfig.port}`;
      break;
    default:
      proxyString = `SOCKS5 ${proxyConfig.host}:${proxyConfig.port}`;
  }
  
  // Generate conditions that match domain and all subdomains
  const conditions = domains
    .filter(domain => domain && domain.trim()) // Filter out empty domains
    .map(domain => {
      // Remove any leading dots and whitespace
      const cleanDomain = domain.replace(/^\./,'').trim();
      // Create match for domain and all subdomains
      return `(host === '${cleanDomain}' || shExpMatch(host, '*.${cleanDomain}'))`;
    })
    .join(' || \n      ');

  return `
    function FindProxyForURL(url, host) {
      // Skip localhost and private IP addresses
      if (isPlainHostName(host) ||
          isInNet(host, "10.0.0.0", "255.0.0.0") ||
          isInNet(host, "172.16.0.0", "255.240.0.0") ||
          isInNet(host, "192.168.0.0", "255.255.0.0") ||
          isInNet(host, "127.0.0.0", "255.0.0.0")) {
        return "DIRECT";
      }

      // Match domain and all subdomains
      if (${conditions || 'false'}) {
        return '${proxyString}';
      }
      return 'DIRECT';
    }
  `.trim();
}

/**
 * Default proxy configuration
 */
export const DEFAULT_PROXY = {
  host: '127.0.0.1',
  port: 8080,
  type: 'socks5'
};