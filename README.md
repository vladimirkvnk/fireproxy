# Fireproxy

A Firefox extension that routes traffic for specific domains through a SOCKS proxy server, including DNS requests.

![Fireproxy Logo](icons/fireproxy-96.png)

## Features

- **Selective Proxying**: Route traffic for specific domains through a proxy while keeping other traffic direct
- **Multiple Proxy Types**: Support for SOCKS5, SOCKS4, HTTP, and HTTPS proxies
- **Domain Management**: Easy-to-use interface for adding, removing, and managing domains
- **Domain Scanning**: Automatically discover domains from pages you visit
- **DNS Proxying**: Prevent DNS leaks by routing DNS requests through the proxy
- **Statistics**: Monitor your proxied traffic with detailed statistics
- **Import/Export**: Save and transfer your domain lists

## Documentation

- [Installation Guide](docs/installation.md)
- [Usage Guide](docs/usage-guide.md)
- [Features and Settings Reference](docs/features-settings.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

## Quick Start

1. Install the extension from the Firefox Add-ons store or manually
2. Configure your proxy server in the Settings tab
3. Add domains you want to proxy in the Domains tab
4. Enable the extension using the toggle at the top
5. Visit a website on your proxy list - traffic will be routed through your proxy

## Development Setup

### Prerequisites

- Firefox Browser
- Node.js (for building and running tests)

### Installation for Development

```bash
# Clone the repository
git clone https://github.com/yourusername/fireproxy.git

# Navigate to the project directory
cd fireproxy

# Install dependencies
npm install
```

### Running in Development Mode

```bash
# Start Firefox with a temporary installation of the extension
npm start
```

### Running Tests

```bash
# Run automated tests
npm test

# Or run the test directly
node tests/cli-test-runner.js
```

### Building for Distribution

```bash
# Build the extension package
npm run build
```

This will create a `.zip` file in the `web-ext-artifacts` directory ready for submission to the Firefox Add-ons store.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firefox Add-ons team for their developer documentation
- Contributors who have helped improve this extension
