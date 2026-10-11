// The Thing
// Trample
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, put four +1/+1 counters on The
// Thing.
// Whenever The Thing attacks, you may pay {R}{G}{W}{U}. When you do, double the number of each kind of counter on any
// number of target permanents you control.
import { addCounters, defineAbility, defineCard, is, keyword, mayPay, on, reflexive, t, triggered } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

const DOBRA = defineAbility('The Thing:dobra', triggered({ kind: 'batch', match: () => false }, function* (c) {
  for (const r of c.targets[0] ?? []) {
    if (!r || r.kind !== 'obj') continue;
    const o = c.g.state.objects[r.id];
    if (!o || o.zone !== 'battlefield') continue;
    // dobrar = colocar a mesma quantidade de marcadores de cada tipo (CR 701.10e)
    for (const [tipo, n] of Object.entries({ ...o.counters })) if (n > 0) addCounters(c.g, { kind: 'obj', id: r.id }, tipo, n, c.you);
  }
}, {
  targets: [{ ...t.permanent(is.yours, 'qualquer número de permanentes alvo que você controla'), min: 0, max: 99 }],
  text: 'Dobre o número de cada tipo de marcador em qualquer número de permanentes alvo que você controla.',
}));

export default defineCard({
  name: 'The Thing',
  faces: [{
    abilities: [
      keyword('trample'),
      noCombateSeConjurou(function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 4, c.you);
      }, { text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, coloque quatro marcadores +1/+1 em The Thing.' }),
      triggered(on.selfAttacks(), function* (c) {
        if (yield* mayPay(c, c.you, '{R}{G}{W}{U}', 'dobrar os marcadores de qualquer número de permanentes alvo que você controla')) reflexive(c, DOBRA.id!);
      }, { text: 'Sempre que The Thing ataca, você pode pagar {R}{G}{W}{U}. Quando fizer isso, dobre o número de cada tipo de marcador em qualquer número de permanentes alvo que você controla.' }),
    ],
  }],
  rulings: {},
});
