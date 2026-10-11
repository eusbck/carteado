// The Elder Dragon War
// Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters
// don't trigger. Sacrifice after III.)
// I — This Saga deals 2 damage to each creature and each opponent.
// II — Discard any number of cards, then draw that many cards.
// III — Create a 4/4 red Dragon creature token with flying.
import { allCreatures, chapter, chooseItems, createTokens, dealDamage, defineCard, discard, draw, nameOf, objItem, readAhead } from '../../motor/api.ts';

export default defineCard({
  name: 'The Elder Dragon War',
  faces: [{
    abilities: [
      // CR 702.155a, 714.3b: escolhe o capítulo ao entrar; os capítulos pulados não disparam
      ...readAhead(3),
      chapter([1], function* (c) {
        dealDamage(c.g, [
          ...allCreatures(c.g).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 2, combat: false })),
          ...c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })),
        ]);
      }, { text: 'I — Esta Saga causa 2 de dano a cada criatura e a cada oponente.' }),
      chapter([2], function* (c) {
        const mao = c.g.state.zones.hand[c.you];
        const esc = mao.length ? yield* chooseItems(c.g, c.you, 'The Elder Dragon War: descarte quantas cartas quiser (você compra essa mesma quantidade)', mao.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, mao.length) : [];
        const fora = esc.length ? yield* discard(c.g, c.you, esc.length, { filter: (id) => esc.includes(String(id)) }) : [];
        if (fora.length) yield* draw(c.g, c.you, fora.length);
      }, { text: 'II — Descarte qualquer número de cartas e depois compre essa mesma quantidade de cartas.' }),
      chapter([3], function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon 4/4', 1);
      }, { text: 'III — Crie uma ficha de criatura Dragon 4/4 vermelha com voar.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças não é jogado nesta mesa',
    2: 'teste: CR 702.155a: entrando no capítulo III, só ele dispara, e a Saga é sacrificada depois',
  },
});
