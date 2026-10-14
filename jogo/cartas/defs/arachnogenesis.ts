// Arachnogenesis
// Create X 1/2 green Spider creature tokens with reach, where X is the number of creatures attacking you. Prevent all
// combat damage that would be dealt this turn by non-Spider creatures.
import { createTokens, defineAbility, defineCard, lkiChars, ruleEffect, staticAbility } from '../../motor/api.ts';

/** a prevenção da resolução: vale o turno todo e olha a fonte na hora do dano (CR 615.1) */
const PREVENCAO = defineAbility('Arachnogenesis:prevencao', staticAbility({
  rules: {
    preventsDamage: (c, _alvo, fonte, combate) => {
      if (!combate) return false;
      const ch = lkiChars(c.g, fonte);
      return !!ch && ch.types.includes('Creature') && !ch.subtypes.includes('Spider');
    },
  },
  text: 'Previna todo o dano de combate que seria causado neste turno por criaturas que não são Spider.',
}));

export default defineCard({
  name: 'Arachnogenesis',
  faces: [{
    spell: {
      *effect(c) {
        const combate = c.g.state.combat;
        const x = combate ? combate.attackers.filter((a) => !a.removed && c.g.state.objects[a.id] && a.target.kind === 'player' && a.target.id === c.you).length : 0;
        if (x > 0) yield* createTokens(c.g, c.you, 'Spider', x);
        ruleEffect(c, PREVENCAO.id!, { kind: 'endOfTurn' });
      },
    },
  }],
  rulings: {},
});
