/** Requests from the fictional passengers. The museum fields on the signed print supply the evidence. */
export const ferryCommissions: Record<
  string,
  { caller: string; request: string; answer: string }
> = {
  'little-moon': {
    caller: 'Tova',
    request:
      'My boy drew the ferry with a silver patch on its side. Everybody says I polished it for him. Turn his paper over.',
    answer:
      'There is his thumb in the paste. He made the moon a little too wide and gave the boat a patch to hold it.',
  },
  'quai-stairs': {
    caller: 'Neris',
    request:
      'The woman on my quay carries a bundle up three flights. Could I stage that climb as a day for everybody in this picture?',
    answer:
      'I can give an actor the rise and fall of the steps. I’ll leave the length of a working day to someone who knew it.',
  },
  'washerwoman-colour': {
    caller: 'Tova',
    request:
      'The apprentice has made one costume for each patch of colour. Have I promised too many seats?',
    answer:
      'Put the colours in the scene. I’ll count our passengers where they board.',
  },
  'womans-work': {
    caller: 'Neris',
    request:
      'My sister has asked which of these workers gets to go home first. I keep wanting to write her an ending.',
    answer:
      'I can give the ending to our own character. I’ll leave the women in the painting together where the artist put them.',
  },
  'goyen-paint': {
    caller: 'Tova',
    request:
      'Renna saw my finger following the painted bank. She took her navigation chalk out of my hand.',
    answer:
      'A painted bank makes a good backdrop. I’ll take bearings on the way home.',
  },
  'lace-pillow': {
    caller: 'Neris',
    request:
      'I drew a neck under the pattern. My sister turned the page over and drew the working pillow back in.',
    answer:
      'Keep the pillow. Now the audience can see someone in the middle of a job.',
  },
  'brussels-lappets': {
    caller: 'Neris',
    request:
      'Two performers, two lappets. I had them take a bow as sisters. Did the maker leave anything that joins them?',
    answer:
      'They can bow as partners in our play. The pair of pieces belongs together in the record even with the maker’s name open.',
  },
  'sicily-band': {
    caller: 'Tova',
    request:
      'Those trees pass my window one after another like the pilings along our quay. What could I tell a passenger about the thread?',
    answer:
      'I can point out the repeated trees. I’ll keep the museum’s qualification on the fibre where it can be read.',
  },
  'poland-sash': {
    caller: 'Tova',
    request:
      'My nephew has assigned this sash to a bridegroom. I’d like to see what the cloth itself can carry onto the boat.',
    answer:
      'A border runs the length of the piece. The wedding scene belongs to my nephew.',
  },
  'tenerife-handkerchief': {
    caller: 'Neris',
    request:
      'A child has put her grandmother’s initials beside the embroidery. She says it reminds her of home.',
    answer:
      'I’ll give her memory its own line. It can travel alongside the museum’s handkerchief.',
  },
  'venice-silk': {
    caller: 'Tova',
    request:
      'Our curtain has a shape rather like this one. Could both labels take the same home port?',
    answer:
      'Each cloth gets its own ticket. Matching a pattern will help me compare them at the next stop.',
  },
  'safavid-poppies': {
    caller: 'Neris',
    request:
      'The harbour audience called out “gold” before I had finished unfolding the paper. They meant three different things.',
    answer:
      'I can show where the petals shine. The material entry can carry its own words at the other window.',
  },
  'isfahan-carpet': {
    caller: 'Tova',
    request:
      'When we roll our cabin rug up, I can see a whole second story underneath. What underneath does this paper give me?',
    answer:
      'The borders and field fit my window. I’ll leave the underside to the description of the construction.',
  },
  'lampas-dancers': {
    caller: 'Neris',
    request:
      'My drummer wants to play the tune these musicians knew. His sticks have been hovering all afternoon.',
    answer:
      'He can compose a tune for our crossing. I’ll credit it to him and give the figures their own place on the programme.',
  },
  'indigo-width': {
    caller: 'Tova',
    request:
      'A sailmaker on the east bank wants to open a rule along the printed leaf. Our window makes the leaf twice as big.',
    answer:
      'Send him the catalogue measurement with its units. He can still use the leaf to follow the repeat.',
  },
  'copperplate-cotton': {
    caller: 'Neris',
    request:
      'A thin branch stops at the edge of the scrap. I had my actor stop speaking in exactly that place.',
    answer:
      'The pause can stay in the play. A lost piece of cotton might once have carried the branch farther.',
  },
  'strawberry-thief': {
    caller: 'Tova',
    request:
      'We have a bird like that on our old cushion. Its owner wants to borrow the date for a sale.',
    answer:
      'The date travels on the ticket for the museum’s piece. The cushion needs a visit of its own.',
  },
  'concorde-view': {
    caller: 'Neris',
    request:
      'I sent a boy running out of the picture and almost wrote what he found round the corner.',
    answer:
      'The photograph lets me place his last visible footstep. What comes after it is a stage direction.',
  },
  'rackham-grove': {
    caller: 'Neris',
    request:
      'From the near rail it looks like a farewell. The other end of the bench calls it a meeting.',
    answer:
      'Let both groups stage their entrance. We can credit the positions to the illustrator and the two arrivals to the company.',
  },
  'yokuts-bowl': {
    caller: 'Tova',
    request:
      'A visitor wants names for every plant under the pattern. The crew has only this one collection view.',
    answer:
      'I can show a change in the coiling. I’ll keep this basket’s own source with it and leave the unnamed materials open.',
  },
  'hearth-press': {
    caller: 'Neris',
    request:
      'I used to sign for a whole crew because there was space for one name. The person who pulled the print never got called to supper.',
    answer:
      'Make room on our programme for artist, printer and publisher. Leave the names on the museum work with their recorded jobs.',
  },
  'bus-print': {
    caller: 'Tova',
    request:
      'One passenger is already counting injuries in this printed calamity. The next is laughing at the type.',
    answer:
      'Read the lettering beside the cartoon. We can tell the audience how the joke works without opening an accident register.',
  },
  'vine-band': {
    caller: 'Tova',
    request:
      'The vine seems to run past the edge of my thumb. Where could I tell a visitor it was going?',
    answer:
      'My thumb can follow a leaf to its neighbour. An imagined destination belongs in the story on board.',
  },
  'bastille-paper': {
    caller: 'Neris',
    request:
      'The date on my placard made the younger children think every event in the procession happened that year.',
    answer:
      'I’ll date the work beside the artist’s scene. The event the holiday remembers needs its own line.',
  },
  'lambert-cup': {
    caller: 'Tova',
    request:
      'The boy at the rail had the body inscription in his pocket. His sister came back with a different mark from the foot.',
    answer:
      'Give them both a turn at the lamp. We can lay out the surfaces before deciding which role each mark supports.',
  },
  'quebec-teapot': {
    caller: 'Tova',
    request:
      'My crew wrote the name of the town in the picture into the place where the pot was fired.',
    answer:
      'I’ll wrap the scene round the paper pot again. The making-place stays on its catalogue ticket.',
  },
  'maraca-gourd': {
    caller: 'Neris',
    request:
      'The boat is quiet enough to hear a bead fall, and I have accidentally promised this particular rattle a solo.',
    answer:
      'Our musician can make a sound of her own. The audience can look at the handle and gourd while she takes the credit for what they hear.',
  },
  'bermuda-bungalow': {
    caller: 'Tova',
    request:
      'The gardener wants to plant everything at precisely the distance it stands from the painted house.',
    answer:
      'Use the painter’s arrangement for a backdrop. We can measure the quay garden before digging.',
  },
  'san-miguel-cloth': {
    caller: 'Neris',
    request:
      'I kept an empty space under the word “maker.” A child asked if somebody had been sent away.',
    answer:
      'I’ll tell her the making is visible in the drawn threads. We can value the work while its maker’s name is missing from this entry.',
  },
  'cedar-chair-two': {
    caller: 'Tova',
    request:
      'There are two rather similar chairs in the collection. The wrong ticket jumped into my pocket once before.',
    answer:
      'Check the collection number before the curtain goes up. The crest and legs can stay in the same picture.',
  },
  quetzalecatzin: {
    caller: 'Neris',
    request:
      'A passenger read the lettering and asked me to settle a family’s land claim on the strength of a projection.',
    answer:
      'I’ll give the manuscript and its Nahua makers’ world room on the programme. The family’s claim deserves its context and the title to land is outside my job.',
  },
  'gage-mount': {
    caller: 'Tova',
    request:
      'A visitor heard the name cut into the iron and thought it was the maker’s signature. The crew went quiet.',
    answer:
      'We can offer the inscription, the making credit and the later deposit separately. The man’s life is larger than our window.',
  },
};
