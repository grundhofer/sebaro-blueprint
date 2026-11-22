# AGENTS.md: sebaro Blueprint

The rules of the sebaro family of products: what a product looks like and how it behaves, and why. German overview
for the owner: [README.md](README.md). Site: <https://grundhofer.github.io/sebaro-blueprint/>.

## Building or converting a product

Start at [`skills/sebaro/SKILL.md`](skills/sebaro/SKILL.md). It names the product kind, what to read here and how to
fetch the technology plan, the starter and the parts from the private workshop, sebaro Foundry. `skills/sebaro/` is
an agent skill: link the folder into `~/.claude/skills/` and `~/.agents/skills/`.

| Here | What |
|---|---|
| `design/KERN.md` (German: `KERN.de.md`) | the 31 core rules |
| `design/views.md` | the 21 view types |
| `design/platforms/` | rules per product kind |
| `design/parts/` | one page per part: purpose, states, behaviour, rules |
| `design/checklist.md` | a review list per screen |
| `rules/rules.json` | the catalogue behind citations such as `[AKT-01]`, each rule with its reason |

## Changing this repository

Build, checks and releases: [MAINTAINING.md](MAINTAINING.md). For the texts an agent reads:

- **Budgets in words**, checked by `tools/check_budget.py`. To add something, remove something.
- **A new rule goes into a part, a starter or a check first.** It becomes a core rule only when none of those can
  carry it.
- **No history in these files**, and nothing a part, a starter or a check already enforces.
- **Two products.** Something enters sebaro when a second product needs it. Until then it lives in the product.
- **Public repository:** no personal data, local paths, accounts, decision numbers or names of unreleased products.
