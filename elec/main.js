const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  desktopCapturer,
} = require("electron");
const shortcut = require("electron-localshortcut");

const path = require("path");
const url = require("url");

//const { notifyMe } = require("./notification");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // alwaysOnTop: true,
    width: 800,
    height: 600,
    minWidth: 480,
    minHeight: 300,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    titleBarStyle: "hidden",
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../dist/index.html"),
      protocol: "file:",
      slashes: true,
    });

  console.log("url:", startUrl);
  mainWindow.loadURL(startUrl);

  //   settings.loadWindowSettings(mainWindow, "main");
  mainWindow.on("close", () => {
    // settings.saveWindowSettings(mainWindow, "main");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.setMenu(null);
  shortcut.register(mainWindow, "F11", () => {
    const win = BrowserWindow.getFocusedWindow();
    win.setFullScreen(!win.isFullScreen());
  });

  shortcut.register(mainWindow, "F12", () => {
    mainWindow.webContents.openDevTools();
  });
  shortcut.register(mainWindow, "F5", () => {
    app.relaunch();
    app.exit();
  });
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  // shortcut.unregister(mainWindow, "Ctrl+A");
  shortcut.unregisterAll(mainWindow);
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// ipc
ipcMain.on("ipc-menu", (event, label, checked) => {
  switch (label) {
    case "Quit Application":
      app.quit();
      break;
    case "Open Data Folder":
      console.log("userData=", app.getPath("userData"));
      shell.openExternal("file://" + app.getPath("userData"));
      break;
    case "Toggle Full Screen": {
      let win = BrowserWindow.getFocusedWindow();
      win.setFullScreen(!win.isFullScreen());
      break;
    }
    default:
      console.log(`Item Clicked: ${label}, checked=${checked}`);
      break;
  }
});

//
ipcMain.handle("ipc-get", async (event, path) => {
  console.log("ipc-get:", path);
  switch (path) {
    case "app.userData":
      return app.getPath("userData");
    case "screens":
      return (await desktopCapturer.getSources({ types: ["screen"] })).map(
        (screen) => {
          return {
            name: screen.name,
            id: screen.id,
          };
        }
      );
  }
  return null;
});
