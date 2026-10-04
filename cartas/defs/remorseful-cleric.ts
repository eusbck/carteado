// Remorseful Cleric
// Flying
// Sacrifice this creature: Exile target player's graveyard.
import { activated, defineCard, exile, keyword, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Remorseful Cleric',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('Sacrifice this creature', function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]);
      }, { targets: [t.player()], text: 'Sacrifique esta criatura: Exile o cemitério do jogador alvo.' }),
    ],
  }],
  rulings: {},
});
