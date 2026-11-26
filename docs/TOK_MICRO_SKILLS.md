# Micro-skills in the campaign

The supplied files contain 803 numbered skills. The file labelled 1–200 contains rows 78–80. The other four files contain every row from 201–1000. Skill numbers below refer to those supplied rows. The playable wording and examples are original.

The campaign records a use when a player completes a linked action. For example, the Nile player turns a sketch after standing at both entrances. A later understudy uses a rehearsal cue from the bench. Both encounters make a specialised mark usable in another situation. The optional Skill Atlas lists the encounters the player has met. The normal sets of marks, quests and story choices remain separate from the skill record. [Evidence links](../src/content/microSkillEvidence.ts)

## Play preferences

Players can shift among these motives. The examples describe approaches a route offers and help authors check whether it leaves another approach open.

| Model | Motives and their campaign expressions |
| --- | --- |
| Bartle | The Planner targets a lead. The Opportunist finds a side use. The Scientist controls a comparison. The Hacker tests an assumption or tries a surprising route. The Networker asks people with different roles. The Friend stays with a companion. The Politician challenges who controls a decision. The Griefer’s appetite for disruption can be exercised by testing a flawed rule in a fictional setting where the keeper can repair it. |
| HEXAD | Philanthropists help a reader or crew. Socialisers exchange perspectives. Free Spirits follow optional routes. Achievers seek a proof or title. Players use an earned item or unlock. Disruptors expose an assumption and change a shared rule. |
| Player Head Model | Entertainers shape a performance. Strategic players plan a use. Leaders divide work. Testers rerun a case. Artistic players edit an arrangement. Researchers follow records. Socializers work alongside a character. |
| Temperament-based play styles | Artisan routes offer making and movement. Guardian routes protect a person or a record. Rational routes compare rules and models. Idealist routes invite a judgment about what a keeper owes others. |

The evidence links record opportunities to see, navigate, hear, read, write, operate, interpret language, reason through data, interact, reflect privately and observe environments. Combinations such as listening with a written record or reading a route while walking are supported in the same action when that action actually offers both.

## Checking combinations

`node tools/audit-micro-skills.mjs` reports the current linked skill and action counts. Use `--json` for the full list by objective, region, and grouping. The audit checks the 247 groupings of two to eight dimensions. It draws combinations only from fields attached to the same use. Several configurations can describe one action, so the action count stays separate.

- Each use points to an actual quest objective, an original description of the player’s action, the motives and modes it offers, and relevant numbered game and story examples.
- The audit reads Webb, Bloom, Fink and SOLO tags from that objective. An unknown thinking level leaves the related combinations open.
- Different actions in different settings provide opportunities for transfer. Neither a journal entry nor an author count measures how well a student transfers a skill.
- Keep authored works, editable copies, assumptions and what a reader can do distinct. Add the smallest verifiable action that gives a player a missing way to practise. [Content guide](CONTENT_GUIDE.md) · [Playtest priorities](PLAYTEST_PRIORITIES.md)
