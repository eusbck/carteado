// Yavimaya, Cradle of Growth
// Each land is a Forest in addition to its other land types.
import { chars, defineCard, isLand, staticAbility } from '../../motor/api.ts';
import type { Mod } from '../../motor/types.ts';

export default defineCard({
  name: 'Yavimaya, Cradle of Growth',
  faces: [{ abilities: [
    // CR 613.1d (camada 4): cada terreno no campo ganha o tipo Forest. CR 305.6: quem tem o tipo Forest tem a habilidade
    // de mana intrínseca "{T}: Adicione {G}" (o motor só a dá pelo tipo impresso, então ela vem junto, sem repetir a
    // de quem já a tem). O próprio Yavimaya também vira Forest.
    staticAbility({
      affects: (c, o) => isLand(c.g, o.id),
      mods: (c, o) => {
        const mods: Mod[] = [{ k: 'addTypes', subtypes: ['Forest'] }];
        if (!chars(c.g, o.id).abilities.some((a) => a.id === 'basic:G')) mods.push({ k: 'addAbility', id: 'basic:G' });
        return mods;
      },
      text: 'Cada terreno é um Forest além de seus outros tipos de terreno.',
    }),
  ] }],
  rulings: {
    1: 'teste: fora do campo, Yavimaya não é Forest',
    2: 'teste: cartas de terreno fora do campo não viram Forest',
    3: 'teste: CR 305.6: cada terreno no campo vira Forest e ganha "{T}: Adicione {G}"; nome, outros tipos, básico e lendário não mudam',
  },
});
