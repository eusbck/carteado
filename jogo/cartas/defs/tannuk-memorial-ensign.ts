// Tannuk, Memorial Ensign
// Landfall — Whenever a land you control enters, Tannuk deals 1 damage to each opponent. If this is the second time this
// ability has resolved this turn, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';
import { danoACadaOponente } from '../terras.ts';

export default defineCard({
  name: 'Tannuk, Memorial Ensign',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        danoACadaOponente(c, 1);
        // contagem das resoluções desta habilidade no turno, no próprio Tannuk (um objeto novo começa do zero, CR 400.7)
        const o = c.g.state.objects[c.source];
        if (!o) return;
        const turno = c.g.state.turn.number;
        const n = o.data.tannukTurno === turno ? ((o.data.tannukVezes as number) ?? 0) + 1 : 1;
        o.data.tannukTurno = turno;
        o.data.tannukVezes = n;
        if (n === 2) yield* draw(c.g, c.you, 1);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, Tannuk causa 1 ponto de dano a cada oponente. Se esta é a segunda vez que esta habilidade resolve neste turno, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
