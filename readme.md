# packages for build

```bash
    yarn add -D webpack webpack-cli webpack-dev-server
    # loader
    yarn add -D @babel/core @babel/preset-env @babel/preset-react babel-loader
    yarn add -D file-loader ts-loader
    yarn add -D css-loader node-sass sass-loader style-loader

    # plugins
    yarn add -D clean-webpack-plugin html-webpack-plugin

```

# package for reactjs

```bash
    yarn add react react-dom
```

# scripts from webpack

```json
    "dev": "webpack-dev-server --port 4500",
    "build": "webpack -p"
```

# packages from frameless-titlebar

```bash
    yarn add @material-ui/core @material-ui/icons
    yarn add electron-localshortcut electron-updater is-electron
    yarn add frameless-titlebar notistack
    yarn add react react-dom

    # for build
    yarn add -D electron electron-builder
    # for script
    yarn add -D cross-env wait-on
  },
```

# scripts from frameless-titlebar

```json
    "start": "cross-env PORT=3600 BROWSER=none react-scripts start",
    "build": "",
    "dev": "wait-on http://localhost:3600 && cross-env ELECTRON_START_URL=http://localhost:3600 electron .",
    "dist": "npx electron-builder --win -c.extraMetadata.main=build/src/elec/main.js",
    "predist": "./update-build.sh",
    "elec-copy": "mkdir build/src && cp -r src/elec/. build/src/elec",
    "asar-unpack": "npx asar extract dist/win-unpacked/resources/app.asar asar-unpack/"
```
