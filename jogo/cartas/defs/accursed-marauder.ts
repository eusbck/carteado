// Accursed Marauder
// When this creature enters, each player sacrifices a nontoken creature of their choice.
import { defineCard, eachSacrifices, etb, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Accursed Marauder',
  faces: [{
    abilities: [etb(function* (c) {
      yield* eachSacrifices(c, c.g.playersInGame(), (id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken, 1, 'uma criatura que não seja ficha');
    }, { text: 'Quando esta criatura entra, cada jogador sacrifica uma criatura que não seja ficha à escolha dele.' })],
  }],
  rulings: {
    1: 'regra geral: CR 701.21a — ela mesma pode ser a criatura que você sacrifica',
    2: 'regra geral: CR 101.4 — cada jogador escolhe na ordem de turno (motor/efeitos.ts eachSacrifices)',
  },
});
