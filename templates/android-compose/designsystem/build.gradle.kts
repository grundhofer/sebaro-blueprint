// The module of the sebaro copy in ../sebaro (never edited). This file belongs to the app and stands outside the
// copy, where any added file fails its check.
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.compose)
    id("sebaro.android.designsystem") // namespace, Compose, the sources sebaro/kotlin and sebaro/res
}

android {
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        // never above the app's
        minSdk = libs.versions.minSdk.get().toInt()
    }
}

dependencies {
    api(platform(libs.compose.bom))
    api(libs.compose.material3)
    // BackHandler of SbScreen
    implementation(libs.androidx.activity.compose)
}
