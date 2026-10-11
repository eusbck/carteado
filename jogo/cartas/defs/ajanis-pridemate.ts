// Ajani's Pridemate
// Whenever you gain life, put a +1/+1 counter on this creature.
import { addCounters, defineCard, on, triggered } from '../../motor/api.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

export default defineCard({
  name: "Ajani's Pridemate",
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: um marcador +1/+1 por evento de ganho de vida, seja de quanto for',
    2: GANHO_DE_VIDA.danoLetal,
    3: GANHO_DE_VIDA.vinculo,
    4: GANHO_DE_VIDA.paraCada,
    5: GANHO_DE_VIDA.duasCabecas,
  },
});