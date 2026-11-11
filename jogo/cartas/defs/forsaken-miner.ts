// Forsaken Miner
// This creature can't block.
// Whenever you commit a crime, you may pay {B}. If you do, return this card from your graveyard to the battlefield.
import { defineCard, keyword, mayPay, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { voceCometeCrime } from '../crime.ts';

export default defineCard({
  name: 'Forsaken Miner',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      triggered(voceCometeCrime(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* mayPay(c, c.you, '{B}', 'devolver Forsaken Miner do cemitério')) {
          if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
        }
      }, { zones: ['graveyard'], text: 'Sempre que você comete um crime, você pode pagar {B}. Se fizer isso, devolva esta carta do seu cemitério ao campo de batalha.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 700.13 — crime: mirar oponente, algo dele ou carta no cemitério dele (cartas/crime.ts)',
    2: 'regra geral: CR 700.13a — vários alvos numa mágica são um crime só',
  },
});
