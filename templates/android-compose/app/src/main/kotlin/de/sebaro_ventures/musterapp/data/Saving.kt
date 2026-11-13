package de.sebaro_ventures.musterapp.data

import android.database.sqlite.SQLiteException
import java.io.IOException

/**
 * Runs a write to Room or DataStore and says whether it went through. Only a failure of the storage is caught
 * (a full disk, a locked database, a file that cannot be written): a programming error stays loud, and a
 * cancellation ends the coroutine as usual. The screen shows a false result in its primary action or in a callout,
 * never in a toast.
 */
suspend fun trySave(write: suspend () -> Unit): Boolean = try {
    write()
    true
} catch (expected: SQLiteException) {
    false
} catch (expected: IOException) {
    false
}
