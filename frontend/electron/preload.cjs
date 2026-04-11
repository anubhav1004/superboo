const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
  "superbooDesktop",
  Object.freeze({
    isDesktopApp: true,
    platform: process.platform,
    versions: Object.freeze({
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      node: process.versions.node,
    }),
  })
);
