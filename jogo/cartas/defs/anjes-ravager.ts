// Anje's Ravager
// This creature attacks each combat if able.
// Whenever this creature attacks, discard your hand, then draw three cards.
// Madness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it
// into your graveyard.)
import { defineCard, discard, draw, madness, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Anje's Ravager",
  faces: [{
    abilities: [
      staticAbility({ rules: { attacksIfAble: (c, id) => id === c.source }, text: 'Esta criatura ataca a cada combate se puder.' }),
      triggered(on.selfAttacks(), function* (c) {
        const mao = c.g.state.zones.hand[c.you].length;
        if (mao > 0) yield* discard(c.g, c.you, mao);
        // ruling 10: compra três mesmo sem ter descartado nada
        yield* draw(c.g, c.you, 3);
      }, { text: 'Sempre que esta criatura ataca, descarte a sua mão e depois compre três cartas.' }),
      // CR 702.35: descartada, vai para o exílio e pode ser conjurada por {1}{R}
      madness('{1}{R}'),
    ],
  }],
  rulings: {
    1: 'teste: descartada durante a resolução, vai para o exílio e a loucura vem depois',
    2: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    3: 'teste: sem conjurar, vai para o cemitério',
    4: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima da mágica paga com o descarte (testes/regras-conjurar.test.ts)',
    5: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    6: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    7: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    8: 'teste: conjurada pela loucura, entra no campo',
    9: 'teste: conjurada pela loucura no turno de outro jogador',
    10: 'teste: compra três mesmo sem cartas na mão',
    11: 'teste: descartada durante a resolução, vai para o exílio e a loucura vem depois',
    12: 'regra geral: CR 508.1d — a exigência de ataque só vale se puder atacar (motor/combat.ts)',
  },
});
