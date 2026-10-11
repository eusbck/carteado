// Haven of the Spirit Dragon
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a Dragon creature spell.
// {2}, {T}, Sacrifice this land: Return target Dragon creature card or Ugin planeswalker card from your graveyard to your hand.
import { activated, and, chars, defineCard, defineFn, is, isCreature, mana, or, returnToHand, t, tgt, type G } from '../../motor/api.ts';

// CR 106.6: mana com restrição de gasto — só para conjurar mágica de criatura Dragon
const SO_DRAGAO = 'Haven of the Spirit Dragon:magiaDeDragao';
defineFn(SO_DRAGAO, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && isCreature(g, purpose.obj) && chars(g, purpose.obj).subtypes.includes('Dragon'));

export default defineCard({
  name: 'Haven of the Spirit Dragon',
  faces: [{ abilities: [
    mana('C'),
    mana('any', { restriction: SO_DRAGAO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica de criatura Dragon.' }),
    activated('{2}, {T}, Sacrifice this land', function* (c) {
      const id = tgt(c);
      if (id !== null) yield* returnToHand(c.g, [id]);
    }, {
      targets: [t.card('graveyard', or(and(is.creature, is.subtype('Dragon')), and(is.planeswalker, is.subtype('Ugin'))), 'carta de criatura Dragon ou de planeswalker Ugin alvo no seu cemitério', 'you')],
      text: '{2}, {T}, Sacrifique este terreno: Devolva a carta de criatura Dragon ou de planeswalker Ugin alvo do seu cemitério para a sua mão.',
    }),
  ] }],
  rulings: {
    1: 'regra geral: CR 601.2f-h — o custo total da mágica (com custos adicionais e alternativos) é pago de uma vez com a finalidade "conjurar esta mágica", que é o que a restrição confere',
  },
});
