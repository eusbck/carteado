// Arcane Lighthouse
// {T}: Add {C}.
// {1}, {T}: Until end of turn, creatures your opponents control lose hexproof and shroud and can't have hexproof or
// shroud.
import { activated, allCreatures, controllerOf, defineAbility, defineCard, mana, ruleEffect, staticAbility } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// efeito de regra: os objetos afetados perdem resistência a magia e manto (e não podem ganhá-los)
const PERDE = defineAbility('Arcane Lighthouse:perde', staticAbility({
  rules: { loseHexproof: (c, obj) => !!((c as unknown as { effect?: { affected?: ObjId[] } }).effect?.affected?.includes(obj)) },
}));

export default defineCard({
  name: 'Arcane Lighthouse',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{1}, {T}', function* (c) {
        // ruling 3: só as criaturas dos oponentes no momento da resolução
        const alvo = allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id)));
        ruleEffect(c, PERDE.id!, { kind: 'endOfTurn' }, { objs: alvo });
      }, { text: '{1}, {T}: Até o fim do turno, as criaturas que seus oponentes controlam perdem resistência a magia e manto e não podem tê-los.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: o efeito de regra vence as estáticas enquanto dura (CR 613, hooks loseHexproof)',
    2: 'regra geral: loseHexproof vale para qualquer resistência a magia dada depois',
    3: 'teste: só afeta as criaturas dos oponentes na resolução',
  },
});
