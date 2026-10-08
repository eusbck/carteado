// Darksteel Angel
// Flying, indestructible
// You can't lose the game and your opponents can't win the game.
// Creatures you control can't have -1/-1 counters put on them.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Darksteel Angel',
  faces: [{
    abilities: [
      ...keywords('flying', 'indestructible'),
      // CR 104.3: nenhuma ação de estado nem efeito faz você perder (ruling 3); conceder continua valendo (CR 104.3a,
      // ruling 1). "Seus oponentes não podem vencer": no motor só se vence quando todos os oponentes saíram (CR 104.2a),
      // o que não acontece enquanto você estiver na partida com esta criatura — e a 104.2a passa por cima de efeitos assim.
      staticAbility({
        rules: { cantLoseGame: (c, p) => p === c.you },
        text: 'Você não pode perder o jogo e seus oponentes não podem vencer o jogo.',
      }),
      // CR 122: vale para marcadores postos por efeitos, por murchar/infectar e para criaturas que entrariam com eles
      staticAbility({
        rules: { cantHaveCountersPut: (c, kind, alvo) => kind === '-1/-1' && alvo.controller === c.you && alvo.chars.types.includes('Creature') },
        text: 'As criaturas que você controla não podem receber marcadores -1/-1.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conceder ainda tira você da partida com Darksteel Angel no campo',
    2: 'não se aplica: não há partidas de Dois Gigantes',
    3: 'teste: vida 0, compra de grimório vazio, dez venenos e 21 de dano de comandante não fazem você perder',
    4: 'não se aplica: nenhuma carta dos decks declara empate; o empate por limite de turnos das partidas de bots continua valendo',
  },
});
