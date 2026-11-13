package de.sebaro_ventures.musterapp

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.CompositionLocalProvider
import de.sebaro_ventures.musterapp.ui.LocalAppContainer
import de.sebaro_ventures.musterapp.ui.MusterappApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // edge to edge: SbScreen and SbTopBar take the system bar insets themselves
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        // the start is shown once per activity start, not again after a rotation
        val firstStart = savedInstanceState == null
        setContent {
            CompositionLocalProvider(LocalAppContainer provides appContainer) {
                MusterappApp(firstStart = firstStart, onDark = ::showSystemBars)
            }
        }
    }

    /** The icons of the system bars follow the app's own choice „Hell oder Dunkel“, not only the system's. */
    private fun showSystemBars(dark: Boolean) {
        val style = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT) { dark }
        enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
    }
}
