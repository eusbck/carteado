// Sceptre of Eternal Glory
// {T}: Add one mana of any color.
// {T}: Add three mana of any one color. Activate only if you control three or more lands with the same name.
import { defineCard, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { tresTerrenosIguais } from '../necrons.ts';

export default defineCard({
  name: 'Sceptre of Eternal Glory',
  faces: [{
    abilities: [
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
      mana((c) => (tresTerrenosIguais(c.g, c.you) ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => [cor, cor, cor]) : []), {
        condition: (c) => tresTerrenosIguais(c.g, c.you),
        text: '{T}: Adicione três manas de uma cor qualquer. Ative somente se você controla três ou mais terrenos com o mesmo nome.',
      }),
    ],
  }],
  rulings: {},
});