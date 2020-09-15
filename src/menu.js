import { useEffect, useState } from "react";
const { fullscreenScreenshot, getDesktopStream } = require("./screenshot");
const ipc = window.ipcRenderer;
const { settings } = require("main-settings");

const enqueue = (queueSnack) => (item, currentWindow, e) => {
  var label = `Item Clicked: ${item.label}!`;
  var variant = "info";
  if (item.type === "radio") {
    label = `Radio Selected: ${item.label}!`;
    variant = "success";
  } else if (item.type === "checkbox") {
    label = `${item.checked ? "Checked" : "Unchecked"} Item: ${item.label}!`;
    variant = item.checked ? "success" : "error";
  }
  queueSnack(label, { variant });
};

const mainHandler = (item, currentWindow, e) => {
  console.log("render:", item);
  ipc.send("ipc-menu", item.label, item.type === "checkbox" && item.checked);
};

const renderHandler = async (item, currentWindow, e) => {
  switch (item.label) {
    case "Full Screenshot":
      fullscreenScreenshot(
        await ipc.invoke("ipc-get", "screens"),
        null,
        "image/jpeg",
        await ipc.invoke("ipc-get", "app.userData")
      );
      break;
    case "Start Desktop Stream":
      {
        const video = document.getElementById("video-main");
        const screens = await ipc.invoke("ipc-get", "screens");
        console.log("screens", screens);
        let stream = await getDesktopStream(screens[0].id);

        video.srcObject = stream;
        console.log(stream);
        console.log(video.src);
        video.play();
        item.label = "Stop Desktop Stream";
      }
      break;

    case "Stop Desktop Stream":
      {
        const video = document.getElementById("video-main");
        if (video.srcObject) {
          video.srcObject.getTracks()[0].stop();
          video.srcObject = null;
        }
        item.label = "Start Desktop Stream";
      }
      break;
    case "New Window":
      console.log(
        `\t Process Type: ${process.type}, pid=${process.pid}
    \t\t argv=${process.argv}
    \t Version: chrome=${process.versions.chrome}, electron=${process.versions.electron}
    `
      );
      console.log("settings:", settings.file());
      break;
    default:
      console.log(item.label);
      break;
  }
};
const createMenu = (queueSnack) => {
  const click = enqueue(queueSnack);
  return [
    {
      label: "File",
      submenu: [
        {
          label: "New Window",
          click: renderHandler,
        },
        {
          label: "Preferences",
          click: renderHandler,
        },
        {
          type: "separator",
        },
        {
          label: "Quit Application",
          accelerator: "Ctrl+Q",
          click: mainHandler,
        },
      ],
    },
    {
      label: "Radios",
      submenu: [
        {
          label: "Option 1",
          type: "radio",
          click,
        },
        {
          label: "Option 2",
          type: "radio",
          click,
        },
        {
          label: "Option 3",
          type: "radio",
          click,
        },
        {
          label: "Option 4",
          type: "radio",
          click,
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "Ctrl+Z",
          click,
        },
        {
          label: "Redo",
          accelerator: "Ctrl+Y",
          click,
        },
        {
          type: "separator",
        },
        {
          label: "Cut",
          accelerator: "Ctrl+X",
          click,
        },
        {
          label: "Copy",
          accelerator: "Ctrl+C",
          click,
        },
        {
          label: "Paste",
          accelerator: "Ctrl+V",
          click,
        },
        {
          label: "Paste and Match Style",
          accelerator: "Ctrl+Shift+V",
          click,
        },
        {
          label: "Seleect All",
          accelerator: "Ctrl+A",
          click,
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Full Screen",
          click: mainHandler,
        },
        {
          label: "Open Developer Tools",
          accelerator: "F12",
          click,
        },
      ],
    },
    {
      label: "Tool",
      submenu: [
        {
          label: "Full Screenshot",
          click: renderHandler,
        },
        {
          label: "Open Data Folder",
          click: mainHandler,
        },
        {
          label: "Start Desktop Stream",
          click: renderHandler,
        },
        {
          label: "Menu Item #1",
          click: renderHandler,
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Home Page",
          click: mainHandler,
        },
        {
          label: "Report an Issue",
          click: mainHandler,
        },
        {
          label: "About Frameless Titlebar",
          click: mainHandler,
        },
      ],
    },
  ];
};

export const useMenu = (dispatch) => {
  const [menu, setMenu] = useState([]);
  useEffect(() => {
    setMenu(createMenu(dispatch));
  }, [dispatch]);

  return menu;
};
