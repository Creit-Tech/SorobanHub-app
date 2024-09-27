# Changelog

All notable changes to this project will be documented in this file.

### 0.6.0 (2024-09-22)
### Add
- Include the StellarWalletsKit so we can sign and submit directly from the app (no need to do that outside of SorobanHub)

### Change
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
