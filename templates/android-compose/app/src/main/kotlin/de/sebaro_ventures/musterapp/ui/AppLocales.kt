package de.sebaro_ventures.musterapp.ui

import android.content.res.Resources
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalResources
import de.sebaro_ventures.musterapp.R
import org.xmlpull.v1.XmlPullParser
import java.util.Locale

private const val ANDROID = "http://schemas.android.com/apk/res/android"

/**
 * The app's languages for the root theme, read from res/xml/locales_config.xml: the file Android reads for the
 * language choice in its settings for the app. A new language needs its values folder and one line there.
 */
fun appLocales(resources: Resources): List<Locale> {
    val locales = mutableListOf<Locale>()
    resources.getXml(R.xml.locales_config).use { xml ->
        while (xml.next() != XmlPullParser.END_DOCUMENT) {
            if (xml.eventType == XmlPullParser.START_TAG && xml.name == "locale") {
                locales += Locale.forLanguageTag(xml.getAttributeValue(ANDROID, "name"))
            }
        }
    }
    return locales
}

@Composable
fun appLocales(): List<Locale> {
    val resources = LocalResources.current
    return remember(resources) { appLocales(resources) }
}
