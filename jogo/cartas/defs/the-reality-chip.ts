// The Reality Chip
// You may look at the top card of your library any time.
// As long as The Reality Chip is attached to a creature, you may play lands and cast spells from the top of your library.
// Reconfigure {2}{U}
import { defineCard, reconfigure, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'The Reality Chip',
  faces: [{
    abilities: [
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const eu = c.g.state.objects[c.source];
            if (p !== c.you || !eu || eu.attachedTo === null || eu.attachedTo === undefined || c.g.state.zones.library[p][0] !== carta) return null;
            return { key: `reality-chip:${c.source}`, label: 'jogar do topo do grimório (The Reality Chip)', land: true };
          },
        },
        text: 'Enquanto The Reality Chip estiver anexado a uma criatura, você pode jogar terrenos e conjurar mágicas do topo do seu grimório.',
      }),
      // CR 702.151
      ...reconfigure('{2}{U}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2 — o tempo e os custos continuam os normais; só a zona muda (motor/priority.ts)',
    2: 'regra geral: CR 305.2 — jogar terreno do topo conta para o limite de terrenos do turno',
    3: 'regra geral: CR 702.151b — anexado, não é criatura',
  },
});
