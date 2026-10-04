// Feed the Swarm
// Destroy target creature or enchantment an opponent controls. You lose life equal to that permanent's mana value.
import { and, defineCard, destroy, is, lkiChars, loseLife, manaValue, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Feed the Swarm',
  faces: [{
    spell: {
      targets: [t.permanent(and(or(is.creature, is.enchantment), is.opponents), 'criatura ou encantamento alvo que um oponente controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const mv = manaValue(c.g, id);
        yield* destroy(c.g, [id]);
        // ruling 3: o valor de mana como o permanente existia por último no campo
        loseLife(c.g, c.you, lkiChars(c.g, id)?.manaValue ?? mv, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — X vale 0 no campo',
    2: 'teste: alvo indestrutível não é destruído, mas você perde a vida',
    3: 'teste: perde vida igual ao valor de mana do permanente',
  },
});
