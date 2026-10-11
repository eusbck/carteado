// Time Stop
// End the turn. (Exile all spells and abilities, including this spell. The player whose turn it is discards down to
// their maximum hand size. Damage heals and "this turn" and "until end of turn" effects end.)
import { defineCard, endTheTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Time Stop',
  faces: [{
    spell: {
      // CR 724.1: tudo na pilha é exilado (anulável ou não), o combate acaba e o jogo vai direto para a limpeza
      *effect(c) { yield* endTheTurn(c.g); },
    },
  }],
  rulings: {
    1: 'teste: CR 724.1: exila tudo na pilha, inclusive Time Stop, tira as criaturas do combate e vai direto para a limpeza',
    2: 'regra geral: CR 724.1f — o que disparar durante o processo vai para a pilha na limpeza (motor/turn.ts runStep)',
    3: 'teste: CR 724.1: exila tudo na pilha, inclusive Time Stop, tira as criaturas do combate e vai direto para a limpeza',
    4: 'teste: CR 724.1e: os gatilhos de "no início da etapa final" não disparam no turno encerrado',
  },
});
