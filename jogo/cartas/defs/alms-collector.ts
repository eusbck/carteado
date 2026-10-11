// Alms Collector
// Flash
// If an opponent would draw two or more cards, instead you and that player each draw a card.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Alms Collector',
  faces: [{
    abilities: [
      keyword('flash'),
      // rulings 1-3: substitui a instrução inteira de comprar duas ou mais (não compras de uma em uma) e não se aplica
      // de novo às compras que resultam dela (motor/actions.ts draw, CR 614.1a, 614.5)
      staticAbility({
        rules: { multiDrawInstead: (c, jogador, n) => n >= 2 && c.g.isOpponent(c.you, jogador) },
        text: 'Se um oponente fosse comprar duas ou mais cartas, em vez disso você e esse jogador compram uma carta cada.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.1a — a substituição vale para a instrução inteira de comprar, antes das compras individuais (motor/actions.ts draw)',
    2: 'regra geral: CR 614.5 — a substituição não se aplica de novo às compras que resultam dela (motor/actions.ts draw)',
    3: 'teste: comprar uma carta de cada vez não é substituído',
    4: 'regra geral: CR 121.1 — pôr cartas na mão sem "comprar" não é substituído (o gancho está só em draw)',
    5: 'teste: com um Alms Collector de cada lado, cada jogador que compraria duas acaba comprando duas',
    6: 'regra geral: CR 616.1 — com mais de um Alms Collector de oponentes, quem compraria escolhe qual se aplica (motor/actions.ts draw)',
  },
});
