package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.junit4.v2.createComposeRule
import com.github.takahirom.roborazzi.ExperimentalRoborazziApi
import com.github.takahirom.roborazzi.captureScreenRoboImage
import de.sebaro_ventures.design.designsystem.SbMessages
import de.sebaro_ventures.design.designsystem.SbThemeMode
import de.sebaro_ventures.design.designsystem.SebaroAppTheme
import de.sebaro_ventures.musterapp.ui.appLocales
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/** Longer than every enter animation of sebaro, shorter than the six seconds a toast stands. */
private const val SETTLE_MS = 3_000L

/**
 * Draws every sample state of one screen light, dark and at large text (font scale 1.3) on a 360 × 800 dp phone
 * in German, on the JVM: Robolectric with its native graphics, Roborazzi for the picture, every window included
 * (a dialog, a toast). The pictures go to docs/screens/`<screen>-<state>-<light|dark|large>.png` and are committed.
 * A green test only says that it was drawn: look at the pictures. A screen's test names [screen] and [states];
 * one that is longer than the phone sets a taller screen with its own `@Config(qualifiers = …)`.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [36], qualifiers = "de-rDE-w360dp-h800dp-xhdpi")
abstract class RenderTest {
    /** The screen's name in the file name, as its package. */
    abstract val screen: String

    /** The sample states by their name in the file name, usually from `object <Screen>Samples`. */
    abstract val states: Map<String, @Composable () -> Unit>

    @get:Rule
    val rule = createComposeRule()

    @Test
    @Config(qualifiers = "+notnight")
    fun light() = draw("light", dark = false)

    @Test
    @Config(qualifiers = "+night")
    fun dark() = draw("dark", dark = true)

    @Test
    @Config(qualifiers = "+notnight", fontScale = 1.3f)
    fun large() = draw("large", dark = false)

    @OptIn(ExperimentalRoborazziApi::class)
    private fun draw(variant: String, dark: Boolean) {
        val folder = File(checkNotNull(System.getProperty("musterapp.screens"))).apply { mkdirs() }
        var shown by mutableStateOf<String?>(null)
        rule.setContent {
            val name = shown ?: return@setContent
            key(name) {
                SebaroAppTheme(
                    mode = if (dark) SbThemeMode.Dark else SbThemeMode.Light,
                    appLocales = appLocales(),
                    fallbackMessages = SbMessages.En,
                    content = states.getValue(name),
                )
            }
        }
        for (name in states.keys) {
            shown = name
            rule.waitForIdle()
            // the clock moves only as far as the enter animations need
            rule.mainClock.autoAdvance = false
            rule.mainClock.advanceTimeBy(SETTLE_MS)
            rule.mainClock.autoAdvance = true
            captureScreenRoboImage(File(folder, "$screen-$name-$variant.png").path)
        }
    }
}
