// Crucible of Worlds
// You may play lands from your graveyard.
import { defineCard, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Crucible of Worlds',
  faces: [{
    abilities: [staticAbility({
      rules: {
        mayPlayFrom: (c, p, carta) => {
          const o = c.g.state.objects[carta];
          if (p !== c.you || !o || o.zone !== 'graveyard' || o.owner !== p || !isLand(c.g, carta)) return null;
          return { key: `crucible:${c.source}`, label: 'jogar do cemitério', land: true, filter: (cc, id) => isLand(cc.g, id) };
        },
      },
      text: 'Você pode jogar terrenos do seu cemitério.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 305.2 — jogar do cemitério conta para o limite de terrenos do turno',
    2: 'regra geral: CR 305.1 — só jogar; não permite pôr no campo por outros meios',
  },
});
