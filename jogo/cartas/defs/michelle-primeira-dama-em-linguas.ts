// Michelle, Primeira-Dama em Línguas (carta própria da mesa)
// Lifelink
// Whenever you gain life for the first time each turn, put a +1/+1 counter on target creature you control.
import { addCounters, and, defineCard, is, keyword, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Michelle, Primeira-Dama em Línguas',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.youGainLife(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        oncePerTurn: true,
        targets: [t.creature(and(is.yours), 'criatura alvo que você controla')],
        text: 'Sempre que você ganha pontos de vida pela primeira vez em cada turno, coloque um marcador +1/+1 na criatura alvo que você controla.',
      }),
    ],
  }],
  rulings: {},
});
