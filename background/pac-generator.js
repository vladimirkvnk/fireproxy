/**
 * Convert CIDR mask to netmask format
 * @param {number} cidr - CIDR mask (0-32)
 * @returns {string} Netmask in dotted decimal notation
 */
function cidrToNetmask(cidr) {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ].join('.');
}

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
      
      // Check if it's CIDR notation (IP with subnet mask)
      const cidrRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;
      if (cidrRegex.test(cleanDomain)) {
        const [ip, mask] = cleanDomain.split('/');
        const netmask = cidrToNetmask(parseInt(mask, 10));
        return `isInNet(host, "${ip}", "${netmask}")`;
      }

      // Check if it's an IP address with port
      const ipWithPortRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/;
      if (ipWithPortRegex.test(cleanDomain)) {
        const [ip, port] = cleanDomain.split(':');
        return `(host === '${ip}' && url.indexOf(':${port}') !== -1)`;
      }
      
      // Check if it's an IP address without port
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      if (ipRegex.test(cleanDomain)) {
        return `host === '${cleanDomain}'`;
      }
      
      // Create match for domain and all subdomains
      return `(host === '${cleanDomain}' || shExpMatch(host, '*.${cleanDomain}'))`;
    })
    .join(' || \n      ');

  return `
    function FindProxyForURL(url, host) {
      // First check if domain/IP is explicitly configured for proxy
      if (${conditions || 'false'}) {
        return '${proxyString}';
      }

      // Skip localhost and private IP addresses for non-configured domains
      if (isPlainHostName(host) ||
          isInNet(host, "10.0.0.0", "255.0.0.0") ||
          isInNet(host, "172.16.0.0", "255.240.0.0") ||
          isInNet(host, "192.168.0.0", "255.255.0.0") ||
          isInNet(host, "127.0.0.0", "255.0.0.0")) {
        return "DIRECT";
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