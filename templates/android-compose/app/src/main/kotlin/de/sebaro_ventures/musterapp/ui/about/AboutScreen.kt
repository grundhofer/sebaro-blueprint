package de.sebaro_ventures.musterapp.ui.about

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import de.sebaro_ventures.design.designsystem.SbAboutHead
import de.sebaro_ventures.design.designsystem.SbBackButton
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbSenderRow
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.design.product.AppProduct
import de.sebaro_ventures.musterapp.R

/**
 * View type `about`, a sub-screen with „back“, reached from the settings: the sign tile, the name, one sentence
 * and the version, then the sender „von sebaro“, with the parts of the copy. It has no primary action, and the
 * tile is its only product colour.
 */
@Composable
fun AboutScreen(state: AboutUiState, onBack: () -> Unit) {
    val name = sbStringResource(R.string.app_name)
    SbScreen(
        topBar = {
            SbTopBar(
                title = sbStringResource(R.string.about_title, name),
                topLevel = false,
                leading = { SbBackButton(onBack) },
            )
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding),
        ) {
            SbAboutHead(
                product = AppProduct,
                // the whole tile as the product kit drew it, never the bare symbol
                glyph = painterResource(R.drawable.sb_sign_musterapp),
                name = name,
                line = sbStringResource(R.string.about_line),
                version = state.version,
                date = null,
            )
            SbSenderRow(sbStringResource(R.string.about_sender))
        }
    }
}
