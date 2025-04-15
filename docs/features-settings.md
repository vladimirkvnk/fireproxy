# Features and Settings Reference

This document provides a detailed reference for all Fireproxy features and settings.

## Proxy Configuration

### Proxy Type

Fireproxy supports multiple proxy protocols:

| Type | Description | Common Port |
|------|-------------|-------------|
| SOCKS5 | Recommended protocol with best compatibility and DNS proxying | 1080, 9050 |
| SOCKS4 | Older SOCKS protocol with limited features | 1080 |
| HTTP | Standard HTTP proxy | 8080, 3128 |
| HTTPS | Encrypted HTTP proxy | 8080, 3128 |

**Recommendation**: Use SOCKS5 whenever possible for best performance and feature support.

### Proxy Host

The hostname or IP address of your proxy server.

- **Examples**: 
  - IP address: `127.0.0.1`
  - Hostname: `proxy.example.com`

### Proxy Port

The port number your proxy server is listening on.

- **Common ports**:
  - SSH tunnels: `8080`
  - Tor: `9050`
  - Default SOCKS: `1080`

### Proxy DNS Requests

When enabled, DNS resolution requests for the specified domains will also be sent through the proxy. This prevents DNS leaks which could compromise privacy.

- **Recommended**: Enabled
- **Effect**: Domain names will be resolved by the proxy server instead of your local DNS

## Domain Management

### Domain Format

Fireproxy accepts domains in various formats and normalizes them internally:

- **Valid formats**:
  - Standard domains: `example.com`
  - Subdomains: `sub.example.com`
  - Internationalized domains: `例子.测试`
  - With protocol (normalized): `https://example.com` → `example.com`
  - With path (normalized): `example.com/path` → `example.com`
  - With port (normalized): `example.com:8080` → `example.com`
  - IP addresses: `192.168.1.1`

- **Invalid formats**:
  - Top-level domains only: `.com`
  - Local paths: `/path/to/file`
  - Malformed domains: `not a domain`

### Subdomain Handling

When you add a domain to Fireproxy, all of its subdomains are automatically included. For example, adding `example.com` will also proxy traffic to:
- `sub.example.com`
- `another.sub.example.com`
- etc.

### Domain List Management

Fireproxy provides several ways to manage your domain list:

- **Add domain**: Enter a domain and click "Add"
- **Remove domain**: Click the "Remove" button next to a domain
- **Clear all domains**: Click the "Clear All" button
- **Import domains**: Click "Import" and select a JSON file
- **Export domains**: Click "Export" to download your domain list

## Domain Scanning

### Scan Types

Fireproxy can scan for domains in two ways:

1. **Manual scan**: Click "Scan Page Resources" to scan the current page
2. **Auto-scan**: Enable "Auto-scan" to automatically discover domains while browsing

### Resource Types

During scanning, Fireproxy identifies different types of resources:

| Type | Description | Example |
|------|-------------|--------|
| document | Main page document | The webpage itself |
| script | JavaScript files | Analytics, frameworks |
| stylesheet | CSS files | Style definitions |
| image | Image files | Photos, icons, banners |
| media | Audio/video | Embedded media players |
| font | Font files | Custom typography |
| xhr | Background requests | API calls, data loading |
| websocket | WebSocket connections | Real-time data |
| other | Other resource types | Miscellaneous resources |

### Selection and Filtering

After scanning, you can:

- Select individual domains to add
- Use "Select All" to choose all discovered domains
- Use "Deselect All" to clear your selection
- Filter by resource type visually through the badges

## Statistics

### Metrics

Fireproxy collects the following statistics:

- **Total Requests**: All web requests made since stats were last reset
- **Proxied Requests**: Requests that were routed through your proxy
- **Proxy Percentage**: Percentage of total traffic being proxied
- **Domains Matched**: Number of unique domains being proxied

### Top Domains

The statistics panel shows the most frequently proxied domains with request counts.

### Data Privacy

- Statistics are stored locally in your browser
- No data is sent to external servers
- Clearing browser data will reset statistics

## Extension Toggle

The main toggle at the top of the popup enables or disables the entire extension.

- **Enabled**: Traffic to listed domains is routed through your proxy
- **Disabled**: All traffic uses your normal connection (no proxying)

## Limitations

- **WebRTC**: WebRTC connections might bypass the proxy and leak your real IP address
- **Browser limitations**: Some browser processes might not respect proxy settings
- **Extension conflicts**: Other proxy extensions might interfere with Fireproxy

## Advanced Features

### Keyboard Shortcuts

- **Open/close popup**: Ctrl+Shift+F (Windows/Linux) or Cmd+Shift+F (Mac)
- **Within popup**: Tab to navigate, Enter to submit

### Storage

- Domains and settings are stored in browser.storage.local
- Import/export functionality for backups and transfers

### Developer Features

- Automated tests available in the tests directory
- Logging for debugging and troubleshooting