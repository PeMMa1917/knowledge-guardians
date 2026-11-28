# The combination atlas

In the Nile hall, a stitcher thinks everyone in the audience will spot her blue repair. A guide trusts a different sling because a famous donor bought it. Turn the repair into the light, then stand where the last family will sit. The same fringe that distracts the stitcher can guide a visitor’s hand. A Guardian can keep that guide or stretch the sling for the back row. Each choice leaves another person with a job.

[See reviewed cells by chapter](COMBINATION_REVIEW_STATUS.md) · [Browse every selectable member](COMBINATION_MEMBERS.md) · [Read the questions, decisions and consequences by chapter](CHAPTER_VIEWPOINTS.md)

## Check off a review

[Download or open the offline combination checklist](COMBINATION_CHECKLIST.html). On GitHub, open the file and choose **Download raw file**, then open the downloaded HTML in a browser. It works without a server. Select a chapter, search by skill number or any other member, add the relevant TOK anchors and choose a narrative and game element. Select **In a particular sequence** when order matters. Open a worked example to try a complete board.

Each exact selection has six Bloom rows and four DOK columns in each chapter. Tick a cell to record a review. Use **Note** beside it to record the player action, what the two people stood to gain or lose and where another reviewer can reproduce it. Enter one action ID per line to track the ten-action target separately for that cell. Existing source evidence appears under the grid. Use **Include documented implementation checks** to load verified examples while keeping your own decisions. You can also import [the dated implementation-review ledger](COMBINATION_REVIEWED.json) to start with the documented exact cells checked. Each record identifies its action and source. Only an explicit reviewer check marks a cell. The **Find its reviewed boards** control finds records involving any particular micro-skill or other member. **Check a whole family** lays out each skill or other member as a row against the current anchors, with all 24 review cells across the row. Search by ID to go straight to any micro-skill. **Export family grid CSV** produces a spreadsheet of every matching member in the selected family, including its exact anchors and 24 review statuses. Export JSON to share, back up or continue the ledger on another device. Export CSV for a spreadsheet with all 24 cells of the current and saved boards.

### Review all the ways a skill can appear

Every one of the 1,200 micro-skills has a searchable public description and a stable worksheet number. Number 20, for instance, is about noticing your own reasoning change while a decision is still open. Search for the number or for a word such as “reasoning”.

For a review of one micro-skill, pin the skill with a key concept, a framework part and an area or theme. Use **Any TOK-anchored selection** to start before choosing the story and mechanic. Use **Check a whole family** to compare narrative elements side by side against those anchors. To examine combinations involving several members, open **Browse possible combinations by number**, choose one or more families, and enter the number of additional elements. Keep the same pinned selection as you move between possible combinations. You can share a checked board, its exact membership and its notes in a JSON export. A catalogue update can introduce new numbers. Saved boards follow their stable element IDs.

For example, use **The stitcher’s sling**, then pin it and choose **Micro-skills** with one addition. Combination 1,200 opens the last supplied micro-skill against that same sling. Its six-by-four grid starts open. For ordered journeys, open the desired board and group its members into the steps in which a player actually meets them. Reversing the steps creates a separate review. **Try an order by number** lays out each selected element as a separate successive action. Edit the steps to group simultaneous elements or to return to an earlier one.

**Find this element in play** searches the published action evidence across chapters. Pick a result to open the exact combination and its observed Bloom and DOK cell. The note editor offers the player action, both perspectives, the map, a source test and the action ID. Edit or save the note and decide whether to tick the cell. The same search shows the linked objectives for the selected chapter. Open one as a starting point and add the story and game elements you observe. Only the separate action register supplies a tested trace and an observed cognitive cell.

### What qualifies for a check

Choose the Bloom row for the thinking the student must do and the DOK column for how demanding that thinking is in this encounter. Write down one observable action or decision before inferring a student's reasoning. Two students who reach different endings can demonstrate the same demand. A second playthrough, interview or transfer task can supply evidence of what happened for a particular student.

| Bloom level | Observable example at the coat rail |
| --- | --- |
| Remember | Find the pear-shaped repair Kip described and identify it on a sleeve. |
| Understand | Show a companion how a wet print can appear on a second sleeve. |
| Apply | Use the same transfer test on a fresh piece of cloth. |
| Analyse | Compare when the pear was copied with when the fare was charged. |
| Evaluate | Decide whether the fare record warrants naming a second wearer. Identify what else would change the decision. |
| Create | Design a way for the next keeper to log a loan, preserve the borrower’s privacy and return a disputed fare. |

| DOK | Evidence to look for |
| --- | --- |
| 1 · Recall or reproduction | The student finds, recalls or performs a familiar operation with a predictable procedure. |
| 2 · Skills and concepts | The student selects and uses a method, sorts relevant observations or interprets a pattern in context. |
| 3 · Strategic thinking | The student weighs plausible accounts, tests a consequential assumption or defends and revises a decision using evidence. |
| 4 · Extended thinking | The student plans sustained work across contexts, integrates differing accounts, tests a design and revises it in light of what others experience. |

These examples guide a review. Some describe opportunities to build or observe in a future playtest. A “Create” verb, time spent playing or a second map alone cannot establish DOK 4. Keep a cell open when the specified cognitive demand is absent.

## What belongs in a combination

Select any number of distinct members from any family, including several members from one family. Every selection must contain at least one TOK key concept, one knowledge framework part, and at least one area of knowledge or core or optional theme. Both an area and a theme may be present. A joint design also needs at least one narrative element and one game element. Every playable result carries a knowledge question and at least two defensible perspectives. A query may also require a specific question or several questions as members. The core theme has its own ID, `theme:knower`.

The member index covers narrative, mechanics, argument patterns, cognitive biases and related effects, types of deception, skills and micro-skills, questions, learner attributes, subjects, approaches to learning and teaching, the TOK framework, vocabulary and sourced word histories. A concept, its glossary entry and the history of its word can do different work in one scene. Each has its own identifier. The question index includes registered questions, original exhibition-route adaptations and distinct question texts from missions. Reused text points to the same entry. Prescribed titles are identified by session and ordinal where source records are available. Published course material remains with its source.

A reviewer can address the same selection at remember, understand, apply, analyse, evaluate or create, at each of DOK 1 through 4. These are 24 separate cells. Creating one short caption might demand less sustained thought than comparing evidence gathered on several journeys. Each cell needs its own account of what a player actually did.

### Plan around a person or object

A reviewer can add a historical guest, fictional character, exhibit, keepsake or creature companion by name or catalogue ID. Select two characters to review a disagreement, or pair an earned keepsake with the person whose reply it opens. A catalogue entry identifies the subject of the proposed review. An exhibit and its collectible record can describe two different uses of the same physical object. A creature’s entry identifies whether it has a friendship record, belongs to the night register or appears in the Loreling atlas. Confirm the meeting, use and consequence in the game before checking its cognitive cell.

Each of the 35 exhibition prompt families is searchable by number, with the game's original wording for its corresponding route question. The registered Fink and SOLO dimensions can also be combined with any Bloom and DOK cell. The SOLO entry for a response with no relevant connection describes a possible need for support.

## Look up a case

From the repository root, run the commands below. The first finds the stitcher’s exact setting and its consequences. The second looks for an observed sequence from inspection to public decision. Commas group simultaneous members. A greater-than sign separates actions in order. Quote the sequence in a shell.

```sh
node tools/audit-combinations.mjs --members 'story:25,game:238,concept:perspective,framework:perspectives,area:ART,bias:halo,fallacy:wealth' --bloom analyse --dok 2
node tools/audit-combinations.mjs --steps 'story:25,game:238,bias:halo,fallacy:wealth>concept:perspective,framework:perspectives,area:ART,story:11,game:22' --chapter 2
node tools/audit-combinations.mjs --design any --members 'concept:evidence,framework:scope,theme:knower'
node tools/audit-combinations.mjs --design joint --question selected --order permutation --length 8 --rank 17
node tools/audit-combinations.mjs --design joint --order repeated-sequence --length 8 --rank 17
node tools/audit-combinations.mjs --design joint --pool bias,fallacy,micro --length 7 --rank 0
node tools/audit-combinations.mjs --activities
node tools/audit-combinations.mjs --check
```

World and chapter filters refer to where an action takes place. Bloom and DOK filters on an ordered route apply to every step requested. Steps may have intervening actions. Lookups report matching same-action bundles, distinct objectives and ordered journeys separately. Two settings of one comparison can show a genuine sequence while counting once toward a ten-action target. An empty result is an open design or evidence gap. Some design elements are planned or deliberately excluded in the classroom adaptation. Their status travels with their catalogue entry.

## How the complete space is represented

For a catalogue of N distinct members, each member is present or absent. Within any required group of g members, there are 2^g − 1 nonempty selections. Multiply that factor for each disjoint required group, and multiply by 2 for every remaining optional member. Pool areas and themes into a single required group. Joint designs use separate required groups for narrative and mechanics. Selecting several stories, mechanics, biases, questions or skills follows the same rule.

For example there are 150 × 288 = 43,200 choices of exactly one narrative element and one mechanic. Selecting any nonempty subset of each gives (2^150 − 1)(2^288 − 1) design bundles before TOK anchoring. Two narrative elements, two mechanics and three biases still form one bundle when discovered together. A chapter with ten distinct opportunities to act on such a bundle has different evidence from a player opening the same prop ten times.

For fixed length k, the calculator counts all size-k sets that meet the required groups. Each such set has k! distinct orders. `--order repeated-sequence --length k` includes revisits. With unlimited revisits, there are infinitely many sequences whenever a valid route is available. Exact integer counts and zero-based lookup by rank make finite sets addressable without printing an exponentially long document. These are counts of design possibilities. Evidence for a particular order comes from a tested journey containing distinct actions in that order.

## Evidence and the next playtest

The objective export includes mission ID, exact chapter, explicit and inferred framework links, areas, themes and questions. A mission question supplies context even when a step has no explicit question ID. The ordered journeys currently reviewed are a subset of the campaign. The [single-action audit](COGNITIVE_CONNECTIONS.md) can also inspect other documented pairs and the per-chapter ten-action target.

At the stitcher’s sling, ask a tester to take someone else’s seat and make one change to the show. Observe whether they discover the finger guide, whose problem they choose to solve, and whether the other person’s later response changes their judgement. A follow-up in a real exhibition can test whether a student looks for the missing viewpoint without a prompt.
