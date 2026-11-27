/** Two holes in the rotating nameplate reveal different relationships between the same two public sources. */
export interface WindowReading {
  voices: string;
  years: string;
}
const pairs: Record<string, WindowReading> = {
  'convention+fort': {
    voices:
      'The September transcript names its parties. The October transcript names Wea representatives in a separate convention. Opal files a second signature strip.',
    years:
      'The first agreement points forward. The second is dated twenty-six days later. Tallis slips a spacer between the two dates so they cannot look simultaneous.',
  },
  'fort+peoria': {
    voices:
      'A treaty transcript tells the reader whom that instrument names. The Peoria Tribe publishes its account of its own confederation and wider nation. The wall has room to name both kinds of authority.',
    years:
      'September 1809 and the confederation described for 1854 now have separate hinges. A reader can turn back through them without putting the later government at the earlier signing.',
  },
  'eastern+fort': {
    voices:
      'The United States commissioner appears on the treaty record. An Eastern Shawnee election board signed its own certificate. Tallis puts the three board signatures beside the count.',
    years:
      'The September 1809 page opens on a separate agreement still to come. The June 1999 page certifies a completed amendment vote. Neither date belongs above both windows.',
  },
  'absentee+fort': {
    voices:
      'A declaration by the parties listed at Fort Wayne and the Absentee Shawnee Tribe’s public account of Tecumseh can stand on the same shelf. One cannot supply the other’s speaker.',
    years:
      'September 1809 dates the treaty. The logo account looks back on Tecumseh’s work. Opal takes the treaty date off the heading over the modern account.',
  },
  'fort+marker': {
    voices:
      'A treaty transcript and a state historical marker each select names for a purpose. A visitor turns towards a third shelf to find what a Nation says in its own name.',
    years:
      'The September 1809 agreement, the 1810 and 1811 meetings and the 2011 marker fit on three separate lines. Tallis makes the inscription date visible from the ferry.',
  },
  'convention+peoria': {
    voices:
      'The 1809 convention records named Wea representatives. The Peoria Tribe describes the Wea among four peoples forming the 1854 confederation and a wider history of twenty tribes. Opal keeps each account under its own name.',
    years:
      'An October 1809 convention sits forty-five calendar years before the confederation named for 1854. The visitor can follow a connection without treating the two groups as interchangeable.',
  },
  'convention+eastern': {
    voices:
      'A convention with named Wea representatives and an Eastern Shawnee election board’s count answer to different communities. Tallis takes down the one-word heading that had covered both.',
    years:
      'An agreement signed in October 1809 and an election certified in June 1999 each tell us about a single event. The gap between them supplies no family tree or line of authority.',
  },
  'absentee+convention': {
    voices:
      'The Absentee Shawnee Tribe authors the description of its own emblem. The October transcript names Wea representatives. A shared place name cannot make those speakers the same.',
    years:
      'The 1809 date belongs on the convention. The Tribe’s later remembrance has its own purpose. Opal removes a pin that had made the logo look like a contemporary witness.',
  },
  'convention+marker': {
    voices:
      'The convention records a formal declaration. The Indiana Historical Bureau chooses words to commemorate meetings at the same place. One reader wants the parties. Another wants to know who commissioned the account.',
    years:
      'Vincennes appears on both leaves. The October 1809 convention precedes the meetings in 1810 and 1811. The marker itself came in 2011.',
  },
  'eastern+peoria': {
    voices:
      'The Peoria Tribe of Indians of Oklahoma describes its own history. The Eastern Shawnee Tribe of Oklahoma publishes its own constitution. Calling both pages “Oklahoma” left both voices out of the byline.',
    years:
      '1854 belongs to the confederation in the Peoria account. June 1999 dates one amendment certificate in the Eastern Shawnee file. Neither is a date of origin for both nations.',
  },
  'absentee+peoria': {
    voices:
      'The Absentee Shawnee Tribe explains a choice on its emblem. The Peoria Tribe describes its confederation in its own words. The touring library has borrowed two public accounts, each credited to its publisher.',
    years:
      'An account that remembers Tecumseh and a history that names a union in 1854 each choose where to look back. Their current publication does not date all the events on their pages.',
  },
  'marker+peoria': {
    voices:
      'Indiana’s marker presents a public commemoration. The Peoria Tribe presents its own history and its wider membership. Tallis turns both credit strips towards the reader.',
    years:
      'The 1854 confederation named by the Peoria Tribe belongs on a different line from the 2011 marker. A printed date tells the reader what happened only when it stays beside its description.',
  },
  'absentee+eastern': {
    voices:
      'The Absentee Shawnee Tribe describes its own emblem. The Eastern Shawnee Tribe of Oklahoma publishes its own constitution. The name “Shawnee” alone would send a reader to the wrong government.',
    years:
      'The 17 June 1999 certificate dates a particular Eastern Shawnee amendment vote. The Absentee Shawnee account remembers an early nineteenth-century leader. Neither source supplies the date of the other.',
  },
  'eastern+marker': {
    voices:
      'An election board certified its count. A state historical bureau installed a marker. A vote tally and a commemoration ask a reader to trust different work.',
    years:
      '1999 records an amendment election. 2011 dates the marker, whose story concerns 1810 and 1811. Opal gives the visitor a separate place for the event and its later commemoration.',
  },
  'absentee+marker': {
    voices:
      'The Absentee Shawnee Tribe explains why Tecumseh appears on its emblem. Indiana’s marker selects words for a public place. Tallis gives each publisher a line. Neither promises the exact words he spoke.',
    years:
      'The marker puts the meetings in 1810 and 1811 and its own installation in 2011. Those dates can guide a reader to the meetings without dating the Tribe’s own act of remembrance.',
  },
};
export function stackWindow(a: string, b: string) {
  return pairs[[a, b].sort().join('+')];
}
