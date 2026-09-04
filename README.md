# ClaudeRead
A Firefox WebExtension that scans and exports entire chat threads on **Claude.ai** as downloadable plain text (`.txt`) files.

## Features

- **DOM Virtualization Bypass:** Claude.ai unmounts off-screen chat nodes to conserve memory. This extension captures conversation blocks dynamically during real-time scrolling.
- **Sidebar Isolation:** Targets `role="feed"` and `role="article"` ARIA attributes, strictly ignoring navigation elements, history lists, and UI controls.
- **Smart Deduplication:** Implements an array search strategy over captured turns to prevent duplicate entries during scrolling passes.

## Installation in Firefox (Temporary / Developer Mode)

1. Clone or download this repository locally:
   ```bash
   git clone https://github.com/D3N14LD15K/ClaudeRead.git

2. Open Firefox and type about:debugging in the address bar.

3. Click This Firefox on the left sidebar.

4. Click Load Temporary Add-on.

5. Select manifest.json inside the project folder.

## Author

**D3N14LD15K** - [https://github.com/D3N14LD15K](https://github.com/D3N14LD15K)
