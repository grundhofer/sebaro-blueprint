# Sender

`sb-sender`, `sb-site-footer__sender`, `sb-keymark` · `SbSenderRow`

The line that says who makes a product: a few words and the sebaro key mark. It ends the „Über“ view after the about
head, and it stands in the footer of a product website.

## Behaviour

- In „Über“ it reads „Ein Werkzeug von“ (English „A tool by“), then the small key mark.
- In a website footer it reads „<Produkt> ist ein Werkzeug von“, then the small key mark.
- Words and key may wrap onto two lines.
- The key mark has a light and a dark form and is named „sebaro“ for screen readers.
- On Android the app passes the words in its own language.

## Rules

- It is a sender: no action, no link.
- Use the generated mark unchanged. Never type the name into a key drawn in code.
- The key is brand paint, never another primary action. [K4]
- „Über“ shows tile, name, version and the sender. [K29]
