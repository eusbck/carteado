// Ocelot Pride
// First strike, lifelink
// Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)
// At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you
// have the city's blessing, for each token you control that entered this turn, create a token that's a copy of it.
import { controllerOf, copiableValues, createTokens, defineCard, hasKw, keyword, keywords, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';
import { fichasQueEntraramNoTurno } from '../forragear.ts';
import { jog, reg } from '../../motor/registro.ts';

/** CR 702.131b-c: a bênção vem assim que você controla dez permanentes com um de ascensão, mesmo no meio da resolução
 *  (ruling 7: o Cat criado pode ser o décimo) */
function confereBencao(g: G, p: PlayerId): void {
  const s = g.state;
  if (s.players[p].citysBlessing) return;
  const meus = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p);
  if (meus.length >= 10 && meus.some((id) => hasKw(g, id, 'ascend'))) {
    s.players[p].citysBlessing = true;
    reg(g, 'outro', { rule: '702.131c' })`${jog(p)} recebe a bênção da cidade.`;
    g.bump();
  }
}

export default defineCard({
  name: 'Ocelot Pride',
  faces: [{
    abilities: [
      ...keywords('first strike', 'lifelink'),
      keyword('ascend'),
      // CR 603.4: condição interveniente — conferida ao disparar e ao resolver
      triggered(on.endStep('you'), function* (c) {
        yield* createTokens(c.g, c.you, 'Cat 1/1 branco', 1);
        confereBencao(c.g, c.you);
        if (!c.g.state.players[c.you].citysBlessing) return;
        // rulings 8-10: sem alvo; cada cópia usa os valores copiáveis da ficha (CR 707.2)
        const fichas = fichasQueEntraramNoTurno(c.g, c.you);
        if (fichas.length) yield* putOntoBattlefield(c.g, fichas.map((id) => ({ controller: c.you, token: { copyOf: copiableValues(c.g, id) } })), 'token');
      }, {
        condition: (c) => (c.g.state.turnStats[c.you]?.lifeGained ?? 0) > 0,
        text: 'No início da sua etapa final, se você ganhou vida neste turno, crie uma ficha de criatura Cat branca 1/1. Depois, se você tiver a bênção da cidade, para cada ficha que você controla que entrou neste turno, crie uma ficha que é uma cópia dela.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.131c — a bênção fica até o fim do jogo (motor/sba.ts; teste de Tendershoot Dryad)',
    2: 'regra geral: CR 110.1 — fichas e terrenos contam como permanentes',
    3: 'regra geral: CR 702.131b — precisa controlar um permanente com ascensão',
    4: 'regra geral: CR 702.131c — a bênção chega antes das outras ações de estado (motor/sba.ts)',
    5: 'regra geral: CR 702.131c — a bênção não usa a pilha',
    6: 'teste: ganhou vida antes de a Ocelot entrar: o gatilho dispara igual',
    7: 'teste: com a bênção (o Cat é o décimo permanente), copia cada ficha que entrou no turno, inclusive o Cat',
    8: 'regra geral: CR 115.1 — a habilidade não tem alvo',
    9: 'teste: com a bênção (o Cat é o décimo permanente), copia cada ficha que entrou no turno, inclusive o Cat',
    10: 'regra geral: CR 707.3 — a cópia de uma ficha que copia outra coisa copia o que ela copia (motor/mecanicas.ts copiableValues)',
    11: 'regra geral: CR 603.6a, 614.12 — gatilhos e "entra com" das fichas valem (motor/actions.ts putOntoBattlefield)',
  },
});
