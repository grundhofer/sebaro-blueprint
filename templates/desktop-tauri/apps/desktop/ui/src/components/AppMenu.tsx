// AppMenu.tsx: „Menü“ in the title bar, with the five groups every sebaro desktop app has. An item without a
// target in this app is shown disabled, never hidden.
import { useTranslation } from "react-i18next";
import { action, keysOf, type CommandId } from "../commands";
import { limits } from "../lib/panes";
import { useAppearance } from "../store/appearance";
import { useNotes } from "../store/notes";
import { paneOpen, useWindow } from "../store/window";
import { Icon } from "./parts/Icon";
import { MenuButton, type MenuAction, type MenuEntry } from "./parts/Menu";

export function AppMenu() {
  const { t } = useTranslation();
  const appearance = useAppearance();
  const { panes, setPaneWidth, togglePane } = useWindow();
  useNotes(); // the items follow the notes: what can go to the bin, what can come back

  const item = (id: CommandId, label: string, more: Partial<MenuAction> = {}): MenuAction => ({
    label,
    keys: keysOf(id),
    onPress: action(id),
    ...more,
  });
  const width = limits("sidebar");
  const sidebarWidth = panes.sidebar.width ?? width.start;
  const widthItem = (label: string, value: number): MenuEntry => ({
    label,
    radio: true,
    checked: sidebarWidth === value,
    onPress() {
      setPaneWidth("sidebar", value);
      // beside the content the pane shows its new width; over the content it stays as it is
      if (!panes.sidebar.overlay) togglePane("sidebar", true);
    },
  });
  const themeItem = (theme: "system" | "light" | "dark"): MenuEntry => ({
    label: t(`choice.${theme}`),
    radio: true,
    checked: appearance.theme === theme,
    onPress: () => appearance.setTheme(theme),
  });
  const toneItem = (tone: "cool" | "warm"): MenuEntry => ({
    label: t(`choice.${tone}`),
    radio: true,
    checked: appearance.tone === tone,
    onPress: () => appearance.setTone(tone),
  });

  const entries: MenuEntry[] = [
    {
      id: "menue-datei",
      label: t("menu.file"),
      items: [
        item("newNote", t("menu.newNote")),
        item("newWindow", t("menu.newWindow")),
        item("open", t("menu.open")),
        "separator",
        item("closeTab", t("menu.close")),
      ],
    },
    {
      id: "menue-bearbeiten",
      label: t("menu.edit"),
      items: [
        item("undo", t("menu.undo")),
        item("redo", t("menu.redo")),
        "separator",
        item("find", t("menu.find")),
        item("settings", t("menu.settings")),
        "separator",
        item("trash", t("menu.trash"), { id: "menue-papierkorb", danger: true }),
        item("restore", t("menu.restore"), { id: "menue-zuruecklegen" }),
        item("emptyBin", t("menu.emptyTrash"), { id: "menue-leeren", danger: true }),
      ],
    },
    {
      id: "menue-darstellung",
      label: t("menu.view"),
      items: [
        item("sidebar", t("menu.sidebar"), { checked: paneOpen(panes.sidebar) }),
        item("inspector", t("menu.inspector"), { checked: paneOpen(panes.inspector) }),
        {
          id: "menue-breite",
          label: t("menu.sidebarWidth"),
          items: [
            widthItem(t("menu.narrow"), width.min),
            widthItem(t("menu.normal"), width.start),
            widthItem(t("menu.wide"), width.max),
          ],
        },
        "separator",
        {
          id: "menue-hell",
          label: t("menu.theme"),
          items: [themeItem("system"), themeItem("light"), themeItem("dark")],
        },
        { id: "menue-farbton", label: t("menu.tone"), items: [toneItem("cool"), toneItem("warm")] },
        {
          label: t("menu.motion"),
          checked: appearance.reduceMotion,
          onPress: () => appearance.setReduceMotion(!appearance.reduceMotion),
        },
        "separator",
        item("textBigger", t("menu.textBigger")),
        item("textSmaller", t("menu.textSmaller")),
        "separator",
        item("palette", t("menu.palette")),
      ],
    },
    {
      id: "menue-fenster",
      label: t("menu.window"),
      items: [
        item("nextArea", t("menu.nextArea")),
        item("previousArea", t("menu.previousArea")),
        item("tabForward", t("menu.tabForward")),
        item("tabBack", t("menu.tabBack")),
        "separator",
        item("back", t("menu.back")),
        item("forward", t("menu.forward")),
      ],
    },
    {
      id: "menue-hilfe",
      label: t("menu.help"),
      items: [item("shortcuts", t("menu.shortcuts")), item("facts", t("menu.facts"))],
    },
  ];

  return (
    <MenuButton
      id="menue"
      label={t("window.menu")}
      entries={entries}
      className="sb-secondary-action sb-secondary-action--compact"
      windowMenu
    >
      <Icon name="menu" />
      <span className="sb-window__word">{t("window.menu")}</span>
    </MenuButton>
  );
}
