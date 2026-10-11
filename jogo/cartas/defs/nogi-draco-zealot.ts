// Nogi, Draco-Zealot
// Dragon spells you cast cost {1} less to cast.
// Whenever Nogi attacks, if you control three or more Dragons, until end of turn, Nogi becomes a Dragon with base power
// and toughness 5/5 and gains flying.
import { chars, controlledBy, defineCard, on, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const dragoes = (g: G, p: PlayerId): number => controlledBy(g, p, (id) => chars(g, id).subtypes.includes('Dragon')).length;

export default defineCard({
  name: 'Nogi, Draco-Zealot',
  faces: [{
    abilities: [
      // CR 601.2f: reduz só a parte genérica do custo total
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Dragon') ? { reduce: 1 } : null) },
        text: 'As mágicas de Dragon que você conjura custam {1} a menos.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        // CR 205.1a: "torna-se um Dragon" troca os tipos de criatura; os tipos de carta e os supertipos ficam
        untilEndOfTurn(c, [c.source], [
          { k: 'setTypes', types: [...chars(c.g, c.source).types], subtypes: ['Dragon'], keepSupertypes: true },
          { k: 'setPT', p: 5, t: 5 },
          { k: 'addKeyword', kw: 'flying' },
        ]);
      }, {
        // CR 603.4: cláusula "se" interveniente, conferida ao disparar e ao resolver
        condition: (c) => dragoes(c.g, c.you) >= 3,
        text: 'Sempre que Nogi ataca, se você controla três ou mais Dragons, até o fim do turno, Nogi se torna um Dragon com força e resistência básicas 5/5 e ganha voar.',
      }),
    ],
  }],
  rulings: {},
});
