// Archangel of Thune
// Flying
// Lifelink (Damage dealt by this creature also causes you to gain that much life.)
// Whenever you gain life, put a +1/+1 counter on each creature you control.
import { addCounters, creaturesOf, defineCard, keywords, on, triggered } from '../../motor/api.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

export default defineCard({
  name: 'Archangel of Thune',
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      triggered(on.youGainLife(), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {
    1: GANHO_DE_VIDA.danoLetal,
    2: 'teste: atacando com vínculo com a vida, você ganha vida e cada criatura sua recebe um marcador +1/+1',
    3: GANHO_DE_VIDA.paraCada,
    4: GANHO_DE_VIDA.duasCabecas,
  },
});