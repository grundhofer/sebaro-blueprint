# lint-sebaro-android.sh <kotlin source dir>; exit 1 = violation (offending lines printed)
SRC="$1"; bad=0
hit() { if [ -n "$1" ]; then printf '%s\n' "$1"; bad=1; fi; }
hit "$(grep -rnE 'SebaroTheme\([^)]*product *= *[^n )]' --include=*.kt "$SRC")"                                   # A1
hit "$(grep -rnE 'SebaroProduct\.' --include=*.kt "$SRC" | grep -vE 'SbSignTile|SbProductArea|SbStart|SbAppFrame|SbAppPane|SbViewTemplateData|fromId|/designsystem/')"         # A2
hit "$(grep -rnE '(on)?[pP]rimaryAction(Hover|Pressed|Outline)?\b' --include=*.kt "$SRC" | grep -v '/designsystem/' | grep -v 'SebaroTheme.kt:' | grep -vE 'SbPrimaryActionModel|primaryAction *=')"  # A3
hit "$(grep -rnE '\b(Button|FilledTonalButton|ElevatedButton|FloatingActionButton|ExtendedFloatingActionButton|NavigationBar|NavigationBarItem)\(' --include=*.kt "$SRC" | grep -v '/designsystem/')"  # A4
hit "$(grep -rnE '(accent|success|warning|danger|info)Subtle|textOn[A-Za-z]*Subtle' --include=*.kt "$SRC" | grep -v 'SebaroTheme.kt:' | sed -E '/\/designsystem\/SbDiff\.kt:/s/(success|danger)Subtle//g' | grep -E '(accent|success|warning|danger|info)Subtle|textOn[A-Za-z]*Subtle')"  # A5
hit "$(grep -rnE '\b(Badge|BadgedBox)\(' --include=*.kt "$SRC")"                                                 # A6
hit "$(grep -rn 'Color(0x' --include=*.kt "$SRC" | grep -v 'SebaroTheme.kt')"                                      # A7
hit "$(grep -rn 'SbPrimaryAction(' --include=*.kt "$SRC" | grep -v '/designsystem/')"                              # A8
exit $bad
