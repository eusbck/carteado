// General Leo Cristophe
// When General Leo Cristophe enters, return up to one target creature card with mana value 3 or less from your graveyard
// to the battlefield. Then put a +1/+1 counter on General Leo Cristophe for each creature you control.
import { addCounters, and, creaturesOf, defineCard, etb, is, putOntoBattlefield, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'General Leo Cristophe',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        const n = creaturesOf(c.g, c.you).length;
        if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
      }, {
        targets: [upTo(1, t.card('graveyard', and(is.creature, is.mvAtMost(3)), 'até uma carta de criatura alvo com valor de mana 3 ou menos no seu cemitério'))],
        text: 'Quando General Leo Cristophe entra, devolva até uma carta de criatura alvo com valor de mana 3 ou menos do seu cemitério ao campo. Depois coloque um marcador +1/+1 nele para cada criatura que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o único alvo ilegal, a habilidade não resolve',
    2: 'regra geral: CR 107.3g — X vale 0 no cemitério',
  },
});
