declare global {
  interface Window {
    superbooDesktop?: {
      isDesktopApp: boolean;
      platform: string;
      versions: {
        chrome: string;
        electron: string;
        node: string;
      };
    };
  }
}

export {};
