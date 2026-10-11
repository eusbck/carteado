// Bloodline Necromancer
// Lifelink
// When this creature enters, you may return target Vampire or Wizard creature card from your graveyard to the battlefield.
import { and, defineCard, etb, is, keyword, or, putOntoBattlefield, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodline Necromancer',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // "você pode": sem alvo escolhido, nada volta
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [upTo(1, t.card('graveyard', and(is.creature, or(is.subtype('Vampire'), is.subtype('Wizard'))), 'carta de criatura Vampire ou Wizard alvo no seu cemitério (opcional)'))],
        text: 'Quando esta criatura entra, você pode devolver a carta de criatura Vampire ou Wizard alvo do seu cemitério para o campo de batalha.',
      }),
    ],
  }],
  rulings: {},
});
