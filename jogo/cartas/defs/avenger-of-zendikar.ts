// Avenger of Zendikar
// When this creature enters, create a 0/1 green Plant creature token for each land you control.
// Landfall — Whenever a land you control enters, you may put a +1/+1 counter on each Plant creature you control.
import { addCounters, controlledBy, createTokens, defineCard, etb, isCreature, isSubtype, on, triggered, yesNo } from '../../motor/api.ts';
import { ATERRAGEM, terrenosDe } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Avenger of Zendikar',
  faces: [{
    abilities: [
      // conta os terrenos na resolução
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Plant 0/1', terrenosDe(c.g, c.you).length);
      }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Planta 0/1 verde para cada terreno que você controla.' }),
      triggered(on.landfall(), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Avenger of Zendikar: colocar um marcador +1/+1 em cada Planta que você controla?'))) return;
        for (const id of controlledBy(c.g, c.you, (x) => isCreature(c.g, x) && isSubtype(c.g, x, 'Plant'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, você pode colocar um marcador +1/+1 em cada criatura Planta que você controla.' }),
    ],
  }],
  rulings: { ...ATERRAGEM('teste: com um terreno entrando, cada Planta sua ganha um marcador +1/+1') },
});
