// Talisman of Creativity
// {T}: Add {C}.
// {T}: Add {U} or {R}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Creativity',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['U', 'R'], {
        text: '{T}: Adicione {U} ou {R}. Este artefato causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
