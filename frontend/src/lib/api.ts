// Dynamic config — can be overridden at runtime via settings
// Use /api proxy in production (avoids HTTPS→HTTP mixed content block)
// Falls back to direct bridge URL for local dev
const IS_PROD = typeof window !== "undefined" && window.location.protocol === "https:";
const DEFAULT_BRIDGE_URL =
  IS_PROD ? "/api" : (import.meta.env.VITE_BRIDGE_URL || "http://34.100.138.134:8100");
const DEFAULT_BRIDGE_TOKEN =
  import.meta.env.VITE_BRIDGE_TOKEN || "oc-bridge-2026-anubhav-secret";

export interface ApiConfig {
  url: string;
  token: string;
}

let config: ApiConfig = {
  // In production (HTTPS), always use /api proxy — ignore stale localStorage
  url: IS_PROD ? "/api" : (localStorage.getItem("oc_bridge_url") || DEFAULT_BRIDGE_URL),
  token: localStorage.getItem("oc_bridge_token") || DEFAULT_BRIDGE_TOKEN,
};

export function getConfig(): ApiConfig {
  return { ...config };
}

export function setConfig(next: Partial<ApiConfig>) {
  config = { ...config, ...next };
  if (next.url !== undefined) localStorage.setItem("oc_bridge_url", next.url);
  if (next.token !== undefined)
    localStorage.setItem("oc_bridge_token", next.token);
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  };
}

export async function checkHealth(
  signal?: AbortSignal
): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${config.url}/v1/health`, {
      headers: headers(),
      signal,
    });
    const latency = Math.round(performance.now() - start);
    return { ok: res.ok, latency };
  } catch (err: any) {
    return {
      ok: false,
      latency: Math.round(performance.now() - start),
      error: err.message,
    };
  }
}

export interface ChatResponse {
  status?: string;
  message?: string;
  text?: string;
  content?: string;
  response?: string;
  task_id?: string;
  session_key?: string;
  run_id?: string;
  tool_calls?: Array<{ name: string; input: string; output?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  progress: string;
  result: string | null;
}

export async function sendChat(
  message: string,
  sessionKey = "agent:main:main"
): Promise<ChatResponse> {
  const res = await fetch(`${config.url}/v1/chat/send`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message, session_key: sessionKey, timeout_ms: 25000 }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${config.url}/v1/tasks/${taskId}/status`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to poll task");
  return res.json();
}

/**
 * Send chat and poll if pending. Calls onStep callback with progress.
 */
export async function sendChatWithPolling(
  message: string,
  sessionKey: string,
  onStep?: (step: "sending" | "thinking" | "polling" | "done", progress?: string) => void
): Promise<string> {
  onStep?.("sending");
  const res = await sendChat(message, sessionKey);

  // If completed immediately
  if (res.status === "completed" || !res.task_id) {
    onStep?.("done");
    return extractReply(res);
  }

  // If pending — poll
  if (res.status === "pending" && res.task_id) {
    onStep?.("thinking");
    const taskId = res.task_id;
    const maxPolls = 60; // 60 * 3s = 3 minutes max
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      onStep?.("polling", `Waiting for response... (${(i + 1) * 3}s)`);
      const task = await pollTaskStatus(taskId);
      if (task.status === "completed" || task.status === "failed") {
        onStep?.("done");
        return task.result || task.progress || "Task completed.";
      }
    }
    onStep?.("done");
    return "Task timed out — agent is still processing. Check back later.";
  }

  // Error
  if (res.status === "error") {
    onStep?.("done");
    return extractReply(res);
  }

  onStep?.("done");
  return extractReply(res);
}

export function extractReply(res: ChatResponse): string {
  // Don't show raw polling messages
  if (res.status === "pending" && res.task_id) {
    return "";
  }
  return (
    res?.message ||
    res?.text ||
    res?.content ||
    res?.response ||
    (typeof res === "string" ? res : JSON.stringify(res, null, 2))
  );
}

export async function listSessions() {
  const res = await fetch(`${config.url}/v1/sessions`, { headers: headers() });
  if (!res.ok) throw new Error("listSessions failed");
  return res.json();
}

export async function resetSession(sessionKey: string) {
  const res = await fetch(`${config.url}/v1/sessions/${sessionKey}/reset`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

export async function sendToChannel(channel: string, text: string) {
  const res = await fetch(`${config.url}/v1/channels/send`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ channel, text }),
  });
  return res.json();
}

// Simulated token-by-token streaming reveal for better UX until
// the bridge exposes a proper WebSocket streaming endpoint.
export async function streamReveal(
  fullText: string,
  onChunk: (partial: string) => void,
  opts: { chunkSize?: number; delayMs?: number } = {}
) {
  const { chunkSize = 4, delayMs = 18 } = opts;
  const words = fullText.split(/(\s+)/); // keep whitespace
  let buf = "";
  for (let i = 0; i < words.length; i += chunkSize) {
    buf += words.slice(i, i + chunkSize).join("");
    onChunk(buf);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
