// Indomitable Archangel
// Flying
// Metalcraft — Artifacts you control have shroud as long as you control three or more artifacts. (An artifact with
// shroud can't be the target of spells or abilities.)
import { and, controlledBy, defineCard, is, isType, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Indomitable Archangel',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        // metalcraft (CR 702 — palavra de habilidade): três ou mais artefatos
        condition: (c) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length >= 3,
        affects: (c, o) => and(is.yours, is.artifact)(c, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'shroud' }],
        text: 'Metalurgia — Os artefatos que você controla têm manto enquanto você controlar três ou mais artefatos.',
      }),
    ],
  }],
  rulings: {},
});
