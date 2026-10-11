// Urborg, Tomb of Yawgmoth
// Each land is a Swamp in addition to its other land types.
import { chars, defineCard, isLand, staticAbility } from '../../motor/api.ts';
import type { Mod } from '../../motor/types.ts';

export default defineCard({
  name: 'Urborg, Tomb of Yawgmoth',
  faces: [{ abilities: [
    // CR 613.1d (camada 4): cada terreno no campo ganha o tipo Swamp. CR 305.6: quem tem o tipo Swamp tem a habilidade
    // de mana intrínseca "{T}: Adicione {B}" (o motor só a dá pelo tipo impresso, então ela vem junto, sem repetir a
    // de quem já a tem). O próprio Urborg também vira Swamp.
    staticAbility({
      affects: (c, o) => isLand(c.g, o.id),
      mods: (c, o) => {
        const mods: Mod[] = [{ k: 'addTypes', subtypes: ['Swamp'] }];
        if (!chars(c.g, o.id).abilities.some((a) => a.id === 'basic:B')) mods.push({ k: 'addAbility', id: 'basic:B' });
        return mods;
      },
      text: 'Cada terreno é um Swamp além de seus outros tipos de terreno.',
    }),
  ] }],
  rulings: {
    1: 'teste: fora do campo, Urborg não é Swamp',
    2: 'teste: cartas de terreno fora do campo não viram Swamp',
    3: 'teste: CR 305.6: cada terreno no campo vira Swamp e ganha "{T}: Adicione {B}"; nome, outros tipos, básico e lendário não mudam',
    4: 'não se aplica: nenhuma carta dos decks define o tipo básico de um terreno (Magus of the Moon, Blood Moon)',
  },
});
