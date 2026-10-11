// Underworld Connections
// Enchant land
// Enchanted land has "{T}, Pay 1 life: Draw a card."
import { activated, attachedGets, defineAbility, defineCard, draw, t } from '../../motor/api.ts';

const COMPRA = defineAbility('Underworld Connections:compra', activated('{T}, Pay 1 life', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{T}, Pague 1 de vida: Compre uma carta.' }));

export default defineCard({
  name: 'Underworld Connections',
  faces: [{
    enchant: t.land(undefined, 'terreno'),
    abilities: [
      // quem ativa é o controlador do terreno, não o da Aura
      attachedGets(() => [{ k: 'addAbility', id: COMPRA.id! }], 'O terreno encantado tem "{T}, Pague 1 de vida: Compre uma carta."'),
    ],
  }],
  rulings: {},
});
