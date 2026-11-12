pluginManagement {
    // The family's build setup (plugins sebaro.android.app and sebaro.android.designsystem). It is not part of this
    // starter: a product exports it into build-logic/ (README.md).
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "musterapp"

include(":app")
// the sebaro copy in sebaro/ as a library module
include(":designsystem")
