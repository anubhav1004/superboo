export type Role = "user" | "assistant" | "tool" | "system";

export interface MediaInfo {
  type: "video" | "image" | "document" | "audio";
  url?: string;
  name?: string;
  status: "generating" | "ready" | "error";
  progress?: number;
}

export interface ExecStepInfo {
  label: string;
  state: "pending" | "active" | "done";
  icon: "send" | "think" | "receive" | "render";
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  media?: MediaInfo[];
  skillTags?: string[];
  toolCall?: { name: string; input: string; output?: string };
  streaming?: boolean;
  execSteps?: ExecStepInfo[];
  createdAt: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "code" | "audio";
  size: number;
  url?: string;
}

export interface Session {
  id: string;
  title: string;
  agentId: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  examplePrompt: string;
  outputPreview: string;
  trending?: boolean;
  connector?: {
    name: string;
    icon: string;
    free: boolean;
  };
}

export type TaskStatus = "running" | "completed" | "cancelled";

export interface TaskStep {
  id: string;
  title: string;
  detail?: string;
  status: "pending" | "running" | "done" | "failed";
  tool?: string;
  startedAt: number;
  completedAt?: number;
}

export interface Task {
  id: string;
  title: string;
  skill?: string;
  sessionId?: string;
  status: TaskStatus;
  progress: number; // 0-100
  steps: TaskStep[];
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  cancelledAt?: number;
}

export interface Connector {
  id: string;
  name: string;
  category: "deployment" | "social" | "ai" | "data" | "dev" | "analytics";
  status: "connected" | "disconnected" | "configured";
  description: string;
  icon?: string;
  credentials?: string;
  lastUsed?: number;
}
