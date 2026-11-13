# Kinonames character catalog

## Active shortlist — 2026-11-13

The active `catalog.json` now contains **322** records: all **212** unique supplied DOCX entries (treated as DC by owner instruction), plus **110** selected recognizable non-DC characters. DOCX names were rechecked read-only after whitespace normalization: no omissions. Existing record IDs and names are preserved. There are no portraits.

The editable `curation.json` groups the non-DC allowlist by universe: Marvel75, The Boys8, Invincible3, TMNT6, The Incredibles6, and12 across the remaining groups. This is an editorial judgment of recognizability, not a statistical popularity ranking. Only the most central characters were retained from smaller franchises; obscure supporting characters and most alternate versions were removed. The two distinct Spider-Men remain separate.

`catalog.original-819.json` preserves the previous complete pool; `catalog.excluded.json` preserves all497 excluded records for review. Neither is imported by the game. Servers read the active JSON on startup; already-running parties retain their generated board and are not rewritten by this data edit. Restart the local dev/backend process to load the pool in that process. The DOCX is unchanged.

Reference checks for identities and franchise grouping: [Marvel Avengers](https://www.marvel.com/teams-and-groups/avengers/in-comics), [Marvel X-Men](https://www.marvel.com/teams-and-groups/x-men/in-comics), [The Boys cast guide](https://www.aboutamazon.co.uk/news/entertainment/the-boys-season-4-cast-characters-prime-video), [Invincible](https://www.skybound.com/invincible/tv-series). These support identities, not an objective popularity cutoff.

Checks: catalog IDs/names unique, all selected names found in original pool, full normalized DOCX coverage, real-catalog demo and engine tests24/24 PASS. The historical preparation notes below describe the original819-record import.

`catalog.json` is the candidate character pool for the server. It combines the 608 non-empty entries copied from the user's prompt and 212 unique entries extracted from the single obvious Downloads file, `DC персонажи.docx`. The DOCX was opened read-only. Exact duplicates after trimming and collapsing whitespace/case-folding are merged; alternate identities and incarnations remain separate. Each `kn-<sha256-prefix>` ID is deterministic from the normalized display name. `sources` records provenance.

The merged catalog contains 819 unique records. `image` is `null` for every record. No portraits were downloaded because the roster consists of protected entertainment characters and no per-image license or authorization has been established. A CC-licensed fan illustration does not automatically clear rights in the underlying character; the Wikimedia Commons fan-art policy only accepts fan art that does not copy protectable visual elements from a particular adaptation ([Commons policy](https://commons.wikimedia.org/wiki/Commons:Fan_art)). DC's published terms limit its site content to personal/non-commercial use unless otherwise specified and identify character names and related indicia as protected ([DC terms](https://www.dc.com/terms/en-us/html/terms_en-us_20230322), [DC copyright notice](https://www.dc.com/blog/2012/03/05/copyright)). These sources do not establish permission for these portraits in this project.

Owner decision, 2026-11-13: Kinonames uses **text-only cards**, with character names on the neutral front and named colors on the reverse. Portrait acquisition is no longer a release requirement. The optional image field remains null and unused. The exact cross-list duplicate `Арес` was merged as requested; its Marvel/DC provenance is retained in `sources` and should be reviewed if the roster later distinguishes universes.

The game can use its own neutral fallback art while image rights are unresolved. To ship recognizable, version-accurate portraits, use either a rights-holder license, assets supplied by the user with documented permission, or a reviewed set of genuinely public-domain characters/artworks. Do not treat attribution alone as a license.

## Catalog fields

- `id`: stable deterministic identifier
- `name`: displayed Russian name, retained from source
- `sources`: `user-prompt` and/or `dc-personazhi.docx`
- `image`: currently `null`; future local static asset path only after rights review

## Review queue

Entries intentionally retain supplied spellings and labels. These apparent issues need owner confirmation before editorial normalization or image matching:

- `Боевой Зверь (Трагг)` and `Трэгг (Великий регент)` appear to conflate Battle Beast and Thragg; they remain distinct exactly as supplied.
- `Электра (livewire)` may combine the Marvel character Elektra with DC's Livewire; retained as supplied.
- `Мистер Флор` may be a misspelling of Mr. Bloom; not silently corrected.
- `Менбэт` may refer to Man-Bat; not silently corrected.
- DOCX includes repeated `Леди Шива` and `Аманда Уоллер`; exact repeats were collapsed.

The Meme Police rules index states that traitors see the opposing team's colors and the black card; the prompt's higher minimum team size and unanimity requirement override the reference's lower minimum ([Meme Police Codenames rules](https://meme-police.com/bg)).
