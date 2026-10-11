// Mind's Dilation
// Whenever an opponent casts their first spell each turn, that player exiles the top card of their library. If it's a
// nonland card, you may cast it without paying its mana cost.
import { defineCard, exile, isLand, mayCastFree, nameOf, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Mind's Dilation",
  faces: [{
    abilities: [
      // a contagem do turno já inclui a mágica que acabou de ser conjurada
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player) && (c.g.state.turnStats[e.player]?.spellsCast ?? 0) === 1 ? { jogador: e.player } : false)), function* (c) {
        const p = c.event.jogador as PlayerId;
        const topo = c.g.state.zones.library[p][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // ruling 6: terreno (ou carta que você não quis conjurar) fica no exílio
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile' || isLand(c.g, ex)) return;
        // rulings 1-3: conjurada agora, na resolução, sem pagar o custo de mana (X = 0, sem custos alternativos)
        yield* mayCastFree(c.g, c.you, ex, `Mind's Dilation: conjurar ${nameOf(c.g, ex)} sem pagar o custo de mana?`);
      }, { text: 'Sempre que um oponente conjura a primeira mágica dele em cada turno, esse jogador exila a carta do topo do grimório dele. Se for uma carta que não é terreno, você pode conjurá-la sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2g — conjurada durante a resolução, sem as permissões de tempo do tipo (motor/mecanicas.ts mayCastFree)',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana não se combinam custos alternativos; os adicionais continuam (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    4: 'teste: na primeira mágica do oponente no turno, ele exila o topo do grimório e você pode conjurar a carta de graça',
    5: 'regra geral: CR 608.2n — a mágica instantânea ou de feitiço conjurada assim vai para o cemitério do dono ao resolver',
    6: 'teste: terreno exilado fica no exílio; a segunda mágica do turno não dispara',
  },
});
