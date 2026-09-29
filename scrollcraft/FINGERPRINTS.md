# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| ravel-softworks (2026-09-29) | Chaptered editorial | Floating folio bottom-left: chapter numeral + title, Contents popover, Start a project | Pinned title page (1.7vh): exploded isometric voxel R settles onto a plinth, callouts draw, 3 blurred near-blocks + dot-grid far plane, pointer parallax | pin > reveal/flow > flow ledger > authored silence + bespoke builder > pan (4 stages) > reveal plate > flow; 7 acts, ~13vh desktop | Navy colophon: Netlify form set as the proposal's last page, FAQ in the margin, small colophon footer | Block builder: toggled services drop as coloured courses onto a plinth, the brief writes itself, and it prefills the enquiry form | Drawn isometric / technical plate on paper + navy, no photography | static HTML, repo root |

| ravel-softworks r1 (2026-09-29, supersedes row above) | Consultancy landing (conventional B2B: fixed nav, trust strip, service cards, live demo, FAQ, form + footer) | Fixed top bar: wordmark, 5 anchors, WhatsApp, Start a project; burger under 1080px | Same pinned voxel-R assembly as the row above | pin > reveal > flow cards > bespoke demo > bespoke builder > pan > reveal > flow FAQ > flow form; 9 acts, ~15vh desktop | Navy contact section: intro + ways to reach, Netlify form card; separate footer | Block builder (unchanged) plus a tabbed agent-workflow demo | Drawn isometric illustrations; photo slots pending Gemini billing | static HTML, repo root |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Chaptered editorial with a floating bottom folio (ravel-softworks).
- Isometric voxel mark assembling as the hero (ravel-softworks).
- Configurator whose selection builds a stacked structure and prefills the form (ravel-softworks).

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
