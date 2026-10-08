// Pest Rescuer
// At the beginning of each upkeep, if you don't control a Pest creature token, create a 1/1 black and green Pest
// creature token with "When this token dies, you gain 1 life."
// If you would gain life, you gain that much life plus 1 instead.
import { controlledBy, createTokens, defineCard, isCreature, isSubtype, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pest Rescuer',
  faces: [{
    abilities: [
      triggered(on.upkeep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Pest', 1); }, {
        // ruling 1: "se" interveniente (CR 603.4)
        condition: (c) => controlledBy(c.g, c.you, (id) => c.g.state.objects[id].isToken && isCreature(c.g, id) && isSubtype(c.g, id, 'Pest')).length === 0,
        text: 'No início de cada manutenção, se você não controla uma ficha de criatura Pest, crie uma ficha de criatura Pest preta e verde 1/1 com "Quando esta ficha morre, você ganha 1 de vida."',
      }),
      // CR 614.1a: substituição do ganho de vida
      staticAbility({ rules: { lifeGainBonus: (c, p) => (p === c.you ? 1 : 0) }, text: 'Se você fosse ganhar vida, em vez disso, você ganha essa quantidade mais 1.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 603.4: com uma ficha Pest, não dispara',
    2: 'teste: ganho "para cada" é um evento só: +1 uma vez',
    3: 'regra geral: CR 120.3 — cada fonte com vínculo com a vida é um evento de ganho de vida',
    4: 'teste: dois Pest Rescuers somam +2',
  },
});
