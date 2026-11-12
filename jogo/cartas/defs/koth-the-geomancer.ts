// Koth, the Geomancer
// Reach
// Landfall — Whenever a land you control enters, Koth deals 1 damage to each opponent. If that land is a Mountain, add {R}.
import { addMana, defineCard, keyword, lkiChars, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { aterragem, danoACadaOponente } from '../terras.ts';

export default defineCard({
  name: 'Koth, the Geomancer',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(aterragem(), function* (c) {
        danoACadaOponente(c, 1);
        // o terreno como está agora, ou como estava ao sair do campo
        if (lkiChars(c.g, c.event.terreno as ObjId)?.subtypes.includes('Mountain')) addMana(c.g, c.you, ['R']);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, Koth causa 1 ponto de dano a cada oponente. Se esse terreno for uma Montanha, adicione {R}.' }),
    ],
  }],
  rulings: {},
});
