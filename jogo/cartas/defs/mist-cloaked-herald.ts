// Mist-Cloaked Herald
// This creature can't be blocked.
import { defineCard } from '../../motor/api.ts';
import { naoPodeSerBloqueada } from '../ninjas.ts';

export default defineCard({
  name: 'Mist-Cloaked Herald',
  faces: [{ abilities: [naoPodeSerBloqueada()] }],
  rulings: {},
});
