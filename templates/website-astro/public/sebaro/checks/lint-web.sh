# Lint for sebaro web sources. Usage: sh lint-colour.sh <css file> <page dir>; exit 1 = violation (lines printed).
CSS="$1"; PAGES="$2"; bad=0
awk '/\{/ {sel=$0} /var\(--sb-color-(on-)?primary-action/ && sel !~ /\.sb-primary-action/ {print "L1 " FILENAME ":" FNR ": " $0; bad=1} END {exit bad}' "$CSS" || bad=1
awk '/\{/ {sel=$0} /--sb-color-(accent|success|warning|danger|info)-subtle|--sb-color-text-on-/ && sel !~ /\.sb-diff__line--(add|del)/ {print "L2 " FILENAME ":" FNR ": " $0; bad=1} END {exit bad}' "$CSS" || bad=1
grep -nE 'data-product' "$CSS" && bad=1
for f in "$PAGES"/*.html; do perl -0pe 's{<!-- sb:inline src="[^"]*brand/inline/[^"]*" -->.*?<!-- /sb:inline -->}{}gs' "$f" | grep -nE 'data-product' | sed "s|^|L3 $f:|" | grep . && bad=1; done
awk '/\{/ {sel=$0} /background(-color)?:[^;]*var\(--sb-color-(accent|link|success|warning|danger|info)\)/ && sel !~ /\.sb-(switch|radio|range)/ {print "L4 " FILENAME ":" FNR ": " $0; bad=1} END {exit bad}' "$CSS" || bad=1
grep -nE '#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(' "$CSS" && bad=1
grep -nE 'https?://' "$CSS" && bad=1
grep -nE 'sb-notes__list[^{]*\{[^}]*(columns|grid-template-columns: *repeat)' "$CSS" && bad=1
awk '/\}/ {acc=""} /\{/ {sel=$0; sub(/\{.*/, "", sel); sel=acc sel; acc=""} !/[{};]/ && /,[[:space:]]*$/ {acc=acc $0} /(^|[^-])(height|block-size):[^;]*var\(--sb-size-control/ && !/(height|block-size): *max\([^;]*[0-9](lh|em)[,) ]/ {n=split(sel, s, ","); ex=(n>0); for (i=1; i<=n; i++) if (s[i] !~ /(svg|\.sb-icon-button|__twist)[^[:space:]>+~]*[[:space:]]*$/) ex=0; if (!ex) {print "L8 " FILENAME ":" FNR ": " $0; bad=1}} END {exit bad}' "$CSS" || bad=1
for f in "$PAGES"/*.html; do grep -nE 'style="([^"]*[^-])?(height|block-size):[^";]*var\(--sb-size-control' "$f" | sed "s|^|L8 $f:|" | grep . && bad=1; done
exit $bad
