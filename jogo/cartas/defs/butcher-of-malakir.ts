// Butcher of Malakir
// Flying
// Whenever this creature or another creature you control dies, each opponent sacrifices a creature of their choice.
import { defineCard, eachSacrifices, isCreature, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Butcher of Malakir',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 2: um gatilho para cada criatura sua que morre, inclusive ele mesmo (olha para trás, CR 603.10a)
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        // ruling 1: os oponentes escolhem em ordem de turno e sacrificam ao mesmo tempo
        yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id), 1, 'uma criatura');
      }, { text: 'Sempre que esta criatura ou outra criatura que você controla morre, cada oponente sacrifica uma criatura à escolha dele.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 101.4 — os oponentes escolhem em ordem de turno e sacrificam ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
    2: 'teste: quando uma criatura sua morre, cada oponente sacrifica uma criatura; duas mortes, dois gatilhos',
    3: 'regra geral: CR 603.2 — cada Butcher of Malakir dispara em separado',
    4: 'regra geral: CR 603.2 — com um Butcher de cada lado os sacrifícios disparam em cadeia até um lado ficar sem criaturas',
  },
});
