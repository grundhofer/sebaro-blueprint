const TOKEN: Record<string, string> = {
  k: "sb-tok-keyword",
  s: "sb-tok-string",
  c: "sb-tok-constant",
  m: "sb-tok-comment",
};

/** Code from the small markup of values.ts: ⟨k:…⟩ keyword, ⟨s:…⟩ string, ⟨c:…⟩ constant, ⟨m:…⟩ comment. */
export function Code({ lines }: { lines: string | readonly string[] }) {
  // split gives: text, kind, token, text, kind, token, … text
  const parts = [lines]
    .flat()
    .join("\n")
    .split(/⟨([ksmc]):([^⟩]*)⟩/);
  return parts.map((part, at) => {
    if (at % 3 === 0) return part;
    if (at % 3 === 1) return null;
    return (
      <span key={at} className={TOKEN[parts[at - 1] ?? ""]}>
        {part}
      </span>
    );
  });
}
