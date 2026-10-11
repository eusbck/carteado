// Zuri, Warrior of Wakanda
// Trample
// Whenever you cast an artifact spell with mana value 4 or greater, put a +1/+1 counter on each creature you control.
import { addCounters, creaturesOf, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { artefatoDeValor4 } from '../wakanda.ts';

export default defineCard({
  name: 'Zuri, Warrior of Wakanda',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.youCast(artefatoDeValor4), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica de artefato com valor de mana 4 ou maior, coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {},
});