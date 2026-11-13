// Abandoned Air Temple
// This land enters tapped unless you control a basic land.
// {T}: Add {W}.
// {3}{W}, {T}: Put a +1/+1 counter on each creature you control.
import { activated, addCounters, controlledBy, defineCard, isCreature, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Abandoned Air Temple',
  faces: [{
    abilities: [
      // ruling 1 / CR 614.12: os terrenos que entram junto não contam
      land.tappedUnlessBasics(1),
      mana('W'),
      activated('{3}{W}, {T}', function* (c) {
        for (const id of controlledBy(c.g, c.you, (i) => isCreature(c.g, i))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: '{3}{W}, {T}: Coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: entra virado sem terreno básico, desvirado com um',
  },
});
