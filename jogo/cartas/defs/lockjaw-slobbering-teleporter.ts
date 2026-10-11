// Lockjaw, Slobbering Teleporter
// Vigilance
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, put a +1/+1 counter on Lockjaw.
// When you do, Lockjaw and up to one other target creature you control can't be blocked this turn.
import { addCounters, and, defineAbility, defineCard, is, keyword, reflexive, t, tgt, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

const SALTO = defineAbility('Lockjaw, Slobbering Teleporter:salto', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const ids = [c.source, tgt(c)].filter((x): x is number => x !== null && c.g.state.objects[x]?.zone === 'battlefield');
  if (ids.length) untilEndOfTurn(c, ids, [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
}, {
  targets: [upTo(1, t.creature(and(is.yours, is.other), 'até uma outra criatura alvo que você controla'))],
  text: 'Lockjaw e até uma outra criatura alvo que você controla não podem ser bloqueados neste turno.',
}));

export default defineCard({
  name: 'Lockjaw, Slobbering Teleporter',
  faces: [{
    abilities: [
      keyword('vigilance'),
      noCombateSeConjurou(function* (c) {
        // "quando fizer isso": só se o marcador foi mesmo colocado
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const antes = c.g.state.objects[c.source].counters['+1/+1'] ?? 0;
        addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        if ((c.g.state.objects[c.source].counters['+1/+1'] ?? 0) > antes) reflexive(c, SALTO.id!);
      }, { text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, coloque um marcador +1/+1 em Lockjaw. Quando fizer isso, Lockjaw e até uma outra criatura alvo que você controla não podem ser bloqueados neste turno.' }),
    ],
  }],
  rulings: {},
});
