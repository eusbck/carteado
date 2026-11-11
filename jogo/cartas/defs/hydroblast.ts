// Hydroblast
// Choose one —
// • Counter target spell if it's red.
// • Destroy target permanent if it's red.
import { chars, counter, defineCard, destroy, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Hydroblast',
  faces: [{
    spell: {
      // ruling 1: mira qualquer mágica ou permanente; a cor só é vista na resolução. Ruling 2: o modo é escolhido ao
      // conjurar (CR 601.2b) e não muda depois
      modes: modal(1, 1, [
        {
          text: 'Anule a mágica alvo, se ela for vermelha',
          targets: [t.spell(undefined, 'mágica alvo')],
          *effect(c) { const id = tgt(c); if (id !== null && chars(c.g, id).colors.includes('R')) yield* counter(c.g, id); },
        },
        {
          text: 'Destrua o permanente alvo, se ele for vermelho',
          targets: [t.permanent(undefined, 'permanente alvo')],
          *effect(c) { const id = tgt(c); if (id !== null && chars(c.g, id).colors.includes('R')) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: mira uma mágica que não é vermelha e não faz nada com ela',
    2: 'regra geral: CR 601.2b, 115.7 — o modo fica escolhido; mudar o alvo não muda o modo (motor/stack.ts changeTargets)',
  },
});
