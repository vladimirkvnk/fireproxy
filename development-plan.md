# Fireproxy Development Plan

This document outlines the step-by-step development plan for the Fireproxy Firefox extension, which will allow users to route traffic for specific domains through a hardcoded SOCKS proxy server, including DNS requests.

## Project Setup

- [x] Create basic extension structure (manifest.json, icons, etc.)
- [x] Set up development environment for Firefox extension testing
- [ ] Create initial extension popup UI skeleton

## Core Functionality

- [ ] Implement proxy configuration module
  - [ ] Create a PAC script generator for dynamic proxy routing
  - [ ] Implement proxy.settings API integration
  - [ ] Add DNS proxy configuration

- [ ] Implement domain management
  - [ ] Create storage module for saving/loading domain lists
  - [ ] Implement domain validation functions
  - [ ] Create domain list CRUD operations

- [ ] Implement request interception
  - [ ] Set up webRequest API listeners
  - [ ] Create domain extraction from requests
  - [ ] Implement request filtering based on domain lists

## User Interface

- [ ] Design and implement popup UI
  - [ ] Create domain input form
  - [ ] Implement domain list display with delete functionality
  - [ ] Add extension enable/disable toggle

- [ ] Implement domain scanning feature
  - [ ] Create page resource scanner
  - [ ] Implement domain collection from active tab
  - [ ] Design UI for displaying and selecting discovered domains

## Testing & Refinement

- [ ] Create test cases for core functionality
  - [ ] Test proxy routing for different domain scenarios
  - [ ] Test domain management persistence
  - [ ] Test domain scanning accuracy

- [ ] Perform usability testing
  - [ ] Test user flows for adding domains manually
  - [ ] Test user flows for scanning and adding domains
  - [ ] Test enabling/disabling extension

- [ ] Implement feedback from testing
  - [ ] Fix identified bugs
  - [ ] Improve UI based on usability feedback
  - [ ] Optimize performance if needed

## Documentation & Packaging

- [ ] Create user documentation
  - [ ] Write installation instructions
  - [ ] Create usage guide with examples
  - [ ] Document all features and settings

- [ ] Package extension for distribution
  - [ ] Prepare final manifest.json
  - [ ] Create promotional images and descriptions
  - [ ] Package extension for Firefox Add-ons store

## Future Enhancements (Post-MVP)

- [ ] Add custom proxy configuration options
- [ ] Implement import/export of domain lists
- [ ] Add advanced filtering options
- [ ] Create keyboard shortcuts for common actions