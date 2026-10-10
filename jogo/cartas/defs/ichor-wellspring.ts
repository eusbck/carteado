// Ichor Wellspring
// When this artifact enters or is put into a graveyard from the battlefield, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Ichor Wellspring",
  faces: [{ abilities: [triggered(on.custom((e, c) => e.type === 'zone' && ((e.to === 'battlefield' && e.obj === c.source) || (e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source))), function*(c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando entra ou vai do campo ao cemitério, compre uma carta.' })] }],
  rulings: {
    "1": "CR 603.10: teste: o gatilho de morte independe da resolução do gatilho de entrada."
  },
});
