// Thickest in the Thicket
// When this enchantment enters, put X +1/+1 counters on target creature, where X is that creature's power.
// At the beginning of your end step, draw two cards if you control the creature with the greatest power or tied for the
// greatest power.
import { addCounters, defineCard, draw, etb, on, power, t, tgt, triggered } from '../../motor/api.ts';
import { controlaMaiorForca } from '../dinossauros.ts';

export default defineCard({
  name: 'Thickest in the Thicket',
  faces: [{
    abilities: [
      // ruling 1: X é calculado uma vez, na resolução
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const x = power(c.g, id);
        if (x > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
      }, { targets: [t.creature()], text: 'Quando este encantamento entra, coloque X marcadores +1/+1 na criatura alvo, em que X é a força dela.' }),
      // ruling 2: dispara sempre; a condição é vista na resolução (não é "se" interveniente)
      triggered(on.endStep('you'), function* (c) {
        if (controlaMaiorForca(c.g, c.you)) yield* draw(c.g, c.you, 2);
      }, { text: 'No início da sua etapa final, compre duas cartas se você controla a criatura com a maior força ou empatada com a maior força.' }),
    ],
  }],
  rulings: {
    1: 'teste: dobra a força da criatura alvo com marcadores +1/+1',
    2: 'teste: na etapa final, compra duas se você tem a maior força (empate vale); senão, não',
  },
});
