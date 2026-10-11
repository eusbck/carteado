// Prowler, Clawed Thief
// Menace (This creature can't be blocked except by two or more creatures.)
// Whenever another Villain you control enters, Prowler connives. (Draw a card, then discard a card. If you discarded a
// nonland card, put a +1/+1 counter on this creature.)
import { and, connive, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Prowler, Clawed Thief',
  faces: [{
    abilities: [
      keyword('menace'),
      // ruling 3: trama mesmo que Prowler já tenha saído do campo (CR 701.50b), sem marcador
      triggered(on.enters(and(is.yours, is.other, is.subtype('Villain'))), function* (c) {
        yield* connive(c.g, c.source);
      }, { text: 'Sempre que outro Villain que você controla entra, Prowler trama.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.50a — sem carta descartada, não há marcador (motor/criaturas.ts connive)',
    2: 'regra geral: CR 608.2 — ninguém age durante a resolução, entre o descarte e o marcador (motor/criaturas.ts connive)',
    3: 'regra geral: CR 701.50b — a criatura que saiu do campo trama mesmo assim, sem marcador (motor/criaturas.ts connive)',
  },
});
