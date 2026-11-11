// Ultimate Magic: Holy
// Permanents you control gain indestructible until end of turn. If this spell was cast from exile, prevent all damage
// that would be dealt to you this turn.
// Foretell {2}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later
// turn for its foretell cost.)
import { controllerOf, defineAbility, defineCard, foretell, ruleEffect, untilEndOfTurn } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

const predizer = foretell('{2}{W}');

// CR 615.1a: todo o dano que seria causado a você neste turno
const PREVINE = defineAbility<StaticDef>('Ultimate Magic: Holy:previne', {
  kind: 'static',
  rules: { preventsDamage: (c, alvo) => alvo.kind === 'player' && alvo.id === c.you },
  text: 'Previna todo o dano que seria causado a você neste turno.',
});

export default defineCard({
  name: 'Ultimate Magic: Holy',
  faces: [{
    // CR 702.143a: conjurar a carta predita do exílio pelo custo de predizer
    altCosts: [predizer.altCost],
    abilities: [predizer.ability],
    spell: {
      *effect(c) {
        // CR 611.2c: só as permanentes que você controla agora; as que entrarem depois não ganham
        const suas = c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you);
        if (suas.length) untilEndOfTurn(c, suas, [{ k: 'addKeyword', kw: 'indestructible' }]);
        // "se esta mágica foi conjurada do exílio" (a carta predita, por exemplo); uma cópia não foi conjurada
        if (c.g.state.objects[c.source]?.stack?.castFrom === 'exile') ruleEffect(c, PREVINE.id!, { kind: 'endOfTurn' });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a, 601.2b — pelo custo de predizer, não se escolhe outro custo alternativo; custos adicionais continuam (motor/stack.ts)',
    2: 'regra geral: CR 116.2h, 702.143b — predizer é ação especial, feita com prioridade no seu turno (testes/regras-predizer.test.ts)',
    3: 'teste: predita no seu turno, pode ser conjurada no turno do oponente pelo custo de predizer e previne o dano a você',
  },
});
