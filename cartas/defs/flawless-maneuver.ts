// Flawless Maneuver
// If you control a commander, you may cast this spell without paying its mana cost.
// Creatures you control gain indestructible until end of turn.
import { controllerOf, creaturesOf, defineCard, untilEndOfTurn } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** ruling 1: o comandante de qualquer jogador serve, basta você controlá-lo */
function controlaComandante(c: SCtx): boolean {
  const s = c.g.state;
  return s.zones.battlefield.some((id) => {
    const o = s.objects[id];
    return controllerOf(c.g, id) === c.you && o.card !== null && !!s.cards[o.card]?.isCommander;
  });
}

export default defineCard({
  name: 'Flawless Maneuver',
  faces: [{
    // CR 118.9: custo alternativo sem mana; a condição vale ao começar a conjurar (ruling 2: depois ninguém age)
    altCosts: [{ key: 'comandante', label: 'sem pagar o custo de mana (você controla um comandante)', zone: 'hand', mana: '', condition: controlaComandante }],
    spell: {
      *effect(c) {
        // só as criaturas que você controla na resolução (CR 611.2c)
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {
    1: 'teste: o comandante de outro jogador que você controla também serve',
    2: 'regra geral: CR 601.2 — durante a conjuração ninguém recebe prioridade (motor/stack.ts)',
  },
});
