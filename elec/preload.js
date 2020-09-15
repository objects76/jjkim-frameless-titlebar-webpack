const { ipcRenderer, remote } = window.require("electron");
window.ipcRenderer = ipcRenderer;
window.remote = remote;
