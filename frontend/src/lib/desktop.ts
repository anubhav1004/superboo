export function isDesktopApp(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.superbooDesktop?.isDesktopApp === true ||
    navigator.userAgent.toLowerCase().includes("electron") ||
    window.location.protocol === "file:"
  );
}

export function desktopPlatform(): string | null {
  if (!isDesktopApp()) {
    return null;
  }

  return window.superbooDesktop?.platform || null;
}

export function isMacDesktop(): boolean {
  return desktopPlatform() === "darwin";
}
