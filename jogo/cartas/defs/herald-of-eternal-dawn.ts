// Herald of Eternal Dawn
// Flash (You may cast this spell any time you could cast an instant.)
// Flying
// You can't lose the game and your opponents can't win the game.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Herald of Eternal Dawn',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      // CR 104.3: nenhuma ação de estado nem efeito faz você perder (ruling 3); conceder continua valendo (CR 104.3a,
      // ruling 4). CR 104.2b: um efeito que faria um oponente vencer não faz nada; a 104.2a (todos os oponentes saíram)
      // passa por cima disso
      staticAbility({
        rules: { cantLoseGame: (c, p) => p === c.you, cantWinGame: (c, p) => c.g.isOpponent(c.you, p) },
        text: 'Você não pode perder o jogo e seus oponentes não podem vencer o jogo.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 119.4 — não se paga mais vida do que se tem (motor/costs.ts)',
    2: 'não se aplica: não há partidas de Dois Gigantes',
    3: 'teste: com 0 de vida você não perde, e um efeito que faria o oponente vencer não faz nada',
    4: 'teste: conceder ainda tira você da partida',
  },
});
