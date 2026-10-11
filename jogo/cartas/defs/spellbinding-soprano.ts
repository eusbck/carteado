// Spellbinding Soprano
// Whenever this creature attacks, instant and sorcery spells you cast this turn cost {1} less to cast.
// Encore {3}{R} ({3}{R}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that
// opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a
// sorcery.)
import { defineAbility, defineCard, encore, on, ruleEffect, triggered } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

// "as mágicas instantâneas e feitiços que você conjura neste turno custam {1} a menos" (CR 601.2f: só a parte genérica)
const DESCONTO = defineAbility<StaticDef>('Spellbinding Soprano:desconto', {
  kind: 'static',
  rules: {
    costModifier: (c, spell) => {
      const quem = (c as SCtx & { params?: { player: PlayerId } }).params?.player;
      return spell.controller === quem && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null;
    },
  },
});

export default defineCard({
  name: 'Spellbinding Soprano',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        ruleEffect(c, DESCONTO.id!, { kind: 'endOfTurn' }, { params: { player: c.you } });
      }, { text: 'Sempre que esta criatura ataca, as mágicas instantâneas e os feitiços que você conjura neste turno custam {1} a menos.' }),
      // CR 702.141a
      encore('{3}{R}'),
    ],
  }],
  rulings: {},
});
