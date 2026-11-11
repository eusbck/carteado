// Koth, the Geomancer
// Reach
// Landfall — Whenever a land you control enters, Koth deals 1 damage to each opponent. If that land is a Mountain, add {R}.
import { addMana, controllerOf, dealDamage, defineCard, isLand, isSubtype, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Koth, the Geomancer',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { terra: e.obj } : false)), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
        const terra = c.event.terra as ObjId;
        // "se esse terreno for uma Mountain": pela última informação se ele saiu
        const montanha = c.g.state.objects[terra]?.zone === 'battlefield' ? isSubtype(c.g, terra, 'Mountain') : !!c.g.state.lki[terra]?.chars.subtypes.includes('Mountain');
        if (montanha) addMana(c.g, c.you, ['R'], { source: c.source });
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, Koth causa 1 de dano a cada oponente. Se esse terreno for uma Mountain, adicione {R}.' }),
    ],
  }],
  rulings: {},
});
