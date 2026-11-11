// Ultimate Magic: Holy
// Permanents you control gain indestructible until end of turn. If this spell was cast from exile, prevent all damage
// that would be dealt to you this turn.
// Foretell {2}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later
// turn for its foretell cost.)
import { defineAbility, defineCard, foretell, ruleEffect, staticAbility, untilEndOfTurn } from '../../motor/api.ts';

const predizer = foretell('{2}{W}');
// "previna todo o dano que seria causado a você neste turno" (CR 615.1)
const PREVENCAO = defineAbility('Ultimate Magic: Holy:prevencao', staticAbility({
  rules: { preventsDamage: (c, alvo) => alvo.kind === 'player' && alvo.id === c.you },
  text: 'Previna todo o dano que seria causado a você neste turno.',
}));

export default defineCard({
  name: 'Ultimate Magic: Holy',
  faces: [{
    altCosts: [predizer.altCost],
    abilities: [predizer.ability],
    spell: {
      *effect(c) {
        const ids = c.g.state.zones.battlefield.filter((id) => c.g.state.objects[id].controller === c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'indestructible' }]);
        if (c.g.state.objects[c.source]?.stack?.castFrom === 'exile') {
          ruleEffect(c, PREVENCAO.id!, { kind: 'endOfTurn' });
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — pelo custo de predizer não se escolhe outro custo alternativo (motor/stack.ts)',
    2: 'regra geral: CR 116.2h — predizer é ação especial no seu turno (testes/regras-predizer.test.ts)',
    3: 'regra geral: CR 702.143a — a carta predita segue o tempo do tipo dela (motor/priority.ts)',
  },
});
