package de.sebaro_ventures.musterapp.ui.list

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.designsystem.SbDemoMarker
import de.sebaro_ventures.design.designsystem.SbEmptyState
import de.sebaro_ventures.design.designsystem.SbListEnd
import de.sebaro_ventures.design.designsystem.SbListHeader
import de.sebaro_ventures.design.designsystem.SbListRow
import de.sebaro_ventures.design.designsystem.SbMenuItem
import de.sebaro_ventures.design.designsystem.SbPrimaryActionModel
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbSearchField
import de.sebaro_ventures.design.designsystem.SbToastData
import de.sebaro_ventures.design.designsystem.SbToastHost
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.rememberSbToastState
import de.sebaro_ventures.design.designsystem.sbMessages
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.design.icons.SebaroIcons
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.ui.SaveFailedCallout
import de.sebaro_ventures.musterapp.ui.formatDate

/**
 * View type `list`, a top-level place: the search, flat rows in two groups with their count in the head, finished
 * rows recede, the end sentence, the empty state, and the primary action „Eintrag anlegen“ at the bottom. An
 * invented entry carries „Beispieldaten“ in its row. „Ausblenden“ in a row's menu can be undone in a toast.
 */
@Composable
fun ListScreen(
    state: ListUiState,
    onQuery: (String) -> Unit,
    onOpen: (Long) -> Unit,
    onCreate: () -> Unit,
    onHide: (Entry) -> Unit,
    onUndoHide: () -> Unit,
    onFailureSeen: () -> Unit,
    navigation: @Composable () -> Unit,
) {
    val t = SebaroTheme.tokens
    val gutter = Modifier.padding(horizontal = t.spacing.gutter, vertical = t.space.s4)
    val toasts = rememberSbToastState()
    val hiddenMessage = state.hidden?.let { sbStringResource(R.string.list_hidden_toast, it.title) }
    val undo = sbMessages().undo
    val undoHide by rememberUpdatedState(onUndoHide)
    // a toast only for a result that can be undone, with „Rückgängig“
    LaunchedEffect(state.hidden) {
        if (hiddenMessage == null) toasts.dismiss() else toasts.show(SbToastData(hiddenMessage, undo) { undoHide() })
    }
    val hide = sbStringResource(R.string.list_hide)
    val demo = sbStringResource(R.string.demo_marker)
    SbScreen(
        topBar = { SbTopBar(title = sbStringResource(R.string.list_title)) },
        primaryAction = SbPrimaryActionModel(text = sbStringResource(R.string.list_create), onClick = onCreate),
        navigation = navigation,
        snackbarHost = { SbToastHost(toasts) },
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize(), contentPadding = padding) {
            if (state.saveFailed) item(key = "save-failed") { SaveFailedCallout(onFailureSeen, gutter) }
            if (state.none) {
                item(key = "none") {
                    SbEmptyState(
                        title = sbStringResource(R.string.list_empty_title),
                        text = sbStringResource(R.string.list_empty_text),
                    )
                }
                return@LazyColumn
            }
            item(key = "search") {
                SbSearchField(
                    value = state.query,
                    onValueChange = onQuery,
                    label = sbStringResource(R.string.list_search_label),
                    modifier = gutter,
                    placeholder = sbStringResource(R.string.list_search_placeholder),
                )
            }
            if (state.entries.isEmpty()) {
                item(key = "no-hit") {
                    SbEmptyState(
                        title = sbStringResource(R.string.list_nohit_title, state.query.trim()),
                        text = sbStringResource(R.string.list_nohit_text),
                    )
                }
                return@LazyColumn
            }
            for (group in EntryState.entries) {
                val rows = state.entries.filter { it.state == group }
                if (rows.isEmpty()) continue
                item(key = group.name) {
                    val label = if (group == EntryState.Open) R.string.list_group_open else R.string.list_group_done
                    SbListHeader(label = sbStringResource(label), count = rows.size)
                }
                items(rows, key = { it.id }) { entry ->
                    SbListRow(
                        title = entry.title,
                        meta = sbStringResource(R.string.list_meta_created, formatDate(entry.created)),
                        trail = if (entry.sample) ({ SbDemoMarker(demo) }) else null,
                        onClick = { onOpen(entry.id) },
                        done = entry.state == EntryState.Done,
                        menu = listOf(SbMenuItem(hide, onClick = { onHide(entry) }, icon = SebaroIcons.Outline.EyeOff)),
                    )
                }
            }
            item(key = "end") { SbListEnd(sbStringResource(R.string.list_end)) }
        }
    }
}
