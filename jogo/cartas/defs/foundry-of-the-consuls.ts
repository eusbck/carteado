// Foundry of the Consuls
// {T}: Add {C}.
// {5}, {T}, Sacrifice this land: Create two 1/1 colorless Thopter artifact creature tokens with flying.
import { activated, createTokens, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Foundry of the Consuls",
  faces: [{ abilities: [mana('C'), activated('{5}, {T}, Sacrifice this land', function*(c) { yield* createTokens(c.g, c.you, 'Thopter', 2); }, { text: '{5}, {T}, Sacrifique este terreno: crie dois Thopter incolores 1/1 com voar.' })] }],
  rulings: {},
});
