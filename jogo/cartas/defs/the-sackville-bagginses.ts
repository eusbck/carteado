// The Sackville-Bagginses
// When The Sackville-Bagginses enter, you may sacrifice another creature or artifact. If you do, draw a card and create
// a Treasure token.
// Whenever you sacrifice a token, target opponent loses 1 life.
import { chooseItems, controlledBy, createTokens, defineCard, draw, etb, isCreature, isType, lkiObj, loseLife, nameOf, objItem, on, sacrifice, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'The Sackville-Bagginses',
  faces: [{
    abilities: [
      etb(function* (c) {
        const cands = controlledBy(c.g, c.you, (id) => id !== c.source && (isCreature(c.g, id) || isType(c.g, id, 'Artifact')));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'The Sackville-Bagginses: você pode sacrificar outra criatura ou artefato para comprar uma carta e criar um Treasure', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc === undefined) return;
        const [feito] = yield* sacrifice(c.g, [Number(esc)]);
        if (feito === null || feito === undefined) return;
        yield* draw(c.g, c.you, 1);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Quando The Sackville-Bagginses entram, você pode sacrificar outra criatura ou artefato. Se fizer isso, compre uma carta e crie uma ficha Treasure.' }),
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && !!lkiObj(c.g, e.old)?.isToken), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, 1, c.source);
      }, { targets: [t.opponent()], text: 'Sempre que você sacrifica uma ficha, o oponente alvo perde 1 ponto de vida.' }),
    ],
  }],
  rulings: {},
});
