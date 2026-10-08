// Phoenix Down
// {1}{W}, {T}, Exile this artifact: Choose one —
// • Return target creature card with mana value 4 or less from your graveyard to the battlefield tapped.
// • Exile target Skeleton, Spirit, or Zombie.
import { activated, and, defineCard, exile, is, modal, or, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Phoenix Down',
  faces: [{
    abilities: [activated('{1}{W}, {T}, Exile this artifact', function* () { /* modos */ }, {
      modes: modal(1, 1, [
        {
          text: 'Devolva a carta de criatura alvo com valor de mana 4 ou menos do seu cemitério ao campo virada',
          targets: [t.card('graveyard', and(is.creature, is.mvAtMost(4)), 'carta de criatura alvo com valor de mana 4 ou menos')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you, tapped: true }], 'effect'); },
        },
        {
          text: 'Exile o Skeleton, Spirit ou Zombie alvo',
          targets: [t.permanent(or(is.subtype('Skeleton'), is.subtype('Spirit'), is.subtype('Zombie')), 'Skeleton, Spirit ou Zombie alvo')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); },
        },
      ]),
      text: '{1}{W}, {T}, Exile este artefato: Escolha um — devolva a carta de criatura alvo com valor de mana 4 ou menos do seu cemitério ao campo virada; ou exile o Skeleton, Spirit ou Zombie alvo.',
    })],
  }],
  rulings: { 1: 'regra geral: CR 202.3e — X vale 0 no cemitério' },
});
