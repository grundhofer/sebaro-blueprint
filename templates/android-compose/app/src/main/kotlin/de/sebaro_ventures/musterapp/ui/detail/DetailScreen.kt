package de.sebaro_ventures.musterapp.ui.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.designsystem.SbBackButton
import de.sebaro_ventures.design.designsystem.SbConfirmDialog
import de.sebaro_ventures.design.designsystem.SbDangerAction
import de.sebaro_ventures.design.designsystem.SbDemoMarker
import de.sebaro_ventures.design.designsystem.SbMetaItem
import de.sebaro_ventures.design.designsystem.SbMetaList
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbSecondaryAction
import de.sebaro_ventures.design.designsystem.SbStatus
import de.sebaro_ventures.design.designsystem.SbStatusGlyph
import de.sebaro_ventures.design.designsystem.SbStatusTone
import de.sebaro_ventures.design.designsystem.SbTextAction
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.SbWrapText
import de.sebaro_ventures.design.designsystem.sbMessages
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.design.icons.SebaroIcons
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.ui.SaveFailedCallout
import de.sebaro_ventures.musterapp.ui.label

/**
 * View type `detail`, a sub-screen with „back“: the state as glyph and word, the note, the facts flat. A detail
 * has no primary action; „Eintrag bearbeiten“ is the one outlined action of its zone and goes once the entry is
 * done. At the end of the content stand the two steps that cannot be undone, both asking first: „Eintrag
 * abschließen“ as a text action and „Eintrag löschen“, the one outlined action there, in the danger colour with
 * the 45° cut and the trash.
 */
@Composable
fun DetailScreen(
    state: DetailUiState,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onAsk: (DetailDialog) -> Unit,
    onDialogDismiss: () -> Unit,
    onFinish: () -> Unit,
    onDelete: () -> Unit,
    onFailureSeen: () -> Unit,
) {
    val entry = state.entry ?: return
    val c = SebaroTheme.colors
    val t = SebaroTheme.tokens
    val open = entry.state == EntryState.Open
    val edit = sbStringResource(R.string.detail_edit)
    SbScreen(
        topBar = { SbTopBar(title = entry.title, topLevel = false, leading = { SbBackButton(onBack) }) },
        secondaryAction = if (open) ({ SbSecondaryAction(edit, onEdit, Modifier.fillMaxWidth()) }) else null,
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(horizontal = t.spacing.gutter, vertical = t.space.s4),
            verticalArrangement = Arrangement.spacedBy(t.space.s6),
        ) {
            if (state.saveFailed) SaveFailedCallout(onFailureSeen)
            if (entry.sample) SbDemoMarker(sbStringResource(R.string.demo_marker))
            if (open) {
                SbStatus(
                    SbStatusTone.Neutral,
                    word = sbStringResource(R.string.detail_state_open),
                    glyph = SbStatusGlyph.Pending,
                )
            } else {
                SbStatus(SbStatusTone.Success, word = sbStringResource(R.string.detail_state_done))
            }
            // the user's own words wrap at spaces; only a word wider than the line is broken
            SbWrapText(
                entry.note.ifBlank { sbStringResource(R.string.detail_no_note) },
                SebaroTheme.typography.body,
                if (entry.note.isBlank()) c.textMuted else c.text,
            )
            SbMetaList(
                labels = true,
                items = listOf(
                    SbMetaItem(sbStringResource(R.string.detail_created), sbMessages().dayDateWithYear(entry.created)),
                    SbMetaItem(sbStringResource(R.string.detail_priority), sbStringResource(entry.priority.label())),
                ),
            )
            Column(verticalArrangement = Arrangement.spacedBy(t.space.s4)) {
                if (open) {
                    SbTextAction(
                        sbStringResource(R.string.detail_finish),
                        onClick = { onAsk(DetailDialog.Finish) },
                    )
                }
                SbDangerAction(
                    sbStringResource(R.string.detail_delete),
                    onClick = { onAsk(DetailDialog.Delete) },
                    icon = SebaroIcons.Outline.Trash,
                )
            }
        }
    }
    when (state.dialog) {
        DetailDialog.Finish -> SbConfirmDialog(
            title = sbStringResource(R.string.detail_finish_title),
            text = sbStringResource(R.string.detail_finish_text, entry.title),
            confirmText = sbStringResource(R.string.detail_finish_confirm),
            onConfirm = onFinish,
            onDismiss = onDialogDismiss,
        )
        DetailDialog.Delete -> SbConfirmDialog(
            title = sbStringResource(R.string.detail_delete_title),
            text = sbStringResource(R.string.detail_delete_text, entry.title),
            confirmText = sbStringResource(R.string.detail_delete_confirm),
            onConfirm = onDelete,
            onDismiss = onDialogDismiss,
        )
        null -> Unit
    }
}
