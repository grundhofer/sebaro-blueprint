package de.sebaro_ventures.musterapp.ui.data

import de.sebaro_ventures.musterapp.R
import java.time.LocalDate

/** Fixed states of the data screen: all values are invented. The app itself shows [normal]. */
object DataSamples {
    private val today = LocalDate.of(2026, 10, 10)

    /** The normal case. */
    val normal = DataUiState(
        today = today,
        expenses = listOf(
            Expense(R.string.data_expense_lock, today.withDayOfMonth(3), 42.90),
            Expense(R.string.data_expense_washer, today.withDayOfMonth(7), 1249.00),
            Expense(R.string.data_expense_soil, today.withDayOfMonth(8), 12.50),
            Expense(R.string.data_expense_boots, today.withDayOfMonth(9), 89.99),
        ),
        steps = listOf(6200, 8400, 7100, 9800, 5400, 10200, 7600),
        stepsGoal = 8000,
        sleep = listOf(5.2f, 5.8f, null, 6.1f, 6.6f, 6.4f),
        shares = listOf(
            Share(R.string.data_share_home, 46f),
            Share(R.string.data_share_food, 31f),
            Share(R.string.data_share_leisure, 23f),
        ),
    )

    /** The edge case: amounts in the millions, a week far above the goal, weeks without a value. */
    val large = normal.copy(
        expenses = normal.expenses.map { it.copy(euros = it.euros * 10_000) },
        steps = listOf(26200, 48400, 0, 99800, 5400, 110200, 76000),
        sleep = listOf(null, null, 11.5f, 0.5f, null, 6.4f),
        shares = listOf(
            Share(R.string.data_share_home, 98f),
            Share(R.string.data_share_food, 1.5f),
            Share(R.string.data_share_leisure, 0.5f),
        ),
    )
}
