// Nevinyrral's Disk
// This artifact enters tapped.
// {1}, {T}: Destroy all artifacts, creatures, and enchantments.
import { activated, chars, defineCard, destroy, entersTapped, permanentsMatching } from '../../motor/api.ts';

export default defineCard({
  name: "Nevinyrral's Disk",
  faces: [{ abilities: [entersTapped(), activated('{1}, {T}', function*(c) { yield* destroy(c.g, permanentsMatching(c.g, (id) => chars(c.g, id).types.some((type) => ['Artifact', 'Creature', 'Enchantment'].includes(type)))); }, { text: '{1}, {T}: destrua todos os artefatos, criaturas e encantamentos.' })] }],
  rulings: {
    "1": "CR 701.7: teste: o disco é destruído na resolução, não sacrificado no custo; permanentes indestrutíveis sobrevivem."
  },
});
