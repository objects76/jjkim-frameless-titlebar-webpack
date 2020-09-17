const path = require("path");
const fs = require("fs");
const log = require("electron-log");
const settings = require("electron-settings");

settings.configure({
  numSpaces: 4,
  prettify: true,
});

function isMain() {
  return process.type === "browser";
}

const MAX_LOG_SIZE = 1024 * 1024 * 2;
function initLog() {
  // rotate log only in initLog().
  log.transports.file.maxSize = 0;
  const logfile = log.transports.file.getFile();
  if (logfile.size > MAX_LOG_SIZE) {
    var oldPath = logfile.toString();
    var inf = path.parse(oldPath);
    try {
      fs.renameSync(oldPath, path.join(inf.dir, inf.name + ".old" + inf.ext));
      logfile.reset();
    } catch (e) {
      console.warn("Could not rotate log", e);
    }
  }

  log.transports.file.format = log.transports.console.format =
    "[{h}:{i}:{s}.{ms}] [{processType}.{level}] {text}";
  log.info("");
  log.info("");
  log.info("");
  log.info("---------------------------------------------------");

  if (process.env.APPNAME)
    log.info(`\t App=${process.env.APPNAME} (v${process.env.VERSION})`);

  if (isMain()) {
    const { app } = require("electron");
    app.once("browser-window-focus", (event, win) => {
      log.info(
        `mainWindow id=${
          win.webContents.id
        }, pid=${win.webContents.getOSProcessId()}`
      );
    });

    log.info(
      `\t Pid=${process.pid}\n\t ${process.argv}\n\t ${process.platform}.${
        process.arch
      }-${process.getSystemVersion()}, chrome=${
        process.versions.chrome
      }, electron=${process.versions.electron}
`
    );
  } else {
    log.info(
      `\t Pid=${window.remote.getCurrentWindow().webContents.getOSProcessId()}`
    );
  }

  // replace console.
  // (console as any).log_native = eleclog.log;
  Object.assign(console, log.functions);
}

// windows settings
function loadWindowSettings(mainWindow, winName) {
  if (settings.getSync(winName + "-devtool"))
    mainWindow.webContents.openDevTools({ mode: "detach" });
  mainWindow.setBounds(settings.getSync(winName + "-bounds"));

  if (settings.getSync(winName + "-fullscreen")) mainWindow.setFullScreen(true);
  if (settings.getSync(winName + "-maximized")) mainWindow.maximize();
}

function saveWindowSettings(mainWindow, winName) {
  settings.setSync(winName + "-devtool", mainWindow.isDevToolsOpened());
  settings.setSync(winName + "-maximized", mainWindow.isMaximized());
  settings.setSync(winName + "-fullscreen", mainWindow.isFullScreen());

  if (mainWindow.isNormal())
    settings.setSync(winName + "-bounds", mainWindow.getBounds());
}

module.exports = {
  initLog,
  settings,
  loadWindowSettings,
  saveWindowSettings,
};
