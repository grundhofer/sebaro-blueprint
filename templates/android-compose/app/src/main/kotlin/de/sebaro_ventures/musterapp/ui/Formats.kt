package de.sebaro_ventures.musterapp.ui

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import de.sebaro_ventures.design.designsystem.sbAppLocale
import de.sebaro_ventures.design.designsystem.sbStringResource
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.domain.Priority
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Currency
import java.util.Locale

// Numbers and dates go through the app's locale and are never glued together by hand. Units and words come from
// the string table; the space between a number and its unit is U+00A0.

/** U+202F and U+2009, the narrow spaces some locales write, become U+00A0. */
private fun String.withNoBreakSpaces(): String = replace(' ', ' ').replace(' ', ' ')

fun formatDecimal(value: Double, digits: Int, locale: Locale): String =
    NumberFormat.getNumberInstance(locale).apply {
        minimumFractionDigits = digits
        maximumFractionDigits = digits
    }.format(value).withNoBreakSpaces()

fun formatPercent(fraction: Double, locale: Locale, digits: Int = 0): String =
    NumberFormat.getPercentInstance(locale).apply {
        minimumFractionDigits = digits
        maximumFractionDigits = digits
    }.format(fraction).withNoBreakSpaces()

fun formatMoney(euros: Double, locale: Locale): String =
    NumberFormat.getCurrencyInstance(locale).apply { currency = Currency.getInstance("EUR") }
        .format(euros).withNoBreakSpaces()

/** „10.10.2026“ in German, „2026-10-10“ in English: the pattern is a string of the app's language. */
@Composable
fun formatDate(date: LocalDate): String =
    DateTimeFormatter.ofPattern(sbStringResource(R.string.date_pattern), sbAppLocale()).format(date)

/** The word of a priority. */
@StringRes
fun Priority.label(): Int = when (this) {
    Priority.Low -> R.string.priority_low
    Priority.Normal -> R.string.priority_normal
    Priority.High -> R.string.priority_high
}
