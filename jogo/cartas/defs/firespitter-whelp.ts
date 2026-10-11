// Firespitter Whelp
// Flying
// Whenever you cast a noncreature or Dragon spell, this creature deals 1 damage to each opponent.
import { chars, dealDamage, defineCard, isCreature, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Firespitter Whelp',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1 (CR 603.3): o gatilho vai para a pilha acima da mágica e resolve antes dela
      triggered(on.youCast((c, id) => !isCreature(c.g, id) || chars(c.g, id).subtypes.includes('Dragon')), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura ou uma mágica de Dragon, esta criatura causa 1 de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica que o disparou, mesmo que ela seja anulada',
  },
});
