// Karmic Guide
// Flying, protection from black
// Echo {3}{W}{W} (At the beginning of your upkeep, if this came under your control since the beginning of your last
// upkeep, sacrifice it unless you pay its echo cost.)
// When this creature enters, return target creature card from your graveyard to the battlefield.
import { defineCard, echo, etb, is, keyword, protectionFrom, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Karmic Guide',
  faces: [{
    abilities: [
      keyword('flying'),
      protectionFrom('B'),
      echo('{3}{W}{W}'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, { targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')], text: 'Quando esta criatura entra, devolva a carta de criatura alvo do seu cemitério ao campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: o eco dispara na primeira manutenção sob seu controle, não na seguinte',
    2: 'teste: sem pagar o eco, sacrifica',
  },
});
