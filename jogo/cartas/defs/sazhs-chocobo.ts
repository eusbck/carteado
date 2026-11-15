// Sazh's Chocobo
// Landfall — Whenever a land you control enters, put a +1/+1 counter on this creature.
import { addCounters, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Sazh's Chocobo",
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: recebe um marcador por terreno jogado ou colocado no campo por um efeito, apenas sob seu controle',
    2: 'teste: tornar uma permanente em terreno não dispara aterragem',
    3: 'regra geral: CR 603.3b — o controlador ordena os gatilhos simultâneos (motor/stack.ts)',
  },
});
