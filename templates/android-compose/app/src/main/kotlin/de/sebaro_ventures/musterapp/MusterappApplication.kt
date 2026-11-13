package de.sebaro_ventures.musterapp

import android.app.Application
import android.content.Context

/** Holds the one [AppContainer] of the process. */
class MusterappApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}

/** The process's [AppContainer], from any context. */
val Context.appContainer: AppContainer
    get() = (applicationContext as MusterappApplication).container
