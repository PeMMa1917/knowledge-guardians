export interface MakerTrial {
  tool: string;
  reading: string;
  bench: string;
  references: [string, string];
  mounts: [string, string];
  seals: [string, string];
  field: string;
  surfaces: [string, string];
  gifts: [string, string];
  replies: [string, string];
}
export const makerTrials: MakerTrial[] = [
  {
    tool: 'rain-gauge',
    reading: 'rain',
    bench:
      'Noa brings a jar with two rings scored by the water keeper. “My last cup had a very fine scale. Every mark was two lines too high.” Hesper has two removable scale strips for the new straight-sided cup.',
    references: ['Fill to the five-line ring', 'Fill to the ten-line ring'],
    mounts: ['Fit the brass strip', 'Fit the tin strip'],
    seals: ['Shift the zero on the strip', 'Tie a correction slip to the cup'],
    field:
      'The tea seller has stacked her cups on the highest shelf. Noa lifts the lid on the rain catch. The seller keeps looking at the timber under the bridge.',
    surfaces: ['Hold the cup level at the rain stake', 'Unroll Noa’s flood-night tally'],
    gifts: ['Give the catch slip to the tea seller', 'Hang the two records at the bridge'],
    replies: [
      'The tea seller brings one shelf down for the child who collects the breakfast cups. She keeps the top shelf clear until a runner comes from upstream.',
      'Noa strings the two records under the lamp. The bridge crew posts a second watch upstream. Their note leaves room for rain that never touched this cup.',
    ],
  },
  {
    tool: 'plumb-line',
    reading: 'tower',
    bench:
      'Hesper’s apprentice has brought his grandmother’s door frame indoors, one chalked corner at a time. A small hook throws the ruled plate one finger left. Turn it round and it throws the plate right. “Either way, write down which face you used.”',
    references: ['Hang against the flush edge', 'Hang against the two-finger step'],
    mounts: ['Use the left face of the plate', 'Turn to the right face'],
    seals: ['Slide the ruled plate to zero', 'Knot a correction tag onto the cord'],
    field:
      'Maren oils the bell rope. The market wants the tower shut. She remembers her grandmother making a mark here with a line and hiding a button in the wet plaster.',
    surfaces: ['Lower the weight beside the door', 'Rub the notch beside the old button'],
    gifts: ['Leave the paired marks with Maren', 'Give a measured rubbing to the stoneworker'],
    replies: [
      'Maren leaves the lower door open for the morning bell. She hangs the two marks where the new ringer can start a record of her own.',
      'The stoneworker checks a higher joint that nobody measured that morning. Maren brings a lamp and asks for her grandmother’s rubbing back afterwards.',
    ],
  },
  {
    tool: 'reed-pen',
    reading: 'flood-post',
    bench:
      'Keeper Oduya pushes two slips across the board. “Call my sister by the wrong berth number and she has to carry the whole basket twice.” A wide reed makes a join swell. A fine reed can leave a gap. Try each mark on an actual slip.',
    references: ['Copy the open three', 'Copy the bar of the seven'],
    mounts: ['Try the wide reed', 'Try the fine reed'],
    seals: ['Fit a marked depth stop to the nib', 'Tie a sample strip beside the pen'],
    field:
      'The paint in the middle of the flood year has washed off. Venn remembers a five. His father told him the story under this post, and it is the only thing his father ever wrote in the ledger.',
    surfaces: ['Take the rubbing under the side lamp', 'Listen while Venn opens his father’s tally'],
    gifts: [
      'Hang the rubbing with a space for the lost digit',
      'Keep Venn’s signed recollection beside the rubbing',
    ],
    replies: [
      'Venn leaves an empty type slug where the digit wore away. A short reader can still trace the two surviving marks. Venn keeps a copy for his father’s book.',
      'Venn signs his recollection on a second slip. The printer can unfold it without supplying a middle digit on the rubbing. Venn runs his finger over his father’s tally again.',
    ],
  },
];
export const makerTrialForTool = (id: string) => makerTrials.find((t) => t.tool === id);
export const makerTrialForReading = (id: string) => makerTrials.find((t) => t.reading === id);
