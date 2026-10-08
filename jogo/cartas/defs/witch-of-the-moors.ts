// Witch of the Moors
// Deathtouch
// At the beginning of your end step, if you gained life this turn, each opponent sacrifices a creature of their choice
// and you return up to one target creature card from your graveyard to your hand.
import { defineCard, eachSacrifices, is, isCreature, keyword, moveObjects, on, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Witch of the Moors',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.endStep('you'), function* (c) {
        // ruling 3: escolhas em ordem, sacrifícios simultâneos
        yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id), 1, 'uma criatura');
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        // rulings 1, 4-5: verificado ao começar a etapa final; só uma vez
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        // ruling 2: alvo opcional; se escolhido e ilegal, nada acontece
        targets: [upTo(1, t.card('graveyard', is.creature, 'até uma carta de criatura alvo no seu cemitério'))],
        text: 'No início da sua etapa final, se você ganhou vida neste turno, cada oponente sacrifica uma criatura à escolha dele e você devolve até uma carta de criatura alvo do seu cemitério para a mão.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.4 — olha o turno inteiro, mesmo antes de ela entrar',
    2: 'regra geral: CR 608.2b — alvo escolhido e ilegal, nada acontece',
    3: 'teste: cada oponente sacrifica uma criatura',
    4: 'teste: sem vida ganha, não dispara',
    5: 'regra geral: dispara uma vez só',
  },
});
