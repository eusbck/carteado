// It's Clobberin' Time!
// Choose one —
// • Target creature you control deals damage equal to its power to target creature an opponent controls.
// • Destroy target artifact or enchantment.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { dealDamage, defineCard, destroy, is, modal, or, power, rebound, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "It's Clobberin' Time!",
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      modes: modal(1, 1, [
        {
          text: 'A criatura alvo que você controla causa dano igual à força dela à criatura alvo que um oponente controla',
          targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(is.opponents, 'criatura alvo que um oponente controla')],
          *effect(c) {
            const minha = tgt(c, 0);
            const dele = tgt(c, 1);
            // CR 608.2b: se um dos alvos ficou ilegal, não há dano
            if (minha === null || dele === null) return;
            const n = power(c.g, minha);
            if (n > 0) dealDamage(c.g, [{ source: minha, target: { kind: 'obj', id: dele }, amount: n, combat: false }]);
          },
        },
        {
          text: 'Destrua o artefato ou encantamento alvo',
          targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});
