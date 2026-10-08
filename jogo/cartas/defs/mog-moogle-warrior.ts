// Mog, Moogle Warrior
// Lifelink
// Dance — At the beginning of your end step, each player may discard a card. Each player who discarded a card this way
// draws a card. If a creature card was discarded this way, you create a 1/2 white Moogle creature token with lifelink.
// Then if a noncreature card was discarded this way, put a +1/+1 counter on each Moogle you control.
import { addCounters, controlledBy, createTokens, defineCard, discard, draw, isCreature, isSubtype, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mog, Moogle Warrior',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.endStep('you'), function* (c) {
        // CR 101.4: cada jogador decide em ordem APNAP
        const descartes: { p: PlayerId; ids: ObjId[] }[] = [];
        for (const p of c.g.apnap()) descartes.push({ p, ids: yield* discard(c.g, p, 1, { upTo: true }) });
        for (const d of descartes) if (d.ids.length) yield* draw(c.g, d.p, 1);
        const cartas = descartes.flatMap((d) => d.ids);
        // ruling 1: no máximo uma ficha e uma rodada de marcadores
        if (cartas.some((id) => isCreature(c.g, id))) yield* createTokens(c.g, c.you, 'Moogle', 1);
        if (cartas.some((id) => !isCreature(c.g, id))) {
          for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Moogle'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        }
      }, { text: 'Dança — No início da sua etapa final, cada jogador pode descartar uma carta. Cada jogador que descartou compra uma carta. Se uma carta de criatura foi descartada assim, crie uma ficha Moogle branca 1/2 com vínculo com a vida. Depois, se uma carta que não é de criatura foi descartada, coloque um marcador +1/+1 em cada Moogle que você controla.' }),
    ],
  }],
  rulings: { 1: 'teste: duas criaturas descartadas criam uma ficha só' },
});
