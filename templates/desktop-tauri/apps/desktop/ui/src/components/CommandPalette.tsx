// CommandPalette.tsx: the palette every sebaro desktop app opens with ⌘K / Strg+K, with this app's commands in
// groups. A setting carries its check at the start of the row.
import { useTranslation } from "react-i18next";
import { action, keysOf, type CommandId } from "../commands";
import { useAppearance } from "../store/appearance";
import { paneOpen, useWindow } from "../store/window";
import { Palette, type PaletteOption } from "./parts/Palette";

const none = () => undefined;

export function CommandPalette() {
  const { t } = useTranslation();
  const { overlay, panes, closeOverlay } = useWindow();
  const { theme, tone, setTheme, setTone } = useAppearance();

  const command = (id: CommandId, label: string, more: Partial<PaletteOption> = {}): PaletteOption => ({
    id: `palette-${id}`,
    label,
    keys: keysOf(id),
    run: action(id) ?? none,
    ...more,
  });
  const themeOption = (choice: "system" | "light" | "dark"): PaletteOption => ({
    id: `palette-${choice}`,
    label: t(`choice.${choice}`),
    keywords: t(choice === "system" ? "palette.keywordsTheme" : "palette.keywordsMode"),
    checked: theme === choice,
    run: () => setTheme(choice),
  });

  return (
    <Palette
      id="palette"
      open={overlay?.kind === "palette"}
      label={t("palette.label")}
      searchLabel={t("palette.search")}
      hints={{ move: t("palette.move"), run: t("palette.run"), close: t("palette.close") }}
      onClose={closeOverlay}
      groups={[
        { label: t("palette.groupFile"), options: [command("newNote", t("menu.newNote"))] },
        {
          label: t("palette.groupView"),
          options: [
            command("sidebar", t("window.sidebar"), {
              keywords: t("palette.keywordsSidebar"),
              checked: paneOpen(panes.sidebar),
            }),
            command("inspector", t("window.inspector"), {
              keywords: t("palette.keywordsInspector"),
              checked: paneOpen(panes.inspector),
            }),
          ],
        },
        {
          label: t("palette.groupLook"),
          options: [
            themeOption("system"),
            themeOption("light"),
            themeOption("dark"),
            {
              id: "palette-warm",
              label: t("palette.toneWarm"),
              keywords: t("palette.keywordsTone"),
              checked: tone === "warm",
              run: () => setTone(tone === "warm" ? "cool" : "warm"),
            },
          ],
        },
        {
          label: t("palette.groupPlaces"),
          options: [command("find", t("palette.find")), command("settings", t("palette.settings"))],
        },
      ]}
    />
  );
}
