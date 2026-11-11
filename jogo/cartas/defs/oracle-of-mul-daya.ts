// Oracle of Mul Daya
// You may play an additional land on each of your turns.
// Play with the top card of your library revealed.
// You may play lands from the top of your library.
import { defineCard, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Oracle of Mul Daya',
  faces: [{
    abilities: [
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      // simplificação: o topo fica visível para você (não para todos)
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Jogue com a carta do topo do seu grimório revelada.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.zones.library[p][0] === carta && isLand(c.g, carta)
            ? { key: `mul-daya:${c.source}`, label: 'jogar do topo do grimório', land: true, filter: (cc, id) => isLand(cc.g, id) } : null),
        },
        text: 'Você pode jogar terrenos do topo do seu grimório.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 305.2 — jogar do topo conta para o limite de terrenos',
    2: 'regra geral: CR 305.2 — vários efeitos de terreno adicional se somam',
    3: 'regra geral: CR 401.2 — a carta do topo muda assim que é jogada ou comprada',
  },
});
