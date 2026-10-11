// Forbidden Alchemy
// Look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard.
// Flashback {6}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { chooseItems, defineCard, flashback, moveObjects, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Forbidden Alchemy',
  faces: [{
    altCosts: [flashback('{6}{B}')],
    spell: {
      *effect(c) {
        const s = c.g.state;
        // ruling 7: com menos de quatro cartas, olha todas
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        const [esc] = topo.length === 1 ? [String(topo[0])] : yield* chooseItems(c.g, c.you, 'Forbidden Alchemy: escolha a carta que vai para a sua mão (o resto vai para o cemitério)', topo.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'hand' }], 'effect');
        const resto = topo.filter((id) => id !== Number(esc) && s.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — o custo de retrospectiva é o custo alternativo; aumentos e reduções se aplicam a ele (motor/stack.ts totalSpellCost)',
    2: 'regra geral: CR 702.34a — custo alternativo e exílio ao sair da pilha (motor/dsl.ts flashback, motor/actions.ts exileOnLeave)',
    3: 'regra geral: CR 702.34a — segue as permissões de tempo do tipo da carta (motor/priority.ts)',
    4: 'regra geral: CR 702.34a — a permissão vale assim que a carta está no cemitério (motor/priority.ts)',
    5: 'teste: conjurada pela retrospectiva, é exilada',
    6: 'regra geral: CR 702.34a — a retrospectiva vale para a carta no cemitério, tenha ela sido conjurada antes ou não',
    7: 'teste: com menos de quatro cartas no grimório, olha todas',
  },
});
