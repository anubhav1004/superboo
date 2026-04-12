import AppKit
import SwiftUI
import AVFoundation
import Speech

// ═══════════════════════════════════════════════════
// SuperbooGuide — System-wide ghost companion
// Runs as a menu bar helper, creates a transparent
// overlay with Boo following the cursor everywhere.
// ═══════════════════════════════════════════════════

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory) // No dock icon
app.run()

// MARK: - App Delegate
class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var overlayManager: OverlayManager!
    var guideState: GuideState!

    func applicationDidFinishLaunching(_ notification: Notification) {
        guideState = GuideState()
        overlayManager = OverlayManager(state: guideState)

        // Menu bar icon
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            button.title = "👻"
            button.action = #selector(toggleGuide)
            button.target = self
        }

        // Build menu
        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "Toggle Guide Mode", action: #selector(toggleGuide), keyEquivalent: "g"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit Superboo Guide", action: #selector(quitApp), keyEquivalent: "q"))
        statusItem.menu = menu

        // Global shortcut: Ctrl+Option+G
        NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            if event.modifierFlags.contains([.control, .option]) && event.keyCode == 5 { // G key
                self?.toggleGuide()
            }
        }

        // Start active
        overlayManager.show()
        guideState.isActive = true

        print("SuperbooGuide running — Ctrl+Option+G to toggle")
    }

    @objc func toggleGuide() {
        if guideState.isActive {
            overlayManager.hide()
            guideState.isActive = false
        } else {
            overlayManager.show()
            guideState.isActive = true
        }
    }

    @objc func quitApp() {
        NSApplication.shared.terminate(nil)
    }
}

// MARK: - Guide State
class GuideState: ObservableObject {
    @Published var isActive = false
    @Published var mood: BooMood = .idle
    @Published var bubble: String = "Press Ctrl+Option+Space to talk!"
    @Published var cursorPos: CGPoint = .zero
    @Published var isListening = false

    let bridgeURL = "http://34.100.138.134:8100"
    let bridgeToken = "oc-bridge-2026-anubhav-secret"
    let synthesizer = NSSpeechSynthesizer()

    enum BooMood {
        case idle, listening, thinking, speaking
    }

    func sendToBoo(_ text: String) {
        mood = .thinking
        bubble = "Thinking..."

        let url = URL(string: "\(bridgeURL)/v1/chat/send")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(bridgeToken)", forHTTPHeaderField: "Authorization")

        let body: [String: Any] = [
            "message": "[system: You are Superboo Guide Mode. Keep responses SHORT (1-2 sentences). Be helpful and casual. No markdown.]\n\(text)",
            "session_key": "agent:main:main",
            "timeout_ms": 15000
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { [weak self] data, _, error in
            DispatchQueue.main.async {
                guard let self = self, let data = data else {
                    self?.mood = .idle
                    self?.bubble = "Couldn't connect 😢"
                    return
                }

                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String, !message.isEmpty {
                    let shortReply = message.count > 150 ? String(message.prefix(147)) + "..." : message
                    self.mood = .speaking
                    self.bubble = shortReply
                    self.synthesizer.startSpeaking(shortReply)

                    // Return to idle after speaking
                    DispatchQueue.main.asyncAfter(deadline: .now() + Double(shortReply.count) * 0.06 + 1) {
                        self.mood = .idle
                        self.bubble = "Press Ctrl+Option+Space to talk!"
                    }
                } else {
                    self.mood = .idle
                    self.bubble = "Hmm, try again?"
                }
            }
        }.resume()
    }
}

// MARK: - Overlay Manager
class OverlayManager {
    var windows: [OverlayWindow] = []
    let state: GuideState
    var mouseMonitor: Any?
    var keyMonitor: Any?
    var spaceHeld = false
    var audioEngine: AVAudioEngine?
    var recognitionTask: SFSpeechRecognitionTask?
    var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?

    init(state: GuideState) {
        self.state = state
    }

    func show() {
        // Create overlay for each screen
        for screen in NSScreen.screens {
            let window = OverlayWindow(screen: screen, state: state)
            window.orderFrontRegardless()
            windows.append(window)
        }

        // Track mouse globally
        mouseMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.mouseMoved, .leftMouseDragged]) { [weak self] event in
            self?.state.cursorPos = NSEvent.mouseLocation
        }

        // Also track in our own windows
        NSEvent.addLocalMonitorForEvents(matching: [.mouseMoved]) { [weak self] event in
            self?.state.cursorPos = NSEvent.mouseLocation
            return event
        }

        // Global push-to-talk: Ctrl+Option+Space
        keyMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.keyDown, .keyUp]) { [weak self] event in
            guard let self = self else { return }

            if event.keyCode == 49 && event.modifierFlags.contains([.control, .option]) { // Space
                if event.type == .keyDown && !self.spaceHeld {
                    self.spaceHeld = true
                    self.startListening()
                } else if event.type == .keyUp && self.spaceHeld {
                    self.spaceHeld = false
                    self.stopListening()
                }
            }
        }

        // Also monitor key up globally
        NSEvent.addGlobalMonitorForEvents(matching: .keyUp) { [weak self] event in
            if event.keyCode == 49 && self?.spaceHeld == true {
                self?.spaceHeld = false
                self?.stopListening()
            }
        }
    }

    func hide() {
        windows.forEach { $0.close() }
        windows.removeAll()
        if let m = mouseMonitor { NSEvent.removeMonitor(m) }
        if let k = keyMonitor { NSEvent.removeMonitor(k) }
        mouseMonitor = nil
        keyMonitor = nil
        stopListening()
    }

    func startListening() {
        state.isListening = true
        state.mood = .listening
        state.bubble = "Listening..."

        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            guard status == .authorized else {
                DispatchQueue.main.async {
                    self?.state.mood = .idle
                    self?.state.bubble = "Mic permission needed"
                }
                return
            }
            DispatchQueue.main.async {
                self?.startRecognition()
            }
        }
    }

    func startRecognition() {
        let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        guard let recognizer = recognizer, recognizer.isAvailable else {
            state.bubble = "Speech not available"
            state.mood = .idle
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true

        audioEngine = AVAudioEngine()
        guard let audioEngine = audioEngine else { return }

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }

        do {
            audioEngine.prepare()
            try audioEngine.start()
        } catch {
            state.bubble = "Mic error"
            state.mood = .idle
            return
        }

        recognitionTask = recognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                DispatchQueue.main.async {
                    self?.state.bubble = "\"\(result.bestTranscription.formattedString)\""
                }
            }
        }
    }

    func stopListening() {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()

        let transcript = state.bubble.replacingOccurrences(of: "\"", with: "")

        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        audioEngine = nil

        state.isListening = false

        if transcript.count > 2 && transcript != "Listening..." {
            state.sendToBoo(transcript)
        } else {
            state.mood = .idle
            state.bubble = "Didn't catch that — try again!"
        }
    }
}

// MARK: - Overlay Window
class OverlayWindow: NSWindow {
    init(screen: NSScreen, state: GuideState) {
        super.init(
            contentRect: screen.frame,
            styleMask: .borderless,
            backing: .buffered,
            defer: false
        )

        self.isOpaque = false
        self.backgroundColor = .clear
        self.level = .screenSaver
        self.ignoresMouseEvents = true
        self.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
        self.isReleasedWhenClosed = false
        self.hasShadow = false
        self.hidesOnDeactivate = false
        self.setFrame(screen.frame, display: true)

        let hostView = NSHostingView(rootView: BooOverlayView(state: state, screenFrame: screen.frame))
        self.contentView = hostView
    }

    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}

// MARK: - Boo Overlay SwiftUI View
struct BooOverlayView: View {
    @ObservedObject var state: GuideState
    let screenFrame: CGRect

    @State private var bobPhase: Double = 0

    var booPosition: CGPoint {
        // Convert from AppKit coords (bottom-left origin) to SwiftUI (top-left)
        let x = state.cursorPos.x - screenFrame.origin.x + 20
        let y = screenFrame.height - (state.cursorPos.y - screenFrame.origin.y) + 20
        return CGPoint(x: x, y: y + sin(bobPhase) * 4)
    }

    var glowColor: Color {
        switch state.mood {
        case .idle: return .purple.opacity(0.3)
        case .listening: return .pink.opacity(0.5)
        case .thinking: return .yellow.opacity(0.4)
        case .speaking: return .green.opacity(0.4)
        }
    }

    var body: some View {
        ZStack {
            // Border glow
            if state.isActive {
                Rectangle()
                    .stroke(glowColor, lineWidth: 3)
                    .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: state.mood)
            }

            // Ghost
            if state.isActive {
                ZStack {
                    // Glow behind ghost
                    Circle()
                        .fill(glowColor)
                        .frame(width: 60, height: 60)
                        .blur(radius: 15)

                    // Ghost body
                    BooShape()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "F5E9FF"), Color(hex: "C084FC"), Color(hex: "6D28D9")],
                                center: .init(x: 0.5, y: 0.3),
                                startRadius: 2,
                                endRadius: 25
                            )
                        )
                        .frame(width: 44, height: 44)
                        .shadow(color: .purple.opacity(0.5), radius: state.mood == .listening ? 20 : 10)

                    // Eyes
                    HStack(spacing: 8) {
                        Circle().fill(Color(hex: "3B0764"))
                            .frame(width: state.mood == .listening ? 8 : 6, height: state.mood == .listening ? 10 : 7)
                        Circle().fill(Color(hex: "3B0764"))
                            .frame(width: state.mood == .listening ? 8 : 6, height: state.mood == .listening ? 10 : 7)
                    }
                    .offset(y: -4)

                    // Blush when listening
                    if state.mood == .listening {
                        HStack(spacing: 20) {
                            Circle().fill(Color.pink.opacity(0.4)).frame(width: 6, height: 6)
                            Circle().fill(Color.pink.opacity(0.4)).frame(width: 6, height: 6)
                        }
                        .offset(y: 2)
                    }

                    // Pulse ring when listening
                    if state.mood == .listening {
                        Circle()
                            .stroke(Color.pink.opacity(0.4), lineWidth: 2)
                            .frame(width: 55, height: 55)
                            .scaleEffect(state.isListening ? 1.8 : 1)
                            .opacity(state.isListening ? 0 : 0.6)
                            .animation(.easeOut(duration: 1.2).repeatForever(autoreverses: false), value: state.isListening)
                    }
                }
                .position(booPosition)
                .animation(.spring(response: 0.15, dampingFraction: 0.8), value: state.cursorPos)

                // Speech bubble
                if !state.bubble.isEmpty {
                    Text(state.bubble)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(state.mood == .idle ? Color(hex: "1a1a2e") : .white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(state.mood == .idle
                                    ? Color.white.opacity(0.95)
                                    : state.mood == .listening
                                    ? Color.pink.opacity(0.2)
                                    : state.mood == .thinking
                                    ? Color.yellow.opacity(0.15)
                                    : Color.green.opacity(0.15)
                                )
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(.ultraThinMaterial)
                                )
                        )
                        .frame(maxWidth: 280)
                        .position(x: booPosition.x, y: booPosition.y - 40)
                        .animation(.spring(response: 0.2), value: state.bubble)
                }
            }
        }
        .onAppear {
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                bobPhase = .pi * 2
            }
        }
    }
}

// MARK: - Ghost Shape
struct BooShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width, h = rect.height
        // Simplified ghost shape
        path.move(to: CGPoint(x: w * 0.5, y: 0))
        path.addCurve(
            to: CGPoint(x: w, y: h * 0.45),
            control1: CGPoint(x: w * 0.85, y: 0),
            control2: CGPoint(x: w, y: h * 0.2)
        )
        path.addLine(to: CGPoint(x: w, y: h * 0.85))
        // Wavy bottom
        path.addCurve(to: CGPoint(x: w * 0.75, y: h), control1: CGPoint(x: w, y: h * 0.95), control2: CGPoint(x: w * 0.85, y: h))
        path.addCurve(to: CGPoint(x: w * 0.5, y: h * 0.9), control1: CGPoint(x: w * 0.65, y: h), control2: CGPoint(x: w * 0.55, y: h * 0.9))
        path.addCurve(to: CGPoint(x: w * 0.25, y: h), control1: CGPoint(x: w * 0.45, y: h * 0.9), control2: CGPoint(x: w * 0.35, y: h))
        path.addCurve(to: CGPoint(x: 0, y: h * 0.85), control1: CGPoint(x: w * 0.15, y: h), control2: CGPoint(x: 0, y: h * 0.95))
        path.addLine(to: CGPoint(x: 0, y: h * 0.45))
        path.addCurve(
            to: CGPoint(x: w * 0.5, y: 0),
            control1: CGPoint(x: 0, y: h * 0.2),
            control2: CGPoint(x: w * 0.15, y: 0)
        )
        path.closeSubpath()
        return path
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        self.init(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}
