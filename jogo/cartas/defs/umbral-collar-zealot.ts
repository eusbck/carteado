// Umbral Collar Zealot
// Sacrifice another creature or artifact: Surveil 1.
import { activated, defineCard, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Umbral Collar Zealot',
  faces: [{
    abilities: [activated('Sacrifice another creature or artifact', function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, {
      text: 'Sacrifique outra criatura ou artefato: Vigiar 1.',
    })],
  }],
  rulings: {},
});
