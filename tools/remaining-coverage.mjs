// A focus cell drops the design/anchor distinctions. This is the most generous possible measure of depth for one skill.
export function coverageRemainder(atlas) {
  const micros = new Set(atlas.members.filter(m => m.kind === 'micro').map(m => m.id));
  const broader = new Set(atlas.members.filter(m => m.kind === 'skill').map(m => m.id));
  const chapters = new Set(Object.values(atlas.chapters)).size;
  const pairsPerChapter = atlas.blooms.length * 4;
  const skillLinks = new Set(atlas.activities.flatMap(a => a.skills));
  const pairs = new Map(), chapterPairs = new Set(), anyPair = new Set();
  for (const beat of atlas.beats) {
    const pair = beat.bloom + '/' + beat.dok;
    anyPair.add(pair);
    for (const id of beat.members) {
      if (!pairs.has(id)) pairs.set(id,new Set());
      pairs.get(id).add(pair);
      if (micros.has(id)) chapterPairs.add(JSON.stringify([id,beat.chapter,pair]));
    }
  }
  function countFamily(ids) {
    const coverage = [...ids].map(id => pairs.get(id) ?? new Set());
    return {total:ids.size, linked:[...ids].filter(id => skillLinks.has(id)).length,
      seen:coverage.filter(set => set.size).length,
      allDepths:coverage.filter(set => new Set([...set].map(p => p.split('/')[1])).size === 4).length,
      allBlooms:coverage.filter(set => new Set([...set].map(p => p.split('/')[0])).size === atlas.blooms.length).length,
      allPairs:coverage.filter(set => set.size === pairsPerChapter).length};
  }
  const count = kind => BigInt(atlas.members.filter(m=>m.kind === kind).length);
  const projected = BigInt(micros.size * chapters * pairsPerChapter) * count('story') * count('game');
  const anchored = projected * count('concept') * count('framework') * (count('area') + count('theme'));
  const uncoveredLinked = [...micros].filter(id => skillLinks.has(id) && !pairs.has(id)).length;
  const newLinks = [...micros].filter(id => !skillLinks.has(id) && !pairs.has(id)).length;
  return {chapters,pairsPerChapter, representedPairs:anyPair.size, micro:countFamily(micros), skill:countFamily(broader),
    focusTotal:micros.size * chapters * pairsPerChapter, focusSeen:chapterPairs.size, uncoveredLinked,newLinks,
    storyGameCells: String(projected), anchoredCells:String(anchored)};
}

export function remainingDocument(atlas) {
  const r = coverageRemainder(atlas), number = n => n.toLocaleString('en-US');
  const {uncoveredLinked:review,newLinks:build} = r;
  const low = review/4 + build, high = review/2 + build*3;
  return [
    '# What remains to cover', '',
    '[Open the exact evidence register](COMBINATION_REVIEW_STATUS.md) · [Look up any skill](SKILL_REVIEW_INDEX.md) · [Start a review](COMBINATION_ATLAS.md)', '',
    '## From registration to full depth', '',
    '| Group | Supplied or registered | Linked to an objective | Reviewed at one or more pairings | Reviewed at every DOK | Reviewed at every Bloom | Reviewed at all 24 pairings |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...[['Micro-skills',r.micro],['Broader skills',r.skill]].map(([name,row])=>'| '+[name,...['total','linked','seen','allDepths','allBlooms','allPairs'].map(k=>number(row[k]))].join(' | ')+' |'),
    '',
    'The last four columns use observed player actions in the exact-combination register. They pool chapters, so a skill can receive credit wherever the action occurred. The register includes '+r.representedPairs+' of the 24 Bloom and DOK pairings somewhere in the game.',
    '',
    '## How much is left?', '',
    'The first milestone is one source-backed gameplay example for each micro-skill. **'+number(review+build)+' of '+number(r.micro.total)+'** still need one. Of these, '+number(review)+' have an objective to inspect. Another '+number(build)+' need a gameplay link established and tested. A suitable existing encounter can supply that link.',
    '',
    'Keeping chapters separate, there are '+number(r.focusTotal)+' micro-skill × chapter × Bloom × DOK positions. **'+number(r.focusSeen)+' have a documented action and '+number(r.focusTotal-r.focusSeen)+' remain open.** One action per position would clear this particular count. The requested ten distinct actions per exact combination is a further requirement.',
    '',
    'Including one of the 150 story elements and one of the 288 game elements yields '+number(BigInt(r.storyGameCells))+' positions with a fixed TOK context. Varying one key concept, one framework part and a single area or theme raises this subtotal to '+number(BigInt(r.anchoredCells))+'. Larger sets, knowledge questions and ordered routes expand it further. One encounter can support multiple overlapping selections. These counts describe review positions, rather than a count of scenes to write. Orders with unlimited repetition have no finite total.',
    '',
    '## Time and credit estimate for the first milestone', '',
    '| Work | Remaining skills | Planning assumption per skill | Person-hours |',
    '| --- | ---: | --- | ---: |',
    '| Inspect an existing link and document the action and consequence | '+review+' | 15–30 minutes | '+number(review/4)+'–'+number(review/2)+' |',
    '| Establish a link, author or adapt the encounter, and test it | '+build+' | 1–3 hours | '+number(build)+'–'+number(build*3)+' |', '',
    'Together these assumptions give roughly **'+number(Math.round(low))+'–'+number(Math.round(high))+' person-hours**, or about '+Math.round(low/40)+'–'+Math.round(high/40)+' forty-hour weeks. The estimate covers one documented opportunity per micro-skill. It assumes completed routes can supply some evidence immediately. New mechanics, historical source work, classroom trials and native-device validation can increase the effort. Parallel production and shared encounters can change elapsed time.',
    '',
    'For credits, use two representative batches on the intended model and account. Let R be the billed credits for reviewing ten already-linked skills and N the billed credits for establishing and testing ten new links. The first-pass budget is approximately **'+(review/10)+' × R + '+(build/10)+' × N credits**. Account usage supplies R and N. Test counts and checked cells do not determine a billing rate. The exhaustive specification has no credible fixed time or credit estimate.',
    '',
  ].join('\n');
}
