// Sin, Spira's Punishment
// Flying
// Whenever Sin enters or attacks, exile a permanent card from your graveyard at random, then create a tapped token
// that's a copy of that card. If the exiled card is a land card, repeat this process.
import { createTokens, defineCard, exile, is, isLand, keyword, on, triggered } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import { int } from '../../motor/rng.ts';

function* exilaECopia(c: Ctx): Gen<void> {
  const s = c.g.state;
  // CR 614.1a: "se a carta exilada for de terreno, repita": até não ser terreno ou o cemitério acabar
  for (let voltas = 0; voltas < 200; voltas++) {
    const cands = s.zones.graveyard[c.you].filter((id) => is.permanentCard(c, id));
    if (!cands.length) return;
    const carta = cands[int(s.rng, cands.length)];
    const def = s.objects[carta].def;
    const terreno = isLand(c.g, carta);
    const [ex] = yield* exile(c.g, [carta]);
    if (ex === null || ex === undefined) return;
    yield* createTokens(c.g, c.you, { copyOf: { def, face: 0 } }, 1, { tapped: true });
    if (!terreno) return;
  }
}

export default defineCard({
  name: "Sin, Spira's Punishment",
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfEnters(), exilaECopia, { text: 'Sempre que Sin entra, exile uma carta de permanente aleatória do seu cemitério e crie uma ficha virada que é uma cópia dela. Se a carta exilada for de terreno, repita.' }),
      triggered(on.selfAttacks(), exilaECopia, { text: 'Sempre que Sin ataca, exile uma carta de permanente aleatória do seu cemitério e crie uma ficha virada que é uma cópia dela. Se a carta exilada for de terreno, repita.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — a ficha copia a carta impressa',
    2: 'regra geral: CR 608.2h — a escolha aleatória é feita ao resolver',
    3: 'regra geral: CR 111.1 — a ficha entra virada, mesmo se for de terreno',
  },
});
