// Shalai, Voice of Plenty
// Flying
// You, planeswalkers you control, and other creatures you control have hexproof.
// {4}{G}{G}: Put a +1/+1 counter on each creature you control.
import { activated, addCounters, creaturesOf, defineCard, isCreature, isType, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Shalai, Voice of Plenty',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && o.id !== c.source && (isCreature(c.g, o.id) || isType(c.g, o.id, 'Planeswalker')),
        mods: () => [{ k: 'addKeyword', kw: 'hexproof' }],
        // CR 702.11c: você tem resistência a magia
        rules: { playerHexproof: (c, p) => p === c.you },
        text: 'Você, os planeswalkers que você controla e as outras criaturas que você controla têm resistência a magia.',
      }),
      activated('{4}{G}{G}', function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: '{4}{G}{G}: Coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
});
