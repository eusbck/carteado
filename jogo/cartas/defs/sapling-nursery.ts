// Sapling Nursery
// Affinity for Forests (This spell costs {1} less to cast for each Forest you control.)
// Landfall — Whenever a land you control enters, create a 3/4 green Treefolk creature token with reach.
// {1}{G}, Exile this enchantment: Treefolk and Forests you control gain indestructible until end of turn.
import { activated, chars, controlledBy, createTokens, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Sapling Nursery',
  faces: [{
    // CR 702.41a: cada Forest seu reduz {1}, inclusive não básico e virado; nunca reduz {G}{G}.
    selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Forest')).length }),
    abilities: [
      { kind: 'static', kw: 'affinity', param: 'Forest', text: 'Afinidade por Florestas (Esta mágica custa {1} a menos para ser conjurada para cada Floresta que você controla.)' },
      triggered(on.landfall(), function* (c) {
        yield* createTokens(c.g, c.you, 'Treefolk', 1);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, crie uma ficha de criatura verde 3/4 do tipo Ent com alcance.' }),
      activated('{1}{G}, Exile this enchantment', function* (c) {
        // CR 611.2c: as permanentes afetadas são fixadas na resolução, mesmo com a fonte já exilada como custo.
        const ids = controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.some((s) => s === 'Treefolk' || s === 'Forest'));
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: '{1}{G}, exile este encantamento: Ents e Florestas que você controla ganham indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: cria uma ficha verde de Ent 3/4 com alcance por terreno seu que entra',
    2: 'regra geral: CR 603.6a — aterragem só dispara na entrada no campo (motor/dsl.ts on.landfall)',
    3: 'regra geral: CR 603.3b — o controlador ordena os gatilhos simultâneos (motor/stack.ts)',
  },
});
