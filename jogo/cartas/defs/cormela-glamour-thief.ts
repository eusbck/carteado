// Cormela, Glamour Thief
// Haste
// {1}, {T}: Add {U}{B}{R}. Spend this mana only to cast instant and/or sorcery spells.
// When Cormela dies, return up to one target instant or sorcery card from your graveyard to your hand.
import { defineCard, defineFn, is, isType, keyword, mana, on, returnToHand, t, tgt, triggered, upTo, type G } from '../../motor/api.ts';

// CR 106.6: mana com restrição de gasto — só para conjurar mágicas instantâneas ou feitiços
const SO_MAGICAS = 'Cormela, Glamour Thief:instantaneasEFeiticos';
defineFn(SO_MAGICAS, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && (isType(g, purpose.obj, 'Instant') || isType(g, purpose.obj, 'Sorcery')));

export default defineCard({
  name: 'Cormela, Glamour Thief',
  faces: [{
    abilities: [
      keyword('haste'),
      mana('UBR', { cost: '{1}, {T}', restriction: SO_MAGICAS, text: '{1}, {T}: Adicione {U}{B}{R}. Gaste essa mana só para conjurar mágicas instantâneas e/ou feitiços.' }),
      triggered(on.selfDies(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, {
        targets: [upTo(1, t.card('graveyard', is.instantOrSorcery, 'até uma carta de instantânea ou feitiço alvo no seu cemitério', 'you'))],
        text: 'Quando Cormela morre, devolva até uma carta de instantânea ou feitiço alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {},
});
