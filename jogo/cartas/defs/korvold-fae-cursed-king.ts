// Korvold, Fae-Cursed King
// Flying
// Whenever Korvold enters or attacks, sacrifice another permanent.
// Whenever you sacrifice a permanent, put a +1/+1 counter on Korvold and draw a card.
import { addCounters, controlledBy, defineCard, draw, keyword, on, sacrificeYours, triggered } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import { voceSacrificaPermanente } from '../terras.ts';

function* sacrificaOutro(c: Ctx): Gen<void> {
  if (!controlledBy(c.g, c.you, (id) => id !== c.source).length) return;
  yield* sacrificeYours(c, c.you, (id) => id !== c.source, 1, 'outro permanente');
}

export default defineCard({
  name: 'Korvold, Fae-Cursed King',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfEnters(), sacrificaOutro, { text: 'Sempre que Korvold entra, sacrifique outro permanente.' }),
      triggered(on.selfAttacks(), sacrificaOutro, { text: 'Sempre que Korvold ataca, sacrifique outro permanente.' }),
      triggered(voceSacrificaPermanente(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você sacrifica um permanente, coloque um marcador +1/+1 em Korvold e compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — cada permanente sacrificado dispara uma vez',
    2: 'regra geral: CR 701.21a — sem outro permanente, não sacrifica nada',
    3: 'regra geral: CR 603.10a — dispara mesmo se Korvold for sacrificado junto',
    4: 'regra geral: CR 111.1 — fichas sacrificadas também contam (Treasure, Food)',
    5: 'regra geral: CR 701.21a — só conta o que você sacrifica, não o que outros jogadores sacrificam',
  },
});
