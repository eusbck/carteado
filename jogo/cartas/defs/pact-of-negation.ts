// Pact of Negation
// Counter target spell.
// At the beginning of your next upkeep, pay {3}{U}{U}. If you don't, you lose the game.
import { counter, defineCard, delayed, t, tgt } from '../../motor/api.ts';
import { pactoNaManutencao } from '../cedh.ts';

const MANUTENCAO = pactoNaManutencao('Pact of Negation', '{3}{U}{U}');

export default defineCard({
  name: 'Pact of Negation',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* counter(c.g, id);
        // ruling 2: o gatilho atrasado nasce mesmo que a mágica não possa ser anulada
        delayed(c, MANUTENCAO);
      },
    },
  }],
  rulings: {
    1: 'teste: se a Pact não resolve (alvo ilegal), não há gatilho na manutenção',
    2: 'teste: na sua próxima manutenção, quem não paga {3}{U}{U} perde o jogo',
    3: 'regra geral: CR 204 — o indicador de cor é impresso e vale como cor (motor/oracle.ts)',
  },
});
