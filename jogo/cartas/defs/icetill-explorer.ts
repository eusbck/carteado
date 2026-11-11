// Icetill Explorer
// You may play an additional land on each of your turns.
// You may play lands from your graveyard.
// Landfall — Whenever a land you control enters, mill a card.
import { defineCard, isLand, mill, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Icetill Explorer',
  faces: [{
    abilities: [
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const o = c.g.state.objects[carta];
            return p === c.you && o?.zone === 'graveyard' && o.owner === p && isLand(c.g, carta) ? { key: `icetill:${c.source}`, label: 'jogar do cemitério', land: true, filter: (cc, id) => isLand(cc.g, id) } : null;
          },
        },
        text: 'Você pode jogar terrenos do seu cemitério.',
      }),
      triggered(on.landfall(), function* (c) { yield* mill(c.g, c.you, 1); }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, moa uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 305.2 — jogar do cemitério conta para o limite',
    2: 'regra geral: CR 305.2 — os terrenos adicionais se somam',
    3: 'regra geral: CR 701.17 — moer com o grimório vazio não faz nada',
  },
});
