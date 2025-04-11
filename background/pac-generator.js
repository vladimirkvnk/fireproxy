export function generatePACScript(domains, proxyConfig) {
  const proxy = `SOCKS5 ${proxyConfig.host}:${proxyConfig.port}`;
  
  // Generate domain matching conditions with wildcard support
  const conditions = domains
    .map(domain => {
      const cleanDomain = domain.replace(/^\./, '');
      return `shExpMatch(host, '*.${cleanDomain}') || host == '${cleanDomain}'`;
    })
    .join(' || \n      ');
  
  return `
    function FindProxyForURL(url, host) {
      // Match domain and all subdomains
      if (${conditions || 'false'}) {
        return '${proxy}';
      }
      return 'DIRECT';
    }
  `.trim();
}

export const DEFAULT_PROXY = {
  host: '127.0.0.1',
  port: 8080,
  type: 'socks'
};