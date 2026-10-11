// Chandra's Ignition
// Target creature you control deals damage equal to its power to each other creature and each opponent.
import { allCreatures, dealDamage, defineCard, is, power, t, tgt } from '../../motor/api.ts';
import type { TargetRef } from '../../motor/types.ts';

export default defineCard({
  name: "Chandra's Ignition",
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        // ruling 3: com o alvo ilegal, a mágica não resolve (CR 608.2b — o motor não chama o efeito)
        const fonte = tgt(c);
        if (fonte === null) return;
        // ruling 2 / CR 608.2h: a força é vista na resolução
        const n = power(c.g, fonte);
        if (n <= 0) return;
        // ruling 1: a criatura é a fonte do dano; CR 120.4: todo o dano ao mesmo tempo
        const alvos: TargetRef[] = [
          ...allCreatures(c.g).filter((id) => id !== fonte).map((id) => ({ kind: 'obj' as const, id })),
          ...c.g.opponents(c.you).map((p) => ({ kind: 'player' as const, id: p })),
        ];
        dealDamage(c.g, alvos.map((target) => ({ source: fonte, target, amount: n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'teste: a criatura é a fonte do dano (vínculo com a vida dela conta)',
    2: 'teste: CR 608.2h: usa a força na resolução',
    3: 'teste: com o alvo ilegal na resolução, nada acontece',
  },
});
