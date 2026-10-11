// Magmaquake
// Magmaquake deals X damage to each creature without flying and each planeswalker.
import { dealDamage, defineCard, hasKw, isCreature, isType, permanentsMatching } from '../../motor/api.ts';

export default defineCard({
  name: 'Magmaquake',
  faces: [{
    spell: {
      *effect(c) {
        if (c.x <= 0) return;
        // ruling 1: não mira — atinge também criaturas com resistência a magia (hexproof); CR 120.4: tudo ao mesmo tempo
        const atingidos = permanentsMatching(c.g, (id) => (isCreature(c.g, id) && !hasKw(c.g, id, 'flying')) || isType(c.g, id, 'Planeswalker'));
        dealDamage(c.g, atingidos.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: c.x, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'teste: não mira: causa dano a uma criatura com resistência a magia (hexproof)',
  },
});
