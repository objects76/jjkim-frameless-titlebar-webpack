function isMain() {
  return process.type === "browser";
}

function isElectron() {
  return process.type === "browser" || process.type === "renderer";
}

function safe_require(pkg) {
  return isMain() ? require(pkg) : window.require(pkg);
}

function initLog() {
  const path = safe_require("path");
  const fs = safe_require("fs");
  const log = safe_require("electron-log");

  // log.transports.file.maxSize = 1024; console.warn('*** log archive test:1KB, default: 1MB ***');
  log.transports.file.archiveLog = (file) => {
    file = file.toString();
    const info = path.parse(file);
    const MAX_BACKUP = 10;
    try {
      // xxx-1.log, ... xxx-9.log ==> xxx-2.log, ... xxx-10.log
      for (let i = MAX_BACKUP; i >= 2; --i) {
        const older = path.join(info.dir, info.name + `-${i}` + info.ext);
        const newer = path.join(info.dir, info.name + `-${i - 1}` + info.ext);
        if (fs.existsSync(newer)) fs.renameSync(newer, older);
      }
      // xxx.log ==> xxx-1.log
      fs.renameSync(file, path.join(info.dir, info.name + "-1" + info.ext));
      console.log(`${process.type}:old logs are archived!!!`);
    } catch (e) {
      console.warn(`${process.type}: Could not rotate log:`, e);
    }
  };

  log.transports.file.format = log.transports.console.format =
    "[{h}:{i}:{s}.{ms}] [{processType}.{level}] {text}";
  log.info("---------------------------------------------------");

  if (process.env.APPNAME) log.info(`\t AppName=${process.env.APPNAME}`);
  if (process.env.VERSION) log.info(`\t AppVer=${process.env.VERSION}`);

  if (isMain()) {
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
      `\t Pid=${remote.getCurrentWindow().webContents.getOSProcessId()}`
    );
  }

  // replace console.
  // (console as any).log_native = eleclog.log;
  Object.assign(console, log.functions);
}

let settings;
if (settings === undefined) {
  settings = safe_require("electron-settings");

  settings.configure({
    numSpaces: 4,
    prettify: true,
  });
}

// windows settings
function loadWindowSettings(mainWindow, winName) {
  if (settings.getSync(winName + "-devtool"))
    mainWindow.webContents.openDevTools();
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
