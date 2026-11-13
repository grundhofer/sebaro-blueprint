package de.sebaro_ventures.musterapp.ui.data

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import java.time.LocalDate
import kotlin.math.roundToInt

/** One row of the table: what was bought, when and for how much. */
@Immutable
data class Expense(@param:StringRes val name: Int, val day: LocalDate, val euros: Double)

/** One share of the expenses in per cent. */
@Immutable
data class Share(@param:StringRes val name: Int, val percent: Float)

/** The series and rows of the data screen. Its single figures are written in the screen, where they are shown. */
@Immutable
data class DataUiState(
    /** The day the figures stand for. */
    val today: LocalDate,
    val expenses: List<Expense>,
    /** The steps of each day of this week, Monday first; the last one is today. */
    val steps: List<Int>,
    val stepsGoal: Int,
    /** Hours of sleep week by week, this week last; null: no value. */
    val sleep: List<Float?>,
    /** The areas of the expenses, the largest first. */
    val shares: List<Share>,
) {
    val expensesSum: Double get() = expenses.sumOf { it.euros }

    val stepsAverage: Int get() = steps.average().roundToInt()
}
