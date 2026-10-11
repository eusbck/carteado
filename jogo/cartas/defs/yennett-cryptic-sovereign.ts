// Yennett, Cryptic Sovereign
// Flying, vigilance, menace
// Whenever Yennett attacks, reveal the top card of your library. You may cast it without paying its mana cost if its
// mana value is odd. If you don't cast it, draw a card.
import { defineCard, draw, keywords, manaValue, mayCastFree, nameOf, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Yennett, Cryptic Sovereign',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance', 'menace'),
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you][0];
        let conjurou = false;
        if (topo !== undefined) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, topo)} do topo do grimório.`, { rule: '701.20' });
          // ruling 4: só agora, durante a resolução; rulings 2-3 são do motor (sem custo alternativo, X = 0)
          if (manaValue(c.g, topo) % 2 === 1) conjurou = yield* mayCastFree(c.g, c.you, topo, `Yennett: conjurar ${nameOf(c.g, topo)} sem pagar o custo de mana?`);
        }
        // ruling 1: revelar não muda a carta de zona; a carta comprada é a revelada
        if (!conjurou) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que Yennett ataca, revele a carta do topo do seu grimório. Você pode conjurá-la sem pagar o custo de mana se o valor de mana dela for ímpar. Se não a conjurar, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: com valor de mana par, ou recusando, você compra a carta revelada',
    2: 'regra geral: CR 118.9a — sem pagar o custo de mana não há custo alternativo (motor/stack.ts, conjurar com free)',
    3: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    4: 'teste: com valor de mana ímpar, você conjura a carta revelada de graça durante a resolução e não compra',
    5: 'regra geral: CR 508.1 — os atacantes já foram declarados quando o gatilho resolve (motor/combat.ts)',
  },
});
