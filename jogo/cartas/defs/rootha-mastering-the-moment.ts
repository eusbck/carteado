// Rootha, Mastering the Moment
// At the beginning of combat on your turn, if you've cast an instant or sorcery spell this turn, create an X/X blue and
// red Elemental creature token with flying and haste, where X is the greatest mana value among instant and sorcery
// spells you've cast this turn.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Rootha, Mastering the Moment',
  faces: [{
    abilities: [triggered(on.beginCombat('you'), function* (c) {
      // rulings 1, 3: valor de mana (com o X escolhido)
      const x = c.g.state.turnStats[c.you].greatestInstantSorceryMV;
      yield* createTokens(c.g, c.you, { copyOf: { def: 'Elemental X/X', face: 0, except: { power: x, toughness: x } } }, 1);
    }, {
      // ruling 2: verificado ao começar o combate (CR 603.4)
      condition: (c) => c.g.state.turnStats[c.you].instantSorceryCast > 0,
      text: 'No início do combate no seu turno, se você conjurou uma mágica instantânea ou de feitiço neste turno, crie uma ficha de criatura Elemental azul e vermelha X/X com voar e ímpeto, onde X é o maior valor de mana entre essas mágicas.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — custos alternativos e reduções não mudam o valor de mana',
    2: 'teste: sem mágica no turno, não dispara',
    3: 'regra geral: CR 202.3e — na pilha, X usa o valor escolhido',
  },
});
