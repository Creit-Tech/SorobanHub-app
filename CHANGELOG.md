# Changelog

All notable changes to this project will be documented in this file.

### 0.7.4 (2025-09-04)
#### Fix
- Add a polyfill for Hot wallet module

### 0.7.3 (2025-09-04)
#### Change
- Update Stellar SDK
- Update Stellar Wallets kit

### 0.7.2 (2024-12-08)
#### Change
- Update Stellar SDK

### 0.7.1 (2024-10-10)
#### Add
- Allow using non-http RPCs when working on localhost

### 0.7.0 (2024-09-29)
#### Add
- A workspace selector, this allows filtering the projects on the dashboard by the networks passphrase
- Allow exporting and importing views (It helps in sharing dashboard views with others).

#### Fix
- In the function call widget, there was a bug when adding a new vector item. Now it should properly copy the correct types 
- Source account was not being properly added in some of the widgets

### 0.6.0 (2024-09-22)
#### Add
- Include the StellarWalletsKit so we can sign and submit directly from the app (no need to do that outside of SorobanHub)

#### Change
- BREAKING CHANGE: The app moved from being an Electron desktop app to a regular website, this because we are not using any desktop feature that justifies the headaches of developing for desktop environments.
- Upgrade Angular and Material from version 17 to 18
- Refactor all the Angular components into standalone components and move the project from Modules to the new way.

### 0.5.0 (2024-07-16)
#### Notes
- First multi-platform deploy (currently only tested on Mac).
- Automatic deploy process on Github
- This version allows the creation of Projects, identities, views, networks and more.
- It includes the feature that allows editing already created widgets
- Widgets that already have implemented: Deploying SACs, installing WASMs, deploy contracts, execute functions and bump/restore ledger keys 
