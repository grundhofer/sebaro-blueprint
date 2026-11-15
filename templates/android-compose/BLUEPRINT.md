# Android blueprint

How every sebaro Android app is built. The design rules are in [`design/KERN.md`](../../design/KERN.md). This starter does not follow all of it yet; where they
differ, the blueprint wins (last section).

## Stack

- One activity, package `de.sebaro_ventures.<app>`, modules as below. Kotlin, Jetpack Compose, minSdk 29, Java 21.
  The versions are those of this starter's `gradle/libs.versions.toml`; every app keeps the same ones.
- Use without asking: AndroidX core, activity-compose, lifecycle, the Compose BOM, kotlinx-coroutines, Hilt, Room with
  KSP, DataStore, WorkManager (only for work that must run in the background). Tests: JUnit 4, Robolectric,
  Roborazzi.
- Not used: Koin, a navigation library, stock Material 3 controls. Any other library needs the owner's OK
  and one line with the reason in the app's docs.
- Offline by default: no INTERNET permission, no accounts, no analytics, backup off (`allowBackup="false"` and
  `dataExtractionRules`). An app that needs the network is a decided deviation of that product.
- Camera: [CAMERA.md](CAMERA.md).

## Modules

Modules are preferred, and required once an app has more than one area of screens or its own system service
(camera, microphone, foreground service):

```
:app             MainActivity, <App>Application, ui/<App>App.kt: theme, navigation, wiring
:designsystem    the sebaro copy
:product         sebaro-product/: sign, icons, start theme, AppProduct
:core:model      models and rules, a Kotlin/JVM module
:core:data       Room, DataStore, files, repositories. No Compose.
:core:ui         what several features show alike (formats, bottom navigation)
:core:testing    render-test base and fakes (testImplementation)
:core:<service>  one system service each, behind an interface
:feature:<area>  the screens of one area, one package per screen
```

Dependencies point one way: `:app` → `:feature:*` → `:core:*`. A feature never depends on another feature; it
exposes its routes, the rest is `internal`. A small app keeps these layers as packages: `data/`, `domain/`, `ui/`.

## Dependency injection

Hilt with KSP. `<App>Application` is `@HiltAndroidApp`, `MainActivity` is `@AndroidEntryPoint`. Each core module
binds its interfaces with `@Binds` in its own `@Module @InstallIn(SingletonComponent::class)`; `@Provides` only for
what has no constructor (Room, DataStore, `java.time.Clock`). A ViewModel is `@HiltViewModel` with
`@Inject constructor`, fetched in its route with `hiltViewModel()`; a service is `@AndroidEntryPoint`, a worker
`@HiltWorker`.

## A screen

Paths as in a small app; in a feature module drop `ui/`.

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
- Time comes only from the injected `java.time.Clock`, never from `now()`.
- Saving that can fail: a `suspend` function catches `SQLiteException` and `IOException` only and returns the
  result; the screen shows it in the primary action or a callout, never in a toast (core rule 14).
- Names of persisted enum entries never change. Migrations never destroy data.

## Navigation

No library. `ui/<App>App.kt` keeps a saved back stack of destinations in `rememberSaveable` and handles back with
`BackHandler`. Three to five top-level places sit in the bottom navigation (core rule 18).

## Text and language

All text is in string resources; number and unit are joined with `&#160;`. Read strings with the copy's
`sbStringResource` and `sbPluralStringResource`, so plurals and digits follow the app's language. The app names its
languages in `locales_config.xml`; the user chooses one in Android's settings for the app, not in the app. German and English from the first version: English in `values/` as the fallback,
German in `values-de/`. A further language is one `values-<xx>/` folder and its entry in `locales_config.xml`.
A string that a language lacks fails `check` (lint `MissingTranslation`).

## Design system

The sebaro copy is the folder `sebaro/` at the project root: profile `android`, the same files in every app, with
only the packs the app uses. Never edit it. It is its own library module, `:designsystem`:

```kotlin
// designsystem/build.gradle.kts; every module with screens has implementation(project(":designsystem"))
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
- Every ViewModel and every repository has a JVM test that builds it directly with a fixed clock and fakes, without Hilt.
- No instrumented tests by default.

## Build, quality, release

The convention plugins live in `build-logic/`, an export like the sebaro copy; never edit it in the app.
Other modules take `sebaro.android.library`, `:product` `sebaro.android.product`, modules with render tests
`sebaro.android.rendertests`. `sebaro.android.app` sets:

- R8 and resource shrinking in every release build; the build fails if an app switches them off.
- The upload signing from the four `SEBARO_UPLOAD_*` values; versionCode is the number of commits.
- detekt and ktlint as part of `check`.
- Publishing to Google Play.

Three workflows run on the family's own runner (`vars.SEBARO_RUNNER`):

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request | the copy's three checks (below), debug build, tests, lint, detekt, ktlint, release build and bundle; fails if the release asks for INTERNET or for anything not in `release-permissions.txt` |
| `release` | by hand, default branch | tests and checks, signed bundle to the internal track, tag |
| `promote` | by hand | internal track to production, or change the roll-out, without rebuilding |

A release to production always needs the owner's OK.

## Updates

- Dependabot checks `gradle` and `github-actions` weekly; minor and patch updates come as one pull request.
- The sebaro copy is updated with `node sebaro/checks/update-copy.mjs`, `build-logic/` by exporting it again;
  neither by hand: each has a manifest and a check that fails on a hand edit.

## Size and speed

- An app with native libraries ships only the ABIs it needs.
- Nothing blocks the main thread: database and files only in `suspend` functions and Flows. Lists are lazy and
  have stable keys.
- `WhileSubscribed(5_000)` stops work while nobody looks at the screen.
- No baseline profile and no size budget until a measured problem needs one.

## Before you say done

```sh
./gradlew assembleDebug                      # no Kotlin warnings
./gradlew testDebugUnitTest                  # unit and render tests, then look at docs/screens/
./gradlew check                              # lint, detekt, ktlint
```

Then the copy's three checks, and say what you could not check:

```sh
node sebaro/checks/verify-export.mjs sebaro --strict     # the copy is unchanged
for d in app/src */*/src; do sh sebaro/checks/lint-android.sh $d; done  # silence: all kept
python3 sebaro/product/product_kit.py check sebaro.product.json --copy sebaro --out sebaro-product --no-raster
```

## Where this starter still differs

- It is one module wired by hand (`AppContainer`): copy its screens and tests, not its wiring.
- It carries no `build-logic/`, no detekt configuration, no `.editorconfig` and no workflows. They are the export
  of the family's private build repository: a product runs that export first, and the starter builds only then.
- Its data screen has no ViewModel, because it reads nothing: it is a catalogue of data kinds with invented
  values. Do not copy that; a screen that reads something has one.
- The render test of the data screen draws a screen 4400 dp high instead of 800 dp, so its whole length shows.
