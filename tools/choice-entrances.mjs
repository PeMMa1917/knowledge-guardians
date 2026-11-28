/** Resolve map entrances using the same station catalogues and character invitations as the playable scenes. */
export async function loadEntrances(server) {
  const get = (path) => server.ssrLoadModule('/src/' + path);
  const [peg, register, callboard, glass, curtain, clear, facing, cues, neighbours, neighbourhoods, ink] =
    await Promise.all([
      get('content/datePegCases.ts'),
      get('content/dateRegisterCases.ts'),
      get('content/callboardCases.ts'),
      get('content/glassRack.ts'),
      get('content/curtainCall.ts'),
      get('domain/clearBay.ts'),
      get('content/facingCue.ts'),
      get('domain/facingCue.ts'),
      get('domain/neighbours.ts'),
      get('content/neighbours.json'),
      get('domain/inkPost.ts'),
    ]);
  const invitations = new Map();
  for (const { people } of neighbourhoods.default) {
    for (const [index, resident] of people.entries()) {
      const other = people[1 - index];
      const cases = [{}, ...other.choices.map(({ id }) => ({ ['neighbour.' + other.id]: id }))];
      invitations.set(
        resident.id,
        cases.flatMap((flags) => {
          const visit = neighbours.neighbourInvitation(resident.id, flags);
          return visit ? [visit.node] : [];
        }),
      );
    }
  }
  const stations = [
    peg.datePegEntries,
    register.dateRegisterEntries,
    callboard.callboardEntries,
    glass.glassRackEntries,
    curtain.curtainCallEntries,
    clear.clearBayEntries,
  ];
  return {
    field(game) {
      const site = cues.FACING_SITES.find((site) => game === facing.FACING_CUE_PREFIX + site);
      return [
        ...stations.flatMap((entries) => entries(game)),
        ...(game === 'badge-annex:press' ? ['oracle.press'] : []),
        ...(site
          ? [
              ...cues.FACINGS.map((side) => facing.facingCueBeatNode(site, side)),
              facing.facingCuePlanNode(site),
              ...(site === 'house' ? [facing.facingCueHouseReadNode] : []),
            ]
          : []),
      ];
    },
    character(id, room) {
      const post = ink.inkInvitation(id, room);
      return [...(invitations.get(id) ?? []), ...(post ? [post.node] : [])];
    },
  };
}
