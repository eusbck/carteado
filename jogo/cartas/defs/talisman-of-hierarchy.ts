// Talisman of Hierarchy
// {T}: Add {C}.
// {T}: Add {W} or {B}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Hierarchy',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['W', 'B'], {
        text: '{T}: Adicione {W} ou {B}. Este artefato causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
