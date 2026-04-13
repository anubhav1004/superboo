import AppKit
import SwiftUI
import AVFoundation
import Speech
import ScreenCaptureKit

// ═══════════════════════════════════════════════════
// SuperbooGuide — System-wide AI companion
// Screen capture + voice + cursor pointing
// ═══════════════════════════════════════════════════

print("🚀 SuperbooGuide launching...")
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
print("🚀 Calling app.run()")
app.run()

// MARK: - State
class BooState: ObservableObject {
    @Published var cursorX: CGFloat = 400
    @Published var cursorY: CGFloat = 400
    @Published var isActive = true
    @Published var bubble = "Hey! Hold Ctrl+Opt+Space to talk 👻"
    @Published var mood: Mood = .idle
    @Published var showBubble = true
    @Published var isListening = false

    // Pointing
    @Published var pointTarget: CGPoint? = nil
    @Published var pointLabel: String? = nil
    @Published var isPointing = false

    enum Mood { case idle, listening, thinking, speaking }

    let bridgeURL = "http://34.100.138.134:8100"
    let bridgeToken = "oc-bridge-2026-anubhav-secret"
    let synthesizer = AVSpeechSynthesizer()

    func speak(_ text: String, completion: @escaping () -> Void) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = 0.52
        utterance.pitchMultiplier = 1.1
        utterance.volume = 0.9
        // Use a good voice
        if let voice = AVSpeechSynthesisVoice(identifier: "com.apple.voice.compact.en-US.Samantha") {
            utterance.voice = voice
        } else {
            utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        }
        synthesizer.stopSpeaking(at: .immediate)

        // Completion via timer (AVSpeechSynthesizerDelegate is complex)
        let duration = Double(text.count) * 0.055 + 0.5
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            completion()
        }
        synthesizer.speak(utterance)
    }

    @MainActor
    func sendToBoo(_ text: String, screenshot: Data?) {
        mood = .thinking
        bubble = "Thinking..."
        showBubble = true
        print("📤 sendToBoo: '\(text)' screenshot=\(screenshot?.count ?? 0) bytes")

        Task {
            do {
                let result: ComputerUseResult
                if let img = screenshot, img.count > 100 {
                    print("📸 Sending with screenshot")
                    result = try await callComputerUse(text: text, imageData: img)
                } else {
                    print("💬 No screenshot — sending text only to chat")
                    result = try await callChatFallback(text: text)
                }

                await MainActor.run {
                    let displayText = result.response.count > 160
                        ? String(result.response.prefix(157)) + "..."
                        : result.response

                    self.mood = .speaking
                    self.bubble = displayText
                    self.showBubble = true

                    // Handle CLICK action — move cursor and click
                    if let click = result.click {
                        let point = CGPoint(x: CGFloat(click.x), y: CGFloat(click.y))
                        self.flyToPoint(point, label: click.label)
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                            self.clickAtCurrentPosition()
                            self.bubble = "Clicked \(click.label)! ✅"
                        }
                    }
                    // Handle POINT action — move cursor to show
                    else if let point = result.point {
                        let cgPoint = CGPoint(x: CGFloat(point.x), y: CGFloat(point.y))
                        self.flyToPoint(cgPoint, label: point.label)
                    }

                    self.speak(result.response) {
                        DispatchQueue.main.async {
                            self.mood = .idle
                            self.isPointing = false
                            self.pointTarget = nil
                            self.pointLabel = nil
                            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                                if self.mood == .idle { self.showBubble = false }
                            }
                        }
                    }
                }
            } catch {
                print("❌ Error: \(error)")
                await MainActor.run {
                    self.mood = .idle
                    self.bubble = "Error: \(error.localizedDescription)"
                    self.showBubble = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 5) { self.showBubble = false }
                }
            }
        }
    }

    struct ComputerUseResult {
        let response: String
        let point: (x: Int, y: Int, label: String)?
        let click: (x: Int, y: Int, label: String)?
    }

    func callComputerUse(text: String, imageData: Data?) async throws -> ComputerUseResult {
        let url = URL(string: "\(bridgeURL)/v1/computer-use")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(bridgeToken)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 30

        let imageBase64 = imageData?.base64EncodedString() ?? ""

        let body: [String: Any] = [
            "image": imageBase64,
            "question": text,
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ComputerUseResult(response: "Got a bad response", point: nil, click: nil)
        }

        let ok = json["ok"] as? Bool ?? false
        guard ok else {
            let error = json["error"] as? String ?? "Unknown error"
            return ComputerUseResult(response: "Error: \(error)", point: nil, click: nil)
        }

        let response = json["response"] as? String ?? "I see your screen but couldn't form a response."

        // Parse point
        var point: (x: Int, y: Int, label: String)? = nil
        if let p = json["point"] as? [String: Any],
           let x = p["x"] as? Int, let y = p["y"] as? Int, let label = p["label"] as? String {
            point = (x: x, y: y, label: label)
        }

        // Parse click
        var click: (x: Int, y: Int, label: String)? = nil
        if let c = json["click"] as? [String: Any],
           let x = c["x"] as? Int, let y = c["y"] as? Int, let label = c["label"] as? String {
            click = (x: x, y: y, label: label)
        }

        return ComputerUseResult(response: response, point: point, click: click)
    }

    /// Fallback: send text-only to the chat API when screenshot isn't available
    func callChatFallback(text: String) async throws -> ComputerUseResult {
        let url = URL(string: "\(bridgeURL)/v1/chat/send")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(bridgeToken)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 20

        let body: [String: Any] = [
            "message": "[system: You are Superboo Guide Mode. Keep responses SHORT (1-2 sentences). Be casual and helpful. Reply directly as assistant message. Do NOT use the send tool.]\n\(text)",
            "session_key": "agent:main:main",
            "timeout_ms": 15000
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        print("📡 Calling chat fallback...")

        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ComputerUseResult(response: "Got a weird response", point: nil, click: nil)
        }
        print("📡 Chat response: \(json)")
        let msg = json["message"] as? String ?? "Hmm, try again?"
        return ComputerUseResult(response: msg, point: nil, click: nil)
    }

    func flyToPoint(_ point: CGPoint, label: String?) {
        guard let screen = NSScreen.main else { return }

        // Screenshot is captured at config.width = 1280 pixels
        // Screen is screen.frame.width x screen.frame.height POINTS
        // On Retina: 1280 points = 2560 pixels, but screenshot is 1280px
        // So screenshot coords map 1:1 to screen points on a 1280pt-wide display
        // For other sizes: scale proportionally
        let screenshotWidth: CGFloat = 1280.0
        let screenshotHeight: CGFloat = screenshotWidth * (screen.frame.height / screen.frame.width)

        let scaleX = screen.frame.width / screenshotWidth
        let scaleY = screen.frame.height / screenshotHeight

        // Screenshot coords: top-left origin. CG coords: also top-left origin.
        let targetX = point.x * scaleX
        let targetY = point.y * scaleY

        print("🎯 flyToPoint: screenshot(\(Int(point.x)),\(Int(point.y))) → screen(\(Int(targetX)),\(Int(targetY))) scale(\(scaleX),\(scaleY)) screenSize(\(Int(screen.frame.width)),\(Int(screen.frame.height)))")

        isPointing = true
        pointLabel = label

        // Animate cursor movement in steps for smooth flight
        let currentPos = NSEvent.mouseLocation
        // Convert AppKit (bottom-left) to CG (top-left) for CGEvent
        let screenHeight = screen.frame.height + screen.frame.origin.y
        let startCG = CGPoint(x: currentPos.x, y: screenHeight - currentPos.y)
        let endCG = CGPoint(x: targetX, y: targetY)

        // Also update our overlay target (AppKit coords — bottom-left origin — for the ghost)
        let targetAppKitY = screen.frame.origin.y + screen.frame.height - targetY
        pointTarget = CGPoint(x: screen.frame.origin.x + targetX, y: targetAppKitY)
        print("🎯 Ghost target (AppKit): (\(Int(screen.frame.origin.x + targetX)),\(Int(targetAppKitY)))")

        // Smooth cursor movement over 0.5 seconds (30 steps)
        let steps = 30
        let duration = 0.5
        for i in 0...steps {
            let t = Double(i) / Double(steps)
            // Ease-out curve
            let eased = 1.0 - pow(1.0 - t, 3)
            let x = startCG.x + (endCG.x - startCG.x) * eased
            let y = startCG.y + (endCG.y - startCG.y) * eased

            DispatchQueue.main.asyncAfter(deadline: .now() + duration * t) {
                let moveEvent = CGEvent(
                    mouseEventSource: nil,
                    mouseType: .mouseMoved,
                    mouseCursorPosition: CGPoint(x: x, y: y),
                    mouseButton: .left
                )
                moveEvent?.post(tap: .cghidEventTap)
            }
        }
    }

    /// Click at the current cursor position
    func clickAtCurrentPosition() {
        let pos = NSEvent.mouseLocation
        guard let screen = NSScreen.main else { return }
        let screenHeight = screen.frame.height + screen.frame.origin.y
        let cgPos = CGPoint(x: pos.x, y: screenHeight - pos.y)

        let mouseDown = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: cgPos, mouseButton: .left)
        let mouseUp = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: cgPos, mouseButton: .left)
        mouseDown?.post(tap: .cghidEventTap)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
            mouseUp?.post(tap: .cghidEventTap)
        }
    }

    /// Move cursor to a specific screen position (AppKit coordinates)
    func moveCursorTo(x: CGFloat, y: CGFloat) {
        guard let screen = NSScreen.main else { return }
        let screenHeight = screen.frame.height + screen.frame.origin.y
        let cgPos = CGPoint(x: x, y: screenHeight - y)

        let moveEvent = CGEvent(
            mouseEventSource: nil,
            mouseType: .mouseMoved,
            mouseCursorPosition: cgPos,
            mouseButton: .left
        )
        moveEvent?.post(tap: .cghidEventTap)
    }
}

// MARK: - App Delegate
class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var state = BooState()
    var overlayWindows: [NSWindow] = []
    var cursorTimer: Timer?
    var audioEngine: AVAudioEngine?
    var recognitionTask: SFSpeechRecognitionTask?
    var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    var spaceHeld = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Request accessibility
        AXIsProcessTrustedWithOptions(
            [kAXTrustedCheckOptionPrompt.takeUnretainedValue(): true] as CFDictionary
        )

        // Request speech recognition
        SFSpeechRecognizer.requestAuthorization { status in
            if status != .authorized {
                print("⚠️ Speech recognition not authorized")
            }
        }

        // Request microphone
        AVAudioApplication.requestRecordPermission { granted in
            if !granted { print("⚠️ Microphone not granted") }
        }

        // Menu bar
        print("📌 Creating status bar item...")
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let btn = statusItem.button {
            btn.title = " 👻 Boo"
        }

        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "💬 Ask Boo a Question", action: #selector(menuAskQuestion), keyEquivalent: "t"))
        menu.addItem(NSMenuItem(title: "🎤 Start Listening", action: #selector(menuStartListening), keyEquivalent: "l"))
        menu.addItem(NSMenuItem(title: "⬛ Stop & Answer", action: #selector(menuStopListening), keyEquivalent: "s"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Toggle Guide", action: #selector(toggleGuide), keyEquivalent: "g"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit Boo", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem.menu = menu
        print("📌 Menu created with \(menu.items.count) items")

        createOverlays()
        startCursorTracking()

        // Global hotkeys
        NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard let self = self else { return }
            // Ctrl+Opt+G = toggle
            if event.modifierFlags.contains([.control, .option]) && event.keyCode == 5 {
                self.toggleGuide()
            }
            // Ctrl+Opt+Space = push-to-talk start
            if event.modifierFlags.contains([.control, .option]) && event.keyCode == 49 && !self.spaceHeld {
                self.spaceHeld = true
                self.startListening()
            }
        }
        NSEvent.addGlobalMonitorForEvents(matching: .keyUp) { [weak self] event in
            // Space release = stop listening
            if event.keyCode == 49 && self?.spaceHeld == true {
                self?.spaceHeld = false
                self?.stopListeningAndProcess()
            }
        }
        // Local monitors too
        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            if event.modifierFlags.contains([.control, .option]) && event.keyCode == 5 { self?.toggleGuide() }
            if event.modifierFlags.contains([.control, .option]) && event.keyCode == 49 && self?.spaceHeld == false {
                self?.spaceHeld = true; self?.startListening()
            }
            return event
        }
        NSEvent.addLocalMonitorForEvents(matching: .keyUp) { [weak self] event in
            if event.keyCode == 49 && self?.spaceHeld == true { self?.spaceHeld = false; self?.stopListeningAndProcess() }
            return event
        }

        // Hide initial bubble after 5s
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { self.state.showBubble = false }
        print("✅ SuperbooGuide started")
    }

    @objc func menuStartListening() {
        print("🎤 Menu: Start listening")
        startListening()
    }

    @objc func menuStopListening() {
        print("⬛ Menu: Stop listening")
        stopListeningAndProcess()
    }

    @objc func menuAskQuestion() {
        print("💬 Menu: Type question")
        let alert = NSAlert()
        alert.messageText = "Ask Boo"
        alert.informativeText = "Type your question — Boo will look at your screen and answer."
        alert.alertStyle = .informational
        let input = NSTextField(frame: NSRect(x: 0, y: 0, width: 300, height: 24))
        input.placeholderString = "e.g. Where is the trash icon?"
        alert.accessoryView = input
        alert.addButton(withTitle: "Ask")
        alert.addButton(withTitle: "Cancel")

        let response = alert.runModal()
        if response == .alertFirstButtonReturn {
            let text = input.stringValue
            guard text.count > 1 else { return }
            print("💬 Question: \(text)")
            // Capture screen and send
            Task { @MainActor in
                var screenshotData: Data? = nil
                do {
                    let captures = try await captureScreen()
                    screenshotData = captures.first?.imageData
                    print("📸 Screenshot captured: \(screenshotData?.count ?? 0) bytes")
                } catch {
                    print("❌ Screen capture failed: \(error)")
                }
                state.sendToBoo(text, screenshot: screenshotData)
            }
        }
    }

    @objc func toggleGuide() {
        state.isActive.toggle()
        if state.isActive {
            createOverlays(); startCursorTracking()
            state.bubble = "I'm back! 👻"; state.showBubble = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { self.state.showBubble = false }
        } else {
            destroyOverlays(); stopCursorTracking()
        }
    }

    func createOverlays() {
        destroyOverlays()
        for screen in NSScreen.screens {
            let w = NSWindow(contentRect: screen.frame, styleMask: .borderless, backing: .buffered, defer: false)
            w.isOpaque = false; w.backgroundColor = .clear; w.level = .floating
            w.ignoresMouseEvents = true
            w.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
            w.isReleasedWhenClosed = false; w.hasShadow = false; w.hidesOnDeactivate = false
            w.setFrame(screen.frame, display: true)
            w.contentView = NSHostingView(rootView: OverlayView(state: state, screenFrame: screen.frame))
            w.orderFrontRegardless()
            overlayWindows.append(w)
        }
    }

    func destroyOverlays() { overlayWindows.forEach { $0.close() }; overlayWindows.removeAll() }
    func startCursorTracking() {
        stopCursorTracking()
        cursorTimer = Timer.scheduledTimer(withTimeInterval: 1.0/60.0, repeats: true) { [weak self] _ in
            let p = NSEvent.mouseLocation; self?.state.cursorX = p.x; self?.state.cursorY = p.y
        }
    }
    func stopCursorTracking() { cursorTimer?.invalidate(); cursorTimer = nil }

    // MARK: - Voice
    var liveTranscript = ""

    func startListening() {
        print("🎤 startListening called")
        state.isListening = true
        state.mood = .listening
        state.bubble = "Listening..."
        state.showBubble = true
        liveTranscript = ""

        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")), recognizer.isAvailable else {
            state.bubble = "Speech not available"; state.mood = .idle; return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let req = recognitionRequest else { return }
        req.shouldReportPartialResults = true

        audioEngine = AVAudioEngine()
        guard let engine = audioEngine else { return }
        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in req.append(buffer) }

        do { engine.prepare(); try engine.start() } catch {
            state.bubble = "Mic error"; state.mood = .idle; return
        }

        recognitionTask = recognizer.recognitionTask(with: req) { [weak self] result, _ in
            if let result = result {
                let text = result.bestTranscription.formattedString
                DispatchQueue.main.async {
                    self?.liveTranscript = text
                    self?.state.bubble = "\"\(text)\""
                }
            }
        }
    }

    func stopListeningAndProcess() {
        print("⬛ stopListeningAndProcess called — transcript: '\(liveTranscript)'")
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionTask = nil; recognitionRequest = nil; audioEngine = nil
        state.isListening = false

        let text = liveTranscript
        guard text.count > 2 else {
            state.mood = .idle; state.bubble = "Didn't catch that — try again!"; return
        }

        // Capture screen then send
        Task { @MainActor in
            var screenshotData: Data? = nil
            do {
                let captures = try await captureScreen()
                screenshotData = captures.first?.imageData
            } catch {
                print("Screen capture failed: \(error)")
            }
            state.sendToBoo(text, screenshot: screenshotData)
        }
    }

    // MARK: - Screen Capture
    @MainActor
    func captureScreen() async throws -> [ScreenCapture] {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        guard let display = content.displays.first else { throw NSError(domain: "capture", code: -1) }

        let ownWindows = content.windows.filter { $0.owningApplication?.bundleIdentifier == Bundle.main.bundleIdentifier }
        let filter = SCContentFilter(display: display, excludingWindows: ownWindows)
        let config = SCStreamConfiguration()
        config.width = 1280
        config.height = Int(1280.0 / (CGFloat(display.width) / CGFloat(display.height)))

        let image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: config)
        guard let jpeg = NSBitmapImageRep(cgImage: image).representation(using: .jpeg, properties: [.compressionFactor: 0.7]) else {
            throw NSError(domain: "capture", code: -2)
        }
        return [ScreenCapture(imageData: jpeg)]
    }
}

struct ScreenCapture { let imageData: Data }

// MARK: - Overlay View
struct OverlayView: View {
    @ObservedObject var state: BooState
    let screenFrame: CGRect

    var localX: CGFloat { state.cursorX - screenFrame.origin.x + 25 }
    var localY: CGFloat { screenFrame.height - (state.cursorY - screenFrame.origin.y) + 25 }
    var isOnScreen: Bool { screenFrame.contains(CGPoint(x: state.cursorX, y: state.cursorY)) }

    // If pointing, show ghost at target instead of cursor
    var ghostX: CGFloat {
        if let target = state.pointTarget, state.isPointing {
            return target.x - screenFrame.origin.x
        }
        return localX
    }
    var ghostY: CGFloat {
        if let target = state.pointTarget, state.isPointing {
            return screenFrame.height - (target.y - screenFrame.origin.y)
        }
        return localY
    }

    var borderColor: Color {
        switch state.mood {
        case .idle: return .purple
        case .listening: return .pink
        case .thinking: return .yellow
        case .speaking: return .green
        }
    }

    var body: some View {
        ZStack {
            // Border glow
            if state.isActive {
                Rectangle()
                    .fill(Color.clear)
                    .border(borderColor.opacity(0.7), width: 6)
                    .shadow(color: borderColor.opacity(0.5), radius: 30)
                    .shadow(color: borderColor.opacity(0.3), radius: 60)
                    .shadow(color: borderColor.opacity(0.15), radius: 100)
                    .animation(.easeInOut(duration: 0.5), value: state.mood)
            }

            if state.isActive && isOnScreen {
                // Ghost glow
                Circle()
                    .fill(borderColor.opacity(0.3))
                    .frame(width: 55, height: 55)
                    .blur(radius: 16)
                    .position(x: ghostX, y: ghostY)

                // Pulse ring when listening
                if state.mood == .listening {
                    Circle()
                        .stroke(Color.pink.opacity(0.4), lineWidth: 2)
                        .frame(width: 60, height: 60)
                        .scaleEffect(state.isListening ? 2 : 1)
                        .opacity(state.isListening ? 0 : 0.5)
                        .position(x: ghostX, y: ghostY)
                        .animation(.easeOut(duration: 1.2).repeatForever(autoreverses: false), value: state.isListening)
                }

                // Ghost
                GhostCanvas(mood: state.mood)
                    .frame(width: 42, height: 42)
                    .shadow(color: .purple.opacity(0.6), radius: state.mood == .listening ? 20 : 10)
                    .position(x: ghostX, y: ghostY)
                    .animation(.spring(response: 0.14, dampingFraction: 0.78), value: ghostX)
                    .animation(.spring(response: 0.14, dampingFraction: 0.78), value: ghostY)

                // Point label
                if state.isPointing, let label = state.pointLabel {
                    Text("👆 \(label)")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.purple.opacity(0.8)))
                        .position(x: ghostX, y: ghostY + 30)
                }

                // Speech bubble
                if state.showBubble {
                    Text(state.bubble)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.black.opacity(0.75))
                                .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(borderColor.opacity(0.4), lineWidth: 1))
                        )
                        .frame(maxWidth: 280)
                        .position(x: ghostX, y: ghostY - 42)
                        .animation(.spring(response: 0.2), value: state.bubble)
                }
            }
        }
        .frame(width: screenFrame.width, height: screenFrame.height)
    }
}

// MARK: - Ghost Canvas
struct GhostCanvas: View {
    let mood: BooState.Mood
    var body: some View {
        Canvas { ctx, size in
            let w = size.width, h = size.height
            var body = Path()
            body.move(to: CGPoint(x: w*0.5, y: h*0.05))
            body.addCurve(to: CGPoint(x: w*0.95, y: h*0.45), control1: CGPoint(x: w*0.82, y: h*0.05), control2: CGPoint(x: w*0.95, y: h*0.22))
            body.addLine(to: CGPoint(x: w*0.95, y: h*0.78))
            body.addCurve(to: CGPoint(x: w*0.72, y: h*0.92), control1: CGPoint(x: w*0.95, y: h*0.88), control2: CGPoint(x: w*0.82, y: h*0.92))
            body.addCurve(to: CGPoint(x: w*0.5, y: h*0.82), control1: CGPoint(x: w*0.62, y: h*0.92), control2: CGPoint(x: w*0.55, y: h*0.82))
            body.addCurve(to: CGPoint(x: w*0.28, y: h*0.92), control1: CGPoint(x: w*0.45, y: h*0.82), control2: CGPoint(x: w*0.38, y: h*0.92))
            body.addCurve(to: CGPoint(x: w*0.05, y: h*0.78), control1: CGPoint(x: w*0.18, y: h*0.92), control2: CGPoint(x: w*0.05, y: h*0.88))
            body.addLine(to: CGPoint(x: w*0.05, y: h*0.45))
            body.addCurve(to: CGPoint(x: w*0.5, y: h*0.05), control1: CGPoint(x: w*0.05, y: h*0.22), control2: CGPoint(x: w*0.18, y: h*0.05))
            body.closeSubpath()
            let g = Gradient(colors: [Color(red:0.96,green:0.91,blue:1), Color(red:0.75,green:0.52,blue:0.99), Color(red:0.43,green:0.16,blue:0.85)])
            ctx.fill(body, with: .radialGradient(g, center: CGPoint(x:w*0.5,y:h*0.3), startRadius: 2, endRadius: w*0.6))
            let eW: CGFloat = mood == .listening ? 5 : 4; let eH: CGFloat = mood == .listening ? 6 : 5
            ctx.fill(Path(ellipseIn: CGRect(x:w*0.33-eW/2,y:h*0.38-eH/2,width:eW,height:eH)), with: .color(Color(red:0.23,green:0.03,blue:0.39)))
            ctx.fill(Path(ellipseIn: CGRect(x:w*0.67-eW/2,y:h*0.38-eH/2,width:eW,height:eH)), with: .color(Color(red:0.23,green:0.03,blue:0.39)))
            ctx.fill(Path(ellipseIn: CGRect(x:w*0.31,y:h*0.34,width:2,height:2)), with: .color(.white))
            ctx.fill(Path(ellipseIn: CGRect(x:w*0.65,y:h*0.34,width:2,height:2)), with: .color(.white))
            if mood == .listening {
                ctx.fill(Path(ellipseIn: CGRect(x:w*0.45,y:h*0.52,width:w*0.1,height:h*0.08)), with: .color(Color(red:0.23,green:0.03,blue:0.39)))
                ctx.fill(Path(ellipseIn: CGRect(x:w*0.2,y:h*0.46,width:5,height:4)), with: .color(Color.pink.opacity(0.4)))
                ctx.fill(Path(ellipseIn: CGRect(x:w*0.72,y:h*0.46,width:5,height:4)), with: .color(Color.pink.opacity(0.4)))
            } else if mood == .speaking {
                ctx.fill(Path(ellipseIn: CGRect(x:w*0.4,y:h*0.52,width:w*0.2,height:h*0.08)), with: .color(Color(red:0.23,green:0.03,blue:0.39)))
            } else {
                ctx.fill(Path(ellipseIn: CGRect(x:w*0.42,y:h*0.53,width:w*0.16,height:h*0.06)), with: .color(Color(red:0.23,green:0.03,blue:0.39)))
            }
            ctx.fill(Path(ellipseIn: CGRect(x:w*0.25,y:h*0.15,width:w*0.5,height:h*0.2)), with: .color(.white.opacity(0.2)))
        }
    }
}
