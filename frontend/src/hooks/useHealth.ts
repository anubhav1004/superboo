import { useEffect } from "react";
import { checkHealth } from "../lib/api";
import { useChatStore } from "../store/chat";

export function useHealth(intervalMs = 15000) {
  const setConnection = useChatStore((s) => s.setConnection);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      setConnection("checking");
      const controller = new AbortController();
      const to = window.setTimeout(() => controller.abort(), 6000);
      const res = await checkHealth(controller.signal);
      clearTimeout(to);
      if (cancelled) return;
      setConnection(res.ok ? "online" : "offline", res.latency);
      timer = window.setTimeout(tick, intervalMs);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [intervalMs, setConnection]);
}
