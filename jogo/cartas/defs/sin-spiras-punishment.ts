// Sin, Spira's Punishment
// Flying
// Whenever Sin enters or attacks, exile a permanent card from your graveyard at random, then create a tapped token
// that's a copy of that card. If the exiled card is a land card, repeat this process.
import { chars, createTokens, defineCard, exile, is, keyword, on, triggered, type Gen } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { shuffle } from '../../motor/rng.ts';

/** o processo do Sin: exila uma carta de permanente aleatória e cria a cópia virada; repete enquanto sair terreno */
function* processo(c: Ctx): Gen<void> {
  const g = c.g;
  const ctx = { g, you: c.you, source: c.source };
  for (;;) {
    const cands = g.state.zones.graveyard[c.you].filter((id) => is.permanentCard(ctx, id));
    if (!cands.length) return;
    const [sorteada] = shuffle(g.state.rng, [...cands]);
    const o = g.state.objects[sorteada];
    const def = o.def;
    const terreno = chars(g, sorteada).types.includes('Land');
    g.log(`${chars(g, c.source).name}: ${chars(g, sorteada).name} é exilada ao acaso do cemitério.`);
    const [ex] = yield* exile(g, [sorteada]);
    if (ex === null || ex === undefined) return;
    // ruling 2: a ficha copia a carta impressa (a face da frente); ruling 3: os gatilhos e substituições de entrar dela
    // funcionam; ruling 1: X vale 0 (CR 707.9)
    yield* createTokens(g, c.you, { copyOf: { def, face: 0 } }, 1, { tapped: true });
    if (!terreno) return;
  }
}

export default defineCard({
  name: "Sin, Spira's Punishment",
  faces: [{
    abilities: [
      keyword('flying'),
      // uma habilidade só, com dois eventos (entra; ataca)
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((x) => x.obj === c.source))), processo, {
        text: 'Sempre que Sin entra ou ataca, exile uma carta de permanente aleatória do seu cemitério e crie uma ficha virada que é uma cópia dela. Se a carta exilada for uma carta de terreno, repita o processo.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.9 — a cópia de uma carta com {X} no custo tem X igual a 0 (motor/chars.ts)',
    2: 'teste: a ficha é uma cópia virada da carta exilada (a impressa)',
    3: 'teste: o gatilho de entrar da carta copiada dispara para a ficha',
  },
});
