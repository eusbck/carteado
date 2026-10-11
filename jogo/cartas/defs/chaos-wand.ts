// Chaos Wand
// {4}, {T}: Target opponent exiles cards from the top of their library until they exile an instant or sorcery card. You
// may cast that card without paying its mana cost. Then put the exiled cards that weren't cast this way on the bottom of
// that library in a random order.
import { activated, defineCard, t, tgtPlayer } from '../../motor/api.ts';
import { exilaAteMagica } from '../esquisitos.ts';

export default defineCard({
  name: 'Chaos Wand',
  faces: [{
    abilities: [
      activated('{4}, {T}', function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* exilaAteMagica(c, p, 'Chaos Wand');
      }, { targets: [t.opponent()], text: '{4}, {T}: O oponente alvo exila cartas do topo do grimório dele até exilar uma carta instantânea ou de feitiço. Você pode conjurar essa carta sem pagar o custo de mana. Depois coloque as cartas exiladas que não foram conjuradas assim no fundo desse grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: o oponente para na primeira instantânea ou feitiço exilada (cartas/esquisitos.ts exilaAteMagica)',
    2: 'teste: sem instantânea nem feitiço no grimório, todas as cartas exiladas voltam para ele',
    3: 'regra geral: sem conjurar, a carta vai para o fundo com as outras (cartas/esquisitos.ts exilaAteMagica)',
    4: 'regra geral: CR 608.2g — conjurada durante a resolução, sem as permissões de tempo do tipo (motor/mecanicas.ts mayCastFree)',
    5: 'regra geral: CR 118.9 — sem pagar o custo de mana não se combinam custos alternativos; os adicionais continuam (motor/stack.ts)',
    6: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
  },
});
