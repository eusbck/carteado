// Kess, Dissident Mage
// Flying
// Once during each of your turns, you may cast an instant or sorcery spell from your graveyard. If a spell cast this way
// would be put into your graveyard, exile it instead.
import { defineCard, is, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Kess, Dissident Mage',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            // uma vez em cada um dos seus turnos, por Kess (ruling 5: outra Kess dá outra permissão)
            if (!eu || p !== c.you || s.turn.active !== c.you || eu.data.kessTurno === s.turn.number) return null;
            const o = s.objects[carta];
            if (!o || o.zone !== 'graveyard' || o.owner !== c.you || !is.instantOrSorcery(c, carta)) return null;
            const fonte = c.source;
            // rulings 1-2: paga os custos e segue o tempo normal da carta; ruling 3: a mágica é exilada mesmo sem Kess
            return {
              key: `kess:${fonte}`, label: 'Kess, Dissident Mage', exileInstead: true,
              onUse: (u) => { const k = u.g.state.objects[fonte]; if (k) { k.data.kessTurno = u.g.state.turn.number; u.g.bump(); } },
            };
          },
        },
        text: 'Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica instantânea ou feitiço do seu cemitério. Se uma mágica conjurada assim fosse para o seu cemitério, exile-a em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: um feitiço do cemitério só no tempo de feitiço, pagando o custo; é exilado ao resolver',
    2: 'teste: um feitiço do cemitério só no tempo de feitiço, pagando o custo; é exilado ao resolver',
    3: 'teste: anulada, a mágica conjurada assim também é exilada',
    4: 'teste: conjurar pela retrospectiva não gasta a permissão de Kess',
    5: 'regra geral: a permissão é contada por Kess (data.kessTurno do permanente); uma Kess nova dá outra',
    6: 'regra geral: CR 117.3b — depois de resolver, o jogador ativo recebe a prioridade primeiro (motor/priority.ts)',
    7: 'teste: com a recompra, a carta volta para a mão em vez de ser exilada',
  },
});
