// en.mjs: every word the website shows, in English (core rule 26, TEC-10), with the same keys as de.mjs
// (tests/strings.spec.ts). Short and plain, “you” for the reader, dates as 2026-10-20 and U+00A0 between number and
// unit (TXT-04). Fragments with markup are HTML strings, rendered with set:html; they hold no user input.
// Example content of a fictive site, as in de.mjs: replace it.

const nb = " ";

export default {
  skip: "Skip to content",
  titleSuffix: " · Beispielseite",
  wordmark: "Beispiel­seite",
  nav: { label: "Main menu", apps: "Apps", projects: "Projects", about: "About", contact: "Contact" },
  language: { label: "Language" },
  theme: "Light or dark",
  breadcrumb: "Breadcrumbs",
  demo: "Sample data",
  footer: {
    copyright: "© 2026 Alex Beispiel · sebaro",
    links: { imprint: "Imprint", privacy: "Privacy", accessibility: "Accessibility" },
    display: "Display",
    tone: "Colour tone",
    cool: "Cool",
    warm: "Warm",
  },
  notePopover: { close: "Close" },
  codeCopy: "Copy",
  pages: {
    start: {
      title: "Small tools, built calmly.",
      description: "Projects and notes by Alex Beispiel, built with sebaro.",
      lead: "On this site I present my projects and write down how they are built.",
      secondary: "About me",
      primary: "See projects",
      recentTitle: "Recently written",
      recentEnd: "Nothing more here yet.",
    },
    apps: {
      title: "Apps",
      description: "The apps of Alex Beispiel.",
      emptyTitle: "No app yet",
      emptyText: "Once the first app is out, it appears here with its tile, its platforms and its facts.",
    },
    projects: {
      title: "Projects",
      description: "Notes on how Alex Beispiel builds small tools.",
      lead: "Notes on how I build. The newest comes first.",
      listTitle: "All notes",
      end: "That is all so far.",
    },
    article: {
      title: "Save a list as a CSV file",
      crumb: "List as CSV",
      description: "How a list becomes a CSV file that any spreadsheet opens.",
      readingMinutes: 5,
      date: "2026-10-20",
      dateText: "2026-10-20",
      meta: (minutes) => `${minutes}${nb}min read · updated `,
      tocLabel: "Contents of this article",
      tocTitle: "Contents",
      sections: [
        { id: "worum", title: "What this is about" },
        { id: "aufbau", title: "What the file looks like" },
        { id: "umlaute", title: "Special letters and separators" },
        { id: "offen", title: "What is still open" },
      ],
      intro: [
        "A CSV file is a table as plain text: one line per entry, the values separated by one character. " +
          "Almost every program can read it, ten years from now as well." +
          '<a class="sb-note-ref" id="fnref-1" href="#fn-1" role="doc-noteref" aria-label="Footnote 1">1</a>',
        "That is why every tool of mine that keeps lists can export them as CSV. Here is what I look out for.",
      ],
      aufbau: [
        "The first line names the columns, every further line is one entry. A value that itself holds a separator " +
          "or a line break stands in double quotes.",
      ],
      codeLang: "JavaScript",
      codeLabel: "Example: write one line of the CSV file",
      // the code as tokens: [look, text]; looks are the five of TXT-10 (keyword, string, constant, comment, plain)
      code: [
        [["comment", "// one line per entry, the values separated by semicolons"]],
        [
          ["keyword", "const"],
          ["plain", " row = (entry) => ["],
          ["plain", "entry.date, entry.name, entry.amount"],
          ["plain", "].join("],
          ["string", '";"'],
          ["plain", ");"],
        ],
        [
          ["keyword", "const"],
          ["plain", " head = "],
          ["string", '"date;name;amount"'],
          ["plain", ";"],
        ],
        [
          ["keyword", "const"],
          ["plain", " maximum = "],
          ["constant", "10000"],
          ["plain", ";"],
        ],
      ],
      umlaute: [
        "The file is saved as UTF-8, so “Größe” and “Straße” arrive just as you wrote them." +
          '<a class="sb-note-ref" id="fnref-2" href="#fn-2" role="doc-noteref" aria-label="Footnote 2">2</a>',
        "I use the semicolon as the separator, because German numbers already use the comma: “12,90” " +
          "would otherwise not stay one number." +
          '<a class="sb-note-ref" id="fnref-1-2" href="#fn-1" role="doc-noteref" aria-label="Footnote 1">1</a>',
      ],
      calloutTitle: "Note",
      calloutText:
        "If a spreadsheet opens the file in a single column, choose the semicolon as the separator when you open it.",
      offen: [
        "Not solved yet: an export that keeps formulas. A CSV file knows only values; if you need formulas, " +
          "you need another format.",
      ],
      quote: "“I want to open my list without the app, too.”",
      quoteSource: "Feedback by email, October 2026",
      notesTitle: "Footnotes",
      notes: [
        {
          id: "fn-1",
          backs: [
            { href: "#fnref-1", label: "Back to reference 1", text: "1" },
            { href: "#fnref-1-2", label: "Back to reference 1 (2)", text: "1b" },
          ],
          html: 'The format is described in <a href="https://www.rfc-editor.org/rfc/rfc4180">RFC 4180<svg class="sb-icon sb-icon--16" aria-hidden="true" focusable="false"><use href="#external-link--16"/></svg></a>; it sets the comma, but many programs read the semicolon as well.',
        },
        {
          id: "fn-2",
          backs: [{ href: "#fnref-2", label: "Back to reference 2", text: "2" }],
          html: "Some older programs recognise UTF-8 only with a mark at the start of the file.",
        },
      ],
      pagerLabel: "Next:",
      pagerTitle: "Who writes this site",
    },
    about: {
      title: "About",
      description: "Who writes the Beispielseite, and how.",
      heading: "About me",
      personName: "Alex Beispiel",
      initials: "AB",
      text: [
        "My name is Alex Beispiel and I build small tools for everyday life: lists, counters, notes.",
        "I write “I” here because a person stands behind this site, not a company.",
      ],
      factsTitle: "In short",
      facts: [
        ["Place", "Beispielstadt"],
        ["Languages", "German, English"],
        ["Focus", "Apps without an account"],
      ],
    },
    contact: {
      title: "Contact",
      description: "How to reach Alex Beispiel.",
      text: `Write me an email. I usually answer within 3${nb}working days.`,
      mailLabel: "Write an email",
      mail: "example@example.org",
      hint: "Only when you choose. Goes to your email app, then to my inbox.",
    },
    imprint: {
      title: "Imprint",
      description: "Legal details of the Beispielseite.",
      legalTitle: "Details under § 5 of the German Digital Services Act (DDG)",
      address: ["Alex Beispiel", "Musterweg 1", "12345 Beispielstadt", "Germany"],
      contactTitle: "Contact",
      mailPrefix: "Email: ",
      mail: "example@example.org",
      disputeTitle: "Dispute resolution",
      dispute: "I do not take part in dispute resolution before a consumer arbitration board.",
      notice:
        "This is a sample: every detail is invented. What an imprint must contain is set by law, not by this template; it is not legal advice.",
    },
    privacy: {
      title: "Privacy",
      description: "What goes where when you visit the Beispielseite, and how long it stays.",
      stand: "As of 2026-10-20",
      responsible: "Responsible: Alex Beispiel, address in the imprint.",
      tableTitle: "What happens when you visit",
      caption: "Data, purpose and how long it is kept",
      head: ["What", "What for", "How long"],
      rows: [
        ["IP address, time, page requested", "running the server, fending off attacks", `7${nb}days`],
        [
          "Your choice of “Light or dark” and colour tone",
          "only in your browser, never on the server",
          "until you delete it",
        ],
      ],
      rightsTitle: "Your rights",
      rights:
        "You can ask what I have stored about you and have it corrected or deleted. Write to the address in the imprint.",
      notice:
        "This is a sample: every detail is invented. What a privacy notice must contain is set by law, not by this template.",
    },
    accessibility: {
      title: "Accessibility",
      description: "How accessible the Beispielseite is and what is still missing.",
      stand: "As of 2026-10-20",
      whatTitle: "What this site is",
      what: "The site presents projects. You cannot buy anything here or create an account.",
      useTitle: "How to use the site",
      use: "Every page starts with a “Skip to content” link. The Tab key reaches every link and every button; focus shows as a cobalt ring. “Light or dark” switches the look and changes nothing else.",
      checksTitle: "How the site meets the requirements",
      checksIntro: "The goal is WCAG 2.2 level AA. Checked so far:",
      checks: [
        {
          state: "passed",
          word: "passed",
          title: "axe in Chromium on every page, light and dark",
          meta: "passed on 2026-10-20 · own check, automatic",
        },
        {
          state: "passed",
          word: "passed",
          title: `Double text size at 320, 390 and 1440${nb}px`,
          meta: "passed on 2026-10-20 · own check, automatic",
        },
        {
          state: "skipped",
          word: "skipped",
          title: "Screen reader on the phone",
          meta: "skipped on 2026-10-20 · own check, by hand",
          reason: "Reason: no test device available.",
        },
        {
          state: "open",
          word: "open",
          title: `Zoom to 400${nb}%`,
          meta: "not run yet · own check, by hand",
        },
      ],
      limitsTitle: "Known limits",
      limits:
        "The site has not been checked with a screen reader on the phone yet; whether every announcement is right there is open.",
      feedbackTitle: "Feedback",
      feedbackPrefix: "If you find a barrier, write to ",
      feedbackSuffix: `. I answer within 2${nb}weeks.`,
      mail: "example@example.org",
      authorityTitle: "Authority in charge",
      authority:
        "Market surveillance authority of the German federal states for the accessibility of products and services (MLBF).",
      notice: "This is a sample: every detail is an example. A real statement names only what was really checked.",
    },
    notFound: {
      title: "This page does not exist",
      text: "Nothing is at this address. Maybe it has a typo: the start page leads to every page.",
      details: "Technical details",
      status: "Status ",
      primary: "Go to the start page",
    },
  },
};
