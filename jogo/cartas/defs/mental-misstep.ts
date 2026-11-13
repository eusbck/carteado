// Mental Misstep
// ({U/P} can be paid with either {U} or 2 life.)
// Counter target spell with mana value 1.
import { counter, defineCard, manaValue, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mental Misstep',
  faces: [{
    spell: {
      targets: [t.spell((c, id) => manaValue(c.g, id) === 1, 'mágica alvo com valor de mana 1')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.4f, 202.2 — a carta é de cada cor do custo, como quer que se pague (motor/mana.ts)',
    2: 'regra geral: CR 202.3f — cada símbolo phyrexiano conta 1 no valor de mana (motor/mana.ts)',
    3: 'regra geral: CR 601.2f — a forma de pagar a mana phyrexiana é escolhida ao pagar (motor/costs.ts)',
    4: 'regra geral: CR 119.4 — com 1 de vida ou menos não dá para pagar 2 de vida (motor/costs.ts)',
    5: 'regra geral: CR 107.4f — mana phyrexiana não é cor nova',
    6: 'teste: só mira mágicas com valor de mana 1; X conta pelo valor escolhido na pilha',
    7: 'teste: paga {U/P} com 2 de vida e anula a mágica de valor 1',
  },
});
