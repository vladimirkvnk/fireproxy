# Fireproxy Development Plan

This document outlines the step-by-step development plan for the Fireproxy Firefox extension, which will allow users to route traffic for specific domains through a hardcoded SOCKS proxy server, including DNS requests.

## Project Setup

- [x] Create basic extension structure (manifest.json, icons, etc.)
- [x] Set up development environment for Firefox extension testing
- [x] Create initial extension popup UI skeleton

## Core Functionality

- [x] Implement proxy configuration module
  - [x] Create a PAC script generator for dynamic proxy routing
  - [x] Implement proxy.settings API integration
  - [x] Add DNS proxy configuration

- [x] Implement domain management
  - [x] Create storage module for saving/loading domain lists
  - [x] Implement domain validation functions
  - [x] Create domain list CRUD operations

- [x] Implement request interception
  - [x] Set up webRequest API listeners
  - [x] Create domain extraction from requests
  - [x] Implement request filtering based on domain lists

## User Interface

- [x] Design and implement popup UI
  - [x] Create domain input form
  - [x] Implement domain list display with delete functionality
  - [x] Add extension enable/disable toggle

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