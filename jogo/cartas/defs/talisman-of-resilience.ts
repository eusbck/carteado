// Talisman of Resilience
// {T}: Add {C}.
// {T}: Add {B} or {G}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Resilience',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['B', 'G'], {
        text: '{T}: Adicione {B} ou {G}. Este artefato causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
