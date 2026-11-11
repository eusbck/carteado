// Tannuk, Steadfast Second
// Other creatures you control have haste.
// Artifact cards and red creature cards in your hand have warp {2}{R}. (You may cast a card from your hand for its warp
// cost. Exile that permanent at the beginning of the next end step, then you may cast it from exile on a later turn.)
import { anthem, controllerOf, defineCard, ehArtefatoOuCriaturaVermelha, isCreature, staticAbility, warpPermission } from '../../motor/api.ts';

const DOBRA = warpPermission('{2}{R}');

export default defineCard({
  name: 'Tannuk, Steadfast Second',
  faces: [{
    abilities: [
      anthem((c, id) => id !== c.source && isCreature(c.g, id) && controllerOf(c.g, id) === c.you, () => [{ k: 'addKeyword', kw: 'haste' }], 'As outras criaturas que você controla têm ímpeto.'),
      // dobra (CR 702.185a): custo alternativo da mão; o gatilho de exilar e a permissão de conjurar do exílio ficam no
      // motor e valem mesmo que Tannuk saia do campo
      staticAbility({
        rules: {
          mayPlayFrom: (c, jogador, carta) => {
            const o = c.g.state.objects[carta];
            if (jogador !== c.you || !o || o.zone !== 'hand' || o.owner !== jogador || !ehArtefatoOuCriaturaVermelha(c.g, carta)) return null;
            return DOBRA;
          },
        },
        text: 'As cartas de artefato e as cartas de criatura vermelhas na sua mão têm dobra {2}{R}. (Você pode conjurar uma carta da sua mão pelo custo de dobra. Exile esse permanente no início da próxima etapa final; depois você pode conjurá-lo do exílio num turno posterior.)',
      }),
    ],
  }],
  rulings: {},
});
