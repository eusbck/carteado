// Gavony Township
// {T}: Add {C}.
// {2}{G}{W}, {T}: Put a +1/+1 counter on each creature you control.
import { activated, addCounters, creaturesOf, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gavony Township',
  faces: [{ abilities: [
    mana('C'),
    // as criaturas são vistas na resolução (CR 608.2h)
    activated('{2}{G}{W}, {T}', function* (c) {
      for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
    }, { text: '{2}{G}{W}, {T}: Coloque um marcador +1/+1 em cada criatura que você controla.' }),
  ] }],
  rulings: {},
});
