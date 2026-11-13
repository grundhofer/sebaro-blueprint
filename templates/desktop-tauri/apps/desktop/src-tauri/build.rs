// build.rs: Tauri's build step, and before it the window's grounds: the four read from the sebaro copy's tokens.json
// (cool and warm, each light and dark), and the ground of the start, the tile colour of the product's group, read
// from the tile the copy's kit wrote into sebaro-product/. So no colour value is ever written into the Rust code. The
// build fails loud when a file is missing or holds no such colour.
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

/// The tile colour in the kit's `sign/tile.svg`: the kit draws the tile's ground first, `fill="#RRGGBB"`.
fn tile_colour(tile: &str) -> [u8; 3] {
    let hex = tile
        .split("fill=\"#")
        .nth(1)
        .and_then(|rest| rest.get(..6))
        .filter(|hex| hex.chars().all(|digit| digit.is_ascii_hexdigit()))
        .expect("sebaro-product/sign/tile.svg: the tile's ground is no fill=\"#RRGGBB\"");
    [0, 2, 4].map(|at| u8::from_str_radix(&hex[at..at + 2], 16).expect("hex digits"))
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
    let tile = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../sebaro-product/sign/tile.svg");
    println!("cargo:rerun-if-changed={}", tile.display());
    let start = tile_colour(&fs::read_to_string(&tile).expect(
        "sebaro-product/ has no sign/tile.svg: write it with the kit of the copy (product/product_kit.py build)",
    ));
    let out = Path::new(&env::var("OUT_DIR").expect("cargo sets OUT_DIR")).join("grounds.rs");
    let code = format!(
        "/// The window grounds of the sebaro copy as red, green, blue: `GROUNDS[tone][mode]`, tone 0 cool and 1 warm,\n\
         /// mode 0 light and 1 dark.\n\
         pub const GROUNDS: [[[u8; 3]; 2]; 2] = [{cool:?}, {warm:?}];\n\
         /// The ground of the start as red, green, blue: the tile colour of the product's group, light and dark alike.\n\
         pub const START: [u8; 3] = {start:?};\n"
    );
    fs::write(out, code).expect("OUT_DIR can be written");
    tauri_build::build()
}
