// Angel of Finality
// Flying
// When this creature enters, exile target player's graveyard.
import { defineCard, etb, exile, keyword, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Angel of Finality',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]);
      }, { targets: [t.player()], text: 'Quando esta criatura entra, exile o cemitério do jogador alvo.' }),
    ],
  }],
  rulings: {},
});
