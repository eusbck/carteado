// Killian, Ink Duelist — Lifelink. Menace. Spells you cast that target a creature cost {2} less to cast.
import { defineCard, isCreature, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Killian, Ink Duelist',
  faces: [{
    abilities: [
      ...keywords('lifelink', 'menace'),
      staticAbility({
        text: 'Mágicas que você conjura que tenham uma criatura como alvo custam {2} a menos.',
        rules: {
          // CR 601.2f: o custo é calculado depois dos alvos (601.2c)
          costModifier: (c, spell) => (spell.controller === c.you && spell.targets.flat().some((t) => t.kind === 'obj' && c.g.state.objects[t.id] && isCreature(c.g, t.id)) ? { reduce: 2 } : null),
        },
      }),
    ],
  }],
});
