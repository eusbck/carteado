// Krosan Grip — Split second. Destroy target artifact or enchantment.
import { defineCard, destroy, is, keyword, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Krosan Grip',
  faces: [{
    abilities: [keyword('split second')],
    spell: {
      targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.61a — com a mágica na pilha, ninguém conjura nem ativa nada além de habilidades de mana',
    2: 'regra geral: CR 702.61b — habilidades desencadeadas ainda disparam e resolvem',
    3: 'regra geral: CR 702.61b — ações especiais como virar uma face para cima continuam permitidas',
    4: 'regra geral: CR 702.61a — depois que ela resolve, todos voltam a poder responder',
    5: 'regra geral: CR 702.12b — indestrutível não é destruído',
    6: 'regra geral: CR 608.2b — com o alvo ilegal, não resolve',
  },
});
