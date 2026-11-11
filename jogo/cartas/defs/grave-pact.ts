// Grave Pact
// Whenever a creature you control dies, each other player sacrifices a creature of their choice.
import { defineCard, eachSacrifices, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Grave Pact',
  faces: [{
    abilities: [triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
      yield* eachSacrifices(c, c.g.playersInGame().filter((p) => p !== c.you), (id) => isCreature(c.g, id));
    }, { text: 'Sempre que uma criatura que você controla morre, cada outro jogador sacrifica uma criatura à escolha dele.' })],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a — dispara mesmo se Grave Pact sair junto com a criatura',
    2: 'regra geral: CR 701.21a — sacrificar não é destruir; indestrutível não impede',
    3: 'regra geral: CR 101.4 — cada jogador escolhe na ordem de turno (motor/efeitos.ts eachSacrifices)',
    4: 'regra geral: CR 603.2 — várias criaturas morrendo juntas disparam uma vez cada',
    5: 'regra geral: CR 111.1 — fichas também contam',
    6: 'regra geral: CR 701.21a — quem não controla criatura não sacrifica nada',
  },
});
