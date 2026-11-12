// Grave Pact
// Whenever a creature you control dies, each other player sacrifices a creature of their choice.
import { defineCard, eachSacrifices, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Grave Pact',
  faces: [{
    abilities: [
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        // ruling 1: escolhas em ordem APNAP, sacrifícios ao mesmo tempo; ruling 2: sem alvo
        yield* eachSacrifices(c, c.g.apnap().filter((p) => p !== c.you), (id) => isCreature(c.g, id), 1, 'uma criatura');
      }, { text: 'Sempre que uma criatura que você controla morre, cada outro jogador sacrifica uma criatura à escolha dele.' }),
    ],
  }],
  rulings: {
    1: 'teste: quando uma criatura sua morre, cada outro jogador sacrifica uma criatura',
    2: 'regra geral: CR 115.1 — sem alvo, resistência a magia não impede (motor)',
    3: 'teste: duas criaturas suas morrendo juntas disparam duas vezes',
    4: 'regra geral: CR 603.2 — cada Grave Pact dispara separadamente (motor/triggers.ts)',
    5: 'regra geral: CR 603.2 — os gatilhos de cada jogador disparam em cadeia (motor/triggers.ts)',
    6: 'não se aplica: Gigante de Duas Cabeças não é jogado aqui',
  },
});
