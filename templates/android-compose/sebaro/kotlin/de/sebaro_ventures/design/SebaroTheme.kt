// generated — do not edit.
// sebaroDesign token contract 1.14 · draft "sebaro" · palette "sebaro"
// source: systems/sebaro/tokens/tokens.json (sha256 1ce6b8c317aefd2e)
//         palettes/sebaro.json (sha256 17200a17be172cdd)
// builder: tools/build_tokens.py 1.14.0 · spec: shared/TOKEN-CONTRACT.md
// Compose bridge: SebaroTheme { } fills MaterialTheme (colorScheme, typography, shapes) and provides
// SebaroTheme.colors / .typography / .tokens / .dataviz for everything Material 3 has no slot for.
// Material 3 mapping target: material3 1.3 (no fixed roles; build with --m3 1.4 for material3 >= 1.4.0).

@file:Suppress("MagicNumber", "LongMethod", "LargeClass", "TooManyFunctions", "MaxLineLength", "unused")

package de.sebaro_ventures.design

import android.animation.ValueAnimator
import android.content.ContentResolver
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

/** Contract and draft this file was generated from. */
object SebaroBuildInfo {
    const val CONTRACT: String = "1.14"
    const val DRAFT: String = "sebaro"
    const val PALETTE: String = "sebaro"
    const val FOCUS_FOLLOWS_ACCENT: Boolean = false
}

// ================================================================== colours

/** All palette-contract colour roles for one mode (product accent applied). */
@Immutable
data class SebaroColors(
    /** `bg`: page / window background */
    val bg: Color,
    /** `surface`: default container: cards, panels, sidebars */
    val surface: Color,
    /** `surface-raised`: elevated container: menus, popovers, dialogs, sheets */
    val surfaceRaised: Color,
    /** `surface-sunken`: inset area: wells, code blocks, input fill, table stripes */
    val surfaceSunken: Color,
    /** `text`: primary text and icons */
    val text: Color,
    /** `text-muted`: secondary text: labels, captions, metadata, placeholders */
    val textMuted: Color,
    /** `text-subtle`: RESTRICTED: large text (>= 24px, >= 18.66px bold) or disabled/decorative text only */
    val textSubtle: Color,
    /** `border`: decorative hairline: dividers, outlines that carry no meaning */
    val border: Color,
    /** `border-strong`: interactive boundary: inputs, checkboxes, toggles (>= 3:1) */
    val borderStrong: Color,
    /** `accent`: brand fill: primary button, selected indicator, active switch */
    val accent: Color,
    /** `accent-hover`: hover state of accent */
    val accentHover: Color,
    /** `accent-pressed`: pressed state of accent */
    val accentPressed: Color,
    /** `on-accent`: content on accent, accent-hover, accent-pressed */
    val onAccent: Color,
    /** `accent-subtle`: tinted fill: selected row, tonal button, chip (never the only state cue) */
    val accentSubtle: Color,
    /** `text-on-accent-subtle`: content on accent-subtle */
    val textOnAccentSubtle: Color,
    /** `focus`: focus ring (2px + 2px offset) */
    val focus: Color,
    /** `success`: success fill / icon colour (always with icon + word) */
    val success: Color,
    /** `on-success`: content on the success fill */
    val onSuccess: Color,
    /** `success-subtle`: tinted success background: alerts, banners */
    val successSubtle: Color,
    /** `text-on-success-subtle`: text on success-subtle */
    val textOnSuccessSubtle: Color,
    /** `warning`: warning fill / icon colour (always with icon + word) */
    val warning: Color,
    /** `on-warning`: content on the warning fill */
    val onWarning: Color,
    /** `warning-subtle`: tinted warning background: alerts, banners */
    val warningSubtle: Color,
    /** `text-on-warning-subtle`: text on warning-subtle */
    val textOnWarningSubtle: Color,
    /** `danger`: danger fill / icon colour (always with icon + word) */
    val danger: Color,
    /** `on-danger`: content on the danger fill */
    val onDanger: Color,
    /** `danger-subtle`: tinted danger background: alerts, banners */
    val dangerSubtle: Color,
    /** `text-on-danger-subtle`: text on danger-subtle */
    val textOnDangerSubtle: Color,
    /** `info`: info fill / icon colour (always with icon + word) */
    val info: Color,
    /** `on-info`: content on the info fill */
    val onInfo: Color,
    /** `info-subtle`: tinted info background: alerts, banners */
    val infoSubtle: Color,
    /** `text-on-info-subtle`: text on info-subtle */
    val textOnInfoSubtle: Color,
    /** `selection`: text selection highlight (alpha) */
    val selection: Color,
    /** `scrim`: modal backdrop (alpha) */
    val scrim: Color,
    /** `link`: inline link */
    val link: Color,
    /** `link-visited`: visited inline link */
    val linkVisited: Color,
    /** `primary-action`: fill of the one primary action per view ('Hauptaktion', lime; at most one per view, always at the bottom, D39) */
    val primaryAction: Color,
    /** `primary-action-hover`: hover fill of the primary action */
    val primaryActionHover: Color,
    /** `primary-action-pressed`: pressed fill of the primary action */
    val primaryActionPressed: Color,
    /** `on-primary-action`: label and icon on the primary action (neutral ink, never the brand colour) */
    val onPrimaryAction: Color,
    /** `primary-action-outline`: 2 px boundary of the primary action: light mode ink outline (the lime fill has only 1.34:1 against bg), dark mode the fill itself (D40) */
    val primaryActionOutline: Color,
    /** `hover-fill`: hover fill of rows, list items and quiet controls (one step away from the ground; in dark mode lighter than bg, never darker, so a hover never reads as a hole) */
    val hoverFill: Color,
    /** `pressed-fill`: pressed fill of quiet controls, slightly beyond hover in the same direction; both regular and muted text pass 4.5:1 in both modes. Dark danger text also passes (4.55:1). */
    val pressedFill: Color,
)

/** Light mode, core (umbrella) accent. */
val SebaroLightColors: SebaroColors = SebaroColors(
    bg = Color(0xFFF4F5F8),
    surface = Color(0xFFFBFCFE),
    surfaceRaised = Color(0xFFFFFFFF),
    surfaceSunken = Color(0xFFE9EBEE),
    text = Color(0xFF1C1E22),
    textMuted = Color(0xFF66696E),
    textSubtle = Color(0xFF828589),
    border = Color(0xFFD7D9DD),
    borderStrong = Color(0xFF84868A),
    accent = Color(0xFF3057B1),
    accentHover = Color(0xFF2348A1),
    accentPressed = Color(0xFF163991),
    onAccent = Color(0xFFFFFFFF),
    accentSubtle = Color(0xFFDAEAFF),
    textOnAccentSubtle = Color(0xFF304B83),
    focus = Color(0xFF3057B1),
    success = Color(0xFF07662E),
    onSuccess = Color(0xFFFFFFFF),
    successSubtle = Color(0xFFDEF6E2),
    textOnSuccessSubtle = Color(0xFF005821),
    warning = Color(0xFFBE5A0A),
    onWarning = Color(0xFFFFFFFF),
    warningSubtle = Color(0xFFFFE7D7),
    textOnWarningSubtle = Color(0xFF782E00),
    danger = Color(0xFFAF2A27),
    onDanger = Color(0xFFFFFFFF),
    dangerSubtle = Color(0xFFFFE5E0),
    textOnDangerSubtle = Color(0xFF7C2621),
    info = Color(0xFF33485D),
    onInfo = Color(0xFFFFFFFF),
    infoSubtle = Color(0xFFE8EFF7),
    textOnInfoSubtle = Color(0xFF354A5F),
    selection = Color(0x403057B1),
    scrim = Color(0x521C1E22),
    link = Color(0xFF254BA4),
    linkVisited = Color(0xFF4A6076),
    primaryAction = Color(0xFFA9E773),
    primaryActionHover = Color(0xFF9DD966),
    primaryActionPressed = Color(0xFF90CC59),
    onPrimaryAction = Color(0xFF1C1E22),
    primaryActionOutline = Color(0xFF1C1E22),
    hoverFill = Color(0xFFE9EBEE),
    pressedFill = Color(0xFFE7E9EC),
)

/** Dark mode, core (umbrella) accent. */
val SebaroDarkColors: SebaroColors = SebaroColors(
    bg = Color(0xFF13161C),
    surface = Color(0xFF1B1E24),
    surfaceRaised = Color(0xFF212429),
    surfaceSunken = Color(0xFF090C11),
    text = Color(0xFFEBEDEF),
    textMuted = Color(0xFF9D9EA1),
    textSubtle = Color(0xFF797A7D),
    border = Color(0xFF32353C),
    borderStrong = Color(0xFF707379),
    accent = Color(0xFF89B1FA),
    accentHover = Color(0xFF95BEFF),
    accentPressed = Color(0xFFA7CBFF),
    onAccent = Color(0xFF101114),
    accentSubtle = Color(0xFF202E47),
    textOnAccentSubtle = Color(0xFFAECBFF),
    focus = Color(0xFF89B1FA),
    success = Color(0xFF439C5B),
    onSuccess = Color(0xFF101114),
    successSubtle = Color(0xFF19301E),
    textOnSuccessSubtle = Color(0xFFAADDB3),
    warning = Color(0xFFF59258),
    onWarning = Color(0xFF101114),
    warningSubtle = Color(0xFF3C2315),
    textOnWarningSubtle = Color(0xFFFCBE9D),
    danger = Color(0xFFE66761),
    onDanger = Color(0xFF101114),
    dangerSubtle = Color(0xFF3E211F),
    textOnDangerSubtle = Color(0xFFFFB7B0),
    info = Color(0xFFC8DDF5),
    onInfo = Color(0xFF101114),
    infoSubtle = Color(0xFF252B31),
    textOnInfoSubtle = Color(0xFFC3CFDD),
    selection = Color(0x5989B1FA),
    scrim = Color(0x99000000),
    link = Color(0xFF8FB7FF),
    linkVisited = Color(0xFFA8C1DA),
    primaryAction = Color(0xFFA9E277),
    primaryActionHover = Color(0xFFB6ED88),
    primaryActionPressed = Color(0xFF99D267),
    onPrimaryAction = Color(0xFF101114),
    primaryActionOutline = Color(0xFFA9E277),
    hoverFill = Color(0xFF212429),
    pressedFill = Color(0xFF25282F),
)

/**
 * Colour tone (palette `variants`, D90): the choice „Farbton“ in the settings next to Hell/Dunkel. A tone
 * replaces only grey roles (grounds, text, lines, hover/pressed); cobalt, lime, status, tiles stay.
 */
enum class SebaroTone(val id: String) {
    Cool("cool"),
    /** Papier („Warm“) */
    Warm("warm");

    companion object {
        /** Look up a tone by its stored id; unknown ids fall back to the base tone. */
        fun fromId(id: String?): SebaroTone = entries.firstOrNull { it.id == id } ?: Cool
    }
}

/** Light mode, tone warm (Papier). */
val SebaroWarmLightColors: SebaroColors = SebaroLightColors.copy(
    bg = Color(0xFFFBF4EA),
    surface = Color(0xFFFFFBF5),
    surfaceRaised = Color(0xFFFFFFFB),
    surfaceSunken = Color(0xFFF3EADC),
    text = Color(0xFF231C18),
    textMuted = Color(0xFF6F675F),
    textSubtle = Color(0xFF8B837B),
    border = Color(0xFFE0D8CC),
    borderStrong = Color(0xFF8B857C),
    scrim = Color(0x52231C18),
    hoverFill = Color(0xFFF3EADC),
    pressedFill = Color(0xFFF1E8DA),
    onPrimaryAction = Color(0xFF231C18),
    primaryActionOutline = Color(0xFF231C18),
)

/** Dark mode, tone warm (Papier). */
val SebaroWarmDarkColors: SebaroColors = SebaroDarkColors.copy(
    bg = Color(0xFF1B140F),
    surface = Color(0xFF241C16),
    surfaceRaised = Color(0xFF29221D),
    surfaceSunken = Color(0xFF100B07),
    text = Color(0xFFF3EBE8),
    textMuted = Color(0xFFA69C96),
    textSubtle = Color(0xFF817873),
    border = Color(0xFF3B332D),
    borderStrong = Color(0xFF7A716A),
    scrim = Color(0x99000000),
    hoverFill = Color(0xFF2A221C),
    pressedFill = Color(0xFF2E2620),
    onPrimaryAction = Color(0xFF101114),
    primaryActionOutline = Color(0xFFA9E277),
)

/** The core colour set of a tone and mode (before a product accent, if any). */
fun sebaroColors(tone: SebaroTone, dark: Boolean): SebaroColors = when (tone) {
    SebaroTone.Cool -> if (dark) SebaroDarkColors else SebaroLightColors
    SebaroTone.Warm -> if (dark) SebaroWarmDarkColors else SebaroWarmLightColors
}

/**
 * A product: its id and the group of its sign tile (D54); there are no product accents. A product the
 * system does not list constructs its own, `SebaroProduct("<id>", SebaroSignTile.<Group>)`. The constants
 * are the products of the palette's `signTiles.productMap`; until contract 1.13 this was an enum of them.
 */
@Immutable
class SebaroProduct(val id: String, val tile: SebaroSignTile) {
    /** The id in PascalCase ("my-app" gives "MyApp"): the name of its constant, as the enum's `name`. */
    val name: String = id.split('-', '_', '.').joinToString("") { it.replaceFirstChar(Char::uppercaseChar) }

    override fun equals(other: Any?): Boolean = other is SebaroProduct && other.id == id && other.tile == tile

    override fun hashCode(): Int = 31 * id.hashCode() + tile.hashCode()

    override fun toString(): String = name

    companion object {
        val Studio = SebaroProduct(id = "studio", tile = SebaroSignTile.Studio)

        /** The listed products, in the order of the palette's map. */
        val entries: List<SebaroProduct> = listOf(Studio)

        /** Look up a listed product by id (androidFactory passes the id, not a colour); throws for unknown ids. */
        fun fromId(id: String): SebaroProduct = entries.firstOrNull { it.id == id }
            ?: throw IllegalArgumentException(
                "Unknown sebaro product '$id'. Allowed: " + entries.joinToString { it.id },
            )
    }
}

/**
 * App-sign tiles (palette `signTiles`, PALETTE-CONTRACT 2.2 §8.2, D50, D51): tile and sign colour per purpose
 * group, the same in light and dark mode. For app signs and the fixed product-area moments of D143/D144.
 */
enum class SebaroSignTile(val id: String, val displayName: String, val label: String, val tile: Color, val glyph: Color) {
    Studio(id = "studio", displayName = "Kobalt", label = "Studio", tile = Color(0xFF3057B1), glyph = Color(0xFFFFFFFF)),
    Collaboration(id = "collaboration", displayName = "Petrol", label = "Zusammenarbeit & Schreiben", tile = Color(0xFF0F8186), glyph = Color(0xFFFFFFFF)),
    Everyday(id = "everyday", displayName = "Magenta", label = "Alltag & Gesundheit", tile = Color(0xFFA80C5D), glyph = Color(0xFFFFFFFF)),
    Learning(id = "learning", displayName = "Violett", label = "Lernen & Entwickeln", tile = Color(0xFF7154CE), glyph = Color(0xFFFFFFFF)),
    Tools(id = "tools", displayName = "Orange", label = "Werkzeuge", tile = Color(0xFFC95100), glyph = Color(0xFFFFFFFF)),
    Media(id = "media", displayName = "Ziegel", label = "Medien & Kreativ", tile = Color(0xFFB62A12), glyph = Color(0xFFFFFFFF)),
    Money(id = "money", displayName = "Grün", label = "Geld & Haushalt", tile = Color(0xFF1E7942), glyph = Color(0xFFFFFFFF)),
    System(id = "system", displayName = "Azur", label = "System & Sicherheit", tile = Color(0xFF1A89C5), glyph = Color(0xFFFFFFFF));

    /** The products whose sign sits on this tile, in signTiles.productMap order (empty for a spare group). */
    val products: List<String>
        get() = PRODUCTS.filterValues { it == this }.keys.toList()

    companion object {
        private val PRODUCTS: Map<String, SebaroSignTile> by lazy {
            mapOf("studio" to Studio)
        }

        /** Look up a group by id; throws for ids outside the checked set. */
        fun fromId(id: String): SebaroSignTile = entries.firstOrNull { it.id == id }
            ?: throw IllegalArgumentException(
                "Unknown sebaro sign tile '$id'. Allowed: " + entries.joinToString { it.id },
            )

        /** The tile of a product key; throws for a product without a tile. */
        fun forProduct(key: String): SebaroSignTile = PRODUCTS[key]
            ?: throw IllegalArgumentException(
                "No sebaro sign tile for product '$key'. Products: " + PRODUCTS.keys.joinToString(),
            )
    }
}

object SebaroSignFoot {
    val band: Color = Color(0xFFA9E773)
    val line: Color = Color(0xFF1C1E22)
}

/** Chart colours (palette `dataviz`); always pair with labels or patterns. */
@Immutable
data class SebaroDataviz(
    val categorical: List<Color>,
    val sequential: List<Color>,
    val diverging: List<Color>,
)

val SebaroLightDataviz: SebaroDataviz = SebaroDataviz(
    categorical = listOf(Color(0xFF1F1F1F), Color(0xFFAB8704), Color(0xFF089772), Color(0xFFD06482), Color(0xFF2698C8), Color(0xFF0B3C2B)),
    sequential = listOf(Color(0xFF5C8AB3), Color(0xFF45658A), Color(0xFF294374), Color(0xFF1C2130)),
    diverging = listOf(Color(0xFF965038), Color(0xFFBB7454), Color(0xFFD7D9DD), Color(0xFF4390A2), Color(0xFF256B7F)),
)

val SebaroDarkDataviz: SebaroDataviz = SebaroDataviz(
    categorical = listOf(Color(0xFFF8F8F8), Color(0xFFFCC959), Color(0xFF5ADDC7), Color(0xFFAF7280), Color(0xFF2591C4), Color(0xFF1C7B5A)),
    sequential = listOf(Color(0xFF3C729E), Color(0xFF7295BC), Color(0xFFAFBED4), Color(0xFFEAEFFE)),
    diverging = listOf(Color(0xFFCA7F67), Color(0xFFA05C3D), Color(0xFF32353C), Color(0xFF0A7989), Color(0xFF599AB1)),
)

/** Code colours (palette `syntax`, D67): code that no role names stays in `colors.text`, comments in `colors.textMuted` (spec/01 §1.8). */
@Immutable
data class SebaroSyntax(
    /** Schlüsselwörter, Annotationen, Tags und At-Regeln */
    val keyword: Color,
    /** Zeichenketten, reguläre Ausdrücke und Attributwerte */
    val string: Color,
    /** Zahlen, Wahrheitswerte, null, Konstanten und Escape-Sequenzen */
    val constant: Color,
)

val SebaroLightSyntax: SebaroSyntax = SebaroSyntax(
    keyword = Color(0xFF54258C),
    string = Color(0xFF1B490F),
    constant = Color(0xFF951D52),
)

val SebaroDarkSyntax: SebaroSyntax = SebaroSyntax(
    keyword = Color(0xFFBC98F9),
    string = Color(0xFF7BB76E),
    constant = Color(0xFFFAA6B2),
)

/**
 * One category tone (palette `categories`, D73): only as a dot or glyph next to the word, never a fill,
 * never text colour, never for states the app assigns. [number] is the order an app offers the tones in;
 * [name] is the accessible name in a colour choice.
 */
@Immutable
data class SebaroCategory(val number: Int, val name: String, val color: Color)

val SebaroLightCategories: List<SebaroCategory> = listOf(
    SebaroCategory(1, "Tanne", Color(0xFF486654)),
    SebaroCategory(2, "Jade", Color(0xFF4B916B)),
    SebaroCategory(3, "Taube", Color(0xFF767EA0)),
    SebaroCategory(4, "Veilchen", Color(0xFF67548E)),
    SebaroCategory(5, "Messing", Color(0xFF88763F)),
    SebaroCategory(6, "Malve", Color(0xFF975C78)),
)

val SebaroDarkCategories: List<SebaroCategory> = listOf(
    SebaroCategory(1, "Tanne", Color(0xFF8DD3B1)),
    SebaroCategory(2, "Jade", Color(0xFF71AF88)),
    SebaroCategory(3, "Taube", Color(0xFF8192CF)),
    SebaroCategory(4, "Veilchen", Color(0xFFBD9FDC)),
    SebaroCategory(5, "Messing", Color(0xFFD2BD77)),
    SebaroCategory(6, "Malve", Color(0xFFC07D9F)),
)

/** Text highlight and search hit (palette `mark`, D73): [fill] behind the text, a 2 dp [edge] at its bottom; the current hit takes a 3 dp edge in `colors.text`. */
@Immutable
data class SebaroMark(
    val fill: Color,
    val edge: Color,
)

val SebaroLightMark: SebaroMark = SebaroMark(fill = Color(0xFFFFF198), edge = Color(0xFF8D894E))
val SebaroDarkMark: SebaroMark = SebaroMark(fill = Color(0xFF3E3600), edge = Color(0xFFE3B831))

// ================================================================== Material 3 colour mapping

/** Maps the palette roles onto Material 3 (TOKEN-CONTRACT §11). */
fun sebaroColorScheme(light: SebaroColors, dark: SebaroColors, isDark: Boolean): ColorScheme {
    val c = if (isDark) dark else light
    val inv = if (isDark) light else dark
    return if (isDark) {
        darkColorScheme(
            primary = c.accent,
            onPrimary = c.onAccent,
            primaryContainer = c.accentSubtle,
            onPrimaryContainer = c.textOnAccentSubtle,
            inversePrimary = inv.accent,
            secondary = c.accent,
            onSecondary = c.onAccent,
            secondaryContainer = c.accentSubtle,
            onSecondaryContainer = c.textOnAccentSubtle,
            tertiary = c.info,
            onTertiary = c.onInfo,
            tertiaryContainer = c.infoSubtle,
            onTertiaryContainer = c.textOnInfoSubtle,
            background = c.bg,
            onBackground = c.text,
            surface = c.bg,
            onSurface = c.text,
            surfaceVariant = c.surfaceSunken,
            onSurfaceVariant = c.textMuted,
            surfaceTint = c.bg,
            inverseSurface = inv.surfaceRaised,
            inverseOnSurface = inv.text,
            error = c.danger,
            onError = c.onDanger,
            errorContainer = c.dangerSubtle,
            onErrorContainer = c.textOnDangerSubtle,
            outline = c.borderStrong,
            outlineVariant = c.border,
            scrim = c.scrim,
            surfaceBright = c.surfaceRaised,
            surfaceContainer = c.surface,
            surfaceContainerHigh = c.surfaceRaised,
            surfaceContainerHighest = c.surfaceSunken,
            surfaceContainerLow = c.surface,
            surfaceContainerLowest = c.bg,
            surfaceDim = c.surfaceSunken,
        )
    } else {
        lightColorScheme(
            primary = c.accent,
            onPrimary = c.onAccent,
            primaryContainer = c.accentSubtle,
            onPrimaryContainer = c.textOnAccentSubtle,
            inversePrimary = inv.accent,
            secondary = c.accent,
            onSecondary = c.onAccent,
            secondaryContainer = c.accentSubtle,
            onSecondaryContainer = c.textOnAccentSubtle,
            tertiary = c.info,
            onTertiary = c.onInfo,
            tertiaryContainer = c.infoSubtle,
            onTertiaryContainer = c.textOnInfoSubtle,
            background = c.bg,
            onBackground = c.text,
            surface = c.bg,
            onSurface = c.text,
            surfaceVariant = c.surfaceSunken,
            onSurfaceVariant = c.textMuted,
            surfaceTint = c.bg,
            inverseSurface = inv.surfaceRaised,
            inverseOnSurface = inv.text,
            error = c.danger,
            onError = c.onDanger,
            errorContainer = c.dangerSubtle,
            onErrorContainer = c.textOnDangerSubtle,
            outline = c.borderStrong,
            outlineVariant = c.border,
            scrim = c.scrim,
            surfaceBright = c.surfaceRaised,
            surfaceContainer = c.surface,
            surfaceContainerHigh = c.surfaceRaised,
            surfaceContainerHighest = c.surfaceSunken,
            surfaceContainerLow = c.surface,
            surfaceContainerLowest = c.bg,
            surfaceDim = c.surfaceSunken,
        )
    }
}

// ================================================================== typography

/**
 * Font families are injected, not generated: R.font ids belong to the consuming module. Bundle the
 * brand fonts as static TTFs in res/font (minSdk < 26 has no variable fonts) and pass your own.
 * - ui: sebaro Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif
 * - display: sebaro Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif
 * - mono: sebaro Mono, ui-monospace, SFMono-Regular, Menlo, monospace
 * Weights the mobile typography uses in light and dark mode. Register one static Font(R.font.…,
 * FontWeight(n)) per weight: Compose matches the nearest bundled weight and never interpolates, so
 * a missing instance (e.g. a 570 dark override) renders as its neighbour (TOKEN-CONTRACT §8.1):
 * - ui: 400, 430, 570, 600, 670, 700
 * - display: 670, 700
 * - mono: 500
 */
@Immutable
data class SebaroFonts(val ui: FontFamily, val display: FontFamily, val mono: FontFamily) {
    companion object {
        /** Platform fallbacks until the brand fonts are bundled. */
        val Default: SebaroFonts = SebaroFonts(ui = FontFamily.SansSerif, display = FontFamily.SansSerif, mono = FontFamily.Monospace)
        const val UI_FAMILY: String = "sebaro Sans"
        const val DISPLAY_FAMILY: String = "sebaro Sans"
        const val MONO_FAMILY: String = "sebaro Mono"
    }
}

/** Contract typography roles (mobile values, sp) for one mode. */
@Immutable
data class SebaroTypography(
    val display: TextStyle,
    val headline: TextStyle,
    val title: TextStyle,
    val body: TextStyle,
    val bodyStrong: TextStyle,
    val label: TextStyle,
    val caption: TextStyle,
    val code: TextStyle,
    val numeric: TextStyle,
    val labelSmall: TextStyle,
)

/**
 * Text styles for the given fonts and mode (mobile typography, TOKEN-CONTRACT §8.2 and §9).
 * [dark] applies the draft's dark overrides; SebaroTheme passes its darkTheme.
 */
fun sebaroTypography(fonts: SebaroFonts = SebaroFonts.Default, dark: Boolean = false): SebaroTypography = SebaroTypography(
    display = TextStyle(fontFamily = fonts.display, fontWeight = if (dark) FontWeight(700) else FontWeight(670), fontSize = 32.sp, lineHeight = 40.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    headline = TextStyle(fontFamily = fonts.display, fontWeight = if (dark) FontWeight(700) else FontWeight(670), fontSize = 24.sp, lineHeight = 32.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    title = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(700) else FontWeight(670), fontSize = 20.sp, lineHeight = 28.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    body = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(430) else FontWeight(400), fontSize = 16.sp, lineHeight = 24.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    bodyStrong = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(600) else FontWeight(570), fontSize = 16.sp, lineHeight = 24.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    label = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(600) else FontWeight(570), fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    caption = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(430) else FontWeight(400), fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    code = TextStyle(fontFamily = fonts.mono, fontWeight = FontWeight(500), fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = if (dark) 0.01.em else 0.em),
    numeric = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(430) else FontWeight(400), fontSize = 16.sp, lineHeight = 24.sp, letterSpacing = if (dark) 0.01.em else 0.em, fontFeatureSettings = "tnum"),
    labelSmall = TextStyle(fontFamily = fonts.ui, fontWeight = if (dark) FontWeight(430) else FontWeight(400), fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = if (dark) 0.01.em else 0.em),
)

/** Fills the 15 Material 3 slots from the contract roles (TOKEN-CONTRACT §11.2). */
fun SebaroTypography.toMaterialTypography(): Typography = Typography(
    displayLarge = display,
    displayMedium = display,
    displaySmall = display,
    headlineLarge = headline,
    headlineMedium = headline,
    headlineSmall = headline,
    titleLarge = title,
    titleMedium = title,
    titleSmall = title,
    bodyLarge = body,
    bodyMedium = body,
    bodySmall = caption,
    labelLarge = label,
    labelMedium = labelSmall,
    labelSmall = labelSmall,
)

// ================================================================== tokens

/** One shadow layer (CSS box-shadow semantics; Compose has no layered shadows). */
@Immutable
data class SebaroShadow(
    val color: Color,
    val offsetX: Dp,
    val offsetY: Dp,
    val blur: Dp,
    val spread: Dp,
    val inset: Boolean,
)

/** Border composite. */
@Immutable
data class SebaroBorder(
    val color: Color,
    val width: Dp,
    val style: String,
)

/** How one elevation role is expressed in this draft. */
@Immutable
data class SebaroElevationLevel(
    /** fill (a surface role) */
    val surface: Color,
    val borderColor: Color,
    /** 0.dp = no border */
    val borderWidth: Dp,
    /** CSS-equivalent layers (empty = none) */
    val shadowLayers: List<SebaroShadow>,
    /** native shadow for Modifier.shadow / Surface(shadowElevation) */
    val shadowElevation: Dp,
)

/** Elevation roles level-0..3 and overlay. */
@Immutable
data class SebaroElevation(
    val level0: SebaroElevationLevel,
    val level1: SebaroElevationLevel,
    val level2: SebaroElevationLevel,
    val level3: SebaroElevationLevel,
    val overlay: SebaroElevationLevel,
)

/** Radius roles as shapes. */
@Immutable
data class SebaroShapes(
    val small: RoundedCornerShape,
    val control: RoundedCornerShape,
    val container: RoundedCornerShape,
    val sheet: RoundedCornerShape,
    val pill: RoundedCornerShape,
)

/** The 4px space scale (sN = N x 4dp). */
@Immutable
data class SebaroSpace(
    val s0: Dp,
    val s0_5: Dp,
    val s1: Dp,
    val s2: Dp,
    val s3: Dp,
    val s4: Dp,
    val s5: Dp,
    val s6: Dp,
    val s8: Dp,
    val s10: Dp,
    val s12: Dp,
    val s16: Dp,
)

/** Semantic spacing roles. */
@Immutable
data class SebaroSpacing(
    val inline: Dp,
    val stack: Dp,
    val group: Dp,
    val insetControl: Dp,
    val insetContainer: Dp,
    val gutter: Dp,
    val gutterWide: Dp,
    val section: Dp,
    val sectionWide: Dp,
)

/** Radius roles. */
@Immutable
data class SebaroRadius(
    /** tags, badges, checkboxes, inline code */
    val small: Dp,
    /** buttons incl. the primary action, fields, segmented controls */
    val control: Dp,
    /** cards, panels, menus, popovers */
    val container: Dp,
    /** dialogs, bottom sheets */
    val sheet: Dp,
    /** switch track and thumb, radio dot */
    val pill: Dp,
)

/** Border widths. */
@Immutable
data class SebaroBorderWidth(
    /** dividers and card outlines with color.border */
    val hairline: Dp,
    /** field baselines and control outlines with color.border-strong */
    val control: Dp,
    /** the current-place edge (selected tab, nav item, claim row) in color.accent */
    val strong: Dp,
)

/** Focus ring geometry (colour: SebaroTheme.colors.focus). */
@Immutable
data class SebaroFocus(
    val width: Dp,
    val offset: Dp,
)

/** Durations in ms, easing curves. */
@Immutable
data class SebaroMotion(
    val durationShort: Int,
    val durationMedium: Int,
    val durationLong: Int,
    val easingStandard: Easing,
    val easingEmphasized: Easing,
    val easingExit: Easing,
)

/** Targets, icons, controls, measures. */
@Immutable
data class SebaroSize(
    val targetTouch: Dp,
    val targetPointer: Dp,
    val iconSm: Dp,
    val iconMd: Dp,
    val iconLg: Dp,
    /** compact pointer controls (desktop tables, toolbars) */
    val controlSm: Dp,
    /** buttons, fields, list rows on touch */
    val controlMd: Dp,
    /** the primary action at the bottom of a view (D39), claim rows */
    val controlLg: Dp,
    /** German running text: 60-70 characters per line */
    val measureProse: Float,
    val containerMax: Dp,
)

/** Stacking order (Modifier.zIndex). */
@Immutable
data class SebaroLayer(
    val sticky: Float,
    val dropdown: Float,
    val overlay: Float,
    val modal: Float,
    val popover: Float,
    val toast: Float,
    val tooltip: Float,
)

/** Web breakpoints (Compose uses WindowSizeClass). */
@Immutable
data class SebaroBreakpoint(
    val sm: Dp,
    val lg: Dp,
)

/** State and disabled opacities. */
@Immutable
data class SebaroOpacity(
    /** No tokens in this group for this draft. */
    val none: Unit = Unit,
)

/** Component tier (aliases of semantic tokens). */
@Immutable
data class SebaroComponentTokens(
    /** No tokens in this group for this draft. */
    val none: Unit = Unit,
)

/** Draft-specific signature tokens (x-sebaro). */
@Immutable
data class SebaroX(
    /** Boundary of the primary action in color.primary-action-outline: 2 px ink by day (the lime fill has 1.34:1 against bg), the fill colour itself at night (D40). */
    val primaryActionOutlineWidth: Dp,
    /** D48 (1): the bar inside the busy primary action, along its bottom edge, in color.on-primary-action (lime on bg is 1.34:1, so the bar is ink on lime). */
    val primaryActionProgressHeight: Dp,
    /** One sweep of the indeterminate bar (unknown duration). Kept under reduced motion so the period never strobes; the CSS and Compose stop the sweep and show a still bar instead (D48). */
    val primaryActionProgressPeriod: Int,
    /** How long the label „✓ <done>“ stays before the action returns to its normal label (D48); a dwell time, not movement. */
    val primaryActionDoneDwell: Int,
    /** Corner radius of the app-sign tile as a share of its edge (8 px at 48 px). Rounded like the owner's bild-1 (sketch C); brand.config.json signs.tile.radius. */
    val signTileRadiusRatio: Float,
    /** Edge of the app-sign tile in lists, cards and headers (web and in-app). */
    val signTileSize: Dp,
    /** Edge of the symbol box as a share of the tile edge on tiles of 48 px and more, where the three-letter code sits under the symbol (D57): 36 of 72, the same layout as the launcher (brand.config.json signs.code symbolDp 36 of the visible 72 dp; build_brand_src.py refuses a mismatch). */
    val signTileGlyphRatio: Float,
    /** The share for tiles below 48 px, where the symbol stands alone without the code (D57; stroke master of the size, glyphSmall where the product has one): header lockup and 32 px tiles. */
    val signTileGlyphRatioSmall: Float,
    /** Lines and series strokes in charts. */
    val chartLineWidth: Dp,
    /** Grid lines (decorative, no meaning). */
    val chartGrid: Color,
    /** Axis lines and tick marks. */
    val chartAxis: Color,
    /** Bars of a labelled bar chart (the label carries the value; colour carries nothing). */
    val chartBar: Color,
    /** The one current or selected bar (today, the chosen period): the accent job "current place", always with a bold label as the non-colour cue. */
    val chartBarCurrent: Color,
    /** D46 (2): layers are separated by a 2 px line in ink, not by a ground tone or a shadow: cards and groups, overlays, the bottom block, the site header and footer, sticky bars, the side navigation edge. Rows inside a group keep the 1 px hairline in color.border. */
    val layerLineWidth: Dp,
    /** Ink of the layer line: text by day (15.31:1 on bg), border-strong by night (3.81:1 on bg; text would glare as a frame). Proposal from the round-3 sketch (D46). */
    val layerLineColor: Color,
    /** D46 (1): the 45° cut at the top end corner of a destructive action (outlined danger action, the confirm button of its dialog): legs of 12 px. Only destructive actions and a final step that deletes nothing but cannot be taken back (D102 (43)) carry it; everything else stays round. */
    val dangerBevelSize: Dp,
    /** D46 (4): new content enters from below over this distance in motion.duration.long with motion.easing.emphasized (transform and opacity only); with reduced motion (system or the app setting „Bewegung immer reduzieren“) it only fades. */
    val enterDistance: Dp,
    /** D46 (4), D102 (52), spec/03 §13.1: the fade that replaces the entry under reduced motion, under the system setting and under the app setting „Bewegung immer reduzieren“ alike, on every platform. Kept, because tokens.css collapses motion.duration.long under both settings (sections 7 and 7a, contract 1.10). */
    val enterFadeDuration: Int,
    /** D49/D52: edge of the app-sign tile in the centre of the start screen; the tile then moves to its place in the top bar or title bar (motion.duration.long, motion.easing.emphasized). */
    val startTileSize: Dp,
    /** D52: links are text-coloured words with a 2 px underline in color.link (visited: color.link-visited); hover/pressed turn the word color.link. External links add the external-link icon. */
    val linkUnderlineWidth: Dp,
    /** D73, D91 C2a: the line at the bottom edge of a mark (palette mark.edge, >= 3:1 on every ground); it carries the shape, the fill only colours. The current search hit takes border-width.strong (3 px) in color.text instead. */
    val markEdgeWidth: Dp,
    /** D81, D91 F3a, D100 (2): start width of a window's sidebar (.sb-side-nav, the divider's aria-valuenow); the content keeps 480 px beside it, so the sidebar docks from a window of 722 px (240 + 2 + 480; spec/02 §4.17, §4.23). */
    val paneSidebar: Dp,
    /** D91 F3a: the smallest width a divider gives the sidebar (aria-valuemin); dragged 48 px below it the sidebar collapses. */
    val paneSidebarMin: Dp,
    /** D91 F3a: the largest width a divider gives the sidebar (aria-valuemax). */
    val paneSidebarMax: Dp,
    /** spec/02 §4.17, shared/ADOPTION.md §2.3: below this width of .sb-window (240 + 2 + 480) the sidebar leaves the grid and is an overlay; the CSS container queries use the same number (they cannot read a custom property). A counterpart without sb-window.js reads the window's width against this token, never the computed style of a hidden pane. */
    val paneSidebarOverlayBelow: Dp,
    /** D81, D91 F3a: start width of a window's inspector (the divider's aria-valuenow); it docks from a window of 1004 px (722 + 2 + 280; spec/02 §4.17, §4.23) and is an overlay of this width below that. */
    val paneInspector: Dp,
    /** D91 F3a: the smallest width a divider gives the inspector (aria-valuemin). */
    val paneInspectorMin: Dp,
    /** D91 F3a: the largest width a divider gives the inspector (aria-valuemax). */
    val paneInspectorMax: Dp,
    /** spec/02 §4.17, shared/ADOPTION.md §2.3: below this width of .sb-window (722 + 2 + 280) the inspector leaves the grid and is an overlay; the CSS container queries use the same number. Read like pane.sidebar-overlay-below. */
    val paneInspectorOverlayBelow: Dp,
    /** D102 (40): the least width of a board column in the side-by-side layout, the columns sharing the rest of the board (spec/02 §3.16): a product may set --sb-x-sebaro-board-column wider for its board, never below 240 px; at large text a column still grows to 15em (D102 lane narrow). A fixed pixel value like the panes, and a least width rather than a fixed one (provisional, agent). */
    val boardColumn: Dp,
    /** D91 F1a (D102 lane desktop, 2026-10-25): where the macOS title bar starts its content beside the system's three window buttons (spec/02 §4.17, spec/09 §13.1): the buttons at x 16 with trafficLightPosition, their width and a gap. A fixed pixel value, not the space tokens in rem: the system buttons do not grow with the page's text size, so at 200 % the room stays 80 px (it was 160 px). */
    val trafficLightRoom: Dp,
    /** D102 (27): the text size of an editor's writing area (Markdown source and code), the default of the product variable: the product sets --sb-x-sebaro-editor-size on its editor from its own setting (at least 16 px, so the 0.875em parts stay at 14 px; provisional, agent). Headings, inline code, line numbers and task boxes are em of it (spec/01 §1.8.2). In rem, so the page's text size scales it. */
    val editorSize: TextUnit,
    /** D102 (27): the line height of an editor's writing area, relative to each line's own size; the owner chose 1.6 for the writing area instead of body's 1.5 (D102 (27), spec/01 §1.8.2). Only the writing area: rendered text keeps its roles' line heights. */
    val editorLineHeight: Float,
)

/** Every non-colour token of the draft for one mode. */
@Immutable
data class SebaroTokens(
    val space: SebaroSpace,
    val spacing: SebaroSpacing,
    val radius: SebaroRadius,
    val shapes: SebaroShapes,
    val borderWidth: SebaroBorderWidth,
    val focus: SebaroFocus,
    val elevation: SebaroElevation,
    val motion: SebaroMotion,
    val size: SebaroSize,
    val layer: SebaroLayer,
    val breakpoint: SebaroBreakpoint,
    val opacity: SebaroOpacity,
    val component: SebaroComponentTokens,
    val x: SebaroX,
)

/**
 * Tokens for one mode; colour aliases read from [colors] so product accents carry through. [fonts] fills
 * the component/signature fontFamily tokens that alias a font.family slot (1.2, TOKEN-CONTRACT §8.12).
 */
@Suppress("UNUSED_PARAMETER") // no fontFamily token of this draft aliases a font.family slot
fun sebaroTokens(colors: SebaroColors, dark: Boolean, fonts: SebaroFonts = SebaroFonts.Default): SebaroTokens {
    val radius = SebaroRadius(
        small = 4.dp,
        control = 8.dp,
        container = 12.dp,
        sheet = 16.dp,
        pill = 9999.dp,
    )
    return SebaroTokens(
        space = SebaroSpace(
            s0 = 0.dp,
            s0_5 = 2.dp,
            s1 = 4.dp,
            s2 = 8.dp,
            s3 = 12.dp,
            s4 = 16.dp,
            s5 = 20.dp,
            s6 = 24.dp,
            s8 = 32.dp,
            s10 = 40.dp,
            s12 = 48.dp,
            s16 = 64.dp,
        ),
        spacing = SebaroSpacing(
            inline = 8.dp,
            stack = 12.dp,
            group = 24.dp,
            insetControl = 16.dp,
            insetContainer = 16.dp,
            gutter = 16.dp,
            gutterWide = 48.dp,
            section = 48.dp,
            sectionWide = 64.dp,
        ),
        radius = radius,
        shapes = SebaroShapes(small = RoundedCornerShape(radius.small), control = RoundedCornerShape(radius.control), container = RoundedCornerShape(radius.container), sheet = RoundedCornerShape(radius.sheet), pill = RoundedCornerShape(radius.pill)),
        borderWidth = SebaroBorderWidth(
            hairline = 1.dp,
            control = 1.dp,
            strong = 3.dp,
        ),
        focus = SebaroFocus(
            width = 2.dp,
            offset = 2.dp,
        ),
        elevation = SebaroElevation(
            level0 = SebaroElevationLevel(
                surface = colors.bg,
                borderColor = colors.border,
                borderWidth = 0.dp,
                shadowLayers = emptyList(),
                shadowElevation = 0.dp,
            ),
            level1 = SebaroElevationLevel(
                surface = colors.bg,
                borderColor = if (dark) colors.borderStrong else colors.text,
                borderWidth = 2.dp,
                shadowLayers = emptyList(),
                shadowElevation = 0.dp,
            ),
            level2 = SebaroElevationLevel(
                surface = colors.bg,
                borderColor = if (dark) colors.borderStrong else colors.text,
                borderWidth = 2.dp,
                shadowLayers = emptyList(),
                shadowElevation = 0.dp,
            ),
            level3 = SebaroElevationLevel(
                surface = colors.bg,
                borderColor = if (dark) colors.borderStrong else colors.text,
                borderWidth = 2.dp,
                shadowLayers = emptyList(),
                shadowElevation = 0.dp,
            ),
            overlay = SebaroElevationLevel(
                surface = colors.bg,
                borderColor = if (dark) colors.borderStrong else colors.text,
                borderWidth = 2.dp,
                shadowLayers = emptyList(),
                shadowElevation = 0.dp,
            ),
        ),
        motion = SebaroMotion(
            durationShort = 120,
            durationMedium = 160,
            durationLong = 200,
            easingStandard = CubicBezierEasing(0.2f, 0f, 0f, 1f),
            easingEmphasized = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f),
            easingExit = CubicBezierEasing(0.3f, 0f, 1f, 1f),
        ),
        size = SebaroSize(
            targetTouch = 48.dp,
            targetPointer = 24.dp,
            iconSm = 16.dp,
            iconMd = 20.dp,
            iconLg = 24.dp,
            controlSm = 32.dp,
            controlMd = 48.dp,
            controlLg = 56.dp,
            measureProse = 70f,
            containerMax = 1440.dp,
        ),
        layer = SebaroLayer(
            sticky = 20f,
            dropdown = 30f,
            overlay = 40f,
            modal = 50f,
            popover = 60f,
            toast = 70f,
            tooltip = 80f,
        ),
        breakpoint = SebaroBreakpoint(
            sm = 640.dp,
            lg = 1024.dp,
        ),
        opacity = SebaroOpacity(),
        component = SebaroComponentTokens(),
        x = SebaroX(
            primaryActionOutlineWidth = 2.dp,
            primaryActionProgressHeight = 6.dp,
            primaryActionProgressPeriod = 1100,
            primaryActionDoneDwell = 1500,
            signTileRadiusRatio = 0.1667f,
            signTileSize = 48.dp,
            signTileGlyphRatio = 0.5f,
            signTileGlyphRatioSmall = 0.6f,
            chartLineWidth = 2.dp,
            chartGrid = colors.border,
            chartAxis = colors.borderStrong,
            chartBar = colors.borderStrong,
            chartBarCurrent = colors.accent,
            layerLineWidth = 2.dp,
            layerLineColor = if (dark) colors.borderStrong else colors.text,
            dangerBevelSize = 12.dp,
            enterDistance = 8.dp,
            enterFadeDuration = 200,
            startTileSize = 96.dp,
            linkUnderlineWidth = 2.dp,
            markEdgeWidth = 2.dp,
            paneSidebar = 240.dp,
            paneSidebarMin = 200.dp,
            paneSidebarMax = 360.dp,
            paneSidebarOverlayBelow = 722.dp,
            paneInspector = 280.dp,
            paneInspectorMin = 240.dp,
            paneInspectorMax = 400.dp,
            paneInspectorOverlayBelow = 1004.dp,
            boardColumn = 240.dp,
            trafficLightRoom = 80.dp,
            editorSize = 16.sp,
            editorLineHeight = 1.6f,
        ),
    )
}

/**
 * The same tokens with every duration that collapses under reduced motion set to 0 ms (TOKEN-CONTRACT
 * §8.7): motion.duration.* and the component/signature durations not marked reducedMotion "keep".
 * `val t = if (rememberSebaroReduceMotion()) SebaroTheme.tokens.withReducedMotion() else SebaroTheme.tokens`
 */
fun SebaroTokens.withReducedMotion(): SebaroTokens = copy(
    motion = motion.copy(durationShort = 0, durationMedium = 0, durationLong = 0),
)

/** Material 3 shape slots from the radius roles (TOKEN-CONTRACT §11.3). */
fun SebaroShapes.toMaterialShapes(): Shapes = Shapes(extraSmall = small, small = control, medium = container, large = container, extraLarge = sheet)

// ================================================================== theme

val LocalSebaroColors = staticCompositionLocalOf { SebaroLightColors }
val LocalSebaroTypography = staticCompositionLocalOf { sebaroTypography() }
val LocalSebaroTokens = staticCompositionLocalOf { sebaroTokens(SebaroLightColors, dark = false) }
val LocalSebaroDataviz = staticCompositionLocalOf { SebaroLightDataviz }
val LocalSebaroSyntax = staticCompositionLocalOf { SebaroLightSyntax }
val LocalSebaroCategories = staticCompositionLocalOf { SebaroLightCategories }
val LocalSebaroMark = staticCompositionLocalOf { SebaroLightMark }

/**
 * Wrap every screen in this. Dynamic colour stays off by design (brand recognition, research 10 §5).
 * One colour set for every product: the palette has no product accents (D54); a product shows only in its
 * sign tile ([SebaroSignTile]).
 * @param tone the colour tone of the settings choice „Farbton“ (palette `variants`, D90).
 */
@Composable
fun SebaroTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    tone: SebaroTone = SebaroTone.Cool,
    fonts: SebaroFonts = SebaroFonts.Default,
    content: @Composable () -> Unit,
) {
    val light = sebaroColors(tone, dark = false)
    val dark = sebaroColors(tone, dark = true)
    val colors = if (darkTheme) dark else light
    val typography = remember(fonts, darkTheme) { sebaroTypography(fonts, darkTheme) }
    val tokens = remember(colors, darkTheme, fonts) { sebaroTokens(colors, darkTheme, fonts) }
    CompositionLocalProvider(
        LocalSebaroColors provides colors,
        LocalSebaroTypography provides typography,
        LocalSebaroTokens provides tokens,
        LocalSebaroDataviz provides if (darkTheme) SebaroDarkDataviz else SebaroLightDataviz,
        LocalSebaroSyntax provides if (darkTheme) SebaroDarkSyntax else SebaroLightSyntax,
        LocalSebaroCategories provides if (darkTheme) SebaroDarkCategories else SebaroLightCategories,
        LocalSebaroMark provides if (darkTheme) SebaroDarkMark else SebaroLightMark,
    ) {
        MaterialTheme(
            colorScheme = sebaroColorScheme(light, dark, darkTheme),
            typography = typography.toMaterialTypography(),
            shapes = tokens.shapes.toMaterialShapes(),
            content = content,
        )
    }
}

/** Accessors: SebaroTheme.colors.accent, SebaroTheme.typography.body, SebaroTheme.tokens.spacing.stack … */
object SebaroTheme {
    val colors: SebaroColors
        @Composable @ReadOnlyComposable get() = LocalSebaroColors.current
    val typography: SebaroTypography
        @Composable @ReadOnlyComposable get() = LocalSebaroTypography.current
    val tokens: SebaroTokens
        @Composable @ReadOnlyComposable get() = LocalSebaroTokens.current
    val dataviz: SebaroDataviz
        @Composable @ReadOnlyComposable get() = LocalSebaroDataviz.current
    val syntax: SebaroSyntax
        @Composable @ReadOnlyComposable get() = LocalSebaroSyntax.current
    val categories: List<SebaroCategory>
        @Composable @ReadOnlyComposable get() = LocalSebaroCategories.current
    val mark: SebaroMark
        @Composable @ReadOnlyComposable get() = LocalSebaroMark.current
}

/**
 * True when animations are off: the user removed them (Settings > Accessibility; animator duration scale 0)
 * or the system turned animators off (battery saver; `ValueAnimator.areAnimatorsEnabled()`, API 26+).
 * Follows a change while the app runs: a ContentObserver on the scale, and from API 33 the animator's own
 * duration-scale listener. Use it to swap movement for fades and to skip durations: [withReducedMotion]
 * (TOKEN-CONTRACT §8.7).
 */
@Composable
fun rememberSebaroReduceMotion(): Boolean {
    val resolver = LocalContext.current.contentResolver
    var off by remember(resolver) { mutableStateOf(sebaroAnimationsOff(resolver)) }
    DisposableEffect(resolver) {
        val main = Handler(Looper.getMainLooper())
        val observer = object : ContentObserver(main) {
            override fun onChange(selfChange: Boolean) {
                off = sebaroAnimationsOff(resolver)
            }
        }
        resolver.registerContentObserver(
            Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE), false, observer,
        )
        val scaleListener = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ValueAnimator.DurationScaleChangeListener { main.post { off = sebaroAnimationsOff(resolver) } }
                .also { ValueAnimator.registerDurationScaleChangeListener(it) }
        } else {
            null
        }
        off = sebaroAnimationsOff(resolver)
        onDispose {
            resolver.unregisterContentObserver(observer)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && scaleListener != null) {
                ValueAnimator.unregisterDurationScaleChangeListener(scaleListener)
            }
        }
    }
    return off
}

private fun sebaroAnimationsOff(resolver: ContentResolver): Boolean =
    Settings.Global.getFloat(resolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f ||
        (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !ValueAnimator.areAnimatorsEnabled())
