// Magma Opus
// Magma Opus deals 4 damage divided as you choose among any number of targets. Tap two target permanents. Create a 4/4
// blue and red Elemental creature token. Draw two cards.
// {U/R}{U/R}, Discard this card: Create a Treasure token.
import { activated, createTokens, dealDamage, defineCard, draw, exactly, t, tap, tgtRef, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Magma Opus',
  faces: [{
    spell: {
      // ruling 1: todos os alvos na conjuração; ruling 5: cada alvo do dano recebe pelo menos 1 (CR 601.2d)
      targets: [upTo(4, t.any('alvos do dano dividido')), exactly(2, t.permanent(undefined, 'dois permanentes alvo para virar'))],
      divide: () => 4,
      *effect(c) {
        const div = c.division?.[0] ?? [];
        const golpes = (c.targets[0] ?? []).map((_, i) => ({ r: tgtRef(c, 0, i), n: div[i] ?? 0 })).filter((x) => x.r !== null && x.n > 0);
        if (golpes.length) dealDamage(c.g, golpes.map((x) => ({ source: c.source, target: x.r!, amount: x.n, combat: false })));
        for (const id of tgtsAll(c, 1)) tap(c.g, id);
        yield* createTokens(c.g, c.you, 'Elemental 4/4', 1);
        yield* draw(c.g, c.you, 2);
      },
    },
    abilities: [activated('{U/R}{U/R}, Discard this card', function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, {
      zones: ['hand'], text: '{U/R}{U/R}, Descarte esta carta: Crie uma ficha de Tesouro.',
    })],
  }],
  rulings: {
    1: 'teste: escolhe todos os alvos ao conjurar',
    2: 'regra geral: CR 608.2b — com todos os alvos ilegais, nada acontece',
    3: 'regra geral: CR 115.3 — os dois permanentes do segundo "alvo" são diferentes entre si',
    4: 'teste: o mesmo permanente pode receber dano e ser virado',
    5: 'teste: divide 4 de dano com pelo menos 1 por alvo',
  },
});
