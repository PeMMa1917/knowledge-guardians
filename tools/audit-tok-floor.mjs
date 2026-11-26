/** Report only the learning tags attached to steps in the modeled itineraries. */
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false, ws: false },
});

try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { playPath, PLAY_STYLES } = await server.ssrLoadModule('/src/domain/learningPaths.ts');
  const { auditCourseFloor, courseTags, estimatedCourseEncounters } = await server.ssrLoadModule('/tools/tok-floor.ts');
  const pack = buildPack();
  const tags = courseTags(pack);
  const routes = [...PLAY_STYLES.map((style) => ({ name: style, steps: playPath(pack, style) })),
    { name: 'explorer, all filed cases', steps: playPath(pack, 'explorer', 'all') }];
  const report = routes.map(({ name, steps }) => {
    const { duration, encounters } = estimatedCourseEncounters(steps, tags);
    return { name, ...auditCourseFloor(duration, encounters), encounters };
  });
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ basis: 'Modeled itineraries, estimated action completion times, and explicit source tags', routes: report }, null, 2));
  } else {
    console.log('Estimated itineraries and authored tags. Framework inference and unknown tags do not count toward the floor.');
    console.log('Required distinct tags per window: 6 concepts, 2 framework areas, 1 area of knowledge, 1 optional theme.');
    for (const { name, duration, firstHour, wholeRoute, rolling } of report) {
      console.log(`\n${name} (${duration} estimated minutes)`);
      for (const { width, firstWindow, gaps, minutesWithGap } of rolling) {
        if (!firstWindow) {
          console.log(`  Rolling ${width} min: no full window`);
          continue;
        }
        console.log(`  Rolling ${width} min: ${minutesWithGap.toFixed(1)} min below the floor in ${gaps.length} interval(s); first window counts ${counts(firstWindow)}`);
        console.log(`    Below-floor dimensions: ${[...new Set(gaps.flatMap(({ below }) => below))].join(', ') || 'none'}`);
        console.log(`    First window: ${firstWindow.distinctActions} distinct actions; tags supported by one action ${Object.entries(firstWindow.singleActionTags).map(([axis, tags]) => `${axis} ${tags.length}`).join(' / ')}`);
      }
      console.log(`  First ${firstHour.minutes} min cumulative${firstHour.complete ? '' : ' (partial hour)'}: ${counts(firstHour)}`);
      console.log(`  First-hour missing: ${Object.entries(firstHour.missing).map(([axis, missing]) => `${axis} ${missing.join(', ') || 'none'}`).join(' / ')}`);
      console.log(`  Encounters without explicit metadata: ${Object.entries(wholeRoute.unknownEncounters).map(([field, ids]) => `${field} ${ids.length}`).join(' / ')}`);
    }
  }
} finally {
  await server.close();
}

function counts(coverage) {
  return Object.entries(coverage.present).map(([axis, values]) => `${axis} ${values.length}`).join(' / ');
}
