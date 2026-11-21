# Identifier and file name

`sb-id`, `sb-file-name` · `sbFileName`, `SbFileNameText`

Two kinds of text that must not break like words: an identifier (a rule number, a version, a build id) and a file
name or path.

## Behaviour

- An identifier never breaks at its hyphen or dot; it stays whole on one line.
- A file name or path breaks only after `-`, `.`, `_` and `/`, without a hyphen. On the web the page marks these
  places itself.
- A part of a file name that alone is wider than the line breaks inside itself, so nothing runs past its box.
- In a heading, names and code break at the line end without a hyphen.

## Rules

- Identifiers and file names get their own class or function; plain text would hyphenate them. [SCH-06, TXT-15]
- A file name never takes the identifier class: it has to break.
- Code, ids and versions stand in sebaro Mono. [K8]
