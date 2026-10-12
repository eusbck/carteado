// Mystic Forge
// You may look at the top card of your library any time.
// You may cast artifact spells and colorless spells from the top of your library.
// {T}, Pay 1 life: Exile the top card of your library.
import { activated, chars, defineCard, exile, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Mystic Forge',
  faces: [{
    abilities: [
      // rulings 4 e 5: olhar o topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // rulings 1-3: só conjurar (terreno não se conjura); o tempo e os custos continuam os normais
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta || isLand(c.g, carta)) return null;
            const ch = chars(c.g, carta);
            if (!ch.types.includes('Artifact') && ch.colors.length > 0) return null;
            return { key: `mystic-forge:${c.source}`, label: 'conjurar do topo do grimório' };
          },
        },
        text: 'Você pode conjurar mágicas de artefato e mágicas incolores do topo do seu grimório.',
      }),
      activated('{T}, Pay 1 life', function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo !== undefined) yield* exile(c.g, [topo]);
      }, { text: '{T}, Pague 1 ponto de vida: Exile a carta do topo do seu grimório.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjura artefatos e mágicas incolores do topo do grimório; cartas coloridas e terrenos, não',
    2: 'regra geral: CR 601.3 — a permissão só muda a zona; o tempo de conjurar continua o do tipo da carta (motor/priority.ts)',
    3: 'regra geral: CR 601.2f — os custos da mágica conjurada do grimório são os normais (motor/stack.ts)',
    4: 'regra geral: CR 401.5 — olhar o topo do grimório não usa a pilha nem precisa de prioridade (motor/view.ts lookAtTopOfLibrary)',
    5: 'regra geral: CR 401.5 — se o topo muda enquanto você conjura ou ativa algo, o novo topo só é visto depois (motor/view.ts)',
    6: 'não se aplica: conjurar virada para baixo do topo não está implementado, e o deck que usa Mystic Forge não tem cartas de metamorfose',
  },
});