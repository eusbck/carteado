// Woe Strider
// When this creature enters, create a 0/1 white Goat creature token.
// Sacrifice another creature: Scry 1.
// Escape—{3}{B}{B}, Exile four other cards from your graveyard.
// This creature escapes with two +1/+1 counters on it.
import { activated, asEnters, createTokens, defineCard, escape, etb, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Woe Strider',
  faces: [{
    // rulings 1-7: fuga é custo alternativo de conjurar do cemitério (CR 702.138)
    altCosts: [escape('{3}{B}{B}', 4)],
    abilities: [
      // CR 702.138c: "foge com" — só quando conjurada com fuga
      asEnters((_c, ev) => { if (ev.spell?.method === 'escape') ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 2; }, 'Esta criatura foge com dois marcadores +1/+1.'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Goat', 1); }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Goat branca 0/1.' }),
      activated('Sacrifice another creature', function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'scry'); }, { text: 'Sacrifique outra criatura: Vidência 1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — sem outro custo alternativo',
    2: 'regra geral: CR 601.2 — vai para a pilha ao começar a conjurar',
    3: 'regra geral: CR 117.3 — o jogador ativo recebe prioridade primeiro',
    4: 'regra geral: CR 601.2b — escolhe uma permissão só',
    5: 'regra geral: CR 601.2f — custo total; valor de mana não muda',
    6: 'teste: depois de fugir, entra com dois marcadores e volta ao cemitério ao morrer',
    7: 'regra geral: CR 702.138a — respeita o tempo da carta',
  },
});
