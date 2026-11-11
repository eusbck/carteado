// Slaughter Pact
// Destroy target nonblack creature.
// At the beginning of your next upkeep, pay {2}{B}. If you don't, you lose the game.
import { defineCard, delayed, destroy, is, not, t, tgt } from '../../motor/api.ts';
import { pactoNaManutencao } from '../cedh.ts';

const MANUTENCAO = pactoNaManutencao('Slaughter Pact', '{2}{B}');

export default defineCard({
  name: 'Slaughter Pact',
  faces: [{
    spell: {
      targets: [t.creature(not(is.color('B')), 'criatura alvo que não seja preta')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        // ruling 2: o gatilho atrasado nasce mesmo que a criatura não seja destruída
        delayed(c, MANUTENCAO);
      },
    },
  }],
  rulings: {
    1: 'teste: com o alvo ilegal na resolução, a mágica não resolve e não há gatilho',
    2: 'teste: destrói a criatura que não é preta e, na sua próxima manutenção, quem não paga {2}{B} perde o jogo',
    3: 'regra geral: CR 204 — o indicador de cor é impresso e vale como cor (motor/oracle.ts)',
  },
});
