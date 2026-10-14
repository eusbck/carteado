// Honored Dreyleader
// Trample
// When this creature enters, put a +1/+1 counter on it for each other Squirrel and/or Food you control.
// Whenever another Squirrel or Food you control enters, put a +1/+1 counter on this creature.
import { addCounters, controlledBy, controllerOf, defineCard, etb, keywords, on, triggered } from '../../motor/api.ts';
import { COMIDA, ehComida, ehEsquilo } from '../esquilos.ts';

export default defineCard({
  name: 'Honored Dreyleader',
  faces: [{
    abilities: [
      ...keywords('trample'),
      // ruling 5: uma permanente que é Squirrel e Food conta uma vez só
      etb(function* (c) {
        const n = controlledBy(c.g, c.you, (id) => id !== c.source && (ehEsquilo(c.g, id) || ehComida(c.g, id))).length;
        if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
      }, { text: 'Quando esta criatura entra, coloque um marcador +1/+1 nela para cada outro Squirrel e/ou Food que você controla.' }),
      // ruling 6: uma vez por permanente que entra, mesmo sendo as duas coisas
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj !== c.source && !!c.g.state.objects[e.obj]
        && controllerOf(c.g, e.obj) === c.you && (ehEsquilo(c.g, e.obj) || ehComida(c.g, e.obj))), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outro Squirrel ou Food que você controla entra, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.umCusto,
    4: COMIDA.piada,
    5: 'teste: entra com um marcador por Squirrel e por Food que você já controla; depois, um por Squirrel ou Food que entra',
    6: 'teste: entra com um marcador por Squirrel e por Food que você já controla; depois, um por Squirrel ou Food que entra',
  },
});
