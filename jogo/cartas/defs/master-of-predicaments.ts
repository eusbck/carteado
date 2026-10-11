// Master of Predicaments
// Flying
// Whenever this creature deals combat damage to a player, choose a card in your hand. That player guesses whether the
// card's mana value is greater than 4. If the player guessed wrong, you may cast the card without paying its mana cost.
import { chooseItems, defineCard, keyword, manaValue, mayCastFree, nameOf, objItem, on, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Master of Predicaments',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const p = c.event.player as PlayerId;
        const mao = s.zones.hand[c.you];
        if (!mao.length || s.players[p].left) return;
        // ruling 4: a carta é separada sem ser revelada
        const [esc] = yield* chooseItems(c.g, c.you, 'Master of Predicaments: escolha uma carta da sua mão', mao.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const carta = Number(esc);
        // ruling 1: o valor de mana da carta dividida é a soma das duas metades (motor/chars.ts)
        const maior = manaValue(c.g, carta) > 4;
        const palpite = yield* yesNo(c.g, p, `Master of Predicaments: o valor de mana da carta que ${s.players[c.you].name} escolheu é maior que 4?`, 'Maior que 4', '4 ou menos');
        // ruling 3: sem conjurar, a carta não é revelada, e o registro não diz se o palpite estava certo
        c.g.log(`${s.players[p].name} diz que o valor de mana é ${palpite ? 'maior que 4' : '4 ou menos'}.`);
        if (palpite === maior) return;
        // rulings 2, 5-7: conjurada agora, sem custo alternativo e com X = 0; terreno não pode ser jogado
        yield* mayCastFree(c.g, c.you, carta, `Master of Predicaments: o palpite estava errado. Conjurar ${nameOf(c.g, carta)} sem pagar o custo de mana?`);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, escolha uma carta na sua mão. Esse jogador diz se o valor de mana da carta é maior que 4. Se errar, você pode conjurar a carta sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 709.4b — o valor de mana da carta dividida fora da pilha é a soma das metades (motor/formatos.ts)',
    2: 'teste: um terreno escolhido não pode ser jogado, mesmo com o palpite errado',
    3: 'teste: com o palpite certo, a carta fica na mão',
    4: 'regra geral: CR 402.3 — a mão é zona oculta: a escolha é feita só para você (motor/ask.ts)',
    5: 'teste: com o palpite errado, você conjura a carta de graça durante a resolução',
    6: 'regra geral: CR 118.9a — sem pagar o custo de mana não há custo alternativo (motor/stack.ts, conjurar com free)',
    7: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
  },
});
