// Gene Pollinator
// {T}, Tap an untapped permanent you control: Add one mana of any color.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gene Pollinator',
  faces: [{ abilities: [{
    ...mana('any', { text: '{T}, Vire uma permanente desvirada que você controla: Adicione uma mana de qualquer cor.' }),
    // CR 118.3, 302.6: {T} exige que esta criatura esteja pronta; a outra permanente pode ter enjoo.
    cost: [{ k: 'tap' }, { k: 'tapPermanents', n: 1, filter: () => true, label: 'permanente desvirada' }],
  }] }],
  rulings: { 1: 'teste: pode virar qualquer permanente sua, inclusive criatura com enjoo, mas a própria precisa estar pronta' },
});
