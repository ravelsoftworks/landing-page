# Ravel Softworks: brief

Interviewed on 2026-09-29 (two rounds of multiple-choice questions plus the
opening request). Where the user answered, their words are quoted. Where a topic
was not asked directly, the decision is marked **Authored**, with the reason.

## The request, verbatim

> need to redesign this website completely. rebrand the company ( include IT and
> software as well). our company is to serve companies , organizations and
> businesses in providing software development outsourcing, ai automation, ai
> implementation etc. I this company needs to be successfully searchable by
> clients and goal is to get our first clinet in no time. design must be
> professional and elegant. attractive and appropriately themed.

## The eight topics

1. **Vibe.** "professional and elegant. attractive and appropriately themed."
   Aesthetic chosen: **Editorial engineering**: warm off-white paper, deep ink
   navy, one teal accent from the logo, a serif display face. Reads like a
   consultancy you would trust with a budget.
2. **Journey, in their words.** Serve "companies, organizations and businesses"
   with "software development outsourcing, ai automation, ai implementation", plus IT
   and software. **Authored** sequence (below), because the user described the
   offer rather than the order.
3. **Energy curve.** **Authored:** calm and assured at the open, one concentrated
   burst of play in the middle (the builder), calm resolve at the close. A buyer
   choosing an outsourcing partner wants composure, not a light show.
4. **Feeling and the one moment.** **Authored from the signature choice:** the
   moment is scoping their own project and seeing it built. See Peak.
5. **The one thing no other site does.** User chose "Scope your project live": the
   visitor picks what they need, the isometric R blocks assemble into their
   project, and the enquiry form arrives already filled in.
6. **Range from premium-minimal.** Editorial (paper, folios, measure, restraint),
   as chosen in answer 1.
7. **One world or chapters.** "Distinct chapters".
8. **Assets.** Name and mark kept: "Keep name + mark, new identity". Existing
   `logo-ravel.png`, `logo-mark.png` and `favicon.png` show an isometric R made
   of teal, blue and indigo prisms, with a navy wordmark. No photography, no
   footage. Proof: "No, we're brand new". So there are no stats, testimonials or
   client logos, and nothing will be invented.

Other answers:
- **Primary action:** "use netlify forms and submit a email". One label everywhere:
  **Start a project**. The form is a Netlify form, and Netlify emails each
  submission.
- **Contact:** the user chose "I'll type email + phone" but did not supply
  values. Placeholders are marked `TODO` in the markup.
- **Markets / SEO:** "India (Bengaluru), US / UK / EU outsourcing".

## Step 1

- **What is this, and who is it for?** A Bengaluru software, IT and AI
  engineering company that builds for companies, organizations and businesses
  in India, the US, the UK and Europe.
- **What must the visitor believe by the end?** *This small senior team can
  build the exact thing I need, and they already understand what it is.*
- **Next action:** Start a project (a Netlify form, pre-filled by the builder).
- **Art direction:** the technical drawing world (worlds.md §8) adapted to the
  brand: an isometric assembly drawing with fine ink edges, dimension lines and
  leader callouts, plus flat fills in the logo's teal, blue and indigo. This fits
  because the mark itself is an isometric block construction. Photography would
  have been generated stock of people pointing at screens.

## Journey

```
1  Recognition   the three disciplines stand together as one structure (the R)
2  Tension       their own week: re-typed data, a stalled roadmap, idle AI licences
3  Substance     what we actually build, set out as a ledger
4  Turn          "Now, yours." They build their own project out of the same blocks
5  Clarity       how an engagement runs, step by step, with real durations
6  Trust         why a new, small, senior team is an advantage, stated honestly
7  Commitment    the brief they built, already in the form. Send it.
```

## Feeling curve (written before the score)

```
1  Composure    a title page, unhurried; an exploded drawing of the R settles into one solid structure
2  Recognition  a hard cut to a navy ground; three plain sentences that describe their own week
3  Confidence   a dense, orderly ledger of services; facts, not adjectives
4  Delight      (after one quiet line) choosing blocks and watching their own structure get built, with the brief writing itself
5  Clarity      four stages travelling sideways, each with its duration and what they receive
6  Reassurance  an honest plate: you would be one of our first clients, so the founders build it
7  Resolve      the colophon; their brief is already in the form; one line to send it
```

No two adjacent lines share a feeling.

## The peak

> "I clicked what we needed, and the blocks built our project in front of me,
> and then the contact form already had it all written up."

Lives in chapter III. It gets the largest span on the page, the only bespoke
interaction, and a line of authored silence in front of it.

## Tell-someone sentence

> It's the site where **you build your project out of blocks and it writes your
> brief for you.**

## Authored silence

The opening of chapter III is a single line ("Now, yours.") on an otherwise
empty paper ground, about 0.6 of a viewport tall. This is deliberate. It is not
dead scroll.

## Honesty rules for this build

- No statistics, counters, client logos, testimonials, prices or years in business.
- Claims are limited to process commitments the company already makes in
  `ravel-softworks-landing-page.md` (reply within one business day, you talk to
  the people building it).
- Domain, email and phone are placeholders until the user supplies them.

## Revision 1 (2026-09-29): from editorial to consultancy

User feedback, verbatim:

> intresting, do you think we should add more contents like that was previously
> there? my friend this that this looks like a blog post not a tech consulting
> landing page

> proceed. also why are there no images? can you generate images from gemini?

Changes made:
- Grammar moved away from chaptered editorial. The folio, roman numerals, "Fig."
  captions, serif display face and colophon are gone. There is now a fixed top
  navigation (Services, AI automation, How we work, Why us, FAQ, WhatsApp,
  Start a project) and Geist throughout.
- Content brought back from the old site: the trust strip, a live workflow demo
  (onboarding, invoices, leads, support; labelled as an example, no invented
  timings), WhatsApp as a second channel (hidden until a number is set), plus
  new content: work we can automate by team, tools, eight FAQs and a real footer.
- The old invented figures ("3 days to 3 hours", "24x faster", ROI savings) and
  the placeholder testimonial stay out.
- Images: Gemini returned 429 with a free-tier limit of 0 for the image model.
  Each service card has a slot filled with a drawn isometric illustration in the
  mark's language. Photo prompts are in IMAGE-PROMPTS.md.
- Kept: the hero R assembly (pin plus layered planes), the brief builder (the
  signature move), the process rail (pan).

Revised feeling curve:
```
1  Confidence   hero: the R settles; clear promise, two actions
2  Recognition  navy: three pains they have this week
3  Substance    six services with pictures and tags
4  Understanding the demo runs a real workflow step by step
5  Delight      (peak) build your brief; blocks stack, brief writes itself
6  Clarity      four stages travel sideways
7  Reassurance  why a new senior team, ownership, engagement models
8  Settled      FAQ answers the objections
9  Resolve      the form, already filled in from the builder
```
