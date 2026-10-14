// Squirrel Nest
// Enchant land
// Enchanted land has "{T}: Create a 1/1 green Squirrel creature token."
import { activated, attachedGets, createTokens, defineAbility, defineCard, t } from '../../motor/api.ts';

// a habilidade concedida ao terreno: quem a ativa é quem controla o terreno
const ESQUILO = defineAbility('Squirrel Nest:esquilo', activated('{T}', function* (c) {
  yield* createTokens(c.g, c.you, 'Squirrel', 1);
}, { text: '{T}: Crie uma ficha de criatura Squirrel verde 1/1.' }));

export default defineCard({
  name: 'Squirrel Nest',
  faces: [{
    enchant: t.land(undefined, 'terreno'),
    abilities: [
      attachedGets(() => [{ k: 'addAbility', id: ESQUILO.id! }], 'O terreno encantado tem "{T}: Crie uma ficha de criatura Squirrel verde 1/1."'),
    ],
  }],
  rulings: {},
});
