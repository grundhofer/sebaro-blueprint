// values.ts: what the specimens of „Datenarten“ show that reads the same in every language: units, IDs, addresses,
// file names and code. All of it is invented. Words come from the i18next resources; code takes its comments from
// there as arguments. Code is written in a small markup: ⟨k:…⟩ keyword, ⟨s:…⟩ string, ⟨c:…⟩ constant, ⟨m:…⟩
// comment (Code.tsx).
export const VALUES = {
  initials: ["AK", "LM", "JB"],
  email: "example@example.org",
  emailParts: ["example@", "example.", "org"], // a line may break after each part
  website: "example.org",
  websiteUrl: "https://example.org/",
  units: { km: "km", celsius: "°C", mb: "MB", litre: "l" },
  timeRange: "08:00–22:00",
  shortHash: "7b3d2e1",
  uuid: "3f2a9c1e-5b7d-4e0a-9c1f-2b8e6d4a0c17",
  ruleId: "FAR-01",
  idInSentence: "DAT-02",
  releaseVersion: "1.4.0",
  pathParts: ["notizen/", "research/", "offline-", "first.md"], // a line may break after each part
  diffFile: "entry.json",
  diffHunk: "@@ -4,4 +4,5 @@",
  menuKeys: "⇧⌘N",
  logTimes: ["2026-10-10T08:12:03", "2026-10-10T08:12:04", "2026-10-10T08:12:04"],
  command: (comment: string) => [`⟨m:${comment}⟩`, "pnpm build"],
  code: (comment: string, unit: string) => [
    `⟨m:${comment}⟩`,
    "⟨k:let⟩ count = ⟨c:0⟩;",
    "⟨k:function⟩ add(): ⟨k:string⟩ {",
    "  count += ⟨c:1⟩;",
    `  ⟨k:return⟩ ⟨s:\`⟩\${count}⟨s:${unit}\`⟩;`,
    "}",
  ],
  json: (title: string) => [
    "{",
    '  "id": ⟨s:"wasser"⟩,',
    `  "title": ⟨s:"${title}"⟩,`,
    '  "goal": ⟨c:8⟩,',
    '  "reminder": { "every": ⟨s:"PT2H"⟩, "from": ⟨s:"08:00"⟩, "to": ⟨s:"22:00"⟩ }',
    "}",
  ],
  diff: {
    goal: '  "goal": ⟨c:8⟩,',
    removed: '  "every": ⟨s:"PT1H"⟩,',
    added: '  "every": ⟨s:"PT2H"⟩,',
    quiet: (comment: string) => `  "quiet": [⟨s:"22:00"⟩, ⟨s:"08:00"⟩], ⟨m:${comment}⟩`,
    sound: '  "sound": ⟨c:false⟩',
  },
} as const;
