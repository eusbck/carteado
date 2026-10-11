// Malfegor
// Flying
// When Malfegor enters, discard your hand. Each opponent sacrifices a creature of their choice for each card discarded
// this way.
import { defineCard, discard, eachSacrifices, etb, isCreature, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Malfegor',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        // ruling 1: obrigatório, a mão inteira
        const descartadas = yield* discard(c.g, c.you, c.g.state.zones.hand[c.you].length);
        // ruling 2: os oponentes escolhem em ordem de turno e tudo é sacrificado ao mesmo tempo
        if (descartadas.length) yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id), descartadas.length, `${descartadas.length} criatura(s)`);
      }, { text: 'Quando Malfegor entra, descarte a sua mão. Cada oponente sacrifica uma criatura à escolha dele para cada carta descartada assim.' }),
    ],
  }],
  rulings: {
    1: 'teste: você descarta a mão inteira e cada oponente sacrifica uma criatura para cada carta descartada',
    2: 'regra geral: CR 101.4 — os oponentes escolhem em ordem de turno e sacrificam ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
  },
});