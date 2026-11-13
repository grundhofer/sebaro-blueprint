# Android blueprint

How every sebaro Android app is built under the hood: stack, structure, tests, release and updates. The design
rules are in [`design/KERN.md`](../../design/KERN.md). This starter does not follow all of it yet; where they
differ, the blueprint wins (last section).

## Stack

- One app module `:app` (plus `:designsystem` for the sebaro copy), one activity, package
  `de.sebaro_ventures.<app>`. Kotlin, Jetpack Compose, minSdk 29,
  Java 21. The versions are those of this starter's `gradle/libs.versions.toml`; every app keeps the same ones.
- Use without asking: AndroidX core, activity-compose, lifecycle, the Compose BOM, kotlinx-coroutines, Room with
  KSP, DataStore, WorkManager (only for work that must run in the background). Tests: JUnit 4, Robolectric,
  Roborazzi.
- Not used: Hilt or Koin, a navigation library, stock Material 3 controls. Any other library needs the owner's OK
  and one line with the reason in the app's docs.
- Offline by default: no INTERNET permission, no accounts, no analytics, backup off (`allowBackup="false"` and
  `dataExtractionRules`). An app that needs the network is a decided deviation of that product.

## Structure

```
MainActivity.kt  <App>Application.kt  AppContainer.kt
data/            Room, DataStore, files, repositories. No Compose.
domain/          plain Kotlin models and rules, where the app has any
ui/<App>App.kt   root: theme, navigation state
ui/<screen>/     one package per screen
```

Dependencies point one way: `ui` → `data` → `domain`.

## Dependency injection

`AppContainer(context)` holds everything that lives as long as the process: one instance, created in
`<App>Application.onCreate`, every member `lazy`, factories as constructor parameters with defaults so a test can
replace them. Reach it with `context.appContainer`, in Compose with `LocalAppContainer.current`. Create a
ViewModel with `appViewModel { c -> XViewModel(c.repository, c.clock) }`; a ViewModel gets what it needs in its
constructor, never the whole container.

## A screen

| File | Content |
|---|---|
| `ui/<screen>/<Screen>Screen.kt` | `@Composable fun <Screen>Screen(state: <Screen>UiState, …callbacks)`. Stateless: no ViewModel, no `remember` for domain data, no clock. |
| `<Screen>UiState` | `@Immutable data class`: everything the screen shows, as data. No finished UI sentences. |
| `ui/<screen>/<Screen>ViewModel.kt` | `val state: StateFlow<<Screen>UiState>` from `combine(…).stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), …)`; actions as `fun onX()` that launch in `viewModelScope`. A draft the user is typing lives in `SavedStateHandle`. |
| `ui/<screen>/<Screen>Route.kt` | gets the ViewModel, collects with `collectAsStateWithLifecycle()`, calls the screen. |
| `ui/<screen>/<Screen>Samples.kt` | `object <Screen>Samples` with fixed sample states: the normal case, the empty state, one edge case (long texts, many entries). |
| `res/values/strings_<screen>.xml` | every text of the screen, names prefixed `<screen>_`, quantities as `<plurals>`. |
| `render/<Screen>RenderTest.kt` | draws every sample state (see Tests). |

- Repositories read as `Flow` and write as `suspend`.
- Time comes only from the container's `java.time.Clock`, never from `now()`.
- Saving that can fail: a `suspend` function catches `SQLiteException` and `IOException` only and returns the
  result; the screen shows it in the primary action or a callout, never in a toast (core rule 14).
- Names of persisted enum entries never change. Migrations never destroy data.

## Navigation

No library. `ui/<App>App.kt` keeps a saved back stack of destinations in `rememberSaveable` and handles back with
`BackHandler`. Three to five top-level places sit in the bottom navigation (core rule 18).

## Text and language

All text is in string resources; number and unit are joined with `&#160;`. Read strings with the copy's
`sbStringResource` and `sbPluralStringResource`, so plurals and digits follow the app's language. The app names its
languages in `locales_config.xml`; the user chooses the language in Android's settings for the app, the app has no
language setting of its own. German and English from the first version: English in `values/` as the fallback,
German in `values-de/`. A further language is one `values-<xx>/` folder and its entry in `locales_config.xml`.
Android lint reports a string that a language lacks (`MissingTranslation`) as an error, so `check` fails.

## Design system

The sebaro copy is the folder `sebaro/` at the project root: profile `android`, the same files in every app, with
only the packs the app uses. Never edit it. It is its own library module, `:designsystem`:

```kotlin
// designsystem/build.gradle.kts; :app has implementation(project(":designsystem"))
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.compose)
    id("sebaro.android.designsystem")   // namespace, Compose, the sources sebaro/kotlin and sebaro/res
}
android {
    compileSdk = libs.versions.compileSdk.get().toInt()
    defaultConfig { minSdk = libs.versions.minSdk.get().toInt() }
}
dependencies {
    api(platform(libs.compose.bom))
    api(libs.compose.material3)
    implementation(libs.androidx.activity.compose)
}
```

The app's own sebaro files (launcher icon, notification icon, sign tile, start symbol, the constant `AppProduct`)
are generated from `sebaro.product.json` into `sebaro-product/`; `sebaro.android.app` adds that folder to `:app`:

```sh
python3 sebaro/product/product_kit.py build sebaro.product.json --copy sebaro --out sebaro-product
```

Every screen is rooted in `SebaroAppTheme` and built with `SbScreen` and the `Sb*` parts. When you move an app
from an older copy, read the first section of the copy's README: three old calls compile and go wrong.

## Tests

- Every screen has a render test that draws each sample state light, dark and at large text (font scale 1.3,
  core rule 30) on a 360 × 800 dp phone, with Robolectric and Roborazzi on the JVM. The pictures go to
  `docs/screens/<screen>-<state>-<light|dark|large>.png` and are committed, so a changed screen shows in the diff.
  A green test only says it was drawn: look at the pictures.
- Every ViewModel and every repository has a JVM test. Tests replace the clock and the factories of the container.
- No instrumented tests by default.

## Build, quality, release

The convention plugin `sebaro.android.app` lives in `build-logic/`, an export like the sebaro copy; never edit it
in the app. It sets:

- R8 and resource shrinking in every release build; the build fails if an app switches them off.
- The upload signing from the four `SEBARO_UPLOAD_*` values; versionCode is the number of commits.
- detekt and ktlint as part of `check`.
- Publishing to Google Play.

Three workflows run on the family's own runner (`vars.SEBARO_RUNNER`):

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request | the copy's three checks (below), debug build, tests, lint, detekt, ktlint, release build and bundle; fails if the release asks for INTERNET |
| `release` | by hand, default branch | tests and checks, signed bundle to the internal track, tag |
| `promote` | by hand | internal track to production, or change the roll-out, without rebuilding |

A release to production always needs the owner's OK.

## Updates

- Dependabot checks `gradle` (the version catalog) and `github-actions` once a week; minor and patch updates come
  as one grouped pull request.
- The sebaro copy is updated with `node sebaro/checks/update-copy.mjs`, `build-logic/` by exporting it again;
  neither by hand. Each has a manifest (`sebaro-export.json`, `sebaro-build-export.json`) and a check that fails
  on a hand edit.

## Size and speed

- R8 and resource shrinking are on (enforced above). An app with native libraries ships only the ABIs it needs.
- Nothing blocks the main thread: database and files only in `suspend` functions and Flows. Lists are lazy and
  have stable keys.
- `WhileSubscribed(5_000)` stops work while nobody looks at the screen.
- There is no baseline profile and no size budget in numbers yet. Add them when a measured problem exists.

## Before you say done

```sh
./gradlew :app:assembleDebug                 # no Kotlin warnings
./gradlew :app:testDebugUnitTest             # unit and render tests, then look at docs/screens/
./gradlew :app:check                         # lint, detekt, ktlint
```

Then the copy's three checks, and say what you could not check:

```sh
node sebaro/checks/verify-export.mjs sebaro --strict     # the copy is unchanged
sh sebaro/checks/lint-android.sh app/src                 # sebaro's rules; silence means none is broken
python3 sebaro/product/product_kit.py check sebaro.product.json --copy sebaro --out sebaro-product --no-raster
```

## Where this starter still differs

- It carries no `build-logic/`, no detekt configuration, no `.editorconfig` and no workflows. They are the export
  of the family's private build repository: a product runs that export first, and the starter builds only then.
- Its data screen has no ViewModel, because it reads nothing: it is a catalogue of data kinds with invented
  values. Do not copy that; a screen that reads something has one.
- The render test of the data screen draws a screen 4400 dp high instead of 800 dp, so its whole length shows.
