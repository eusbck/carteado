// Bojuka Bog
// This land enters tapped.
// When this land enters, exile target player's graveyard.
// {T}: Add {B}.
import { defineCard, etb, exile, land, mana, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Bojuka Bog',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]);
      }, { targets: [t.player()], text: 'Quando entra, exile o cemitério do jogador alvo.' }),
      mana('B'),
    ],
  }],
  rulings: {},
});
