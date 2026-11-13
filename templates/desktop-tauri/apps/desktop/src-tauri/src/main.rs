// Musterapp Desktop (fictive): the Tauri shell. It owns the window, the settings file and the commands the UI may
// call; what needs no window lives in musterapp-core.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod window;

/// The commands the UI may call: the handler and the UI's bindings are both made from this one list.
fn commands() -> tauri_specta::Builder<tauri::Wry> {
    tauri_specta::Builder::new().commands(tauri_specta::collect_commands![
        commands::set_appearance,
        commands::set_window_title,
    ])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(commands().invoke_handler())
        .setup(|app| {
            let settings = commands::settings(app.handle());
            window::open(app, &settings)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("the app could not start");
}

#[cfg(test)]
mod tests {
    /// Writes the UI's bindings from the commands, so `cargo test` leaves them fresh. `ci` fails when the committed
    /// file differs from what this test wrote.
    #[test]
    fn bindings() {
        let file = concat!(env!("CARGO_MANIFEST_DIR"), "/../ui/src/ipc/bindings.ts");
        super::commands()
            .export(specta_typescript::Typescript::default(), file)
            .expect("the bindings can be written");
    }
}
