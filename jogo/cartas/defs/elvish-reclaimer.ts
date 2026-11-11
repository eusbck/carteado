// Elvish Reclaimer
// This creature gets +2/+2 as long as there are three or more land cards in your graveyard.
// {2}, {T}, Sacrifice a land: Search your library for a land card, put it onto the battlefield tapped, then shuffle.
import { activated, defineCard, isLand, staticAbility } from '../../motor/api.ts';
import { buscaTerrenos, sacrificaTerrenoCusto } from '../terras.ts';

export default defineCard({
  name: 'Elvish Reclaimer',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id === c.source && c.g.state.zones.graveyard[c.you].filter((id) => isLand(c.g, id)).length >= 3,
        mods: () => [{ k: 'pt', p: 2, t: 2 }],
        text: 'Esta criatura recebe +2/+2 enquanto houver três ou mais cartas de terreno no seu cemitério.',
      }),
      activated([{ k: 'mana', cost: '{2}' }, { k: 'tap' }, sacrificaTerrenoCusto], function* (c) { yield* buscaTerrenos(c, 1, () => true, true); },
        { text: '{2}, {T}, Sacrifique um terreno: Procure uma carta de terreno, coloque-a no campo virada e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
