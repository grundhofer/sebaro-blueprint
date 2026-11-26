# Feedback

`sb-feedback` · `SbFeedback`

A bug, a wish or a question from inside the product, sent without an account as a public issue of the product.

## States

- Desktop and wide windows: a panel at the bottom end. Phone: a sheet in two steps, first the kind, then the text.
- Kind: „Fehler“, „Wunsch“, „Frage“, each with its icon in a circle (bug on `danger-subtle`, bulb on
  `success-subtle`, question mark on `accent-subtle`), the same everywhere. On the desktop the kind may stay empty.
- Picture: the own view as it was when the form opened, with every element the product marks private already
  blacked out (web `data-sb-private`, Compose `Modifier.sbPrivate()`). „Bearbeiten“ blacks out and marks more,
  „Weglassen“ drops it; at most three pictures.
- Sent: „Danke, ist angekommen.“ with a link to the issue.

## Behaviour

- Only the text is required.
- What goes along by itself (version, view, browser or device, appearance) can be opened and read before sending.
- A picture goes along only after the person has looked at it. A product with sensitive data (TEC-12) sends none
  unless it allows them on purpose.
- Pictures are encoded anew before sending: no metadata.
- An app without the INTERNET permission opens the form of the service in the browser, without a picture.
- The foot of the form says: „Öffentlich auf GitHub, ohne deinen Namen. Keine persönlichen Daten hineinschreiben.“

## Rules

- The entry is „Rückmeldung geben“ in the „Mehr“ menu of every view, in the second last block before „Hilfe“; on a
  website in the footer; on an error page with the error filled in. Never a floating button. [NAV-12]
- Shaking opens it on Android only when the person has switched that on. [NAV-12]
- One text field, the kind optional on the desktop, a picture only after a look. [EIN-07]
- The issue names no person and holds no content of the person beyond what they wrote and the pictures they let
  go. [EIN-07]
- Permissions as few as possible; INTERNET only where the product's purpose gains from it. [TEC-14]
