# Avatar

`sb-avatar`, `sb-avatars` · `SbAvatar`, `SbAvatars`

A person, shown as initials in a circle. The circle tells people from app signs, which are rounded squares.

## States

- Offline: a dashed ring and `text-muted` initials; the avatar is never dimmed.
- Moderation: a small shield glyph at the bottom end of the circle.

## Behaviour

- Two sizes. In a group the next avatar starts after the shield.
- The avatar's name is the person's name with role and presence: „Anna, Moderation, offline“. Initials and glyph
  are hidden from screen readers.

## Rules

- Initials in a ring, no fill. [DAT-06]
- The circle is one of the four pill shapes. [FOR-06]
