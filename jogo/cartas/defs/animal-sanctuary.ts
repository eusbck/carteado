// Animal Sanctuary
// {T}: Add {C}.
// {2}, {T}: Put a +1/+1 counter on target Bird, Cat, Dog, Goat, Ox, or Snake.
import { activated, addCounters, chars, defineCard, mana, t, tgt } from '../../motor/api.ts';

const TIPOS = ['Bird', 'Cat', 'Dog', 'Goat', 'Ox', 'Snake'];

export default defineCard({
  name: 'Animal Sanctuary',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        // qualquer permanente com um desses subtipos (de qualquer jogador)
        targets: [t.permanent((ctx, id) => chars(ctx.g, id).subtypes.some((s) => TIPOS.includes(s)), 'Bird, Cat, Dog, Goat, Ox ou Snake alvo')],
        text: '{2}, {T}: Coloque um marcador +1/+1 no Bird, Cat, Dog, Goat, Ox ou Snake alvo.',
      }),
    ],
  }],
  rulings: {},
});
