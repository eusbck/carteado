// Spit Flame
// Spit Flame deals 4 damage to target creature.
// Whenever a Dragon you control enters, you may pay {R}. If you do, return this card from your graveyard to your hand.
import { and, dealDamage, defineCard, is, mayPay, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Spit Flame',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 4, combat: false }]);
      },
    },
    abilities: [
      // CR 113.6: a habilidade diz de onde funciona; só dispara com a carta no cemitério
      triggered(on.enters(and(is.yours, is.subtype('Dragon'))), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (!(yield* mayPay(c, c.you, '{R}', 'devolver Spit Flame do cemitério para a mão'))) return;
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: c.source, to: 'hand' }], 'effect');
      }, { zones: ['graveyard'], text: 'Sempre que um Dragon que você controla entra, você pode pagar {R}. Se fizer isso, devolva esta carta do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {},
});
