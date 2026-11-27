import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import { existsSync, readFileSync } from 'node:fs';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
  const { validateContent } = await server.ssrLoadModule('/src/domain/validate.ts');
  const { artKeys, BIG_ART } = await server.ssrLoadModule('/src/ui/illustrations.ts');
  const { SPECIMEN_TARGET: TARGET, specimenToolId } = await server.ssrLoadModule('/src/domain/specimenGear.ts');
  const pack = buildPack();
  const errors = validateContent(pack);
  const authoredArt = new Set(artKeys());
  const manifest = JSON.parse(readFileSync('public/assets/credits.json', 'utf8'));
  const illustrations = new Map();
  const imageBytes = new Map();
  const physical = new Map();
  for (const map of Object.values(MAPS)) {
    for (const prop of map.interactables) {
      if (prop.kind !== 'exhibit' || !prop.exhibit) continue;
      const occurrences = physical.get(prop.exhibit) ?? [];
      occurrences.push({ map: map.id, prop: prop.id, x: prop.x, y: prop.y });
      physical.set(prop.exhibit, occurrences);
    }
  }
  const registered = pack.exhibits.filter((record) => record.specimen).map((record) => {
    const { specimen } = record;
    const found = physical.get(record.id) ?? [];
    const sites = new Set(found.map(({ map, x, y }) => `${map}|${x}|${y}`));
    if (sites.size !== 1) errors.push(`${specimen.key}: expected one physical exhibit, saw ${sites.size}`);
    const picture = specimen.pixelAsset ?? BIG_ART[record.art] ?? record.art;
    const earlier = illustrations.get(picture);
    if (earlier) errors.push(`${specimen.key}: its image is also registered to ${earlier}`);
    illustrations.set(picture, specimen.key);
    if (specimen.pixelAsset) {
      if (!manifest.files[picture] || !existsSync(`public/assets/${picture}`)) {
        errors.push(`${specimen.key}: missing licensed local image ${picture}`);
      } else {
        const digest = createHash('sha256').update(readFileSync(`public/assets/${picture}`)).digest('hex');
        if (imageBytes.has(digest)) errors.push(`${specimen.key}: identical image bytes to ${imageBytes.get(digest)}`);
        imageBytes.set(digest, specimen.key);
      }
    } else if (!authoredArt.has(picture)) errors.push(`${specimen.key}: missing original illustration ${picture}`);
    if (specimen.revisit) {
      const revisit = MAPS[specimen.revisit.map]?.interactables.find((prop) => prop.id === specimen.revisit.prop);
      if (!revisit || !JSON.stringify(revisit.visibleIf ?? {}).includes(specimenToolId(specimen.key))) {
        errors.push(`${specimen.key}: missing equipped return interaction ${specimen.revisit.prop}`);
      }
    }
    return {
      ...specimen,
      exhibit: record.id,
      name: record.name,
      date: record.dateText,
      dateKind: record.dateKind,
      catalogue: pack.sources.find((source) => source.id === specimen.source)?.url,
      placements: found,
    };
  });
  const unique = new Set(registered.map(({ key }) => key));
  const legacy = pack.exhibits.filter((record) => record.historicalLabel === 'documented' && !record.specimen && physical.has(record.id));
  const required = process.argv.includes('--release') ? TARGET : 0;
  const baseOnly = registered.filter(({revisit,fieldUse})=>!revisit&&!fieldUse).map(({key})=>key);
  if (required && baseOnly.length) errors.push(baseOnly.length+' registered specimens have only the Nexus return arch.');
  if (required && unique.size < required) errors.push(`${required - unique.size} exact specimens still to register and place.`);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ target: TARGET, unique: unique.size, registered, baseOnly, legacyExhibits: legacy.map(({ id, name }) => ({ id, name })), errors }, null, 2));
  } else {
    console.log(`${unique.size} unique exact specimens registered and ${legacy.length} documented exhibits awaiting exact identity review.`);
    console.log(`${registered.filter(({ revisit }) => revisit).length} have a dedicated equipped return prop. ${registered.filter(({ fieldUse }) => fieldUse).length} support a portable use at other chapter desks. The Nexus also offers a return route.`);
    console.log(`${baseOnly.length} registered specimens have only the base return arch.`);
    console.log(`${Math.max(0, TARGET - unique.size)} open places in the ${TARGET}-specimen target.`);
    for (const error of errors) console.error(error);
  }
  if (errors.length) process.exitCode = 1;
} finally {
  await server.close();
}
