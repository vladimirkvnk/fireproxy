# Fireproxy

A Firefox extension that routes traffic for specific domains through a SOCKS proxy server, including DNS requests.

## Development Setup

### Prerequisites

- Firefox Browser
- Node.js (optional, for running helper scripts)

### Loading the extension in Firefox

1. Open Firefox
2. Enter `about:debugging` in the URL bar
3. Click on "This Firefox" in the left sidebar
4. Click on "Load Temporary Add-on..."
5. Navigate to the project directory and select the `manifest.json` file

The extension will now be loaded and visible in your toolbar. It will remain until Firefox is closed.

### Development Workflow

1. Make changes to the extension code
2. If Firefox is already running with the extension loaded, click the "Reload" button next to the extension in `about:debugging`
3. Test your changes

### Debugging

- Click on "Inspect" next to the extension in `about:debugging` to open the developer tools for the extension
- Background script logs can be viewed in the console of the developer tools
- Popup logs can be viewed by right-clicking on the extension popup and selecting "Inspect Element"

## Building for Distribution

To package the extension for distribution:

```bash
zip -r fireproxy.zip manifest.json icons/ popup/ background/