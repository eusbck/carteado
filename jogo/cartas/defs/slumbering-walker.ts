// Slumbering Walker
// This creature enters with two -1/-1 counters on it.
// At the beginning of your end step, you may remove a counter from this creature. When you do, return target creature
// card with power 2 or less from your graveyard to the battlefield.
import { and, chooseItems, defineAbility, defineCard, entersWithCounters, is, on, power, putOntoBattlefield, reflexive, removeCounters, t, tgt, triggered, yesNo } from '../../motor/api.ts';

const DEVOLVE = defineAbility('Slumbering Walker:devolve', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
}, {
  targets: [t.card('graveyard', and(is.creature, (c, id) => power(c.g, id) <= 2), 'carta de criatura alvo com força 2 ou menos no seu cemitério')],
  text: 'Quando fizer isso, devolva a carta de criatura alvo com força 2 ou menos do seu cemitério ao campo.',
}));

export default defineCard({
  name: 'Slumbering Walker',
  faces: [{
    abilities: [
      entersWithCounters('-1/-1', 2),
      triggered(on.endStep('you'), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        const tipos = Object.entries(o.counters).filter(([, n]) => n > 0).map(([k]) => k);
        if (!tipos.length || !(yield* yesNo(c.g, c.you, 'Slumbering Walker: remover um marcador desta criatura?'))) return;
        const [tipo] = tipos.length === 1 ? tipos : yield* chooseItems(c.g, c.you, 'Slumbering Walker: qual marcador remover?', tipos.map((k) => ({ id: k, label: `marcador ${k}` })), 1, 1);
        // ruling 1: gatilho reflexivo, alvo escolhido quando vai para a pilha (CR 603.12)
        if (removeCounters(c.g, { kind: 'obj', id: c.source }, tipo, 1) > 0) reflexive(c, DEVOLVE.id!);
      }, { text: 'No início da sua etapa final, você pode remover um marcador desta criatura. Quando fizer isso, devolva a carta de criatura alvo com força 2 ou menos do seu cemitério ao campo.' }),
    ],
  }],
  rulings: { 1: 'teste: o alvo é escolhido depois de remover o marcador' },
});
