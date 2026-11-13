// Expel the Interlopers
// Choose a number between 0 and 10. Destroy all creatures with power greater than or equal to the chosen number.
import { allCreatures, chooseNumber, defineCard, destroy, power } from '../../motor/api.ts';
import { jog, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Expel the Interlopers',
  faces: [{
    spell: {
      *effect(c) {
        const n = yield* chooseNumber(c.g, c.you, 'Expel the Interlopers: escolha um número de 0 a 10', 0, 10);
        reg(c.g, 'outro')`${jog(c.you)} escolhe ${n}.`;
        yield* destroy(c.g, allCreatures(c.g).filter((id) => power(c.g, id) >= n));
      },
    },
  }],
  rulings: { 1: 'teste: o número escolhido pode ser de 0 a 10' },
});
