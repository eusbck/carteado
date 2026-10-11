// Dazzling Sphinx
// Flying
// Whenever this creature deals combat damage to a player, that player exiles cards from the top of their library until
// they exile an instant or sorcery card. You may cast that card without paying its mana cost. Then that player puts the
// exiled cards that weren't cast this way on the bottom of their library in a random order.
import { defineCard, keyword, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { exilaAteMagica } from '../esquisitos.ts';

export default defineCard({
  name: 'Dazzling Sphinx',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-3: conjurada agora, na resolução, com X = 0; recusando, vai para o fundo com as outras
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* exilaAteMagica(c, c.event.player as PlayerId, 'Dazzling Sphinx'); }, {
        text: 'Sempre que esta criatura causa dano de combate a um jogador, esse jogador exila cartas do topo do grimório dele até exilar uma carta instantânea ou de feitiço. Você pode conjurar essa carta sem pagar o custo de mana. Depois esse jogador coloca as cartas exiladas que não foram conjuradas assim no fundo do grimório dele em ordem aleatória.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2g — conjurada durante a resolução (motor/mecanicas.ts mayCastFree)',
    2: 'teste: recusando, a carta vai para o fundo do grimório com as outras',
    3: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
  },
});
