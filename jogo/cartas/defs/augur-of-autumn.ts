// Augur of Autumn
// You may look at the top card of your library any time.
// You may play lands from the top of your library.
// Coven — As long as you control three or more creatures with different powers, you may cast creature spells from the
// top of your library.
import { creaturesOf, defineCard, isCreature, isLand, power, staticAbility } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

/** Coven: três ou mais criaturas com forças diferentes (rulings 4-5) */
function coven(g: G, p: PlayerId): boolean {
  return new Set(creaturesOf(g, p).map((id) => power(g, id))).size >= 3;
}

export default defineCard({
  name: 'Augur of Autumn',
  faces: [{
    abilities: [
      // rulings 3 e 6: olhar o topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // rulings 1, 7-9: só jogar o terreno ou conjurar a criatura; o tempo e os custos continuam os normais
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
            if (isLand(c.g, carta)) return { key: `augur:${c.source}`, label: 'jogar do topo do grimório', land: true };
            if (isCreature(c.g, carta) && coven(c.g, c.you)) return { key: `augur-coven:${c.source}`, label: 'conjurar do topo do grimório' };
            return null;
          },
        },
        text: 'Você pode jogar terrenos do topo do seu grimório. Coven — Enquanto você controlar três ou mais criaturas com forças diferentes, você pode conjurar mágicas de criatura do topo do seu grimório.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: joga um terreno do topo do grimório como a jogada do turno',
    2: 'não se aplica: o Coven da Augur of Autumn é estático, sem cláusula "se"',
    3: 'regra geral: CR 401.5 — olhar o topo do grimório não usa a pilha nem precisa de prioridade (motor/view.ts lookAtTopOfLibrary)',
    4: 'teste: com três criaturas de forças diferentes, conjura a criatura do topo; com duas forças iguais, não',
    5: 'teste: com três criaturas de forças diferentes, conjura a criatura do topo; com duas forças iguais, não',
    6: 'regra geral: CR 401.5 — o novo topo só é visto depois de terminar de conjurar ou ativar (motor/view.ts)',
    7: 'regra geral: CR 601.3 — a permissão só deixa jogar ou conjurar; habilidades da carta no grimório não podem ser ativadas',
    8: 'regra geral: CR 601.2f — os custos da mágica conjurada do grimório são os normais (motor/stack.ts)',
    9: 'regra geral: CR 601.3 — a permissão só muda a zona; o tempo de conjurar continua o do tipo da carta (motor/priority.ts)',
  },
});
