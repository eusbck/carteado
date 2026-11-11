// Apprentice Necromancer
// {B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield. That creature
// gains haste. At the beginning of the next end step, sacrifice it.
import { activated, chars, defineCard, delayed, putOntoBattlefield, t, tgt, withDuration } from '../../motor/api.ts';
import { SACRIFICA_NO_FIM } from '../cedh.ts';

export default defineCard({
  name: 'Apprentice Necromancer',
  faces: [{
    abilities: [activated('{B}, {T}, Sacrifice this creature', function* (c) {
      const id = tgt(c);
      if (id === null) return;
      const [novo] = yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      if (novo === undefined) return;
      withDuration(c, [novo], [{ k: 'addKeyword', kw: 'haste' }], { kind: 'whileOnBattlefield', obj: novo });
      delayed(c, SACRIFICA_NO_FIM, { data: { obj: novo } });
    }, {
      targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature'), 'carta de criatura alvo no seu cemitério')],
      text: '{B}, {T}, Sacrifique esta criatura: Devolva a carta de criatura alvo do seu cemitério ao campo. Ela ganha ímpeto. No início da próxima etapa final, sacrifique-a.',
    })],
  }],
  rulings: { 1: 'regra geral: CR 602.2b, 601.2c — os alvos são escolhidos antes de pagar o custo: ela não mira a si mesma (motor/stack.ts)' },
});
