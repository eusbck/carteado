// Imperial Recovery Unit
// Whenever this Vehicle attacks, return target creature or Vehicle card with mana value 2 or less from your graveyard to
// your hand.
// Crew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, isCreature, manaValue, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';
import { ehVeiculo } from '../veiculos.ts';

export default defineCard({
  name: 'Imperial Recovery Unit',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => (isCreature(c.g, id) || ehVeiculo(c.g, id)) && manaValue(c.g, id) <= 2, 'carta de criatura ou de Veículo alvo com valor de mana 2 ou menos no seu cemitério')],
        text: 'Sempre que este Veículo ataca, devolva a carta de criatura ou de Veículo alvo com valor de mana 2 ou menos do seu cemitério para a sua mão.',
      }),
      crew(2),
    ],
  }],
  rulings: {},
});
