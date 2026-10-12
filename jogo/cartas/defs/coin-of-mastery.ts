// Coin of Mastery
// Each creature you control enters with an additional +1/+1 counter on it for each mana from an artifact source spent
// to cast it.
// {T}: Create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")
import { activated, createTokens, defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Coin of Mastery',
  faces: [{
    abilities: [
      // CR 614.1c: substituição sobre como a criatura entra; a mana de fontes que são artefatos é contada ao conjurar
      staticAbility({
        rules: {
          enterModifier: (c, ev, vaiSer) => {
            const n = ev.spell?.manaSpent?.fromArtifacts ?? 0;
            if (ev.controller !== c.you || n <= 0 || !vaiSer.types.includes('Creature')) return;
            ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + n;
          },
        },
        text: 'Cada criatura que você controla entra com um marcador +1/+1 adicional para cada mana de uma fonte que é artefato gasta para conjurá-la.',
      }),
      activated('{T}', function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, { text: '{T}: Crie uma ficha Treasure.' }),
    ],
  }],
  rulings: {},
});