---
title: example/23_build_process
group: example
---

# Build Process

This document explains the multi-application build system used in the signals platform. The build process handles compilation and artifact consolidation for multiple React frontend applications and the backend server. For information about Docker containerization and deployment, see [Docker Configuration](./24_Docker_Configuration.md).

## Build Architecture Overview

The signals platform uses a multi-application build architecture where each frontend application is built independently using Vite, and then all build artifacts are consolidated into a single deployment-ready structure.

**Build Architecture Diagram**
![Mermaid Diagram](./diagrams\23_Build_Process_0.svg)

## Multi-Application Build Process

The build process consists of three main phases: root project build, individual app builds, and artifact consolidation.

### Phase 1: Root Project Build
The platform-specific build scripts ([scripts/win/build.bat:1-4](), [scripts/linux/build.sh:1-4]()) first execute:
- `npm install` - Install root project dependencies
- `npm run build` - Build the backend server and shared components

### Phase 2: Individual App Builds
Both build scripts iterate through all directories in the `apps/` folder and execute the same commands for each application:

**Windows Build Loop**
```bash
for /d %%D in (*) do (
    cd "%%D"
    npm install
    npm run build
    cd ..
)
```

**Linux Build Loop**
```bash
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    npm install
    npm run build
    cd ..
done
```

### Phase 3: Artifact Consolidation

The `copy-build.ts` script consolidates all build artifacts into a unified deployment structure:

**Artifact Consolidation Flow**
![Mermaid Diagram](./diagrams\23_Build_Process_1.svg)

The `createCopy` function ([scripts/copy-build.ts:16-33]()) handles the consolidation logic:
- Creates target directories using `fs.mkdirSync` with recursive option
- Copies `build/` directories from each app using `fs.cpSync`
- Copies `package.json` and `types.d.ts` files using `fs.copyFileSync`
- Uses `globSync` to discover all app directories dynamically

## Vite Configuration

Each frontend application uses Vite as the build tool with shared configuration patterns but application-specific customizations.

### Common Vite Configuration

All applications share these core configuration elements:

| Configuration | Purpose | Implementation |
|---------------|---------|----------------|
| React Plugin | React/JSX compilation | `@vitejs/plugin-react-swc` |
| Node Polyfills | Browser compatibility | `vite-plugin-node-polyfills` |
| Environment Variables | Runtime configuration | `vite-plugin-environment` with `CC_` prefix |
| Full Reload | Development hot reload | `vite-plugin-full-reload` |
| Barrel Imports | MUI optimization | `vite-plugin-barrel` |
| Million.js | React performance | `million/compiler` |

### Build Configuration

The build configuration ([apps/chat-app/vite.config.mts:46-51]()) specifies:
- **Target**: `chrome87` for modern browser support
- **Output Directory**: `build` (consistent across all apps)
- **Minification**: `terser` for production optimization
- **Asset Handling**: `assetsInlineLimit: 0` prevents asset inlining

### Application-Specific Proxies

Each app configures development server proxies differently:

**Chat App Proxy Configuration**
```javascript
proxy: {
  "/session": {
    target: "http://localhost:30050",
    changeOrigin: true,
    ws: true,
  },
}
```

**Signal App Proxy Configuration**
```javascript
proxy: {
  "/status": {
    target: "http://localhost:30050",
    changeOrigin: true,
  },
}
```

The `base` configuration differs per application:
- Chat App: `base: "chat"` ([apps/chat-app/vite.config.mts:66]())
- Signal App: `base: "signal"` ([apps/signal-app/vite.config.mts:65]())

## Build Output Structure

The consolidated build output follows this directory structure:

```
build/
├── apps/
│   ├── chat-app/
│   │   ├── build/          # Vite build output
│   │   ├── package.json    # App dependencies
│   │   └── types.d.ts      # TypeScript definitions
│   ├── signal-app/
│   ├── wallet-app/
│   ├── news-app/
│   └── strategy-app/
├── public/                 # Static assets
├── package.json           # Root dependencies
├── ecosystem.config.js    # PM2 configuration
└── index.mjs             # Backend server entry point
```

## Deployment Configuration

The build process includes PM2 configuration for production deployment via `ecosystem.config.js`:

**PM2 Application Configuration**
![Mermaid Diagram](./diagrams\23_Build_Process_2.svg)

The `readConfig` function ([config/ecosystem.config.js:6-11]()) uses `dotenv.parse` to load environment variables from `.env` file if it exists, falling back to `process.env`.

## Build Process Summary

The complete build process follows this sequence:

1. **Platform Detection**: Choose appropriate build script (Windows/Linux)
2. **Root Build**: Install dependencies and build backend server
3. **App Iteration**: Build each frontend application in `apps/` directory
4. **Artifact Consolidation**: Run `copy-build.ts` to create unified deployment structure
5. **Deployment Ready**: `build/` directory contains all necessary files for PM2 deployment

The build system is designed to be platform-agnostic and supports both development and production builds through the same unified process.
