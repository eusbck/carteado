// Vincent Valentine // Galian Beast
// Frente — Whenever a creature an opponent controls dies, put a number of +1/+1 counters on Vincent Valentine equal to
// that creature's power.
// Whenever Vincent Valentine attacks, you may transform it.
// //
// Verso — Trample, lifelink
// When Galian Beast dies, return it to the battlefield tapped (front face up).
import { addCounters, defineCard, keywords, on, putOntoBattlefield, transformFrom, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Vincent Valentine // Galian Beast',
  faces: [
    {
      abilities: [
        // ruling 4: a força como a criatura existia por último no campo
        triggered(on.dies((c, lki) => c.g.isOpponent(c.you, lki.controller)), function* (c) {
          const n = c.g.state.lki[c.event.old as ObjId]?.chars.power ?? 0;
          if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
        }, { text: 'Sempre que uma criatura que um oponente controla morre, coloque em Vincent Valentine uma quantidade de marcadores +1/+1 igual à força dessa criatura.' }),
        triggered(on.selfAttacks(), function* (c) {
          // CR 701.27f: só transforma se ainda estiver com a frente para cima
          if (c.g.state.objects[c.source]?.face !== 0) return;
          if (yield* yesNo(c.g, c.you, 'Vincent Valentine: transformar?')) transformFrom(c.g, c.source, 0);
        }, { text: 'Sempre que Vincent Valentine ataca, você pode transformá-lo.' }),
      ],
    },
    {
      abilities: [
        ...keywords('trample', 'lifelink'),
        triggered(on.selfDies(), function* (c) {
          const carta = c.event.obj as ObjId;
          // CR 712.14: volta com a frente para cima
          if (c.g.state.objects[carta]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.g.state.objects[carta].owner, tapped: true }], 'effect');
        }, { text: 'Quando Galian Beast morre, devolva-o ao campo de batalha virado (com a frente para cima).' }),
      ],
    },
  ],
  rulings: {
    1: 'regra geral: CR 712.14 — entra com a frente para cima (motor/actions.ts)',
    2: 'regra geral: CR 204 — o verso tem indicador de cor (motor/oracle.ts)',
    3: 'não se aplica: nenhuma carta dos decks põe uma carta de uma face só no campo transformada',
    4: 'teste: quando uma criatura de um oponente morre, recebe marcadores iguais à força dela',
    5: 'regra geral: CR 707.8 — a ficha que copia uma carta de duas faces tem as duas faces (motor/criaturas.ts)',
    6: 'regra geral: CR 712.8 — fora do campo só vale a frente (motor/chars.ts)',
    7: 'teste: ao atacar, pode transformar; Galian Beast morrendo volta virado com a frente para cima',
    8: 'regra geral: CR 712.8 — o valor de mana é o da frente (motor/chars.ts)',
    9: 'regra geral: CR 903.4 — a identidade de cor soma as duas faces (motor/oracle.ts)',
  },
});
