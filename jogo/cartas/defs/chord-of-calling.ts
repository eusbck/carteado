// Chord of Calling
// Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one
// mana of that creature's color.)
// Search your library for a creature card with mana value X or less, put it onto the battlefield, then shuffle.
import { controllerOf, defineCard, isCreature, keyword, manaValue, searchTo } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';

export default defineCard({
  name: 'Chord of Calling',
  faces: [{
    convoke: true,
    abilities: [keyword('convoke')],
    spell: {
      // ruling 1: X é escolhido antes do convoke; o teto conta a mana disponível e as criaturas que podem convocar
      xMax: (c) => {
        const s = c.g.state;
        const porFonte = new Map<number, number>();
        for (const o of manaOptions(c.g, c.you)) porFonte.set(o.obj, Math.max(porFonte.get(o.obj) ?? 0, o.alt.length));
        const criaturas = s.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you && isCreature(c.g, id) && !s.objects[id].tapped).length;
        let total = s.players[c.you].manaPool.length + criaturas;
        for (const v of porFonte.values()) total += v;
        return Math.max(0, total - 3);
      },
      *effect(c) {
        const x = c.x ?? 0;
        // ruling 8: uma carta com {X} no custo de mana tem X = 0 no grimório (CR 107.3m)
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id) && manaValue(c.g, id) <= x, 1, 'battlefield',
          { prompt: `Chord of Calling: procure uma carta de criatura com valor de mana ${x} ou menos` });
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.51: X escolhido primeiro, criaturas viradas pagam parte do custo total',
    2: 'regra geral: CR 702.51a — qualquer criatura desvirada sua pode convocar, mesmo com enjoo (motor/stack.ts)',
    3: 'regra geral: CR 702.51 — virar para convocar não tira a criatura do combate (motor/stack.ts)',
    4: 'regra geral: CR 702.51b — o convoke vem depois do custo total e não muda o valor de mana (motor/stack.ts)',
    5: 'regra geral: CR 605.3 — mana tirada de uma criatura a vira antes do pagamento; ela não pode convocar depois',
    6: 'regra geral: CR 702.51b — convoke não é custo alternativo e combina com eles (motor/stack.ts)',
    7: 'regra geral: CR 702.51a — criatura de várias cores paga uma mana de qualquer das suas cores (motor/mana.ts convokeOne)',
    8: 'teste: acha só criatura com valor de mana X ou menos e a põe no campo',
  },
});
