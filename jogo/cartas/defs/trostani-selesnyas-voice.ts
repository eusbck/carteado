// Trostani, Selesnya's Voice
// Whenever another creature you control enters, you gain life equal to that creature's toughness.
// {1}{G}{W}, {T}: Populate. (Create a token that's a copy of a creature token you control.)
import { activated, defineCard, gainLife, populate, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { entraOutraCriaturaSua, POPULAR, resistenciaDe } from '../miku.ts';

export default defineCard({
  name: "Trostani, Selesnya's Voice",
  faces: [{
    abilities: [
      triggered(entraOutraCriaturaSua(), function* (c) {
        // ruling 7: a resistência na resolução, ou a última conhecida; resistência negativa não tira vida
        gainLife(c.g, c.you, resistenciaDe(c.g, c.event.obj as ObjId), c.source);
      }, { text: 'Sempre que outra criatura que você controla entra, você ganha vida igual à resistência dela.' }),
      activated('{1}{G}{W}, {T}', function* (c) { yield* populate(c.g, c.you); }, { text: '{1}{G}{W}, {T}: Popule. (Crie uma ficha que é uma cópia de uma ficha de criatura que você controla.)' }),
    ],
  }],
  rulings: {
    1: POPULAR.copia,
    2: POPULAR.naoMira,
    3: POPULAR.copiaDeCopia,
    4: POPULAR.semFicha,
    5: POPULAR.semEstado,
    6: POPULAR.entrar,
    7: 'teste: quando outra criatura sua entra, você ganha vida igual à resistência dela',
  },
});