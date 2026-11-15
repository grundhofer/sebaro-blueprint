# Android camera recipe

How a sebaro Android app uses the camera. Two products follow it (a document scanner and a code scanner); a new one
starts here instead of deciding it again. The blueprint ([BLUEPRINT.md](BLUEPRINT.md)) still holds; this adds only
what the camera needs.

## Libraries

CameraX with the Compose viewfinder, not `camera-view`: the preview is a composable, no `AndroidView`. One version
for all four entries, the newest stable (not an `rc`).

```toml
[versions]
camerax = "1.6.2"

[libraries]
camera-core = { module = "androidx.camera:camera-core", version.ref = "camerax" }
camera-camera2 = { module = "androidx.camera:camera-camera2", version.ref = "camerax" }
camera-lifecycle = { module = "androidx.camera:camera-lifecycle", version.ref = "camerax" }
camera-compose = { module = "androidx.camera:camera-compose", version.ref = "camerax" }
```

The camera sits in its own module `:core:camera` (BLUEPRINT.md, Modules). It has `api(libs.camera.core)`, because
`SurfaceRequest` is part of its interface, and `implementation` of `camera2` and `lifecycle`; the feature with the
viewfinder has `camera-compose`.

## Manifest

In the manifest of `:core:camera`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
<uses-feature android:name="android.hardware.camera.flash" android:required="false" />
```

`required="false"`: a device without a camera installs the app too and gets what works without one (reading from a
picture through the Photo Picker, which needs no storage permission). CAMERA goes into `release-permissions.txt`.

## Who owns the camera

- One camera object per visit to the screen, created and released by the **route**, never by a ViewModel: the
  ViewModel outlives the visit, and a camera held there keeps the system's camera indicator on.
- Behind an interface with a factory, so the ViewModel can hand out the factory through Hilt and a test can replace
  it:

  ```kotlin
  interface Scanner {
      val preview: StateFlow<SurfaceRequest?>   // for CameraXViewfinder; null until bound
      val status: StateFlow<CameraStatus>       // Starting, Ready(hasTorch), Unavailable
      val torchOn: StateFlow<Boolean>
      suspend fun bind(owner: LifecycleOwner, onResult: (Result) -> Unit)
      fun setTorch(on: Boolean)
      fun release()                             // unbindAll; calling it twice does no harm
      fun interface Factory { fun create(): Scanner }
  }
  ```

- In the route: `remember(viewModel) { viewModel.scanners.create() }`, `DisposableEffect(scanner) { onDispose {
  scanner.release() } }`, `LaunchedEffect(scanner, owner) { scanner.bind(owner, viewModel::onResult) }` with
  `LocalLifecycleOwner.current`. Binding to the lifecycle stops the camera when the app goes to the background.
- Failures (no back camera, another app holds it) land in `status`, never as an exception; the screen shows a
  callout, no empty dark box.
- Image analysis runs on a background executor with `STRATEGY_KEEP_ONLY_LATEST`; turn frames upright before reading
  them. The first result wins: further frames are ignored until the screen has handled it.

## Permission

Ask for CAMERA only when the screen opens, not at the app's start. Refused: view type `state-permission` with the
sentence what the camera is for and one action. When Android no longer asks
(`shouldShowRequestPermissionRationale` false after a refusal), the action opens Android's settings for the app.

## Screen and tests

- The screen takes the viewfinder as a slot (`preview: @Composable (Modifier) -> Unit`) and the camera state as
  data. The route passes `CameraXViewfinder(surfaceRequest = it, modifier = modifier)`.
- Robolectric cannot draw a camera: the render test passes a plain surface in the slot and draws every state
  (starting, ready with and without torch, torch on, unavailable, no permission).
- The torch is an icon button whose icon (outline or filled) and description follow its state.

## Not checked by the tests

The preview, the analysis on real frames (blur, light, angle), the torch and the Photo Picker run only on a device.
Say so when a camera screen is called done.
