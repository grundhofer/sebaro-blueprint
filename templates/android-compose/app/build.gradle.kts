plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.room)
    // R8, signing, versionCode, detekt, ktlint, Google Play and the product files in ../sebaro-product
    id("sebaro.android.app")
}

android {
    namespace = "de.sebaro_ventures.musterapp"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "de.sebaro_ventures.musterapp"
        minSdk = libs.versions.minSdk.get().toInt()
        targetSdk = libs.versions.targetSdk.get().toInt()
        // the fallback without git or a release tag; sebaro.android.app sets both
        versionCode = 1
        versionName = "0.1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildFeatures {
        compose = true
    }

    // The theme loads the texts in the app's language, so every language stays in the base APK of a bundle.
    bundle {
        language {
            enableSplit = false
        }
    }

    testOptions {
        unitTests.isIncludeAndroidResources = true
    }

    lint {
        // targetSdk is the family's decision in the version catalog, not always the newest API
        disable += "OldTargetApi"
    }
}

// Room writes the schema of every database version here; a migration is tested against it.
room {
    schemaDirectory("$projectDir/schemas")
}

// Render tests: Robolectric draws with the Android 16 framework jar that Gradle fetched (no download in a test),
// Roborazzi writes the pictures to docs/screens/.
val robolectricAndroidAll: Configuration = configurations.create("robolectricAndroidAll")
val screens = rootProject.layout.projectDirectory.dir("docs/screens").asFile.path

tasks.withType<Test>().configureEach {
    inputs.files(robolectricAndroidAll)
    systemProperty("roborazzi.test.record", "true")
    systemProperty("robolectric.offline", "true")
    systemProperty("musterapp.screens", screens)
    jvmArgumentProviders.add(RobolectricJars(robolectricAndroidAll))
    // SDK 36 reaches into java.base internals that JDK 17 and later close
    jvmArgs("--add-opens=java.base/jdk.internal.access=ALL-UNNAMED", "--add-opens=java.base/java.io=ALL-UNNAMED")
    maxHeapSize = "3g"
    // the pictures are no declared output: every run draws them again
    outputs.upToDateWhen { false }
    outputs.cacheIf { false }
}

/** Tells Robolectric where the framework jar lies. */
class RobolectricJars(
    @get:InputFiles @get:PathSensitive(PathSensitivity.NONE) val jars: FileCollection,
) : CommandLineArgumentProvider {
    override fun asArguments() = listOf("-Drobolectric.dependency.dir=${jars.singleFile.parent}")
}

dependencies {
    implementation(project(":designsystem"))

    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.room.runtime)
    ksp(libs.room.compiler)
    implementation(libs.datastore.preferences)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.robolectric)
    testImplementation(platform(libs.compose.bom))
    testImplementation(libs.compose.ui.test.junit4)
    testImplementation(libs.roborazzi)
    // the empty activity a Compose test draws in
    debugImplementation(platform(libs.compose.bom))
    debugImplementation(libs.compose.ui.test.manifest)
    robolectricAndroidAll(libs.robolectric.android.all)
}
