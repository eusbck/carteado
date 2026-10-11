// Impact Tremors
// Whenever a creature you control enters, this enchantment deals 1 damage to each opponent.
import { and, dealDamage, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Impact Tremors',
  faces: [{
    abilities: [
      // ruling 1: um gatilho para cada criatura que entra, inclusive as que entram junto com Impact Tremors (CR 603.6a)
      triggered(on.enters(and(is.creature, is.yours)), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
      }, { text: 'Sempre que uma criatura que você controla entra, este encantamento causa 1 de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'teste: duas criaturas entrando juntas causam 1 de dano a cada oponente duas vezes',
  },
});
