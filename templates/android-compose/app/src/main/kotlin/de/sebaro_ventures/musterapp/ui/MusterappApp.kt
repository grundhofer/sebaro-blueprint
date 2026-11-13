package de.sebaro_ventures.musterapp.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.rememberViewModelStoreOwner
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.designsystem.SbMessages
import de.sebaro_ventures.design.designsystem.SbNavItem
import de.sebaro_ventures.design.designsystem.SbNavigationBar
import de.sebaro_ventures.design.designsystem.SbStart
import de.sebaro_ventures.design.designsystem.SbStartSymbol
import de.sebaro_ventures.design.designsystem.SebaroAppTheme
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.design.designsystem.sebaroIsDark
import de.sebaro_ventures.design.icons.SebaroIcons
import de.sebaro_ventures.design.product.AppProduct
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.ui.about.AboutRoute
import de.sebaro_ventures.musterapp.ui.data.DataRoute
import de.sebaro_ventures.musterapp.ui.detail.DetailRoute
import de.sebaro_ventures.musterapp.ui.form.FormRoute
import de.sebaro_ventures.musterapp.ui.list.ListRoute
import de.sebaro_ventures.musterapp.ui.settings.SettingsRoute
import de.sebaro_ventures.musterapp.ui.settings.SettingsUiState
import de.sebaro_ventures.musterapp.ui.settings.SettingsViewModel

/**
 * The root of the app: the theme with the stored settings and the app's languages, below it the navigation, over
 * it the start. [firstStart] is true on the activity's first start; [onDark] tells the activity whether the
 * screens are drawn dark.
 */
@Composable
fun MusterappApp(firstStart: Boolean = false, onDark: (Boolean) -> Unit = {}) {
    val settingsViewModel = appViewModel { c -> SettingsViewModel(c.settings) }
    val settings by settingsViewModel.state.collectAsStateWithLifecycle()
    // Until the stored choice is read only the start is drawn, so the app never jumps from light to dark.
    val ready = settings != null
    val shown = settings ?: SettingsUiState()
    SebaroAppTheme(
        mode = shown.mode,
        reduceMotion = shown.reduceMotion,
        tone = shown.tone,
        appLocales = appLocales(),
        fallbackMessages = SbMessages.En,
    ) {
        Box {
            if (ready) {
                val dark = sebaroIsDark()
                LaunchedEffect(dark) { onDark(dark) }
                // the app's ground: the window behind it keeps the product colour of the start
                Box(Modifier.fillMaxSize().background(SebaroTheme.colors.bg)) { Navigation() }
            }
            // over the app and always at this place; a rotation does not show it again
            if (firstStart) MusterappStart(ready)
        }
    }
}

/**
 * The start: the whole screen in the product colour with the white symbol, both from the product kit. It lies
 * over the app and fades once the app is [ready].
 */
@Composable
fun MusterappStart(ready: Boolean) {
    SbStart(ready, AppProduct, { SbStartSymbol(AppProduct, it) }) {}
}

/** Navigation without a library: a saved back stack of destinations; its first entry is always a top-level place. */
@Composable
private fun Navigation() {
    val stack = rememberSaveable(saver = BackStackSaver) { mutableStateListOf<Destination>(Destination.Entries) }

    fun open(destination: Destination) {
        stack.add(destination)
    }

    fun back() {
        if (stack.size > 1) stack.removeAt(stack.lastIndex)
    }

    BackHandler(enabled = stack.size > 1) { back() }

    val navigation = @Composable {
        MusterappNavigation(
            selected = Destination.topLevel.indexOf(stack.first()),
            onSelect = { index ->
                stack.clear()
                stack.add(Destination.topLevel[index])
            },
        )
    }

    when (val destination = stack.last()) {
        Destination.Entries -> ListRoute(
            onOpen = { open(Destination.Detail(it)) },
            onCreate = { open(Destination.Form(null)) },
            navigation = navigation,
        )
        Destination.Data -> DataRoute(navigation)
        Destination.Settings -> SettingsRoute(onAbout = { open(Destination.About) }, navigation = navigation)
        is Destination.Detail -> SubScreen(destination) {
            DetailRoute(destination.id, onBack = ::back, onEdit = { open(Destination.Form(destination.id)) })
        }
        is Destination.Form -> SubScreen(destination) {
            FormRoute(
                id = destination.id,
                onClose = ::back,
                onSaved = { id ->
                    back()
                    // a new entry opens in its detail, an edited one returns there
                    if (destination.id == null) open(Destination.Detail(id))
                },
            )
        }
        Destination.About -> SubScreen(destination) { AboutRoute(onBack = ::back) }
    }
}

/**
 * A sub-screen has ViewModels of its own, for as long as it is shown: leaving it clears them, so a form opens
 * without the last draft. The top-level places keep theirs with the activity.
 */
@Composable
private fun SubScreen(destination: Destination, content: @Composable () -> Unit) {
    key(destination) {
        CompositionLocalProvider(LocalViewModelStoreOwner provides rememberViewModelStoreOwner(), content = content)
    }
}

/** The bottom navigation: icon and word, the current place filled. */
@Composable
fun MusterappNavigation(selected: Int, onSelect: (Int) -> Unit) {
    SbNavigationBar(
        items = listOf(
            SbNavItem(sbStringResource(R.string.nav_entries), SebaroIcons.Outline.Home, SebaroIcons.Filled.Home),
            SbNavItem(sbStringResource(R.string.nav_data), SebaroIcons.Outline.ChartBar, SebaroIcons.Filled.ChartBar),
            SbNavItem(
                sbStringResource(R.string.nav_settings),
                SebaroIcons.Outline.Settings,
                SebaroIcons.Filled.Settings,
            ),
        ),
        selectedIndex = selected,
        onSelect = onSelect,
    )
}
