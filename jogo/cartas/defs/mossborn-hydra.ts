// Mossborn Hydra
// Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)
// This creature enters with a +1/+1 counter on it.
// Landfall — Whenever a land you control enters, double the number of +1/+1 counters on this creature.
import { defineCard, entersWithCounters, keyword, on, triggered } from '../../motor/api.ts';
import { dobraMarcadores } from '../tartarugas.ts';

export default defineCard({
  name: 'Mossborn Hydra',
  faces: [{
    abilities: [
      keyword('trample'),
      entersWithCounters('+1/+1', 1),
      triggered(on.landfall(), function* (c) {
        // CR 701.10e: adicionar tantos marcadores quantos ela tem; substituições se aplicam normalmente.
        if (c.g.state.objects[c.source]?.zone === 'battlefield') dobraMarcadores(c.g, c.source, '+1/+1', c.you);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, dobre o número de marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 701.10e: dobrar coloca novos marcadores e aplica as substituições',
    2: 'teste: dispara por cada terreno que entra ao mesmo tempo que ela',
    3: 'teste: dobra os marcadores atuais na resolução de cada aterragem',
    4: 'regra geral: CR 603.6a — aterragem só dispara na entrada no campo (motor/dsl.ts on.landfall)',
    5: 'regra geral: CR 603.3b — o controlador ordena os gatilhos simultâneos (motor/stack.ts)',
  },
});
