// Talisman of Progress
// {T}: Add {C}.
// {T}: Add {W} or {U}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Progress',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['W', 'U'], {
        text: '{T}: Adicione {W} ou {U}. Este artefato causa 1 de dano a você.',
        // CR 120.3a: dano a um jogador faz ele perder essa quantidade de vida
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
