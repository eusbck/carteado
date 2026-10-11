// Reconnaissance
// {0}: Remove target attacking creature you control from combat and untap it. (If you activate during end of combat, the
// creature will untap after it deals combat damage.)
import { activated, and, defineCard, is, isAttacking, t, tgt, untap } from '../../motor/api.ts';
import { removeFromCombat } from '../../motor/actions.ts';

export default defineCard({
  name: 'Reconnaissance',
  faces: [{
    abilities: [
      // ruling 1: o que já disparou na declaração de atacantes ou bloqueadores não é desfeito
      activated('{0}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        removeFromCombat(c.g, id);
        untap(c.g, id);
      }, { targets: [t.creature(and(is.yours, (c, id) => isAttacking(c.g, id)), 'criatura atacante alvo que você controla')], text: '{0}: Remova do combate a criatura atacante alvo que você controla e desvire-a.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 506.4 — sair do combate não desfaz o que já disparou na declaração de atacantes ou bloqueadores',
  },
});
