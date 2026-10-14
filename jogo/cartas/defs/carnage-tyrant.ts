// Carnage Tyrant
// This spell can't be countered.
// Trample, hexproof
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Carnage Tyrant',
  faces: [{
    // CR 101.2, 113.6g: funciona na pilha
    cantBeCountered: true,
    abilities: keywords('trample', 'hexproof'),
  }],
  rulings: {},
});
