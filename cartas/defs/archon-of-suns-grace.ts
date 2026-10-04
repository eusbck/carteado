// Archon of Sun's Grace
// Flying
// Lifelink
// Pegasus creatures you control have lifelink.
// Constellation — Whenever an enchantment you control enters, create a 2/2 white Pegasus creature token with flying.
import { and, anthem, createTokens, defineCard, is, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Archon of Sun's Grace",
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      anthem(and(is.creature, is.subtype('Pegasus'), is.yours), () => [{ k: 'addKeyword', kw: 'lifelink' }], 'As criaturas Pegasus que você controla têm vínculo com a vida.'),
      triggered(on.enters(and(is.enchantment, is.yours)), function* (c) { yield* createTokens(c.g, c.you, 'Pegasus', 1); }, {
        text: 'Constelação — Sempre que um encantamento que você controla entra, crie uma ficha de criatura Pegasus branca 2/2 com voar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.15f — várias instâncias de vínculo com a vida são redundantes',
    2: 'teste: encantamento criatura também dispara a constelação',
    3: 'regra geral: CR 608.2b — Aura com alvo ilegal não resolve nem entra',
  },
});
