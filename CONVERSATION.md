# Superboo — Session Log

## Session: April 9-14, 2026

### What Was Built

**Superboo** — A general-purpose AI agent for kids (ages 8-16). Live at superboo.me.

#### Web App (React/Vite/Tailwind)
- **Landing page**: Magical animated landing with mesh gradients, sparkles, bento grid, skills cloud, testimonials, ghost runner easter egg (press G)
- **Dynamic Boo**: Animated ghost on landing page with facial expressions, eye tracking, click speech bubbles
- **Chat interface**: Workspace hub with 35 skills, quick-start cards, execution status, canvas preview for created files
- **Auth**: Login/signup with SQLite DB on VM, 3-step onboarding (interests, role, welcome)
- **Pricing**: 3 tiers — Explorer (free), Creator ($9.99/mo), Family ($29.99/mo)
- **24x7 Agent page**: Explains always-on deployment, channel connections (WhatsApp, Telegram, Discord, etc.), $20/mo pricing
- **Download page**: macOS app download with install instructions
- **Bots marketplace**: 22 pre-built bot templates (Study Buddy, Meme Lord, etc.) at /bots
- **Skills panel**: 35 consumer skills across 8 categories with MCP connector info
- **Connectors panel**: 12 consumer integrations + 8 dev connectors
- **Guide Mode**: In-app ghost cursor follower with push-to-talk (Electron)
- **Canvas Preview**: Right-side panel showing created files (slides, docs, sheets)

#### macOS Desktop App (Electron)
- Custom titlebar with traffic lights, vibrancy, dark mode
- Native menu bar (New Chat, Skills, Settings shortcuts)
- Global shortcut: Option+Space to summon
- Guide Mode toggle in titlebar
- Desktop-specific layout with ambient effects

#### Native SuperbooGuide (Swift)
- System-wide ghost cursor companion (like Clicky)
- Follows cursor across ALL apps at 60fps
- Push-to-talk voice input (Ctrl+Option+Space) via macOS Speech Recognition
- Screen capture via ScreenCaptureKit
- Computer-use skill: sends screenshots to Gemini Vision for coordinate detection
- Cursor control: physically moves cursor via CGEvent (POINT + CLICK support)
- Purple border glow changes color per mood (idle/listening/thinking/speaking)
- Menu bar app (👻 Boo) with text input option
- Needs: Accessibility + Microphone + Screen Recording permissions

#### Backend (on GCP VM 34.100.138.134)
- **OpenClaw Gateway** (Docker): Heisenberg agent running Gemini 2.5 Flash
- **FastAPI Bridge** (port 8100): REST API connecting web UI to gateway
  - `/v1/chat/send` — chat with polling + history fallback
  - `/v1/create` — direct file creation (slides, docs, sheets via python scripts)
  - `/v1/computer-use` — Gemini Vision with screenshot for cursor control
  - `/v1/tts` — Gemini 2.5 Pro Preview TTS (voice output)
  - `/v1/files/` — serve files from VM for inline rendering
  - `/v1/auth/` — signup/login with SQLite DB
- **Skills deployed**: generate-slides, generate-document, generate-spreadsheet + 4 custom (sora, dubbing, narration, gog)
- **SOUL.md + AGENTS.md**: Agent personality + behavior guidelines
- **Vercel proxy**: `/api/*` rewrites to bridge (fixes HTTPS mixed content)

### Key Decisions
- **Gemini 2.5 Flash** as primary LLM (Z.ai GLM-5 rate-limited, Gemini 3.1 Pro key expired)
- **Gemini 2.5 Pro Preview TTS** for voice (Flash TTS blocked from VM IP)
- **Direct file creation** via `/v1/create` endpoint (agent unreliable at using exec tool)
- **Chat history fallback**: when agent sends to WhatsApp, bridge reads response from history
- **`deliver: false`** in chat.send params prevents WhatsApp delivery
- **localStorage persist** for user sessions + chat history (zustand)
- **SQLite on VM** for real user auth (not just localStorage)

### Messaging Pivot
- Started as OpenClaw UI for UGC video ads (Professor Curious)
- Pivoted to consumer AI agent "Superboo" with ghost branding
- Final positioning: **"The first AI agent built for kids"** — general-purpose (not just learning), safe, creative
- Mission: kids deserve their own AI, safe models built in-house, creativity over productivity

### Current Issues
- Bridge gateway disconnects frequently — needs restart
- TTS: Flash blocked from VM, using Pro which works
- SuperbooGuide: screen capture needs Screen Recording permission (hard to grant for unsigned apps)
- Agent doesn't reliably use exec tool — direct `/v1/create` endpoint as workaround
- Z.ai GLM-5 permanently rate-limited

### Tech Stack
- Frontend: React 19, Vite 8, Tailwind 3, Zustand 5, React Router
- Desktop: Electron 41, electron-builder
- Native: Swift, SwiftUI, ScreenCaptureKit, Speech framework
- Backend: FastAPI, SQLite, OpenClaw, Docker
- AI: Gemini 2.5 Flash (chat), Gemini 2.5 Pro TTS (voice), Gemini Vision (screen)
- Deploy: Vercel (web), GitHub Releases (Mac DMG), GCP VM (backend)

### GitHub
- Repo: github.com/anubhav1004/superboo
- Latest release: v0.1.1
- Domain: superboo.me
