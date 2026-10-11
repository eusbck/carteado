// Skyhunter Strike Force
// Flying
// Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)
// Lieutenant — As long as you control your commander, other creatures you control have melee.
import { and, anthem, controlledBy, defineCard, is, keyword, melee, MELEE } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

void MELEE; // garante o registro do corpo a corpo concedido antes das cartas

const controlaComandante = (c: SCtx): boolean => controlledBy(c.g, c.you, (id) => {
  const o = c.g.state.objects[id];
  return o.owner === c.you && o.card !== null && !!c.g.state.cards[o.card]?.isCommander;
}).length > 0;

export default defineCard({
  name: 'Skyhunter Strike Force',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 702.121a; rulings 1-4: conta os oponentes atacados com criaturas declaradas, na resolução (motor/criaturas.ts)
      melee(),
      {
        ...anthem(and(is.creature, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'melee' }], 'Tenente — Enquanto você controlar o seu comandante, as outras criaturas que você controla têm corpo a corpo.'),
        condition: controlaComandante,
      },
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.121a — o bônus conta os oponentes atacados, na resolução (motor/criaturas.ts gatilhoCorpoACorpo)',
    2: 'teste: corpo a corpo: +1/+1 por oponente atacado; com o seu comandante no campo, as outras criaturas também têm',
    3: 'regra geral: CR 702.121a — atacar um planeswalker dispara, mas só jogadores atacados contam (motor/criaturas.ts)',
    4: 'regra geral: CR 506.3 — criaturas que entram atacando não foram declaradas e não contam',
  },
});
