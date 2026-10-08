// Talisman of Dominance
// {T}: Add {C}.
// {T}: Add {U} or {B}. This artifact deals 1 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Talisman of Dominance',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana(['U', 'B'], {
        text: '{T}: Adicione {U} ou {B}. Este artefato causa 1 de dano a você.',
        // CR 120.3a: dano a um jogador faz ele perder essa quantidade de vida
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
