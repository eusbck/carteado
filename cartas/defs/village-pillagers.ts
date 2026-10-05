// Village Pillagers
// Wither (This deals damage to creatures in the form of -1/-1 counters.)
// When this creature enters, it deals 1 damage to each creature your opponents control.
// Whenever a creature an opponent controls with a counter on it dies, you create a tapped Treasure token.
import { createTokens, creaturesOf, dealDamage, defineCard, etb, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Village Pillagers',
  faces: [{
    abilities: [
      keyword('wither'),
      // ruling 1: o dano dela também vira marcadores -1/-1
      etb(function* (c) {
        const alvos = c.g.opponents(c.you).flatMap((p) => creaturesOf(c.g, p));
        dealDamage(c.g, alvos.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 1, combat: false })));
      }, { text: 'Quando esta criatura entra, ela causa 1 de dano a cada criatura que seus oponentes controlam.' }),
      triggered(on.dies((c, l, o) => c.g.isOpponent(c.you, l.controller) && Object.values(o.counters).some((n) => n > 0)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1, { tapped: true });
      }, { text: 'Sempre que uma criatura com marcador que um oponente controla morre, você cria uma ficha de Tesouro virada.' }),
    ],
  }],
  rulings: { 1: 'teste: o dano ao entrar vira marcadores -1/-1 e as criaturas que morrem dão Tesouros' },
});
