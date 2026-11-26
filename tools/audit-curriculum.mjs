/** Inventory real objective links by subject and world so gaps stay visible during authoring. */
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { SUBJECTS } = await server.ssrLoadModule('/src/domain/curriculum.ts');
  const pack = buildPack();
  const profile = Object.entries(SUBJECTS).map(([subject, { name, group }]) => {
    const encounters = pack.missions.flatMap((mission) => mission.objectives
      .filter(({ weave }) => weave?.subjects?.includes(subject))
      .map(({ id, title, essential, weave }) => ({ id, title, essential, world: mission.world, thinking: weave.thinking })));
    return { subject, name, group,
      count: encounters.length,
      worlds: [...new Set(encounters.map(({ world }) => world))].sort(),
      core: encounters.filter(({ essential }) => essential).length,
      depths: [...new Set(encounters.flatMap(({ thinking }) => thinking ? [thinking.dok] : []))].sort(),
      encounters,
    };
  });
  if (process.argv.includes('--json')) console.log(JSON.stringify(profile, null, 2));
  else {
    console.log('Subject | Group | Linked objectives | Worlds | Core steps | Authored DOK levels');
    for (const { name, group, count, worlds, core, depths } of profile) {
      console.log([name, group, count, worlds.length, core, depths.join(', ') || 'None'].join(' | '));
    }
  }
} finally {
  await server.close();
}
