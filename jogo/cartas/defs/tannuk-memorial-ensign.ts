// Tannuk, Memorial Ensign
// Landfall — Whenever a land you control enters, Tannuk deals 1 damage to each opponent. If this is the second time
// this ability has resolved this turn, draw a card.
import { dealDamage, defineCard, draw, on, triggered } from '../../motor/api.ts';

const CONTA = 'tannuk:resolucoes';

export default defineCard({
  name: 'Tannuk, Memorial Ensign',
  faces: [{
    abilities: [triggered(on.landfall(), function* (c) {
      dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
      const s = c.g.state;
      const eu = s.objects[c.source];
      if (!eu) return;
      const n = eu.usedThisTurn[CONTA] === s.turn.number ? ((eu.data.tannuk as number) ?? 0) + 1 : 1;
      eu.usedThisTurn[CONTA] = s.turn.number;
      eu.data.tannuk = n;
      if (n === 2) yield* draw(c.g, c.you, 1);
    }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, Tannuk causa 1 de dano a cada oponente. Se esta for a segunda vez que esta habilidade resolveu neste turno, compre uma carta.' })],
  }],
  rulings: {},
});
