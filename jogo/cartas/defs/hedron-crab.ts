// Hedron Crab — Landfall — Whenever a land you control enters, target player mills three cards.
import { defineCard, mill, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Hedron Crab',
  faces: [{
    abilities: [triggered(on.landfall(), function* (c) { const p = tgtPlayer(c); if (p !== null) yield* mill(c.g, p, 3); },
      { targets: [t.player()], text: 'Queda de terreno — Sempre que um terreno que você controla entra, o jogador alvo moe três cartas.' })],
  }],
  rulings: {
    1: 'regra geral: CR 701.17b — com menos de três cartas, moe o que tiver',
    2: 'regra geral: CR 603.2 — cada terreno que entra dispara uma vez',
    3: 'regra geral: CR 115.1 — pode mirar você mesmo',
  },
});
