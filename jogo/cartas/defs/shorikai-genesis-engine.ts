// Shorikai, Genesis Engine
// {1}, {T}: Draw two cards, then discard a card. Create a 1/1 colorless Pilot creature token with "This token crews
// Vehicles as though its power were 2 greater."
// Crew 8 (Tap any number of creatures you control with total power 8 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { activated, crew, defineCard, discard, draw } from '../../motor/api.ts';
import { criaPiloto } from '../veiculos.ts';

export default defineCard({
  name: 'Shorikai, Genesis Engine',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) {
        yield* draw(c.g, c.you, 2);
        yield* discard(c.g, c.you, 1);
        yield* criaPiloto(c);
      }, { text: '{1}, {T}: Compre duas cartas e depois descarte uma carta. Crie uma ficha de criatura Pilot incolor 1/1 com "Esta ficha tripula Veículos como se a força dela fosse 2 maior."' }),
      crew(8),
    ],
  }],
  rulings: {},
});
