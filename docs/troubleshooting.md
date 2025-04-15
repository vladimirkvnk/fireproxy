# Troubleshooting Guide

This guide helps you resolve common issues with the Fireproxy extension.

## Connection Issues

### Problem: Cannot connect to websites when proxy is enabled

**Possible causes and solutions:**

1. **Proxy server is not running or unreachable**
   - Verify that your proxy server is running
   - Check that you can connect to the proxy from your computer
   - Try pinging the proxy server to check connectivity

2. **Incorrect proxy configuration**
   - Double-check the proxy host and port in the Settings tab
   - Verify that you've selected the correct proxy type (SOCKS5, SOCKS4, HTTP, HTTPS)
   - If your proxy requires authentication, ensure it's set up in Firefox's network settings

3. **Firewall blocking proxy connection**
   - Check if your firewall is blocking outgoing connections to your proxy
   - Temporarily disable the firewall to test if it's the cause
   - Add an exception for your proxy server in your firewall settings

### Problem: Some websites work but others don't

**Possible causes and solutions:**

1. **Missing related domains**
   - Use the "Scan Page Resources" feature to discover all domains used by the website
   - Add all discovered domains to your proxy list

2. **DNS resolution issues**
   - Enable "Proxy DNS Requests" in the Settings tab
   - If still having issues, try adding the website's IP address directly

3. **Website blocking proxy access**
   - Some websites detect and block proxy connections
   - Try a different proxy server
   - For services that actively block proxies, Fireproxy may not work

## Extension Functionality Issues

### Problem: Extension not routing traffic through proxy

**Possible causes and solutions:**

1. **Extension is disabled**
   - Check that the toggle at the top of the popup is in the "Enabled" position
   - Verify that the status text shows "Enabled"

2. **Domain not in proxy list**
   - Ensure the domain you're trying to access is in your proxy list
   - Remember that domains must be added without protocols (e.g., "example.com" not "https://example.com")
   - Check for typos in the domain name

3. **Firefox proxy settings conflict**
   - Go to Firefox Settings → Network Settings
   - Ensure Firefox is set to "Use system proxy settings" or "Auto-detect proxy settings"
   - If you've manually configured proxy settings in Firefox, they may override the extension

### Problem: Scanned domains not appearing

**Possible causes and solutions:**

1. **No external domains on the page**
   - The page might not include resources from other domains
   - Try a different page with more external resources

2. **Content blocking preventing detection**
   - Temporarily disable content blocking in Firefox to see if more domains appear
   - Check if other extensions might be blocking resources

3. **Page not fully loaded**
   - Ensure the page has fully loaded before scanning
   - For dynamic sites, interact with the page first to load more resources

## Performance Issues

### Problem: Browsing is slow when extension is enabled

**Possible causes and solutions:**

1. **Slow proxy server**
   - Try a different proxy server with better performance
   - Check if your proxy server is overloaded

2. **Too many domains in proxy list**
   - Remove unnecessary domains from your proxy list
   - Only proxy traffic that actually needs to go through the proxy

3. **Proxy DNS slowing things down**
   - If you don't need the privacy benefits, try disabling "Proxy DNS Requests"
   - Note that this may cause DNS leaks

## User Interface Issues

### Problem: Extension popup not displaying correctly

**Possible causes and solutions:**

1. **Firefox zoom level affecting display**
   - Reset the zoom level for the extension popup
   - Use Ctrl+0 (Windows/Linux) or Cmd+0 (Mac) to reset zoom

2. **CSS loading issues**
   - Try reloading the extension from about:addons
   - Restart Firefox if the issue persists

3. **Display scaling on high-DPI monitors**
   - Adjust your system's display scaling settings
   - Firefox may need to be restarted for changes to take effect

## Data and Settings Issues

### Problem: Settings or domains not saving

**Possible causes and solutions:**

1. **Storage permission issues**
   - Make sure you've granted the necessary permissions to the extension
   - Check Firefox's privacy settings regarding storage permissions

2. **Firefox in private browsing mode**
   - Extension storage may behave differently in private browsing windows
   - Try using the extension in a normal browsing window

3. **Storage corruption**
   - Reset the extension by removing it and reinstalling
   - Export your domain list first to preserve your data

### Problem: Import/export not working

**Possible causes and solutions:**

1. **Invalid file format**
   - Ensure the import file is a valid JSON file previously exported by Fireproxy
   - Check that the file isn't corrupted

2. **File permissions**
   - Make sure your browser has permission to read/write files
   - Try saving to a different location

3. **Large domain list**
   - If you have a very large list of domains, try splitting it into smaller files
   - Import them in batches

## Conflicts with Other Extensions

### Problem: Fireproxy conflicts with other extensions

**Possible causes and solutions:**

1. **Other proxy extensions**
   - Disable other proxy-related extensions
   - Extensions like FoxyProxy, Proxy SwitchyOmega, etc. may conflict

2. **Privacy extensions**
   - Some privacy extensions might interfere with proxy routing
   - Try temporarily disabling them to check for conflicts

3. **Content blockers**
   - Ad blockers and content blockers might prevent some resources from loading
   - This can affect domain scanning and statistics

## Advanced Troubleshooting

### Viewing Extension Logs

1. Navigate to about:debugging in Firefox
2. Click "This Firefox" in the sidebar
3. Find Fireproxy in the list and click "Inspect"
4. In the developer tools that open, select the "Console" tab
5. Look for error messages or warnings

### Resetting the Extension

If all else fails, you can completely reset Fireproxy:

1. Export your domains list first (if you want to keep it)
2. Uninstall the extension
3. Go to about:support in Firefox
4. Click "Clear Startup Cache..." and confirm
5. Restart Firefox
6. Reinstall Fireproxy
7. Import your saved domains

### Reporting Issues

If you've tried all the above solutions and still have issues:

1. Check the GitHub repository for known issues
2. Report a new issue with detailed steps to reproduce
3. Include your Firefox version, operating system, and the extension version
4. Provide any error messages from the console logs