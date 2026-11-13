package de.sebaro_ventures.musterapp.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbListRow
import de.sebaro_ventures.design.designsystem.SbMotionSetting
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbThemeChoice
import de.sebaro_ventures.design.designsystem.SbThemeMode
import de.sebaro_ventures.design.designsystem.SbToneChoice
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.ui.SaveFailedCallout

/**
 * View type `settings`, a top-level place: „Hell oder Dunkel“, „Farbton“ and „Bewegung immer reduzieren“ with the
 * parts and words of the copy. Every choice applies at once, so there is no primary action. The last row leads to
 * „Über“. The language is not chosen here but in Android's settings for the app.
 */
@Composable
fun SettingsScreen(
    state: SettingsUiState,
    onMode: (SbThemeMode) -> Unit,
    onTone: (SebaroTone) -> Unit,
    onReduceMotion: (Boolean) -> Unit,
    onFailureSeen: () -> Unit,
    onAbout: () -> Unit,
    navigation: @Composable () -> Unit,
) {
    val t = SebaroTheme.tokens
    SbScreen(
        topBar = { SbTopBar(title = sbStringResource(R.string.settings_title)) },
        navigation = navigation,
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(vertical = t.space.s4),
            verticalArrangement = Arrangement.spacedBy(t.space.s6),
        ) {
            if (state.saveFailed) {
                SaveFailedCallout(onFailureSeen, Modifier.padding(horizontal = t.spacing.gutter))
            }
            SbThemeChoice(mode = state.mode, onChange = onMode)
            SbToneChoice(tone = state.tone, onChange = onTone)
            SbMotionSetting(reduce = state.reduceMotion, onChange = onReduceMotion)
            SbListRow(
                title = sbStringResource(R.string.settings_about, sbStringResource(R.string.app_name)),
                onClick = onAbout,
            )
        }
    }
}
