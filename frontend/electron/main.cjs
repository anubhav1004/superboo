const path = require("node:path");
const {
  app,
  BrowserWindow,
  shell,
  Menu,
  globalShortcut,
  nativeTheme,
  Tray,
  Notification,
} = require("electron");

const DEV_SERVER_URL =
  process.env.SUPERBOO_DESKTOP_URL || "http://127.0.0.1:4173";

let mainWindow = null;
let tray = null;

/* ── Navigation guard ── */
function isAllowedNavigation(url) {
  if (!url) return false;
  if (url.startsWith("file://")) return true;
  try {
    return new URL(url).origin === new URL(DEV_SERVER_URL).origin;
  } catch {
    return false;
  }
}

/* ── Application menu (macOS native) ── */
function buildAppMenu() {
  const template = [
    {
      label: "Superboo",
      submenu: [
        { role: "about", label: "About Superboo" },
        { type: "separator" },
        {
          label: "New Chat",
          accelerator: "CmdOrCtrl+N",
          click: () =>
            mainWindow?.webContents.executeJavaScript(
              'document.dispatchEvent(new CustomEvent("superboo:new-chat"))'
            ),
        },
        {
          label: "Skills",
          accelerator: "CmdOrCtrl+Shift+K",
          click: () =>
            mainWindow?.webContents.executeJavaScript(
              'document.dispatchEvent(new CustomEvent("superboo:open-skills"))'
            ),
        },
        {
          label: "Connectors",
          accelerator: "CmdOrCtrl+Shift+J",
          click: () =>
            mainWindow?.webContents.executeJavaScript(
              'document.dispatchEvent(new CustomEvent("superboo:open-connectors"))'
            ),
        },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () =>
            mainWindow?.webContents.executeJavaScript(
              'document.dispatchEvent(new CustomEvent("superboo:open-settings"))'
            ),
        },
        { type: "separator" },
        { role: "hide", label: "Hide Superboo" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: "Quit Superboo" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Sidebar",
          accelerator: "CmdOrCtrl+B",
          click: () =>
            mainWindow?.webContents.executeJavaScript(
              'document.dispatchEvent(new CustomEvent("superboo:toggle-sidebar"))'
            ),
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "close" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Superboo Website",
          click: () => shell.openExternal("https://superboo.me"),
        },
        {
          label: "Pricing",
          click: () => shell.openExternal("https://superboo.me/pricing"),
        },
        { type: "separator" },
        {
          label: "Report an Issue",
          click: () =>
            shell.openExternal("https://github.com/anubhav1004/superboo/issues"),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ── Main window ── */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0c0118",
    vibrancy: "under-window",
    visualEffectState: "active",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  // Smooth show with fade
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    // Set dock badge to empty (shows app is ready)
    if (app.dock) app.dock.show();
  });

  // External links open in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Navigation guard
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isAllowedNavigation(url)) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remember window position and size
  mainWindow.on("close", () => {
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.executeJavaScript(
      `localStorage.setItem('superboo-window-bounds', '${JSON.stringify(bounds)}')`
    );
  });

  // Load content
  if (app.isPackaged) {
    mainWindow.loadFile(
      path.join(__dirname, "..", "dist-desktop", "index.html")
    );
  } else {
    mainWindow.loadURL(DEV_SERVER_URL);
  }

  // Inject desktop-specific CSS for titlebar drag area
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(`
      /* macOS titlebar drag region */
      .desktop-drag {
        -webkit-app-region: drag;
      }
      .desktop-drag button,
      .desktop-drag a,
      .desktop-drag input,
      .desktop-drag textarea,
      .desktop-drag [role="button"] {
        -webkit-app-region: no-drag;
      }

      /* Extra top padding for traffic lights */
      body {
        padding-top: 0 !important;
      }

      /* Sidebar top padding for traffic lights */
      .sidebar-desktop-pad {
        padding-top: 44px !important;
      }

      /* Smooth scrolling everywhere */
      * {
        scroll-behavior: smooth;
      }

      /* Native selection color */
      ::selection {
        background: rgba(147, 112, 255, 0.3);
      }

      /* Hide scrollbars but keep scrolling (cleaner look) */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.2);
      }
    `);
  });
}

/* ── Global shortcut (Option+Space to focus) ── */
function registerShortcuts() {
  globalShortcut.register("Alt+Space", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });
}

/* ── App lifecycle ── */
app.whenReady().then(() => {
  app.setName("Superboo");

  // Dark mode by default
  nativeTheme.themeSource = "dark";

  buildAppMenu();
  createMainWindow();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      mainWindow?.focus();
    }
  });

  // Show notification on first launch
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: "Superboo is ready 👻",
      body: "Press Option+Space to open from anywhere",
      silent: true,
    });
    notif.show();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
