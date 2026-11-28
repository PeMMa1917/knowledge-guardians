// The two accounts concern the same albumen print. An institutional title is an attributed claim.
export const TAKU_PRINT=163365;
export const TAKU_EXHIBIT='OBJ-NIGHT-163365';
export const takuCaption='The catalogue title dates the surrender to 21 August 1860 and says 2,000 prisoners were taken.';
export const takuWhole='A broad sweep of earthen fortifications. The two banks frame a track through the foreground. The distant defences meet the sky. The print does not supply a count of prisoners or a prisoner’s account.';
export function takuDescription(mode:string) {
  switch(mode){
    case 'left':return 'At the left margin an earthen bank rises behind low rounded structures. The right bank and the rest of the track fall outside this crop.';
    case 'right':return 'At the right margin the earthworks meet the edge of the print. The shelters at the other end have fallen outside the crop.';
    case 'top':return 'The skyline and the tops of the fortifications cross the upper strip. The track near the camera has been cropped away.';
    case 'bottom':return 'The lower strip holds earth and the track. The distant horizon is outside this strip.';
    case 'mono': case 'contrast': case 'soft': case 'amber': case 'negative':return 'The treatment changes the print’s tones. The positions of the banks and the track stay fixed. Changing value or colour yields no independent count.';
    case 'mirror':return 'Reversing the print puts the bank that was at the left on the right. The relative positions reverse, while the words on the mount stay in place.';
    case 'turn':return 'The skyline turns with the print. The change comes from the mount, without any new evidence about the surrender.';
    case 'grid':return 'A grid divides the earthworks and track into smaller viewing areas. A grid square gives a position in this print. It cannot supply the number in its title.';
    case 'medium':return 'The catalogue describes an albumen silver print. The process can leave a photographic trace of a view, while the title conveys a separate claim.';
    case 'date':return takuCaption+' The dating belongs to the title. The earth in the photograph bears no visible calendar.';
    case 'maker':return 'The National Gallery of Art credits the photograph to Felice Beato. The name identifies the photographer. It supplies no testimony from a prisoner.';
    case 'accession':return 'The National Gallery of Art identifies this particular print as 2012.137.1.2, part of the album The Second Opium War. A catalogue number identifies a print. It does not validate every claim in its title.';
    default:return takuWhole;
  }
}
