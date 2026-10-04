// Talisman of Conviction
// {T}: Add {C}.
// {T}: Add {R} or {W}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Conviction',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['R', 'W'], {
        text: '{T}: Adicione {R} ou {W}. Este artefato causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
