// Krosan Grip
// Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't
// mana abilities.)
// Destroy target artifact or enchantment.
import { defineCard, destroy, is, keyword, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Krosan Grip',
  faces: [{
    // CR 702.61 (motor/controle-base.ts)
    abilities: [keyword('split second')],
    spell: {
      targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'teste: com ela na pilha, o oponente não pode conjurar mágicas',
    2: 'regra geral: CR 702.61b — ações especiais (desvirar uma criatura virada para baixo) continuam permitidas (motor/priority.ts)',
    3: 'regra geral: CR 702.61b — habilidades desencadeadas continuam disparando e indo para a pilha (motor/triggers.ts)',
    4: 'regra geral: CR 702.61a — o que já estava na pilha não muda (motor/equipar.ts)',
    5: 'regra geral: CR 702.61a — nem durante a resolução de uma habilidade se conjura uma mágica com ela na pilha (motor/stack.ts castInner)',
    6: 'regra geral: CR 702.61a — depois que ela sai da pilha, todos voltam a conjurar (testes/regras-controle.test.ts)',
  },
});
