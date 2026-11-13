// Hedron Crab
// Landfall — Whenever a land you control enters, target player mills three cards. (They put the top three cards of
// their library into their graveyard.)
import { defineCard, mill, on, t, tgtPlayer, triggered } from '../../motor/api.ts';
import { ATERRAGEM } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Hedron Crab',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* mill(c.g, p, 3);
      }, { targets: [t.player()], text: 'Aterragem — Sempre que um terreno que você controla entra, o jogador alvo mói três cartas.' }),
    ],
  }],
  rulings: { ...ATERRAGEM('teste: jogando um terreno, o jogador alvo mói três cartas') },
});
