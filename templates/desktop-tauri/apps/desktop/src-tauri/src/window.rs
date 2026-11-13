// window.rs: the main window. It is made here, not in tauri.conf.json, so it has the stored „Hell oder Dunkel“ and
// its ground before the page paints. The four grounds come from the sebaro copy at build time (build.rs).
// On macOS the UI's own bar is the title bar (overlay style, hidden title); Windows and Linux keep the system frame.
use musterapp_core::{Settings, Theme, Tone};
use tauri::{
    window::Color, App, Theme as SystemTheme, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

include!(concat!(env!("OUT_DIR"), "/grounds.rs"));

/// The mode the window is told to show; `None` lets it follow the system.
fn mode(settings: &Settings) -> Option<SystemTheme> {
    match settings.theme {
        Theme::System => None,
        Theme::Light => Some(SystemTheme::Light),
        Theme::Dark => Some(SystemTheme::Dark),
    }
}

fn ground(tone: Tone, dark: bool) -> Color {
    let [red, green, blue] = GROUNDS[usize::from(tone == Tone::Warm)][usize::from(dark)];
    Color(red, green, blue, 255)
}

/// Runs in the page before its own scripts: the stored choice where the copy's theme-init.js reads it (only "warm"
/// is stored as a tone), and the platform, which decides the form of the title bar and of the shortcuts.
fn init_script(settings: &Settings) -> String {
    let platform = match std::env::consts::OS {
        "macos" => "mac",
        "windows" => "windows",
        _ => "linux",
    };
    let theme = match settings.theme {
        Theme::System => "null",
        Theme::Light => "'light'",
        Theme::Dark => "'dark'",
    };
    let tone = match settings.tone {
        Tone::Cool => "null",
        Tone::Warm => "'warm'",
    };
    format!(
        "(function () {{ try {{ var theme = {theme}, tone = {tone};\n\
         if (theme) localStorage.setItem('sb-theme', theme); else localStorage.removeItem('sb-theme');\n\
         if (tone) localStorage.setItem('sb-tone', tone); else localStorage.removeItem('sb-tone'); }} catch (e) {{}}\n\
         document.documentElement.setAttribute('data-sb-platform', '{platform}'); }})();"
    )
}

/// Makes the main window with the stored choice.
pub fn open(app: &App, settings: &Settings) -> tauri::Result<()> {
    let builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title(&app.package_info().name)
        .inner_size(1200.0, 800.0)
        .min_inner_size(480.0, 400.0)
        .theme(mode(settings))
        .background_color(ground(
            settings.tone,
            mode(settings) == Some(SystemTheme::Dark),
        ))
        .initialization_script(init_script(settings));
    #[cfg(target_os = "macos")]
    let builder = builder
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true);
    let window = builder.build()?;
    // "follow the system": only the window itself knows which mode the system shows
    apply(&window, settings);
    Ok(())
}

/// Sets the mode and the ground of a window to the choice.
pub fn apply(window: &WebviewWindow, settings: &Settings) {
    let _ = window.set_theme(mode(settings));
    let dark = match mode(settings) {
        Some(theme) => theme == SystemTheme::Dark,
        None => window
            .theme()
            .map(|theme| theme == SystemTheme::Dark)
            .unwrap_or(false),
    };
    let _ = window.set_background_color(Some(ground(settings.tone, dark)));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_grounds_are_the_four_of_the_copy() {
        let all = [GROUNDS[0][0], GROUNDS[0][1], GROUNDS[1][0], GROUNDS[1][1]];
        for (at, one) in all.iter().enumerate() {
            assert!(
                all.iter().skip(at + 1).all(|other| other != one),
                "four different grounds: {all:?}"
            );
        }
        // light grounds are light, dark grounds dark
        let light =
            |ground: [u8; 3]| ground.iter().map(|&part| u32::from(part)).sum::<u32>() > 3 * 128;
        assert!(
            light(GROUNDS[0][0])
                && !light(GROUNDS[0][1])
                && light(GROUNDS[1][0])
                && !light(GROUNDS[1][1])
        );
    }

    #[test]
    fn the_page_gets_the_stored_choice_before_its_scripts() {
        let script = init_script(&Settings {
            theme: Theme::Dark,
            tone: Tone::Warm,
        });
        assert!(
            script.contains("var theme = 'dark', tone = 'warm';"),
            "{script}"
        );
        let script = init_script(&Settings::default());
        assert!(
            script.contains("var theme = null, tone = null;"),
            "{script}"
        );
    }
}
