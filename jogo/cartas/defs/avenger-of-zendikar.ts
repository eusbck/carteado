// Avenger of Zendikar
// When this creature enters, create a 0/1 green Plant creature token for each land you control.
// Landfall — Whenever a land you control enters, you may put a +1/+1 counter on each Plant creature you control.
import { addCounters, controlledBy, createTokens, defineCard, etb, isCreature, isLand, isSubtype, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Avenger of Zendikar',
  faces: [{
    abilities: [
      etb(function* (c) {
        const n = controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length;
        if (n) yield* createTokens(c.g, c.you, 'Plant 0/1', n);
      }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Plant verde 0/1 para cada terreno que você controla.' }),
      triggered(on.landfall(), function* (c) {
        const plantas = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Plant'));
        if (!plantas.length || !(yield* yesNo(c.g, c.you, 'Avenger of Zendikar: pôr um marcador +1/+1 em cada Plant?'))) return;
        for (const id of plantas) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, você pode colocar um marcador +1/+1 em cada criatura Plant que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2h — conta os terrenos quando a habilidade resolve',
    2: 'regra geral: CR 608.2h — os marcadores vão nas Plants que você controla ao resolver',
    3: 'regra geral: CR 603.5 — pôr os marcadores é opcional',
  },
});
