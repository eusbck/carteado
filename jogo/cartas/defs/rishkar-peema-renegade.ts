// Rishkar, Peema Renegade
// When Rishkar enters, put a +1/+1 counter on each of up to two target creatures.
// Each creature you control with a counter on it has "{T}: Add {G}."
import { addCounters, and, anthem, defineAbility, defineCard, etb, is, mana, t, tgtsAll, upTo } from '../../motor/api.ts';

const MANA_G = defineAbility('Rishkar, Peema Renegade:mana', mana('G', { text: '{T}: Adicione {G}.' }));

export default defineCard({
  name: 'Rishkar, Peema Renegade',
  faces: [{
    abilities: [
      // dois alvos diferentes (ruling 2); Rishkar pode ser um deles (ruling 1)
      etb(function* (c) {
        for (const id of tgtsAll(c, 0)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [upTo(2, t.creature(undefined, 'até duas criaturas alvo'))], text: 'Quando Rishkar entra, coloque um marcador +1/+1 em cada uma de até duas criaturas alvo.' }),
      // qualquer tipo de marcador vale (ruling 3)
      anthem(and(is.creature, is.yours, is.withCounter()), () => [{ k: 'addAbility', id: MANA_G.id! }], 'Cada criatura que você controla com um marcador tem "{T}: Adicione {G}."'),
    ],
  }],
  rulings: {
    1: 'teste: põe um marcador +1/+1 em até duas criaturas, Rishkar incluído, e elas ganham {T}: Adicione {G}',
    2: 'regra geral: CR 115.3 — o mesmo objeto não pode ser escolhido duas vezes para a mesma palavra "alvo" (motor/stack.ts)',
    3: 'teste: qualquer marcador vale, não só +1/+1',
  },
});
