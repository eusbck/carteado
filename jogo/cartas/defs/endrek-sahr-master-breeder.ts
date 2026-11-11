// Endrek Sahr, Master Breeder
// Whenever you cast a creature spell, create X 1/1 black Thrull creature tokens, where X is that spell's mana value.
// When you control seven or more Thrulls, sacrifice Endrek Sahr.
import { controlledBy, createTokens, defineCard, is, isSubtype, manaValue, on, sacrifice, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Endrek Sahr, Master Breeder',
  faces: [{
    abilities: [
      triggered(on.youCast(is.creature), function* (c) {
        const s = c.g.state;
        const magica = c.event.spell as ObjId;
        // ruling 1: o valor de mana da mágica na pilha (com X)
        const x = s.objects[magica] ? manaValue(c.g, magica) : 0;
        if (x > 0) yield* createTokens(c.g, c.you, 'Thrull', x);
      }, { text: 'Sempre que você conjura uma mágica de criatura, crie X fichas de criatura Thrull pretas 1/1, onde X é o valor de mana dessa mágica.' }),
      // CR 603.8: habilidade de estado desencadeada
      staticAbility({
        rules: {
          // simplificação: sacrifica na conferência, sem usar a pilha
          stateAction: function* (c) {
            if (c.g.state.objects[c.source]?.zone !== 'battlefield') return false;
            if (controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Thrull')).length < 7) return false;
            yield* sacrifice(c.g, [c.source]);
            return true;
          },
        },
        text: 'Quando você controlar sete ou mais Thrulls, sacrifique Endrek Sahr.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — X conta no valor de mana na pilha',
    2: 'regra geral: CR 603.8 — confere a condição sempre que um jogador receberia prioridade',
    3: 'regra geral: CR 603.3 — as fichas são criadas antes de a mágica resolver',
  },
});
