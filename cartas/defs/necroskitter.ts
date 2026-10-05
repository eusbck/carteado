// Necroskitter
// Wither (This deals damage to creatures in the form of -1/-1 counters.)
// Whenever a creature an opponent controls with a -1/-1 counter on it dies, you may return that card to the battlefield
// under your control.
import { defineCard, keyword, nameOf, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Necroskitter',
  faces: [{
    abilities: [
      keyword('wither'),
      // rulings 2-3: basta um marcador -1/-1 e um oponente controlando ao sair do campo
      triggered(on.dies((c, l, o) => c.g.isOpponent(c.you, l.controller) && (o.counters['-1/-1'] ?? 0) > 0), function* (c) {
        const carta = c.g.state.lki[c.event.old as ObjId]?.newId ?? null;
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        // ruling 1: volta sem os marcadores (objeto novo)
        if (yield* yesNo(c.g, c.you, `Necroskitter: devolver ${nameOf(c.g, carta)} ao campo sob seu controle?`)) yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, { text: 'Sempre que uma criatura com marcador -1/-1 que um oponente controla morre, você pode devolver essa carta ao campo sob seu controle.' }),
    ],
  }],
  rulings: {
    1: 'teste: volta sem os marcadores',
    2: 'regra geral: o cemitério de destino não importa',
    3: 'regra geral: basta um marcador -1/-1',
  },
});
