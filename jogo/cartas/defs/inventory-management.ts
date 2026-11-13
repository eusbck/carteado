// Inventory Management
// Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't
// mana abilities.)
// For each Aura and Equipment you control, you may attach it to a creature you control.
import { attach, chars, chooseItems, controlledBy, defineCard, enchantCandidates, isCreature, keyword, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Inventory Management',
  faces: [{
    // CR 702.61 (motor/equipar.ts segundoDivididoNaPilha): rulings 1-6
    abilities: [keyword('split second')],
    spell: {
      *effect(c) {
        const g = c.g;
        const anexos = controlledBy(g, c.you, (id) => chars(g, id).subtypes.some((t) => t === 'Aura' || t === 'Equipment'));
        for (const a of anexos) {
          const o = g.state.objects[a];
          if (!o || o.zone !== 'battlefield') continue;
          const ehAura = chars(g, a).subtypes.includes('Aura');
          // ruling 7: só criaturas a que ele pode ser anexado (CR 301.5c, 303.4)
          const auraOk = ehAura ? enchantCandidates(g, o.copyOf?.def ?? o.def, 0, c.you, [], a) : null;
          const cands = controlledBy(g, c.you, (id) => id !== a && isCreature(g, id) && id !== o.attachedTo && (!auraOk || auraOk.includes(id)));
          if (!cands.length) continue;
          const [esc] = yield* chooseItems(g, c.you, `Inventory Management: anexar ${nameOf(g, a)} a uma criatura sua?`, cands.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
          if (esc !== undefined) attach(g, a, Number(esc));
        }
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.61a — com ela na pilha, ninguém conjura mágicas nem ativa habilidades que não são de mana; habilidades de mana continuam',
    2: 'regra geral: CR 702.61b — ações especiais (desvirar uma criatura virada para baixo) continuam permitidas (motor/priority.ts)',
    3: 'regra geral: CR 702.61b — habilidades desencadeadas continuam disparando e indo para a pilha (motor/triggers.ts)',
    4: 'regra geral: CR 702.61a — o que já estava na pilha não muda (motor/equipar.ts)',
    5: 'regra geral: CR 702.61a — nem durante a resolução de uma habilidade se conjura uma mágica com ela na pilha (motor/stack.ts castInner)',
    6: 'teste: depois que ela resolve, os jogadores voltam a poder conjurar e ativar',
    7: 'teste: cada Aura e Equipamento seu pode ir para uma criatura sua; a Aura só para onde pode encantar',
  },
});
