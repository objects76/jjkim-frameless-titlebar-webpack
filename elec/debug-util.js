const { app, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

module.exports.collectLogFiles = (mainWindow) => {
  const basedir = app.getPath("userData");
  const settings = path.join(basedir, "settings.json");
  const logs = path.join(basedir, "logs");
  const outname = `${path.basename(basedir)}-${new Date()
    .toLocaleString("en-US")
    .replace(/[/:]/g, ".")}.zip`;

  console.log("get log files...");
  console.log(basedir);
  console.log(path.basename(basedir));
  console.log(settings);
  console.log(logs);
  console.log(outname);

  const archive = archiver("zip");

  archive.on("error", function (err) {
    throw err;
  });
  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      throw err;
    }
  });

  // pipe archive data to the output file
  const output = fs.createWriteStream(
    path.join(app.getPath("desktop"), outname)
  );
  output.on("close", () => console.log(`log file ${archive.pointer()} bytes`));
  output.on("end", () => console.log("Data has been drained"));

  archive.pipe(output);
  archive.file(settings, { name: path.basename(settings) });
  archive.directory(logs, "logs");

  archive.finalize();

  // ui feedback:
  const options = {
    type: "info",
    buttons: ["OK"],
    title: "Zip log file(s)",
    message: "Zip log file(s)",
    detail: `Zip log file is created on desktop folder.\r\n - ${outname}`,
  };

  dialog.showMessageBox(mainWindow, options, (response, checkboxChecked) => {
    console.log(response);
    console.log(checkboxChecked);
  });
};
