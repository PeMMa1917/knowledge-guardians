// Scope is the supplied posters plus the named narrative forms below. Synonyms do not multiply totals.
// An effect can be useful, neutral or harmful. A weak inference by itself cannot establish intent.
const families = {
  bias: [
    ['anchoring','Anchoring'], ['availability','Availability heuristic'], ['bandwagon','Bandwagon effect'],
    ['blind-spot','Bias blind spot'], ['choice-supportive','Choice-supportive memory'], ['clustering','Clustering illusion'],
    ['confirmation','Confirmation bias'], ['conservatism','Conservatism in belief updating'], ['information','Information bias in decisions'],
    ['ostrich','Ostrich effect'], ['outcome','Outcome bias'], ['overconfidence','Overconfidence'],
    ['expectancy','Expectancy and placebo effects','placebo effect'], ['pro-innovation','Pro-innovation bias'],
    ['recency','Recency effect'], ['salience','Salience bias'], ['selective-perception','Selective perception'],
    ['stereotyping','Stereotyping'], ['survivorship','Survivorship bias'], ['zero-risk','Zero-risk bias'],
    ['attribution','Fundamental attribution error'], ['calibration','Dunning–Kruger effect'], ['curse-of-knowledge','Curse of knowledge'],
    ['automation','Automation bias'], ['triviality','Law of triviality','bikeshedding'], ['ikea','IKEA effect'],
    ['unfinished','Zeigarnik effect'], ['third-person','Third-person effect'], ['spotlight','Spotlight effect'],
    ['sunk-cost','Sunk-cost effect'], ['backfire','Backfire effect'], ['declinism','Declinism'], ['just-world','Just-world belief'],
    ['barnum','Barnum effect','Forer effect'], ['framing','Framing effect'], ['in-group','In-group bias'],
    ['halo','Halo effect'], ['bystander','Bystander effect'], ['belief','Belief bias'], ['groupthink','Groupthink'],
    ['optimism','Optimism bias'], ['reactance','Psychological reactance'], ['self-serving','Self-serving bias'],
    ['negativity','Negativity bias'], ['pessimism','Pessimism bias'],
  ],
  fallacy: [
    ['straw-man','Straw man','strawman'], ['false-cause','False cause'], ['post-hoc','Post hoc ergo propter hoc'],
    ['emotion','Appeal to emotion'], ['fallacy-fallacy','Fallacy fallacy'], ['slippery-slope','Slippery slope'],
    ['ad-hominem','Ad hominem'], ['tu-quoque','Tu quoque'], ['incredulity','Personal incredulity'],
    ['special-pleading','Special pleading'], ['loaded-question','Loaded question'], ['burden','Shifting the burden of proof'],
    ['equivocation','Equivocation','ambiguity'], ['gamblers','Gambler’s fallacy'], ['popularity','Appeal to popularity','ad populum','bandwagon fallacy'],
    ['authority','Misplaced appeal to authority'], ['composition','Composition'], ['division','Division'],
    ['no-true-member','No true Scotsman'], ['genetic','Genetic fallacy'], ['false-dilemma','False dilemma','black-or-white','false dichotomy','either/or'],
    ['circular','Circular reasoning','begging the question','begging the claim'], ['nature','Appeal to nature'], ['anecdotal','Overgeneralising from an anecdote'],
    ['sharpshooter','Texas sharpshooter fallacy'], ['middle-ground','Middle-ground fallacy'], ['hasty','Hasty generalisation'],
    ['red-herring','Red herring'], ['false-equivalence','False equivalence'], ['moral-equivalence','False moral equivalence'],
    ['ignorance','Appeal to ignorance'], ['tradition','Appeal to tradition'], ['sunk-cost','Sunk-cost fallacy'],
    ['wealth','Appeal to wealth'], ['wishful','Wishful thinking'], ['oversimplification','Causal oversimplification'],
  ],
  deception: [
    ['fabrication','Inventing a record'], ['omission','Deliberate omission of material context'],
    ['misattribution','False attribution'], ['impersonation','False identity'], ['alteration','Altering a record'],
    ['selective-display','Deliberate selective display'], ['equivocation','Intentional equivocation'],
    ['diversion','Deliberate diversion'], ['staging','Staging an observation'], ['false-consensus','Manufactured agreement'],
  ],
};
export const reasoningRepertoire = Object.entries(families).flatMap(([kind, rows]) =>
  rows.map(([key, name, ...aliases]) => ({id:kind+':'+key,kind,name,aliases})));
