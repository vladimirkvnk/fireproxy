export function generatePACScript(domains, proxyConfig) {
  const proxy = `SOCKS5 ${proxyConfig.host}:${proxyConfig.port}`;
  
  // Generate conditions that match domain and all subdomains
  const conditions = domains
    .map(domain => {
      // Remove any leading dots and whitespace
      const cleanDomain = domain.replace(/^\./, '').trim();
      // Create match for domain and all subdomains
      return `(host === '${cleanDomain}' || shExpMatch(host, '*.${cleanDomain}'))`;
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