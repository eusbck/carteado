// Archfiend of Depravity
// Flying
// At the beginning of each opponent's end step, that player chooses up to two creatures they control, then sacrifices
// the rest.
import { chooseItems, creaturesOf, defineCard, keyword, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Archfiend of Depravity',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.endStep('opponent'), function* (c) {
        const p = c.event.active as PlayerId;
        if (c.g.state.players[p].left) return;
        const todas = creaturesOf(c.g, p);
        // rulings 1-2: escolhe na resolução, sem alvo; pode poupar uma ou nenhuma
        const fica = todas.length <= 0 ? [] : (yield* chooseItems(c.g, p, 'Archfiend of Depravity: escolha até duas criaturas para manter (as outras serão sacrificadas)', todas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, Math.min(2, todas.length))).map(Number);
        yield* sacrifice(c.g, todas.filter((id) => !fica.includes(id)));
      }, { text: 'No início da etapa final de cada oponente, esse jogador escolhe até duas criaturas que controla e sacrifica as demais.' }),
    ],
  }],
  rulings: {
    1: 'teste: o oponente escolhe na resolução as que ficam',
    2: 'teste: sem escolher nenhuma, sacrifica todas',
  },
});
