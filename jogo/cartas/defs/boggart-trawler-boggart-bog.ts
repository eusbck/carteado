// Boggart Trawler // Boggart Bog
// Frente — When this creature enters, exile target player's graveyard.
// Verso — As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {B}.
import { defineCard, etb, exile, land, mana, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Boggart Trawler // Boggart Bog',
  faces: [
    {
      abilities: [etb(function* (c) {
        const p = tgtPlayer(c);
        if (p !== null && c.g.state.zones.graveyard[p].length) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]);
      }, { targets: [t.player()], text: 'Quando esta criatura entra, exile o cemitério do jogador alvo.' })],
    },
    { abilities: [land.payLifeOrTapped(3), mana('B')] },
  ],
  rulings: {},
});
