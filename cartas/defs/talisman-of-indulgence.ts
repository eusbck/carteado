// Talisman of Indulgence
// {T}: Add {C}.
// {T}: Add {B} or {R}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Indulgence',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['B', 'R'], {
        text: '{T}: Adicione {B} ou {R}. Este artefato causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
