// commands.rs: the commands the UI may call, and everything that crosses to it. The types here are the ones the
// bindings are generated from (apps/desktop/ui/src/ipc/bindings.ts); the core knows no UI and no binding tool, so
// its types are turned into these.
use std::path::PathBuf;

use musterapp_core::Settings;
use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::{AppHandle, Manager, WebviewWindow};

use crate::window;

#[derive(Clone, Copy, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    System,
    Light,
    Dark,
}

#[derive(Clone, Copy, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Tone {
    Cool,
    Warm,
}

impl From<Theme> for musterapp_core::Theme {
    fn from(theme: Theme) -> Self {
        match theme {
            Theme::System => Self::System,
            Theme::Light => Self::Light,
            Theme::Dark => Self::Dark,
        }
    }
}

impl From<Tone> for musterapp_core::Tone {
    fn from(tone: Tone) -> Self {
        match tone {
            Tone::Cool => Self::Cool,
            Tone::Warm => Self::Warm,
        }
    }
}

/// The codes an error carries to the UI. The UI maps each to a sentence: `errors.<code>` in i18n/<language>.json.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum ErrorCode {
    SettingsNotSaved,
}

/// What a failed command gives the UI: a code, never a sentence.
#[derive(Debug, Serialize, Type)]
pub struct CommandError {
    pub code: ErrorCode,
}

impl From<musterapp_core::Error> for CommandError {
    fn from(error: musterapp_core::Error) -> Self {
        let code = match error {
            musterapp_core::Error::SettingsNotSaved(_) => ErrorCode::SettingsNotSaved,
        };
        CommandError { code }
    }
}

/// The app's settings file, in the folder the system gives the app for its configuration.
fn settings_file(app: &AppHandle) -> Option<PathBuf> {
    app.path()
        .app_config_dir()
        .ok()
        .map(|folder| folder.join("settings.json"))
}

/// The stored settings; the defaults while nothing is stored.
pub fn settings(app: &AppHandle) -> Settings {
    settings_file(app)
        .map(|file| Settings::load(&file))
        .unwrap_or_default()
}

/// „Hell oder Dunkel“ and „Farbton“ were chosen: every window takes the choice at once, then the settings file
/// keeps it. A choice that could not be stored still holds until the app closes; the error says so.
#[tauri::command]
#[specta::specta]
pub fn set_appearance(app: AppHandle, theme: Theme, tone: Tone) -> Result<(), CommandError> {
    let settings = Settings {
        theme: theme.into(),
        tone: tone.into(),
    };
    for window in app.webview_windows().values() {
        window::apply(window, &settings);
    }
    let file = settings_file(&app).ok_or(CommandError {
        code: ErrorCode::SettingsNotSaved,
    })?;
    Ok(settings.save(&file)?)
}

/// The title the system shows for the window: „<place> · <app>“.
#[tauri::command]
#[specta::specta]
pub fn set_window_title(window: WebviewWindow, title: String) {
    // a title the system refuses changes nothing the person could act on: the old one stays
    let _ = window.set_title(&title);
}

#[cfg(test)]
mod tests {
    use super::ErrorCode;

    /// Every code; a new one is added here.
    const ALL: [ErrorCode; 1] = [ErrorCode::SettingsNotSaved];

    /// The shell's codes and the UI's sentences meet in i18n/: every code has its sentence in every language.
    #[test]
    fn every_error_code_has_a_sentence_in_every_language() {
        let folder = concat!(env!("CARGO_MANIFEST_DIR"), "/../../../i18n");
        let files: Vec<_> = std::fs::read_dir(folder)
            .expect("i18n/ exists")
            .flatten()
            .map(|entry| entry.path())
            .collect();
        assert!(files.len() >= 2, "German and English from the start");
        for file in files {
            let text = std::fs::read_to_string(&file).expect("a language file can be read");
            let words: serde_json::Value =
                serde_json::from_str(&text).expect("a language file is JSON");
            for code in ALL {
                let name = serde_json::to_value(code).expect("a code is a word");
                let key = name.as_str().expect("a code is a word");
                assert!(
                    words["errors"][key].is_string(),
                    "{}: errors.{key} is missing",
                    file.display()
                );
            }
        }
    }
}
