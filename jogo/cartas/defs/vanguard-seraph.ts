// Vanguard Seraph
// Flying
// Whenever you gain life for the first time each turn, surveil 1. (Look at the top card of your library. You may put it
// into your graveyard.)
import { defineCard, keyword, lookAndArrange, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vanguard Seraph',
  faces: [{
    abilities: [
      keyword('flying'),
      // a contagem do turno já inclui este ganho: é o primeiro se o total do turno é exatamente ele (ruling 2: ganhos de
      // antes de ela estar no campo também contam)
      triggered(on.custom((e, c) => e.type === 'lifeGain' && e.player === c.you && e.amount > 0 && c.g.state.turnStats[c.you].lifeGained === e.amount), function* (c) {
        yield* lookAndArrange(c.g, c.you, 1, 'surveil');
      }, { text: 'Sempre que você ganha vida pela primeira vez em cada turno, vigie 1.' }),
    ],
  }],
  rulings: {
    1: 'teste: só o primeiro ganho de vida do turno, de qualquer tamanho',
    2: 'teste: se você já ganhou vida no turno antes de ela entrar, não dispara nesse turno',
  },
});
