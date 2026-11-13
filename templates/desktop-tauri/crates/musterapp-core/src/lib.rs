//! musterapp-core: what the app knows without a window. No Tauri here: the shell (apps/desktop/src-tauri) calls
//! these functions from its commands, a command-line tool or a test calls them the same way.
//!
//! Today that is the settings and their file. A product puts its documents and their rules here.

use std::{fmt, fs, io, path::Path};

use serde::{Deserialize, Serialize};

/// „Hell oder Dunkel“: `System` follows the computer's own setting.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    #[default]
    System,
    Light,
    Dark,
}

/// „Farbton“: Kühl or Warm.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Tone {
    #[default]
    Cool,
    Warm,
}

/// What the settings file holds. A key the file lacks takes its default.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    pub theme: Theme,
    pub tone: Tone,
}

impl Settings {
    /// The settings in `file`. A file that is missing or does not read as settings gives the defaults, so the app
    /// always starts; the next `save` writes a good file.
    pub fn load(file: &Path) -> Settings {
        fs::read_to_string(file)
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    /// Writes the settings to `file` and makes the folders above it.
    pub fn save(&self, file: &Path) -> Result<(), Error> {
        let text = serde_json::to_string_pretty(self).map_err(io::Error::from)?;
        if let Some(folder) = file.parent() {
            fs::create_dir_all(folder)?;
        }
        Ok(fs::write(file, text + "\n")?)
    }
}

/// What can go wrong here. The shell gives each variant a code, the UI a sentence (i18n/, `errors`).
#[derive(Debug)]
pub enum Error {
    /// The settings file could not be written.
    SettingsNotSaved(io::Error),
}

impl From<io::Error> for Error {
    fn from(cause: io::Error) -> Self {
        Error::SettingsNotSaved(cause)
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::SettingsNotSaved(cause) => {
                write!(f, "the settings file could not be written: {cause}")
            }
        }
    }
}

impl std::error::Error for Error {}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    /// A folder of this test alone, emptied before the test uses it.
    fn folder(test: &str) -> PathBuf {
        let folder =
            std::env::temp_dir().join(format!("musterapp-core-{}-{test}", std::process::id()));
        let _ = fs::remove_dir_all(&folder);
        folder
    }

    #[test]
    fn saved_settings_are_loaded_again() {
        let file = folder("round-trip").join("deep").join("settings.json");
        let settings = Settings {
            theme: Theme::Dark,
            tone: Tone::Warm,
        };
        settings
            .save(&file)
            .expect("the folders are made, the file is written");
        assert_eq!(Settings::load(&file), settings);
    }

    #[test]
    fn the_file_names_the_choices_in_words() {
        let file = folder("words").join("settings.json");
        Settings {
            theme: Theme::Light,
            tone: Tone::Cool,
        }
        .save(&file)
        .unwrap();
        let text = fs::read_to_string(&file).unwrap();
        assert!(
            text.contains(r#""theme": "light""#) && text.contains(r#""tone": "cool""#),
            "{text}"
        );
    }

    #[test]
    fn a_missing_or_broken_file_gives_the_defaults() {
        let dir = folder("broken");
        fs::create_dir_all(&dir).unwrap();
        assert_eq!(Settings::load(&dir.join("none.json")), Settings::default());
        for text in ["", "{", r#"{"theme": "blue"}"#, "[1, 2]"] {
            let file = dir.join("settings.json");
            fs::write(&file, text).unwrap();
            assert_eq!(Settings::load(&file), Settings::default(), "{text}");
        }
    }

    #[test]
    fn a_missing_key_takes_its_default() {
        let file = folder("partial").join("settings.json");
        fs::create_dir_all(file.parent().unwrap()).unwrap();
        fs::write(&file, r#"{"tone": "warm"}"#).unwrap();
        assert_eq!(
            Settings::load(&file),
            Settings {
                theme: Theme::System,
                tone: Tone::Warm
            }
        );
    }

    #[test]
    fn a_file_that_cannot_be_written_is_an_error() {
        let dir = folder("unwritable");
        fs::create_dir_all(&dir).unwrap();
        // the place of the file is taken by a folder
        let error = Settings::default()
            .save(&dir)
            .expect_err("a folder is no file");
        assert!(matches!(error, Error::SettingsNotSaved(_)));
        assert!(error
            .to_string()
            .starts_with("the settings file could not be written"));
    }
}
