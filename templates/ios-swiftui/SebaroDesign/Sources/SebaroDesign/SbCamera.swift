import SwiftUI

// MARK: - Camera and photo parts (spec/02 §3.32; D105 (39), D106 (16)–(24), D107 (5)–(7), D91 F8a)

/// What the camera's page finder sees now (D105 (39)): still looking, or a page found.
public enum SbCameraFind: Sendable { case looking, found }

/// A dark area (D106 (17)): `content` drawn in the dark mode's values whatever the app's mode, keeping the app's tone and
/// its motion setting; for the camera and the page view in full screen, and the corner screen on the photo, never for a
/// list or a form. No new colour role: everything in it is the dark mode's.
public struct SbDarkArea<Content: View>: View {
    let content: Content
    @Environment(\.sebaroTone) private var tone
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        content
            .environment(\.colorScheme, .dark)
            .foregroundStyle(tone.text)
            .background(tone.bg.ignoresSafeArea())
            .environment(\.colorScheme, .dark)
    }
}

/// The camera's flash (D120 (1)): the system's automatic flash, always on, or off.
public enum SbFlashMode: CaseIterable, Sendable { case auto, on, off }

/// The camera's flash as a key with its word (D120 (1)): the `flash` icon and „Blitz: Auto“, „Blitz an“ or „Blitz aus“,
/// 48 pt high, that opens the system menu with `modes` („Auto“, „An“, „Aus“) and the check mark at the chosen one
/// (`SbMenuContent`, as `SbOverflowMenu`). VoiceOver hears the key's word, a button, and „Menü öffnen“ as its hint.
public struct SbFlashMenu: View {
    @Binding var mode: SbFlashMode
    let modes: [SbFlashMode]
    private var context = SbContext()

    public init(mode: Binding<SbFlashMode>, modes: [SbFlashMode] = SbFlashMode.allCases) {
        self._mode = mode
        self.modes = modes
    }

    /// The key's word: „Blitz: Auto“, „Blitz an“, „Blitz aus“.
    static func word(_ m: SbMessages, _ mode: SbFlashMode) -> String {
        switch mode { case .auto: m.flashAuto; case .on: m.flashOn; case .off: m.flashOff }
    }

    /// The menu's rows in the order of `modes`, the check at `mode`.
    static func items(_ m: SbMessages, mode: SbFlashMode, modes: [SbFlashMode],
                      choose: @escaping (SbFlashMode) -> Void) -> [SbMenuItem] {
        modes.map { f in
            let entry = switch f { case .auto: m.flashModeAuto; case .on: m.flashModeOn; case .off: m.flashModeOff }
            return SbMenuItem(entry, checked: f == mode) { choose(f) }
        }
    }

    public var body: some View {
        let m = context.messages
        let word = Self.word(m, mode)
        Menu {
            SbMenuContent(Self.items(m, mode: mode, modes: modes) { mode = $0 })
        } label: {
            HStack(spacing: SebaroSpace.s2) {
                SbIcon("flash", size: SebaroSize.iconLg, color: context.tone.text)
                SbWrapText(word).sbFont(.label).foregroundStyle(context.tone.text)
            }
            .padding(.horizontal, SebaroSpace.s3)
            .frame(minHeight: SebaroSize.targetTouch)
            .contentShape(Rectangle())
        }
        .menuIndicator(.hidden)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(word))
        .accessibilityHint(Text(m.openMenu))
        .accessibilityAddTraits(.isButton)
    }
}

/// The flash as it was before D120 (1): on or off. It now draws `SbFlashMenu` with „An“ and „Aus“ only.
/// `SbFlashMenu(mode:)` is preferred for new code (it offers „Auto“); the same two ways there are
/// `SbFlashMenu(mode: …, modes: [.on, .off])`. Not marked deprecated on purpose (CHECKS.md §46.10): an app that builds
/// with warnings as errors keeps building after a package update.
public struct SbFlashSwitch: View {
    @Binding var on: Bool
    public init(on: Binding<Bool>) { self._on = on }
    public var body: some View {
        SbFlashMenu(mode: Binding(get: { on ? .on : .off }, set: { on = $0 == .on }), modes: [.on, .off])
    }
}

/// What the camera may do (D120 (2)). The app keeps the platform's permission logic (`AVCaptureDevice`, the system's
/// question, the settings) and passes the state it knows: `granted` shows the preview; `notAsked` shows `reason` (the
/// app's sentence what the camera is for) with „Kamera erlauben“ (`onAsk` asks the system); `denied` shows the calm
/// sentence (`text` or „Die Kamera ist nicht erlaubt. …“) with „Einstellungen öffnen“ and, with `onImport`, „Aus Galerie
/// importieren“.
public enum SbCameraPermission {
    case granted
    case notAsked(reason: String, onAsk: () -> Void)
    case denied(onOpenSettings: () -> Void, onImport: (() -> Void)? = nil, text: String? = nil)

    /// The words in the preview's place: the sentence, the primary action and the secondary one (nil = none);
    /// nil for `granted`.
    func words(_ m: SbMessages) -> (sentence: String, primary: String, secondary: String?)? {
        switch self {
        case .granted: nil
        case let .notAsked(reason, _): (reason, m.cameraAllow, nil)
        case let .denied(_, onImport, text): (text ?? m.cameraDenied, m.recordSettings, onImport == nil ? nil : m.cameraImport)
        }
    }
}

/// The closed path through the first four `corners` (fractions 0…1 of `size`); fewer than four = nothing.
func sbPhotoPath(_ corners: [CGPoint], size: CGSize) -> Path? {
    guard corners.count >= 4 else { return nil }
    var p = Path()
    p.move(to: CGPoint(x: corners[0].x * size.width, y: corners[0].y * size.height))
    for c in corners[1..<4] { p.addLine(to: CGPoint(x: c.x * size.width, y: c.y * size.height)) }
    p.closeSubpath()
    return p
}

/// A mark on a photo (D106 (21), (22)): the found page's outline as a 2 pt line in accent on a 2 pt seam in `bg` at both
/// sides, the same on a light, dark or busy photo. `corners` are four points as fractions of the area, clockwise from
/// the top left; fewer than four draw nothing. It stands where `corners` put it with no transition, also under reduced
/// motion: a new detection jumps (D106 (21)); the app sends at most five places a second (D107 (5)). VoiceOver skips it.
public struct SbPhotoOutline: View {
    let corners: [CGPoint]
    @Environment(\.sebaroTone) private var tone
    public init(_ corners: [CGPoint]) { self.corners = corners }
    public var body: some View {
        Canvas { ctx, size in
            guard let path = sbPhotoPath(corners, size: size) else { return }
            let w = SebaroX.layerLineWidth
            ctx.stroke(path, with: .color(tone.bg), style: StrokeStyle(lineWidth: 3 * w, lineJoin: .round))
            ctx.stroke(path, with: .color(.sbAccent), style: StrokeStyle(lineWidth: w, lineJoin: .round))
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
        .transaction { $0.animation = nil }
    }
}

/// The camera that takes pages (spec/02 §3.32; D106 (16), (17), (20)–(22)), always in the dark area: the top bar with
/// „Kamera schließen“, `title` and, when the camera has a flash (`flash`, or the older two-way `flashOn`, not nil),
/// `SbFlashMenu` (D120 (1)); the `preview` in
/// the middle (the app's AVCaptureVideoPreviewLayer view: sebaro brings no camera library) with the found page's
/// `outline`; under it the finder's state as glyph and word („sucht Blatt“, „Blatt erkannt“; `findWord` = the app's
/// own) and, with `thumbnail`, the pages taken so far (`SbCaptureStrip`, only to look at, D107 (7)); at the bottom the
/// one primary action „Seite aufnehmen“ with the count as its hint („2 Seiten bisher“). No flash of the picture and no
/// sound of its own (D106 (20)). `captureState` shows the work of keeping a page in the action itself (D48).
/// `actions` = the app's icon buttons in the top bar before the flash („Aus Galerie importieren“); `captureHint` = the
/// app's sentence in place of the count (a help sentence or „Bleibt auf diesem Gerät.“; both provisional, agent).
/// D119 (2): with `onDone` and pages taken, the key „Fertig (2)“ at the end of the row of pages leads to the pages; with
/// `onSave` and `onDiscard` and pages taken, the close X asks first with `SbUnsavedDialog` („Scan sichern?“,
/// „Abbrechen“ · „Verwerfen“ · „Sichern“, `saveHint` under „Sichern“); without pages it calls `onClose` at once.
/// D120 (2): `permission` other than `.granted` puts a sentence in the preview's place: before the system's question
/// the app's sentence and „Kamera erlauben“ as the primary action; after a denial the calm sentence, „Einstellungen
/// öffnen“ as the primary action and, with `onImport`, „Aus Galerie importieren“ under the sentence. Then no flash, no
/// outline and no finder's state.
/// `closeAsking` (2026-11-01, provisional, agent) holds the X's question from outside, as Compose's `closeAsking`; nil =
/// the frame holds it. A sheet around the camera cannot be swiped away while the X would ask. The flash menu is the
/// system's `Menu`, whose open state SwiftUI does not hand out, so it has no `flashExpanded` here (Compose has one).
/// The type keeps its two parameters `SbCameraFrame<Preview, Thumb>` from before `actions` (CHECKS.md §46.10): the
/// app's actions are held as `AnyView`, so an app's explicit type such as `SbCameraFrame<Color, Color>` still compiles.
public struct SbCameraFrame<Preview: View, Thumb: View>: View {
    let title: String
    let find: SbCameraFind
    let pageCount: Int
    let onCapture: () -> Void
    let onClose: () -> Void
    let outline: [CGPoint]?
    let flashOn: Binding<Bool>?
    let flash: Binding<SbFlashMode>?
    let permission: SbCameraPermission
    let findWord: String?
    let captureLabel: String?
    let captureState: SbActionState
    let haptics: Bool
    let thumbnail: ((Int) -> Thumb)?
    let onDone: (() -> Void)?
    let onSave: (() -> Void)?
    let onDiscard: (() -> Void)?
    let saveHint: SbDataPathHint?
    let captureHint: String?
    let actions: AnyView
    let preview: Preview
    let closeAsking: Binding<Bool>?
    @State private var asking = false
    private var context = SbContext()

    /// `closeAsking` has its own overloads without a default (CHECKS.md §47.6): the forms without it keep their
    /// signatures (below, in the extension), so a reference to an initializer of D120 still binds.
    public init<Actions: View>(_ title: String, find: SbCameraFind, pageCount: Int, onCapture: @escaping () -> Void,
                onClose: @escaping () -> Void, outline: [CGPoint]? = nil, flashOn: Binding<Bool>? = nil,
                findWord: String? = nil, captureLabel: String? = nil, captureState: SbActionState = .idle,
                haptics: Bool = true, thumbnail: ((Int) -> Thumb)? = nil, onDone: (() -> Void)? = nil,
                onSave: (() -> Void)? = nil, onDiscard: (() -> Void)? = nil, saveHint: SbDataPathHint? = nil,
                captureHint: String? = nil, flash: Binding<SbFlashMode>? = nil,
                permission: SbCameraPermission = .granted, closeAsking: Binding<Bool>?,
                @ViewBuilder actions: () -> Actions, @ViewBuilder preview: () -> Preview) {
        self.title = title
        self.find = find
        self.pageCount = pageCount
        self.onCapture = onCapture
        self.onClose = onClose
        self.outline = outline
        self.flashOn = flashOn
        self.flash = flash
        self.permission = permission
        self.findWord = findWord
        self.captureLabel = captureLabel
        self.captureState = captureState
        self.haptics = haptics
        self.thumbnail = thumbnail
        self.onDone = onDone
        self.onSave = onSave
        self.onDiscard = onDiscard
        self.saveHint = saveHint
        self.captureHint = captureHint
        self.actions = AnyView(actions())
        self.preview = preview()
        self.closeAsking = closeAsking
    }

    public var body: some View {
        SbDarkArea {
            let m = context.messages
            VStack(spacing: 0) {
                // the flash switch beside the title while both fit, else under it (AX5 on 320 pt)
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: SebaroSpace.s1) {
                        SbIconButton("close", label: m.cameraClose, action: close)
                        Text(title).sbFont(.title).lineLimit(1).fixedSize()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .accessibilityAddTraits(.isHeader)
                        actions
                        flashKey.fixedSize()
                    }
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(alignment: .top, spacing: SebaroSpace.s1) {
                            SbIconButton("close", label: m.cameraClose, action: close)
                            SbWrapText(title, style: .title).frame(maxWidth: .infinity, alignment: .leading)
                                .accessibilityAddTraits(.isHeader)
                        }
                        HStack(spacing: SebaroSpace.s1) {
                            actions
                            flashKey
                        }
                    }
                }
                .padding(.horizontal, SebaroSpace.s1)
                ZStack {
                    if let ask = permission.words(m) {
                        askView(ask)
                    } else {
                        preview
                        if let outline { SbPhotoOutline(outline) }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipped()
                // the finder's state, the pages so far and the action scroll when they do not fit (AX5)
                ViewThatFits(in: .vertical) {
                    foot
                    ScrollView { foot }.frame(maxHeight: SebaroSize.targetTouch * 5)
                }
            }
            // the question only while its grounds hold: pages taken and both ways given; when the pages drop to 0 or
            // the app takes `onSave` / `onDiscard` away, it closes and stays closed until the X is pressed again
            .sbScanUnsavedDialog(isPresented: Binding(get: { askingNow && canAsk }, set: { setAsking($0) }),
                                 pageCount: pageCount, saveHint: saveHint, haptics: haptics,
                                 onSave: { onSave?() }, onDiscard: { onDiscard?() })
            // watched as the pair of question and grounds, from the first appearance on (CHECKS.md §47.6): a held or
            // restored `true` without its grounds is reported back as false at once, also when the app sets it while
            // the grounds stay away, so it cannot open later when pages arrive
            .onChange(of: Self.keptQuestion(askingNow, pageCount: pageCount, confirms: confirms) != askingNow,
                      initial: true) { _, invalid in
                if invalid { setAsking(false) }
            }
            // the system's way out of a sheet (swipe down) does not skip the question while the X would ask
            // (2026-11-01, provisional, agent; the Android back gesture's match)
            .interactiveDismissDisabled(canAsk)
        }
    }

    private var confirms: Bool { onSave != nil && onDiscard != nil }
    /// The X's question: held by the app (`closeAsking`, 2026-11-01, provisional, agent) or by the frame.
    private var askingNow: Bool { closeAsking?.wrappedValue ?? asking }
    func setAsking(_ value: Bool) {
        if let closeAsking { closeAsking.wrappedValue = value } else { asking = value }
    }
    private var canAsk: Bool { Self.closeAsks(pageCount: pageCount, confirms: confirms) }

    /// The open question after a change of the pages or the ways (CHECKS.md §46.10): it stays open only while the X
    /// would still ask; once closed it never reopens by itself.
    static func keptQuestion(_ asking: Bool, pageCount: Int, confirms: Bool) -> Bool {
        asking && closeAsks(pageCount: pageCount, confirms: confirms)
    }

    /// The flash key (D120 (1)) while the camera may run: `flash`, else the older two-way `flashOn` with „An“ and „Aus“.
    @ViewBuilder private var flashKey: some View {
        if permission.words(context.messages) == nil {
            if let flash {
                SbFlashMenu(mode: flash)
            } else if let flashOn {
                SbFlashMenu(mode: Binding(get: { flashOn.wrappedValue ? .on : .off },
                                          set: { flashOn.wrappedValue = $0 == .on }), modes: [.on, .off])
            }
        }
    }

    /// The preview's place without the camera (D120 (2)): the sentence in body, centred, and the import key; centred
    /// while it fits, else it scrolls from its top (AX5 on 320 pt).
    private func askView(_ ask: (sentence: String, primary: String, secondary: String?)) -> some View {
        let content = VStack(spacing: SebaroSpace.s4) {
            SbWrapText(ask.sentence, style: .body).multilineTextAlignment(.center)
            if ask.secondary != nil, case let .denied(_, onImport?, _) = permission {
                Button(ask.secondary ?? "", action: onImport).buttonStyle(SbSecondaryButtonStyle())
            }
        }
        .padding(.horizontal, SebaroSpacing.gutter)
        .padding(.vertical, SebaroSpace.s4)
        .frame(maxWidth: .infinity)
        return ViewThatFits(in: .vertical) {
            content.frame(maxHeight: .infinity)
            ScrollView { content }
        }
    }

    /// The close X (D119 (2)): asks while pages exist and the app gave `onSave` and `onDiscard`, else closes at once.
    func close() {
        if canAsk { setAsking(true) } else { onClose() }
    }

    /// Whether the close X asks first (D119 (2)): with pages taken and both ways given.
    static func closeAsks(pageCount: Int, confirms: Bool) -> Bool { confirms && pageCount > 0 }

    /// The word of the done key, „Fertig (2)“, or nil while there is no page or no `onDone` (D119 (2)).
    static func doneWord(_ m: SbMessages, pageCount: Int, hasDone: Bool, locale: Locale) -> String? {
        guard hasDone, pageCount > 0 else { return nil }
        return m.cameraDone(pageCount, SbMessages.formatCount(pageCount, locale: locale))
    }

    var doneKey: String? {
        Self.doneWord(context.messages, pageCount: pageCount, hasDone: onDone != nil, locale: context.currentLocale)
    }

    private var foot: some View {
        let m = context.messages
        return VStack(alignment: .leading, spacing: SebaroSpace.s3) {
            if permission.words(m) == nil {
            HStack(alignment: .firstTextBaseline, spacing: SebaroSpace.s1) {
                SbIcon(find == .found ? "success--filled" : "pending--16", size: SebaroSize.iconSm,
                       color: find == .found ? .sbSuccess : context.tone.textMuted)
                SbWrapText(findWord ?? (find == .found ? m.cameraFound : m.cameraLooking), style: .caption)
            }
            .accessibilityElement(children: .combine)
            }
            if (thumbnail != nil && pageCount > 0) || doneKey != nil {
                // the pages and „Fertig (2)“ at the row's end; under each other when both do not fit (AX5)
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: SebaroSpace.s3) { pagesAndDone }
                    VStack(alignment: .trailing, spacing: SebaroSpace.s2) { pagesAndDone }
                }
            }
            switch permission {
            case .granted:
                SbPrimaryActionBar(SbPrimaryActionModel(captureLabel ?? m.capturePage,
                                                        hint: captureHint ?? m.capturedSoFar(pageCount, SbMessages.formatCount(pageCount, locale: context.currentLocale)),
                                                        state: captureState, haptics: haptics, action: onCapture))
            case let .notAsked(_, onAsk):
                SbPrimaryActionBar(SbPrimaryActionModel(m.cameraAllow, haptics: haptics, action: onAsk))
            case let .denied(onOpenSettings, _, _):
                SbPrimaryActionBar(SbPrimaryActionModel(m.recordSettings, haptics: haptics, action: onOpenSettings))
            }
        }
        .padding(.top, SebaroSpace.s3)
        .padding(.horizontal, SebaroSpacing.gutter)
    }

    @ViewBuilder private var pagesAndDone: some View {
        if let thumbnail, pageCount > 0 {
            SbCaptureStrip(count: pageCount, thumbnail: thumbnail).frame(maxWidth: .infinity, alignment: .leading)
        } else {
            Spacer(minLength: 0)
        }
        if let doneKey, let onDone {
            Button(doneKey, action: onDone).buttonStyle(SbSecondaryButtonStyle()).fixedSize()
        }
    }
}

public extension SbCameraFrame {
    /// The camera without actions of the app's own (the form before `actions`; source compatible).
    init(_ title: String, find: SbCameraFind, pageCount: Int, onCapture: @escaping () -> Void,
         onClose: @escaping () -> Void, outline: [CGPoint]? = nil, flashOn: Binding<Bool>? = nil,
         findWord: String? = nil, captureLabel: String? = nil, captureState: SbActionState = .idle,
         haptics: Bool = true, thumbnail: ((Int) -> Thumb)? = nil, onDone: (() -> Void)? = nil,
         onSave: (() -> Void)? = nil, onDiscard: (() -> Void)? = nil, saveHint: SbDataPathHint? = nil,
         captureHint: String? = nil, flash: Binding<SbFlashMode>? = nil, permission: SbCameraPermission = .granted,
         closeAsking: Binding<Bool>?, @ViewBuilder preview: () -> Preview) {
        self.init(title, find: find, pageCount: pageCount, onCapture: onCapture, onClose: onClose, outline: outline,
                  flashOn: flashOn, findWord: findWord, captureLabel: captureLabel, captureState: captureState,
                  haptics: haptics, thumbnail: thumbnail, onDone: onDone, onSave: onSave, onDiscard: onDiscard,
                  saveHint: saveHint, captureHint: captureHint, flash: flash, permission: permission,
                  closeAsking: closeAsking, actions: { EmptyView() }, preview: preview)
    }

    /// The form of D120 with the app's actions, before `closeAsking` (kept with its signature, CHECKS.md §47.6).
    init<Actions: View>(_ title: String, find: SbCameraFind, pageCount: Int, onCapture: @escaping () -> Void,
                        onClose: @escaping () -> Void, outline: [CGPoint]? = nil, flashOn: Binding<Bool>? = nil,
                        findWord: String? = nil, captureLabel: String? = nil, captureState: SbActionState = .idle,
                        haptics: Bool = true, thumbnail: ((Int) -> Thumb)? = nil, onDone: (() -> Void)? = nil,
                        onSave: (() -> Void)? = nil, onDiscard: (() -> Void)? = nil, saveHint: SbDataPathHint? = nil,
                        captureHint: String? = nil, flash: Binding<SbFlashMode>? = nil,
                        permission: SbCameraPermission = .granted,
                        @ViewBuilder actions: () -> Actions, @ViewBuilder preview: () -> Preview) {
        self.init(title, find: find, pageCount: pageCount, onCapture: onCapture, onClose: onClose, outline: outline,
                  flashOn: flashOn, findWord: findWord, captureLabel: captureLabel, captureState: captureState,
                  haptics: haptics, thumbnail: thumbnail, onDone: onDone, onSave: onSave, onDiscard: onDiscard,
                  saveHint: saveHint, captureHint: captureHint, flash: flash, permission: permission,
                  closeAsking: nil, actions: actions, preview: preview)
    }

    /// The form of D120 without actions, before `closeAsking` (kept with its signature, CHECKS.md §47.6).
    init(_ title: String, find: SbCameraFind, pageCount: Int, onCapture: @escaping () -> Void,
         onClose: @escaping () -> Void, outline: [CGPoint]? = nil, flashOn: Binding<Bool>? = nil,
         findWord: String? = nil, captureLabel: String? = nil, captureState: SbActionState = .idle,
         haptics: Bool = true, thumbnail: ((Int) -> Thumb)? = nil, onDone: (() -> Void)? = nil,
         onSave: (() -> Void)? = nil, onDiscard: (() -> Void)? = nil, saveHint: SbDataPathHint? = nil,
         captureHint: String? = nil, flash: Binding<SbFlashMode>? = nil, permission: SbCameraPermission = .granted,
         @ViewBuilder preview: () -> Preview) {
        self.init(title, find: find, pageCount: pageCount, onCapture: onCapture, onClose: onClose, outline: outline,
                  flashOn: flashOn, findWord: findWord, captureLabel: captureLabel, captureState: captureState,
                  haptics: haptics, thumbnail: thumbnail, onDone: onDone, onSave: onSave, onDiscard: onDiscard,
                  saveHint: saveHint, captureHint: captureHint, flash: flash, permission: permission,
                  closeAsking: nil, actions: { EmptyView() }, preview: preview)
    }
}

/// The words of the question before an unsaved scan is left (D119 (2), D121): „Scan sichern?“ and „Ohne Sichern gehen
/// die 2 Seiten verloren.“ (the singular for one page).
enum SbScanQuestion {
    static func words(_ m: SbMessages, pageCount: Int, locale: Locale) -> (title: String, message: String) {
        (m.scanUnsavedTitle, m.scanUnsavedText(pageCount, SbMessages.formatCount(pageCount, locale: locale)))
    }
}

struct SbScanUnsavedQuestion: ViewModifier {
    let isPresented: Binding<Bool>
    let pageCount: Int
    let saveHint: SbDataPathHint?
    let haptics: Bool
    let onSave: () -> Void
    let onDiscard: () -> Void
    private var context = SbContext()

    init(isPresented: Binding<Bool>, pageCount: Int, saveHint: SbDataPathHint?, haptics: Bool,
         onSave: @escaping () -> Void, onDiscard: @escaping () -> Void) {
        self.isPresented = isPresented
        self.pageCount = pageCount
        self.saveHint = saveHint
        self.haptics = haptics
        self.onSave = onSave
        self.onDiscard = onDiscard
    }

    func body(content: Content) -> some View {
        let w = SbScanQuestion.words(context.messages, pageCount: pageCount, locale: context.currentLocale)
        content.sbUnsavedDialog(isPresented: isPresented, title: w.title, message: w.message, saveHint: saveHint,
                                haptics: haptics, onSave: onSave, onDiscard: onDiscard)
    }
}

public extension View {
    /// The question before an unsaved scan is left (D119 (2), D121): „Scan sichern?“, „Abbrechen“ · „Verwerfen“ ·
    /// „Sichern“, the words of `SbMessages`. The camera's X asks with it; so does the page view of an unsaved scan when
    /// it is left (its back button), which the app's screen around `SbPageView` shows (provisional, agent).
    func sbScanUnsavedDialog(isPresented: Binding<Bool>, pageCount: Int, saveHint: SbDataPathHint? = nil,
                             haptics: Bool = true, onSave: @escaping () -> Void,
                             onDiscard: @escaping () -> Void) -> some View {
        modifier(SbScanUnsavedQuestion(isPresented: isPresented, pageCount: pageCount, saveHint: saveHint,
                                       haptics: haptics, onSave: onSave, onDiscard: onDiscard))
    }
}

/// The pages taken so far (spec/02 §3.32; D106 (20), D107 (7)): small pictures of 40 × 48 pt in a row over the primary
/// action, each the photo as it is with the border hairline and radius control; a page that arrives later comes from
/// below (`sbEnter`; with reduced motion it fades in), the newest carries the 3 pt place line, and the row scrolls to it.
/// Only to look at, no buttons (D107 (7)). For VoiceOver the row is one element with the count („3 Seiten bisher“),
/// announced when it grows. No flash, no sound.
public struct SbCaptureStrip<Thumb: View>: View {
    let count: Int
    let thumbnail: (Int) -> Thumb
    private var context = SbContext()

    public init(count: Int, @ViewBuilder thumbnail: @escaping (Int) -> Thumb) {
        self.count = count
        self.thumbnail = thumbnail
    }

    public var body: some View {
        let m = context.messages
        let words = m.capturedSoFar(count, SbMessages.formatCount(count, locale: context.currentLocale))
        let shape = RoundedRectangle(cornerRadius: SebaroRadius.control, style: .continuous)
        ScrollViewReader { reader in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: SebaroSpace.s2) {
                    ForEach(0..<count, id: \.self) { i in
                        thumbnail(i)
                            .frame(width: SebaroSpace.s10, height: SebaroSpace.s12)
                            .clipShape(shape)
                            .overlay(shape.strokeBorder(context.tone.border, lineWidth: SebaroBorderWidth.hairline))
                            .overlay(alignment: .bottom) {
                                if i == count - 1 { Rectangle().fill(Color.sbAccent).frame(height: SebaroBorderWidth.strong) }
                            }
                            .id(i)
                            .transition(.sbEnter(reduceMotion: context.reduceMotion))
                    }
                }
            }
            .onChange(of: count) {
                withAnimation(SebaroMotion.enter(reduceMotion: context.reduceMotion)) { reader.scrollTo(count - 1, anchor: .trailing) }
                SbAnnounce.polite(words)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(words))
    }
}

/// A corner of a page on a photo, clockwise from the top left (D106 (18)).
public enum SbCorner: Int, CaseIterable, Sendable { case topLeft, topRight, bottomRight, bottomLeft }

/// `corners` with `corner` moved by `dx` and `dy` (fractions of the width and height), kept on the photo.
public func sbMoveCorner(_ corners: [CGPoint], _ corner: SbCorner, dx: CGFloat, dy: CGFloat) -> [CGPoint] {
    corners.enumerated().map { i, p in
        i == corner.rawValue ? CGPoint(x: min(max(p.x + dx, 0), 1), y: min(max(p.y + dy, 0), 1)) : p
    }
}

/// „Ecke oben links, 15 % von links, 18 % von oben“: what VoiceOver hears for a corner.
func sbCornerSentence(_ corners: [CGPoint], _ corner: SbCorner, _ m: SbMessages) -> String {
    let p = corners[corner.rawValue]
    return m.cornerPosition(m.cornerNames[corner.rawValue], String(Int((p.x * 100).rounded())), String(Int((p.y * 100).rounded())))
}

/// Moving the four corners of a page on a photo (spec/02 §3.32; D106 (18), (22); D91 F8a): the `image` with the outline
/// and a handle of 48 pt on each corner, a 20 pt ring in accent on a seam in `bg`, the `selected` one filled with accent.
/// A handle is dragged with a finger, or chosen by a tap and then moved with `SbCornerNudge`'s four buttons or with
/// VoiceOver's adjustable action and custom actions („Nach links schieben“ …), `step` per press (1 %). VoiceOver hears
/// „Ecke oben links, 15 % von links, 18 % von oben“.
public struct SbCornerEditor<Photo: View>: View {
    @Binding var corners: [CGPoint]
    @Binding var selected: SbCorner?
    let step: CGFloat
    let image: Photo
    private var context = SbContext()

    public init(corners: Binding<[CGPoint]>, selected: Binding<SbCorner?>, step: CGFloat = 0.01,
                @ViewBuilder image: () -> Photo) {
        self._corners = corners
        self._selected = selected
        self.step = step
        self.image = image()
    }

    public var body: some View {
        let m = context.messages
        image
            .overlay { SbPhotoOutline(corners) }
            .overlay {
                GeometryReader { g in
                    ForEach(SbCorner.allCases, id: \.self) { corner in
                        if corners.count == 4 {
                            let p = corners[corner.rawValue]
                            let chosen = selected == corner
                            ZStack {
                                Circle().fill(chosen ? Color.sbAccent : context.tone.bg)
                                Circle().strokeBorder(context.tone.bg, lineWidth: SebaroX.layerLineWidth * 3)
                                Circle().strokeBorder(Color.sbAccent, lineWidth: SebaroX.layerLineWidth)
                                    .padding(SebaroX.layerLineWidth)
                            }
                            .frame(width: SebaroSize.iconMd, height: SebaroSize.iconMd)
                            .frame(width: SebaroSize.targetTouch, height: SebaroSize.targetTouch)
                            .contentShape(Rectangle())
                            .position(x: p.x * g.size.width, y: p.y * g.size.height)
                            .gesture(DragGesture(minimumDistance: 0).onChanged { v in
                                selected = corner
                                let to = CGPoint(x: v.location.x / max(g.size.width, 1), y: v.location.y / max(g.size.height, 1))
                                corners = sbMoveCorner(corners, corner, dx: to.x - p.x, dy: to.y - p.y)
                            })
                            .onTapGesture { selected = corner }
                            .accessibilityElement()
                            .accessibilityLabel(Text(sbCornerSentence(corners, corner, m)))
                            .accessibilityAddTraits(chosen ? [.isSelected, .isButton] : .isButton)
                            .accessibilityAction { selected = corner }
                            .accessibilityAction(named: Text(m.moveLeft)) { corners = sbMoveCorner(corners, corner, dx: -step, dy: 0) }
                            .accessibilityAction(named: Text(m.moveRight)) { corners = sbMoveCorner(corners, corner, dx: step, dy: 0) }
                            .accessibilityAction(named: Text(m.moveUp)) { corners = sbMoveCorner(corners, corner, dx: 0, dy: -step) }
                            .accessibilityAction(named: Text(m.moveDown)) { corners = sbMoveCorner(corners, corner, dx: 0, dy: step) }
                        }
                    }
                }
            }
    }
}

/// The way without dragging (D106 (18), D91 F8a): the chosen corner's name with its position over four buttons of 48 pt
/// that move it by `step` („Nach oben schieben“ …); without a chosen corner „Wähle eine Ecke.“ and the buttons disabled.
/// VoiceOver hears the new position after each press.
public struct SbCornerNudge: View {
    @Binding var corners: [CGPoint]
    let selected: SbCorner?
    let step: CGFloat
    private var context = SbContext()

    public init(corners: Binding<[CGPoint]>, selected: SbCorner?, step: CGFloat = 0.01) {
        self._corners = corners
        self.selected = selected
        self.step = step
    }

    public var body: some View {
        let m = context.messages
        VStack(alignment: .leading, spacing: SebaroSpace.s2) {
            SbWrapText(selected.map { sbCornerSentence(corners, $0, m) } ?? m.cornerChoose, style: .body)
                .foregroundStyle(context.tone.text)
            SbWrapRow(spacing: SebaroSpace.s1) {
                nudge("arrow-left", m.moveLeft, dx: -step, dy: 0)
                nudge("arrow-up", m.moveUp, dx: 0, dy: -step)
                nudge("arrow-down", m.moveDown, dx: 0, dy: step)
                nudge("arrow-right", m.moveRight, dx: step, dy: 0)
            }
        }
    }

    private func nudge(_ icon: String, _ label: String, dx: CGFloat, dy: CGFloat) -> some View {
        SbIconButton(icon, label: label) {
            guard let selected else { return }
            corners = sbMoveCorner(corners, selected, dx: dx, dy: dy)
            SbAnnounce.polite(sbCornerSentence(corners, selected, context.messages))
        }
        .disabled(selected == nil)
    }
}

/// A filter of a taken page (D106 (23)).
public enum SbPhotoFilter: CaseIterable, Sendable { case original, grayscale, blackWhite }

/// The filter of a page (spec/02 §3.32; D106 (23)): the words as single-choice chips under the big page, which shows the
/// result at once („Original“, „Graustufen“, „Schwarzweiß“); no small preview pictures. The app applies the filter.
/// D120 (3): `allPages` not nil adds the switch row „Für alle Seiten“ under the words; the app starts it at true and,
/// while it is false, applies the filter only to the page shown. Nil (one page) = no row.
public struct SbFilterChoice: View {
    @Binding var selected: SbPhotoFilter
    let filters: [SbPhotoFilter]
    let allPages: Binding<Bool>?
    private var context = SbContext()

    public init(selected: Binding<SbPhotoFilter>, filters: [SbPhotoFilter] = SbPhotoFilter.allCases,
                allPages: Binding<Bool>? = nil) {
        self._selected = selected
        self.filters = filters
        self.allPages = allPages
    }

    public var body: some View {
        let m = context.messages
        let words = filters.map { f in
            switch f { case .original: m.filterOriginal; case .grayscale: m.filterGrayscale; case .blackWhite: m.filterBlackWhite }
        }
        VStack(alignment: .leading, spacing: SebaroSpace.s2) {
            SbChips(m.filterGroup, labels: words,
                    selected: Binding(get: { Set([filters.firstIndex(of: selected) ?? 0]) },
                                      set: { if let i = $0.first { selected = filters[i] } }),
                    single: true)
            if let allPages { SbSwitchRow(m.filterAllPages, isOn: allPages) }
        }
    }
}

/// A user's photo in a list or grid (spec/02 §3.32; D106 (24)): the `photo` as it is, never dimmed or tinted in dark mode,
/// with the border hairline, radius control, no shadow; `label` under it in caption text-muted („Seite 2“). VoiceOver
/// hears `name` („Seite 2 von „Mietvertrag““), never a guessed description. With `onTap` the whole is one target of at
/// least 48 pt with the pressed fill around the picture. `aspect` = width / height (A4 upright by default). `detail` =
/// a second line under the label in caption text-muted („Graustufen“); `name` nil = the silent form for a picture beside
/// words that already say it (a list row's lead), only without `onTap` (2026-11-01, provisional, agent). The iPhone has
/// no ⋮ on a tile: its menu is the long press the app attaches (`.contextMenu`, D91 I3a; spec/12 §5).
public struct SbPhotoThumb<Photo: View>: View {
    let name: String?
    let label: String?
    let detail: String?
    let onTap: (() -> Void)?
    let aspect: CGFloat
    let beside: Bool
    let photo: Photo
    private var context = SbContext()

    public init(_ name: String?, label: String? = nil, detail: String? = nil, onTap: (() -> Void)? = nil,
                aspect: CGFloat = 210.0 / 297.0, @ViewBuilder photo: () -> Photo) {
        self.init(name, label: label, detail: detail, onTap: onTap, aspect: aspect, beside: false, photo: photo)
    }

    /// `beside` = true (2026-11-01, provisional, agent): the form for large text, the picture at the start (64 pt
    /// wide) and the words beside it at its top, for a list of one column instead of a grid; the app switches to it.
    /// Its own overload without a default (CHECKS.md §47.6), so `SbPhotoThumb<Color>.init(_:label:detail:onTap:aspect:photo:)`
    /// still binds.
    public init(_ name: String?, label: String? = nil, detail: String? = nil, onTap: (() -> Void)? = nil,
                aspect: CGFloat = 210.0 / 297.0, beside: Bool, @ViewBuilder photo: () -> Photo) {
        precondition(name != nil || onTap == nil, "SbPhotoThumb with onTap needs a name")
        self.name = name
        self.label = label
        self.detail = detail
        self.onTap = onTap
        self.aspect = aspect
        self.beside = beside
        self.photo = photo()
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: SebaroRadius.control, style: .continuous)
        let picture = photo
            .aspectRatio(aspect, contentMode: .fit)
            .clipShape(shape)
            .overlay(shape.strokeBorder(context.tone.border, lineWidth: SebaroBorderWidth.hairline))
        let words = VStack(alignment: .leading, spacing: SebaroSpace.s1) {
            if let label { SbWrapText(label, style: .caption).foregroundStyle(context.tone.textMuted) }
            if let detail { SbWrapText(detail, style: .caption).foregroundStyle(context.tone.textMuted).monospacedDigit() }
        }
        let inner = Group {
            if beside {
                HStack(alignment: .top, spacing: SebaroSpace.s3) {
                    picture.frame(width: SebaroSize.targetTouch + SebaroSpace.s4)
                    words.frame(maxWidth: .infinity, alignment: .leading)
                }
            } else {
                VStack(alignment: .leading, spacing: SebaroSpace.s1) {
                    picture
                    words
                }
            }
        }
        .frame(minWidth: SebaroSize.targetTouch, minHeight: SebaroSize.targetTouch)
        Group {
            if let onTap {
                Button(action: onTap) { inner.padding(SebaroSpace.s1).contentShape(Rectangle()) }.buttonStyle(SbFillPressStyle())
            } else {
                inner
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(name ?? ""))
        .accessibilityAddTraits(onTap == nil ? .isImage : [.isImage, .isButton])
        .accessibilityHidden(name == nil)
    }
}

/// The page view's zoom and page arithmetic (spec/02 §4.25.3 steps, D104 (5)–(7)).
public enum SbPageZoom {
    public static let steps = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400]
    public static func zoomOut(_ percent: Int) -> Int? { steps.last { $0 < percent } }
    public static func zoomIn(_ percent: Int) -> Int? { steps.first { $0 > percent } }
    /// A typed page number: inside the pages it jumps, else nil (the field goes back to the page shown).
    public static func page(_ typed: String, count: Int) -> Int? {
        guard let n = Int(typed.trimmingCharacters(in: .whitespaces)), (1...max(count, 1)).contains(n) else { return nil }
        return n
    }
}

/// A document of pages (spec/02 §3.32; D106 (19), D107 (6)): one row of tools over the pages: „Vorige Seite“, the field
/// „Seite [2] von 5“ (a number and Go jumps; a number outside the pages goes back), „Nächste Seite“; „Verkleinern“,
/// the value („100 %“), „Vergrößern“ and „Einpassen“ (VoiceOver hears „eingepasst“ while the page fits the width); the
/// row wraps where it does not fit, the targets stay 48 pt. Under it the pages one under the other on `surfaceSunken`,
/// each on `bg` with a 1 pt border-strong frame, its name under it („Seite 1“); wider than the view, they scroll
/// sideways too. Changing the page jumps (D80). In full screen the app puts it in `SbDarkArea` (D106 (17), D107 (6)).
public struct SbPageView<Page: View>: View {
    let pageCount: Int
    let documentName: String
    let pageWidth: CGFloat?
    let pageAspect: CGFloat
    let page: (Int) -> Page
    private var context = SbContext()
    @State private var zoom = 100
    @State private var fitted = true
    @State private var current = 1
    @State private var typed = "1"
    @State private var target: Int?

    public init(pageCount: Int, documentName: String, pageWidth: CGFloat? = nil, pageAspect: CGFloat = 210.0 / 297.0,
                @ViewBuilder page: @escaping (Int) -> Page) {
        self.pageCount = pageCount
        self.documentName = documentName
        self.pageWidth = pageWidth
        self.pageAspect = pageAspect
        self.page = page
    }

    public var body: some View {
        GeometryReader { g in
            let room = max(g.size.width - 2 * SebaroSpacing.gutter, 1)
            let natural = pageWidth ?? room
            let fit = Int((room / natural * 100).rounded())
            let percent = fitted ? fit : zoom
            let width = fitted ? room : natural * CGFloat(zoom) / 100
            VStack(spacing: 0) {
                bar(percent: percent)
                Rectangle().fill(context.tone.border).frame(height: SebaroBorderWidth.hairline)
                ScrollView([.vertical, .horizontal]) {
                    LazyVStack(spacing: SebaroSpace.s4) {
                        ForEach(0..<pageCount, id: \.self) { i in
                            VStack(spacing: SebaroSpace.s1) {
                                page(i)
                                    .frame(width: width, height: width / pageAspect)
                                    .background(context.tone.bg)
                                    .overlay(Rectangle().strokeBorder(context.tone.borderStrong, lineWidth: SebaroBorderWidth.control))
                                SbWrapText(context.messages.pageName(i + 1), style: .caption).foregroundStyle(context.tone.textMuted)
                            }
                            .id(i + 1)
                        }
                    }
                    .padding(SebaroSpacing.gutter)
                    .scrollTargetLayout()
                }
                .scrollPosition(id: $target, anchor: .top)
                .background(context.tone.surfaceSunken)
                .onChange(of: target) { if let target { current = target; typed = String(target) } }
            }
        }
    }

    private func bar(percent: Int) -> some View {
        let m = context.messages
        let total = SbMessages.formatCount(pageCount, locale: context.currentLocale)
        // every tool is its own part of the row, so the row wraps between tools and nothing leaves the screen (AX5)
        return SbWrapRow(spacing: SebaroSpace.s1) {
            SbIconButton("chevron-left", label: m.pagePrevious) { go(current - 1) }.disabled(current <= 1)
            Text(m.pageWord).sbFont(.caption).fixedSize().frame(minHeight: SebaroSize.targetTouch)
            TextField("", text: $typed)
                .sbFont(.body).monospacedDigit()
                .multilineTextAlignment(.center)
                .frame(minWidth: SebaroSpace.s12, maxWidth: SebaroSpace.s16 * 2, minHeight: SebaroSize.targetTouch)
                .fixedSize(horizontal: true, vertical: false)
                .background(context.tone.surfaceSunken, in: RoundedRectangle(cornerRadius: SebaroRadius.control))
                .submitLabel(.go)
                .onSubmit { if let n = SbPageZoom.page(typed, count: pageCount) { go(n) } else { typed = String(current) } }
                .accessibilityLabel(Text(m.pageFieldName(total)))
                #if os(iOS)
                // digits with a return key: the number pad has none, so Go (onSubmit) could not be pressed on an iPhone
                .keyboardType(.numbersAndPunctuation)
                #endif
            Text(m.pageOfTotal(total)).sbFont(.caption).fixedSize().frame(minHeight: SebaroSize.targetTouch)
            SbIconButton("chevron-right", label: m.pageNext) { go(current + 1) }.disabled(current >= pageCount)
            SbIconButton("zoom-out", label: m.zoomOut) {
                if let z = SbPageZoom.zoomOut(percent) { zoom = z; fitted = false }
            }
            Text(SbMessages.formatCount(percent, locale: context.currentLocale) + "\u{00A0}%")
                .sbFont(.caption).monospacedDigit().fixedSize().frame(minHeight: SebaroSize.targetTouch)
                .accessibilityLabel(Text(m.zoomValue(SbMessages.formatCount(percent, locale: context.currentLocale) + "\u{00A0}%")))
            SbIconButton("zoom-in", label: m.zoomIn) {
                if let z = SbPageZoom.zoomIn(percent) { zoom = z; fitted = false }
            }
            SbIconButton("zoom-fit", label: m.zoomFit) { fitted = true }
                .accessibilityValue(Text(fitted ? m.zoomFitted : ""))
        }
        .foregroundStyle(context.tone.text)
        .padding(.horizontal, SebaroSpace.s1)
    }

    private func go(_ n: Int) {
        let to = min(max(n, 1), max(pageCount, 1))
        target = to   // jumps, no glide (D80)
        current = to
        typed = String(to)
    }
}
