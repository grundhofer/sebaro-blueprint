package de.sebaro_ventures.musterapp.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.compose.viewModel
import de.sebaro_ventures.musterapp.AppContainer

/** The process's [AppContainer] for everything below the root; MainActivity provides it, a test its own. */
val LocalAppContainer = staticCompositionLocalOf<AppContainer> { error("LocalAppContainer is not provided") }

/**
 * The ViewModel of a route, built from the container: `appViewModel { c -> XViewModel(c.repository, c.clock) }`.
 * A ViewModel gets what it needs in its constructor, never the whole container; one with a draft also takes
 * `createSavedStateHandle()`. Call it in a route or the root, never in a screen.
 */
@Composable
inline fun <reified VM : ViewModel> appViewModel(crossinline create: CreationExtras.(AppContainer) -> VM): VM {
    val container = LocalAppContainer.current
    return viewModel { create(container) }
}
