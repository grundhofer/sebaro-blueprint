package de.sebaro_ventures.musterapp.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import de.sebaro_ventures.design.designsystem.SbCallout
import de.sebaro_ventures.design.designsystem.SbCalloutKind
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.musterapp.R

/**
 * Says that a change did not reach the storage, on a view whose primary action is not the change that failed.
 * A failure is never a toast. [onHide] is „Ausblenden“.
 */
@Composable
fun SaveFailedCallout(onHide: () -> Unit, modifier: Modifier = Modifier) {
    SbCallout(
        SbCalloutKind.Error,
        text = sbStringResource(R.string.save_failed),
        modifier = modifier,
        inlineTitle = true,
        live = true,
        onHide = onHide,
    )
}
