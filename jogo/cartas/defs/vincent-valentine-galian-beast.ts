// Vincent Valentine // Galian Beast
// Frente — Whenever a creature an opponent controls dies, put a number of +1/+1 counters on Vincent Valentine equal to
// that creature's power. Whenever Vincent Valentine attacks, you may transform it.
// Verso — Trample, lifelink. When Galian Beast dies, return it to the battlefield tapped (front face up).
import { addCounters, defineCard, keyword, on, putOntoBattlefield, transformFrom, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Vincent Valentine // Galian Beast',
  faces: [
    {
      abilities: [
        triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
          // ruling: força pela última informação
          const p = c.g.state.lki[c.event.old as ObjId]?.chars.power ?? 0;
          if (p > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', p, c.you);
        }, { text: 'Sempre que uma criatura que um oponente controla morre, coloque em Vincent Valentine marcadores +1/+1 iguais à força dessa criatura.' }),
        triggered(on.selfAttacks(), function* (c) {
          if (c.g.state.objects[c.source]?.face !== 0) return;
          if (yield* yesNo(c.g, c.you, 'Vincent Valentine: transformar em Galian Beast?')) transformFrom(c.g, c.source, 0);
        }, { text: 'Sempre que Vincent Valentine ataca, você pode transformá-lo.' }),
      ],
    },
    {
      abilities: [
        keyword('trample'), keyword('lifelink'),
        triggered(on.selfDies(), function* (c) {
          const carta = c.event.obj as ObjId;
          if (c.g.state.objects[carta]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.g.state.objects[carta].owner, tapped: true }], 'effect');
        }, { text: 'Quando Galian Beast morre, devolva-o ao campo de batalha virado (com a face da frente para cima).' }),
      ],
    },
  ],
  rulings: {
    1: 'regra geral: CR 608.2h — usa a força da criatura pela última informação',
    2: 'regra geral: CR 711.8 — volta ao campo com a face da frente para cima',
    3: 'regra geral: CR 701.28 — transformado continua o mesmo objeto, com os marcadores',
  },
});
