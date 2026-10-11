// Cordial Vampire
// Whenever this creature or another creature dies, put a +1/+1 counter on each Vampire you control.
import { addCounters, controlledBy, defineCard, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Cordial Vampire',
  faces: [{
    abilities: [
      // ruling 1: dispara para cada criatura que morre, inclusive ele; ruling 2: quem morreu junto não recebe o marcador
      triggered(on.dies(() => true), function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Vampire'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que esta criatura ou outra criatura morre, coloque um marcador +1/+1 em cada Vampire que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: duas criaturas morrendo juntas dão dois marcadores a cada Vampire seu',
    2: 'regra geral: CR 704.3 — o Vampire que tomou dano letal junto morre antes de o gatilho resolver e não recebe o marcador',
  },
});
