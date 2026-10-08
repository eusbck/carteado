// Chromatic Lantern
// Lands you control have "{T}: Add one mana of any color."
// {T}: Add one mana of any color.
import { and, anthem, defineAbility, defineCard, is, mana } from '../../motor/api.ts';

// a habilidade concedida aos terrenos (CR 613.1f, camada 6)
const QUALQUER_COR = defineAbility('Chromatic Lantern:terrenos', mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }));

export default defineCard({
  name: 'Chromatic Lantern',
  faces: [{
    abilities: [
      // ruling 1: só acrescenta a habilidade; os terrenos mantêm as outras e os tipos de terreno
      anthem(and(is.land, is.yours), () => [{ k: 'addAbility', id: QUALQUER_COR.id! }], 'Terrenos que você controla têm "{T}: Adicione uma mana de qualquer cor."'),
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {
    1: 'teste: os terrenos mantêm as outras habilidades e os tipos de terreno',
  },
});
