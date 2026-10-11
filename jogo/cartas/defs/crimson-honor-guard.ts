// Crimson Honor Guard
// Trample
// At the beginning of each player's end step, this creature deals 4 damage to that player unless they control a
// commander.
import { controlledBy, dealDamage, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Crimson Honor Guard',
  faces: [{
    abilities: [
      keyword('trample'),
      // ruling 1: dispara em toda etapa final; quem controla um comandante é conferido só na resolução
      triggered(on.endStep('each'), function* (c) {
        const p = c.g.state.turn.active;
        if (c.g.state.players[p].left) return;
        // ruling 3: vale o comandante de qualquer jogador; ruling 2: você também toma o dano
        const temComandante = controlledBy(c.g, p, (id) => { const o = c.g.state.objects[id]; return o.card !== null && !!c.g.state.cards[o.card]?.isCommander; }).length > 0;
        if (!temComandante) dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: p }, amount: 4, combat: false }]);
      }, { text: 'No início da etapa final de cada jogador, esta criatura causa 4 de dano a esse jogador, a menos que ele controle um comandante.' }),
    ],
  }],
  rulings: {
    1: 'teste: causa 4 de dano na etapa final de cada jogador que não controla um comandante, inclusive você',
    2: 'teste: causa 4 de dano na etapa final de cada jogador que não controla um comandante, inclusive você',
    3: 'regra geral: CR 903.3 — vale controlar o comandante de qualquer jogador (cartas/defs/crimson-honor-guard.ts)',
  },
});
