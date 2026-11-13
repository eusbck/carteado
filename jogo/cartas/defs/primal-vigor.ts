// Primal Vigor
// If one or more tokens would be created, twice that many of those tokens are created instead.
// If one or more +1/+1 counters would be put on a creature, twice that many +1/+1 counters are put on that creature
// instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Primal Vigor',
  faces: [{
    abilities: [
      // CR 614.1a: vale para qualquer jogador (ruling 2); o resto do pedido acompanha as fichas novas (ruling 1)
      staticAbility({
        rules: {
          tokenCreation: () => ({
            label: 'Primal Vigor: o dobro das fichas',
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((x) => ({ ...x }))] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas, o dobro dessas fichas é criado em vez disso.',
      }),
      // ruling 3: vale também para quem entra com marcadores (motor/actions.ts countersAfterReplacements)
      staticAbility({
        rules: { countersDouble: (_c, tipo, perm) => tipo === '+1/+1' && perm.chars.types.includes('Creature') },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados numa criatura, o dobro desses marcadores é colocado nela em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.1a — as fichas a mais acompanham o que o efeito manda (viradas, atacando) (motor/actions.ts createTokens)',
    2: 'teste: dobra as fichas e os marcadores +1/+1 de qualquer jogador',
    3: 'regra geral: CR 614.1c — entrar com marcadores também é dobrado (motor/actions.ts countersAfterReplacements)',
    4: 'teste: com duas Primal Vigor, quatro vezes',
  },
});
