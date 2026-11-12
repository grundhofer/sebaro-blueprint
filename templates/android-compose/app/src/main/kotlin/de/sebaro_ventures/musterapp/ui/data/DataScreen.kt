package de.sebaro_ventures.musterapp.ui.data

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import de.sebaro_ventures.design.SebaroTheme
import de.sebaro_ventures.design.designsystem.SbAxisLabel
import de.sebaro_ventures.design.designsystem.SbBar
import de.sebaro_ventures.design.designsystem.SbBarChart
import de.sebaro_ventures.design.designsystem.SbBigNumber
import de.sebaro_ventures.design.designsystem.SbCategory
import de.sebaro_ventures.design.designsystem.SbChartValue
import de.sebaro_ventures.design.designsystem.SbCodeBlock
import de.sebaro_ventures.design.designsystem.SbColumnKind
import de.sebaro_ventures.design.designsystem.SbDemoMarker
import de.sebaro_ventures.design.designsystem.SbFileNameText
import de.sebaro_ventures.design.designsystem.SbGoalRing
import de.sebaro_ventures.design.designsystem.SbLineChart
import de.sebaro_ventures.design.designsystem.SbLinePoint
import de.sebaro_ventures.design.designsystem.SbMarkedText
import de.sebaro_ventures.design.designsystem.SbMetaItem
import de.sebaro_ventures.design.designsystem.SbMetaList
import de.sebaro_ventures.design.designsystem.SbProgressBar
import de.sebaro_ventures.design.designsystem.SbProgressRing
import de.sebaro_ventures.design.designsystem.SbRating
import de.sebaro_ventures.design.designsystem.SbScreen
import de.sebaro_ventures.design.designsystem.SbShareRow
import de.sebaro_ventures.design.designsystem.SbShareRows
import de.sebaro_ventures.design.designsystem.SbSign
import de.sebaro_ventures.design.designsystem.SbSignedNumber
import de.sebaro_ventures.design.designsystem.SbSortableTable
import de.sebaro_ventures.design.designsystem.SbStatItem
import de.sebaro_ventures.design.designsystem.SbStats
import de.sebaro_ventures.design.designsystem.SbStatus
import de.sebaro_ventures.design.designsystem.SbStatusGlyph
import de.sebaro_ventures.design.designsystem.SbStatusTone
import de.sebaro_ventures.design.designsystem.SbSteps
import de.sebaro_ventures.design.designsystem.SbTableCell
import de.sebaro_ventures.design.designsystem.SbTableColumn
import de.sebaro_ventures.design.designsystem.SbTableSum
import de.sebaro_ventures.design.designsystem.SbTag
import de.sebaro_ventures.design.designsystem.SbTags
import de.sebaro_ventures.design.designsystem.SbTopBar
import de.sebaro_ventures.design.designsystem.sbAppLocale
import de.sebaro_ventures.design.designsystem.sbFormatCount
import de.sebaro_ventures.design.designsystem.sbMessages
import de.sebaro_ventures.design.designsystem.sbPluralStringResource
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.ui.formatDate
import de.sebaro_ventures.musterapp.ui.formatDecimal
import de.sebaro_ventures.musterapp.ui.formatMoney
import de.sebaro_ventures.musterapp.ui.formatPercent
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/**
 * A top-level place without a primary action: the kinds of data, each with its part of the copy. Numbers, money
 * and units, time, state and progress, categories and marks, technical values, a sortable table with a sum, charts
 * and a rating. Every value is invented and the screen says so under its title.
 */
@Composable
fun DataScreen(state: DataUiState, navigation: @Composable () -> Unit) {
    val t = SebaroTheme.tokens
    SbScreen(
        topBar = { SbTopBar(title = sbStringResource(R.string.data_title)) },
        navigation = navigation,
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(bottom = t.space.s8),
        ) {
            SbDemoMarker(
                sbStringResource(R.string.demo_marker),
                Modifier.padding(horizontal = t.spacing.gutter).padding(top = t.space.s4),
            )
            NumbersSection(state)
            TimeSection(state)
            StateSection()
            CategorySection()
            TechnicalSection()
            TableSection(state)
            ChartSection(state)
        }
    }
}

/** One section: its title, a heading for TalkBack, over its content. */
@Composable
private fun Section(title: String, content: @Composable ColumnScope.() -> Unit) {
    val t = SebaroTheme.tokens
    Column(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = t.spacing.gutter)
            .padding(top = t.spacing.section),
        verticalArrangement = Arrangement.spacedBy(t.space.s4),
    ) {
        Text(
            title,
            style = SebaroTheme.typography.title,
            color = SebaroTheme.colors.text,
            modifier = Modifier.semantics { heading() },
        )
        content()
    }
}

@Composable
private fun NumbersSection(state: DataUiState) {
    val locale = sbAppLocale()
    Section(sbStringResource(R.string.data_numbers)) {
        SbBigNumber(
            value = formatMoney(state.expensesSum, locale),
            label = sbStringResource(R.string.data_expenses_month),
        )
        // the plain list puts a label above its value once a number would break
        SbMetaList(
            items = listOf(
                SbMetaItem(sbStringResource(R.string.data_integer), sbFormatCount(12)),
                SbMetaItem(
                    sbStringResource(R.string.data_fraction),
                    sbStringResource(R.string.data_fraction_value, sbFormatCount(5), sbFormatCount(8)),
                ),
                SbMetaItem(sbStringResource(R.string.data_decimal), formatDecimal(3.75, 2, locale)),
                SbMetaItem(sbStringResource(R.string.data_large), sbFormatCount(10_000)),
                SbMetaItem(sbStringResource(R.string.data_percent), formatPercent(0.6, locale)),
                SbMetaItem(sbStringResource(R.string.data_money), formatMoney(1249.0, locale)),
                SbMetaItem(
                    sbStringResource(R.string.data_per_month),
                    sbStringResource(R.string.data_per_month_value, formatMoney(0.99, locale)),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_unit),
                    sbStringResource(R.string.data_unit_value, formatDecimal(2.5, 1, locale)),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_approx),
                    sbStringResource(R.string.data_approx_value, sbFormatCount(40)),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_rank),
                    sbStringResource(R.string.data_rank_value, sbFormatCount(3), sbFormatCount(12)),
                ),
            ),
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(SebaroTheme.tokens.space.s6)) {
            SbSignedNumber(sbStringResource(R.string.data_signed_plus, formatPercent(0.125, locale, 1)), SbSign.Plus)
            SbSignedNumber(sbStringResource(R.string.data_signed_minus, formatPercent(0.03, locale, 1)), SbSign.Minus)
            SbSignedNumber(sbStringResource(R.string.data_signed_zero, formatPercent(0.0, locale, 1)), SbSign.Zero)
        }
    }
}

@Composable
private fun TimeSection(state: DataUiState) {
    val m = sbMessages()
    val today = state.today
    Section(sbStringResource(R.string.data_time)) {
        SbMetaList(
            items = listOf(
                SbMetaItem(sbStringResource(R.string.data_day), m.dayDateWithYear(today)),
                SbMetaItem(sbStringResource(R.string.data_date), formatDate(today)),
                SbMetaItem(sbStringResource(R.string.data_date_short), m.shortDate(today)),
                SbMetaItem(sbStringResource(R.string.data_clock), m.timeOfDay(LocalTime.of(8, 12))),
                SbMetaItem(
                    sbStringResource(R.string.data_range),
                    sbStringResource(
                        R.string.data_range_value,
                        m.timeOfDay(LocalTime.of(8, 0)),
                        m.timeOfDay(LocalTime.of(22, 0)),
                    ),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_span),
                    sbStringResource(R.string.data_range_value, m.shortDate(today), m.shortDate(today.plusDays(4))),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_duration),
                    sbStringResource(R.string.data_duration_value, 1, 20),
                ),
                SbMetaItem(
                    sbStringResource(R.string.data_remaining),
                    sbStringResource(R.string.data_remaining_value, 3),
                ),
            ),
        )
    }
}

@Composable
private fun StateSection() {
    val t = SebaroTheme.tokens
    val locale = sbAppLocale()
    Section(sbStringResource(R.string.data_state)) {
        Column(verticalArrangement = Arrangement.spacedBy(t.space.s3)) {
            // the four fixed state words come from the copy
            SbStatus(SbStatusTone.Info)
            SbStatus(SbStatusTone.Neutral)
            SbStatus(SbStatusTone.Success)
            SbStatus(SbStatusTone.Danger)
            SbStatus(
                SbStatusTone.Warning,
                word = sbStringResource(R.string.data_state_conflict),
                glyph = SbStatusGlyph.Warning,
            )
            SbStatus(
                SbStatusTone.Neutral,
                word = sbStringResource(R.string.data_state_count_open, sbFormatCount(2)),
                glyph = SbStatusGlyph.Pending,
            )
        }
        val share = formatPercent(0.6, locale)
        SbProgressBar(0.6f, label = sbStringResource(R.string.data_import), valueText = share)
        SbProgressRing(0.6f, label = sbStringResource(R.string.data_goal_day), valueText = share)
        SbSteps(
            steps = listOf(
                sbStringResource(R.string.data_step_name),
                sbStringResource(R.string.data_step_data),
                sbStringResource(R.string.data_step_done),
            ),
            current = 1,
        )
    }
}

@Composable
private fun CategorySection() {
    val t = SebaroTheme.tokens
    Section(sbStringResource(R.string.data_categories)) {
        SbTags {
            SbTag(sbStringResource(R.string.data_tag_household))
            SbTag(sbStringResource(R.string.data_tag_garden))
        }
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(t.space.s6),
            verticalArrangement = Arrangement.spacedBy(t.space.s2),
        ) {
            SbCategory(sbStringResource(R.string.data_category_work), tone = 1)
            SbCategory(sbStringResource(R.string.data_category_family), tone = 2)
            SbCategory(sbStringResource(R.string.data_category_sport), tone = 3)
        }
        val sentence = sbStringResource(R.string.data_mark_sentence)
        val word = sbStringResource(R.string.data_mark_word)
        val at = sentence.indexOf(word, ignoreCase = true)
        SbMarkedText(sentence, marks = if (at >= 0) listOf(at until at + word.length) else emptyList())
    }
}

@Composable
private fun TechnicalSection() {
    val t = SebaroTheme.tokens
    val c = SebaroTheme.colors
    val label = SebaroTheme.typography.label
    val code = SebaroTheme.typography.code
    Section(sbStringResource(R.string.data_technical)) {
        Column(verticalArrangement = Arrangement.spacedBy(t.space.s1)) {
            Text(sbStringResource(R.string.data_id), style = label, color = c.textMuted)
            Text(sbStringResource(R.string.data_id_value), style = code, color = c.text)
        }
        Column(verticalArrangement = Arrangement.spacedBy(t.space.s1)) {
            Text(sbStringResource(R.string.data_version), style = label, color = c.textMuted)
            Text(sbStringResource(R.string.data_version_value), style = code, color = c.text)
        }
        Column(verticalArrangement = Arrangement.spacedBy(t.space.s1)) {
            Text(sbStringResource(R.string.data_file), style = label, color = c.textMuted)
            SbFileNameText(sbStringResource(R.string.data_file_value))
        }
        SbCodeBlock(
            code = sbStringResource(R.string.data_code_value),
            language = sbStringResource(R.string.data_code_language),
        )
    }
}

@Composable
private fun TableSection(state: DataUiState) {
    val locale = sbAppLocale()
    // how the table is sorted is the screen's own state, not data of the app
    var sortIndex by rememberSaveable { mutableIntStateOf(2) }
    var descending by rememberSaveable { mutableStateOf(true) }
    Section(sbStringResource(R.string.data_table)) {
        SbSortableTable(
            caption = sbStringResource(R.string.data_table_caption),
            columns = listOf(
                SbTableColumn(sbStringResource(R.string.data_col_item)),
                SbTableColumn(sbStringResource(R.string.data_col_date), SbColumnKind.Date),
                SbTableColumn(sbStringResource(R.string.data_col_amount), SbColumnKind.Number),
            ),
            rows = state.expenses.map { expense ->
                listOf(
                    SbTableCell(sbStringResource(expense.name)),
                    SbTableCell(formatDate(expense.day), date = expense.day),
                    SbTableCell(formatMoney(expense.euros, locale), number = expense.euros),
                )
            },
            sortIndex = sortIndex,
            sortDescending = descending,
            onSort = { index, desc ->
                sortIndex = index
                descending = desc
            },
            rowHeads = true,
            sum = SbTableSum(
                sbStringResource(R.string.data_sum),
                mapOf(2 to formatMoney(state.expensesSum, locale)),
            ),
        )
    }
}

@Composable
private fun ChartSection(state: DataUiState) {
    val m = sbMessages()
    val locale = sbAppLocale()
    val goal = sbFormatCount(state.stepsGoal)
    Section(sbStringResource(R.string.data_charts)) {
        SbStats(
            listOf(
                SbStatItem(
                    sbStringResource(R.string.data_stat_steps),
                    sbFormatCount(state.stepsAverage),
                    spark = state.steps.map { it.toFloat() },
                ),
                SbStatItem(
                    sbStringResource(R.string.data_stat_streak),
                    sbPluralStringResource(R.plurals.data_days, 12, 12),
                ),
            ),
        )
        SbBarChart(
            bars = state.steps.mapIndexed { i, steps ->
                SbBar(m.weekdays[i], steps.toFloat(), sbFormatCount(steps), current = i == state.steps.lastIndex)
            },
            caption = sbStringResource(R.string.data_bar_caption, goal),
            target = SbChartValue(state.stepsGoal.toFloat(), goal),
        )
        val weeks = state.sleep.indices.map { state.today.minusWeeks((state.sleep.lastIndex - it).toLong()) }
        val month = DateTimeFormatter.ofPattern("LLLL", locale)
        SbLineChart(
            points = state.sleep.mapIndexed { i, hours ->
                SbLinePoint(
                    m.weekFrom(m.shortDate(weeks[i])),
                    hours,
                    hours?.let { formatDecimal(it.toDouble(), 1, locale) } ?: m.noValue,
                )
            },
            caption = sbStringResource(R.string.data_line_caption),
            // one month name over its weeks
            axis = weeks.groupBy { it.month }.values.map { SbAxisLabel(month.format(it.first()), span = it.size) },
        )
        SbShareRows(
            rows = state.shares.mapIndexed { i, share ->
                SbShareRow(
                    sbStringResource(share.name),
                    share.percent,
                    formatPercent(share.percent / 100.0, locale, if (share.percent % 1 == 0f) 0 else 1),
                    current = i == 0,
                )
            },
            caption = sbStringResource(R.string.data_share_caption),
        )
        SbGoalRing(done = 5, total = 8, caption = sbStringResource(R.string.data_goal_caption))
        SbRating(value = 4.2f, count = 38)
    }
}
