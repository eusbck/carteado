// Finale of Devastation
// Search your library and/or graveyard for a creature card with mana value X or less and put it onto the battlefield. If
// you search your library this way, shuffle. If X is 10 or more, creatures you control get +X/+X and gain haste until end
// of turn.
import { chooseItems, creaturesOf, defineCard, isCreature, manaValue, nameOf, objItem, putOntoBattlefield, searchLibrary, shuffleLibrary, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Finale of Devastation',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const x = c.x;
        // ruling 1: o X do custo das cartas no grimório ou no cemitério conta 0
        const serve = (id: ObjId) => isCreature(c.g, id) && manaValue(c.g, id) <= x;
        let escolhida: ObjId | null = null;
        const doCemiterio = s.zones.graveyard[c.you].filter(serve);
        if (doCemiterio.length) {
          const esc = yield* chooseItems(c.g, c.you, `Finale of Devastation: escolha uma carta de criatura do seu cemitério com valor de mana ${x} ou menos (ou nenhuma, para procurar no grimório)`, doCemiterio.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
          if (esc.length) escolhida = Number(esc[0]);
        }
        if (escolhida === null) {
          const achados = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: serve, prompt: `Procure uma carta de criatura com valor de mana ${x} ou menos` });
          escolhida = achados[0] ?? null;
          shuffleLibrary(c.g, c.you);
        }
        if (escolhida !== null) yield* putOntoBattlefield(c.g, [{ id: escolhida, controller: c.you }], 'effect');
        // rulings 2-4: com X 10 ou mais, vale para todas as suas criaturas, a que acabou de entrar também, ache ou não
        if (x >= 10) {
          const ids = creaturesOf(c.g, c.you);
          if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: x, t: x }, { k: 'addKeyword', kw: 'haste' }]);
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    2: 'teste: com X 10 ou mais, as suas criaturas, inclusive a que entrou, recebem +X/+X e ímpeto',
    3: 'regra geral: CR 608.2 — a mágica resolve inteira antes de os gatilhos de entrar irem para a pilha (motor/stack.ts)',
    4: 'teste: com X 10 ou mais, as suas criaturas, inclusive a que entrou, recebem +X/+X e ímpeto',
  },
});