// Prodigy's Prototype
// Whenever one or more Vehicles you control attack, create a 1/1 colorless Pilot creature token with "This token crews
// Vehicles as though its power were 2 greater."
// Crew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { controllerOf, crew, defineCard, on, triggered } from '../../motor/api.ts';
import { criaPiloto, ehVeiculo } from '../veiculos.ts';

export default defineCard({
  name: "Prodigy's Prototype",
  faces: [{
    abilities: [
      // "um ou mais": uma vez por declaração de ataque
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((a) => ehVeiculo(c.g, a.obj) && controllerOf(c.g, a.obj) === c.you)), function* (c) {
        yield* criaPiloto(c);
      }, { text: 'Sempre que um ou mais Veículos que você controla atacam, crie uma ficha de criatura Pilot incolor 1/1 com "Esta ficha tripula Veículos como se a força dela fosse 2 maior."' }),
      crew(2),
    ],
  }],
  rulings: {},
});
