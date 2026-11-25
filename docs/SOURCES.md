# Historical objects and sources

The project owner's rule: **objects in the game are real, from history, specific, time-bound and clear.** Fictional things (Aethelgard, its people and the patterned blade for sale in Emberford) are labelled `fictional-world` in the game and never look like historical records.

The data source of truth is `src/content/sources.json` (sources) and the exhibits and cards in the mission files. This page explains them for people. If you change one, change the other.

Each source supports only a **narrow** claim. The "Supports" column says what that claim is. Do not use a source for a larger claim.

## Source register

| ID | Source | Supports (narrow claim) | Accessed |
|---|---|---|---|
| HIS-S11 | [US Patent 392,046, John J. Loud, granted 30 October 1888](https://patents.google.com/patent/US392046A/en) | Loud's documented design (a reservoir pen with a rotating marking point for rough surfaces) and the grant date. | 2026-11-20 |
| HIS-S12 | [German Patent and Trademark Office (DPMA): Ballpoint pen](https://www.dpma.de/en/explore/milestones/inventions-that-made-history/ballpoint-pen) | Loud's patent is distinct from László Bíró's later development of a practical writing instrument and suitable ink, with his chemist brother György and others. | 2026-11-20 |
| HIS-S13 | [Science Museum Group: Biro ballpoint pen, object 1949-174/2](https://collection.sciencemuseumgroup.org.uk/objects/co8057178/biro-ballpoint-pen) | A particular surviving Biro pen dated 1945–1948. The record names László József Bíró and his brother Georg. Image rights are different for each asset. | 2026-11-20 |
| HIS-S14 | [The Met: Techniques of Decoration on Arms and Armor (2003)](https://www.metmuseum.org/essays/techniques-of-decoration-on-arms-and-armor) | Pattern welding (joining and working different iron or steel parts) is distinct from crucible or watered-steel production. | 2026-11-20 |
| HIS-S15 | [Verhoeven, Pendray and Dauksch, "The key role of impurities in ancient Damascus steel blades", JOM 50(9), 1998, pp. 58–64](https://www.tf.uni-kiel.de/matwis/amat/def_en/articles/key_role_impurities/key_role.html) | The study uses both "pattern-welded Damascus" and "wootz Damascus", so "Damascus" alone is not one material recipe. | 2026-11-20 |
| HIS-S16 | [The Met: Ten Wootz Steel Ingots with Bag, accession 2023.133a–k](https://www.metmuseum.org/art/collection/search/894714) | Object metadata: Indian, probably eighteenth century. The qualifier "probably" stays visible. | 2026-11-20 |

## Objects in chapter 1

### The Nexus: mission "Three Firsts" (who invented the ballpoint pen?)

| Exhibit ID | Object | Label | Date shown | What the date describes | Sources |
|---|---|---|---|---|---|
| OBJ-001-A | Patent drawing, US 392,046 (J. J. Loud) | documented | Granted 30 October 1888 | A patent grant date. Not the day a pen was made, tested or sold. | HIS-S11 |
| OBJ-001-B | Workshop model of Loud's design | reconstruction | Built this year in the Nexus | A build date of a modern model. It tells nothing about 1888. | none (it is a reconstruction) |
| OBJ-001-C | Biro pen, Science Museum Group 1949-174/2 | documented | 1945–1948 (museum record) | An object date range from a museum record. | HIS-S13 |

Evidence cards with real sources in this mission: `card.loud-patent` (HIS-S11), `card.dpma-history` (HIS-S12), `card.biro-object` (HIS-S13).

The fair test at the bench is a **simulation** (`claimKind: simulation`). Its numbers come from a stated model, not from historical measurement. The game says this on screen ("Model assumption").

### Emberford, Aethelgard: mission "The Label on the Blade" (what is "Damascus" steel?)

| Exhibit ID | Object | Label | Notes | Sources |
|---|---|---|---|---|
| OBJ-003-AE | The patterned blade for sale | fictional-world | Made this season by the smith Hesper by pattern welding. The trader calls it "ancient Damascus wootz". | none (fictional) |
| OBJ-002 | Ten wootz steel ingots with bag, The Met 2023.133a–k (shown as a catalogue record held by the scholar Sefa) | documented | Indian, probably 18th century. | HIS-S16 |
| AE-ASSAY | The assay table (etch and microstructure test) | fictional-world | Fictional test inside the story. | none |

Evidence cards with real sources in this mission: `card.met-ingots` (HIS-S16), `card.met-techniques` (HIS-S14), `card.damascus-terms` (HIS-S15). The process cards at Hesper's forge are **schematic only**. They are not a working recipe.

## No images from museums

The game does not show museum photographs. Exhibits are original pixel art drawn in code, with an `altText` description. Before you add a museum image, check the rights statement on the record (it is different for each image) and credit it in `CREDITS.md`.

## Checking sources

Links can change. When you work on a mission, open each of its source links. If a link is dead, find the current record and update `url` and `accessed`. Do not change the claim to fit a new source without checking it.
