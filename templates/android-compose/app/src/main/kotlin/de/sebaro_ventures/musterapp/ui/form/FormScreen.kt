package de.sebaro_ventures.musterapp.ui.form

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.designsystem.SbActionState
import de.sebaro_ventures.design.designsystem.SbDemoMarker
import de.sebaro_ventures.design.designsystem.SbIconButton
import de.sebaro_ventures.design.designsystem.SbPrimaryActionModel
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbSegmented
import de.sebaro_ventures.design.designsystem.SbTextField
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.SbUnsavedDialog
import de.sebaro_ventures.design.designsystem.sbFormatCount
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.design.icons.SebaroIcons
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.domain.NOTE_MAX
import de.sebaro_ventures.musterapp.domain.Priority
import de.sebaro_ventures.musterapp.ui.label

/**
 * View type `form`, a sub-screen: labels above the fields, „(optional)“ on the voluntary note, the priority as
 * segments. The primary action stays enabled and says at the field what is missing; the line under it says where
 * the data goes. A save that fails shows in the primary action. Closing with changes asks „Abbrechen“ ·
 * „Verwerfen“ · „Sichern“. „Beispieldaten“ stands on a sample whose words are unchanged.
 */
@Composable
fun FormScreen(
    state: FormUiState,
    onTitle: (String) -> Unit,
    onNote: (String) -> Unit,
    onPriority: (Priority) -> Unit,
    onSave: () -> Unit,
    onClose: () -> Unit,
    onDiscard: () -> Unit,
    onDialogDismiss: () -> Unit,
) {
    val t = SebaroTheme.tokens
    val titleFocus = remember { FocusRequester() }
    val noteFocus = remember { FocusRequester() }
    val noteTooLong = state.note.length > NOTE_MAX
    // a refused save moves the focus to the first field with an error
    LaunchedEffect(state.refused) {
        if (state.refused > 0) (if (state.titleMissing) titleFocus else noteFocus).requestFocus()
    }
    BackHandler(onBack = onClose)

    val save = sbStringResource(if (state.isNew) R.string.form_create else R.string.form_save)
    SbScreen(
        topBar = {
            SbTopBar(
                title = sbStringResource(if (state.isNew) R.string.form_new_title else R.string.form_edit_title),
                topLevel = false,
                leading = { SbIconButton(SebaroIcons.Outline.Close, sbStringResource(R.string.form_close), onClose) },
            )
        },
        primaryAction = SbPrimaryActionModel(
            text = save,
            onClick = onSave,
            hint = sbStringResource(R.string.form_local),
            state = if (state.saveFailed) {
                SbActionState.Failed(sbStringResource(R.string.save_failed), retryLabel = save)
            } else {
                SbActionState.Idle
            },
        ),
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(horizontal = t.spacing.gutter, vertical = t.space.s4),
            verticalArrangement = Arrangement.spacedBy(t.space.s6),
        ) {
            if (state.sample) SbDemoMarker(sbStringResource(R.string.demo_marker))
            SbTextField(
                value = state.title,
                onValueChange = onTitle,
                label = sbStringResource(R.string.form_title_label),
                modifier = Modifier.focusRequester(titleFocus),
                error = if (state.titleMissing) sbStringResource(R.string.form_title_missing) else null,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Sentences,
                    imeAction = ImeAction.Next,
                ),
            )
            SbSegmented(
                label = sbStringResource(R.string.form_priority_label),
                options = Priority.entries.map { it to sbStringResource(it.label()) },
                selected = state.priority,
                onChange = onPriority,
            )
            val count = sbFormatCount(state.note.length)
            val max = sbFormatCount(NOTE_MAX)
            SbTextField(
                value = state.note,
                onValueChange = onNote,
                label = sbStringResource(R.string.form_note_label),
                modifier = Modifier.focusRequester(noteFocus),
                counter = sbStringResource(R.string.form_note_counter, count, max),
                error = if (noteTooLong) sbStringResource(R.string.form_note_too_long, count, max) else null,
                singleLine = false,
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                optional = true,
                minLines = 3,
            )
        }
    }
    if (state.askUnsaved) {
        SbUnsavedDialog(
            title = if (state.isNew) {
                sbStringResource(R.string.form_unsaved_new_title)
            } else {
                sbStringResource(R.string.form_unsaved_edit_title, state.storedTitle)
            },
            text = sbStringResource(
                if (state.isNew) R.string.form_unsaved_new_text else R.string.form_unsaved_edit_text,
            ),
            onSave = onSave,
            onDiscard = onDiscard,
            onDismiss = onDialogDismiss,
        )
    }
}
