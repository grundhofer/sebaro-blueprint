# sebaro view types

Every screen of a sebaro app is one of these 21 types (D145). Pick the type, start from its template, fill the
slots. The three fixed points of a type (primary action, product area, way out) stay as they are. Only the one view
that is the app's reason to exist may take its own form, built from the system's parts.

For all types: at most one lime primary action per view, at the bottom. A list stays a list. Light and dark are
equal. Below 840 dp one pane with bottom navigation; from 840 dp a rail and, for `list` and `search`, two panes.
The four `state-*` types replace the content of the view they occur in and never add a second primary action.

| Key | Name | For | Primary action | Product area | Way out |
|---|---|---|---|---|---|
| `entry` | Einstieg | introduce the app and the next setup step | „Weiter: <Ziel>“ | yes, as head | steps only, no main navigation |
| `overview` | Übersicht | the current situation and the usual next act | the app's most frequent act | yes, the one value | bottom navigation |
| `list` | Liste | scan and open a collection | create something new | no | bottom navigation; a row opens the detail |
| `detail` | Detail | look at one item | none; „Bearbeiten“ is outlined | only with one value | back to the collection |
| `form` | Formular | edit a draft, then save | „Sichern“ | no | back; asks about unsaved changes |
| `flow` | Ablauf in Schritten | a finite task, one step at a time | „Weiter: <nächster Schritt>“ | no | steps above the content; back through the steps |
| `tool` | Werkzeug | a repeatable act with visible input and output | the tool's one act | no | stays when it is a main area |
| `result` | Ergebnis | confirm an outcome, offer the next act | what one does with the result | yes | back to the list |
| `read` | Lesen | read content, tools stay quiet | none | no | back; tools in the head |
| `history` | Verlauf und Statistik | past activity and its distribution | none | no | bottom navigation |
| `search` | Suche | find items without changing them | none | no | back closes the search |
| `settings` | Einstellungen | change lasting preferences | none | no | bottom navigation |
| `about` | Über und Rechtliches | app, sender, legal information | none | only the tile | back |
| `state-empty` | Zustand: leer | say what is missing and the first step | the first step | yes, as head | as the containing view |
| `state-loading` | Zustand: lädt | content or act is still loading | stays in place | no | as the containing view |
| `state-error` | Zustand: Fehler | say what failed, offer recovery | „Noch mal versuchen“ | no | as the containing view |
| `state-permission` | Zustand: keine Erlaubnis | say what the permission is for, lead to the system choice | leads to allowing | no | back |
| `outside` | Außerhalb der App | widget, notification, share sheet | at most two actions | only the tile | opens the fitting view |
| `account` | Anmeldung und Konto | sign in, look at the account | „Anmelden“; none on the account | no | back |
| `import` | Import und Teilen-Ziel | review incoming content before storing it | „Sichern in <Ziel>“ or „Importieren“ | no | back cancels and returns to the sending app |
| `help` | Hilfe und Rückmeldung | find an answer, send feedback | none on the list; „Senden“ on feedback | no | back |

Templates: the web specimens of all 21 types are in the workshop page `demo/views.html`; the Compose screens are
being built (workshop stage 3). Both move into the starter templates of this repository; until then this table is
the reference.
