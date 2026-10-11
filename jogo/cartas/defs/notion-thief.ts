// Notion Thief
// Flash
// If an opponent would draw a card except the first one they draw in each of their draw steps, instead that player skips
// that draw and you draw a card.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Notion Thief',
  faces: [{
    abilities: [
      keyword('flash'),
      // o motor poupa a primeira compra da etapa de compra de cada jogador (motor/actions.ts draw; CR 614.1a)
      staticAbility({
        rules: { drawInstead: (c, jogador) => c.g.isOpponent(c.you, jogador) },
        text: 'Se um oponente fosse comprar uma carta que não a primeira que ele compra em cada etapa de compra dele, em vez disso esse jogador pula essa compra e você compra uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.1a — só a compra é substituída; o resto da instrução (descartar, por exemplo) continua valendo para o oponente',
    2: 'regra geral: CR 616.1, 614.5 — com Notion Thieves de vários jogadores, quem compraria escolhe qual se aplica, e cada um só se aplica uma vez (motor/actions.ts draw)',
    3: 'teste: com um Notion Thief de cada lado, quem compraria é quem compra',
  },
});
