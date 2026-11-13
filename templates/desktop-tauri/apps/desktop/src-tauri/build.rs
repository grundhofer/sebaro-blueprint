// build.rs: Tauri's build step, and before it the four window grounds read from the sebaro copy's tokens.json
// (cool and warm, each light and dark), so no colour value is ever written into the Rust code. The build fails loud
// when the copy is missing or has no such token.
use std::{env, fs, path::Path};

fn ground(tokens: &serde_json::Value, pointer: &str) -> [u8; 3] {
    let hex = tokens
        .pointer(pointer)
        .and_then(|value| value.as_str())
        .and_then(|value| value.strip_prefix('#'))
        .filter(|hex| hex.len() == 6 && hex.is_ascii())
        .unwrap_or_else(|| panic!("tokens.json: {pointer} is no #RRGGBB colour"));
    [0, 2, 4].map(|at| {
        u8::from_str_radix(&hex[at..at + 2], 16).expect("tokens.json: a colour is #RRGGBB")
    })
}

fn main() {
    let file = Path::new(env!("CARGO_MANIFEST_DIR")).join("../ui/src/sebaro/tokens.json");
    println!("cargo:rerun-if-changed={}", file.display());
    let text = fs::read_to_string(&file)
        .expect("the sebaro copy has no tokens.json: fetch the copy of profile desktop");
    let tokens: serde_json::Value = serde_json::from_str(&text).expect("tokens.json is no JSON");
    let cool = [
        ground(&tokens, "/tokens/color.bg/light"),
        ground(&tokens, "/tokens/color.bg/dark"),
    ];
    let warm = [
        ground(&tokens, "/variants/warm/light/bg"),
        ground(&tokens, "/variants/warm/dark/bg"),
    ];
    let out = Path::new(&env::var("OUT_DIR").expect("cargo sets OUT_DIR")).join("grounds.rs");
    let code = format!(
        "/// The window grounds of the sebaro copy as red, green, blue: `GROUNDS[tone][mode]`, tone 0 cool and 1 warm,\n\
         /// mode 0 light and 1 dark.\n\
         pub const GROUNDS: [[[u8; 3]; 2]; 2] = [{cool:?}, {warm:?}];\n"
    );
    fs::write(out, code).expect("OUT_DIR can be written");
    tauri_build::build()
}
