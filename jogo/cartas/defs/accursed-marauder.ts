// Accursed Marauder
// When this creature enters, each player sacrifices a nontoken creature of their choice.
import { defineCard, eachSacrifices, etb, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Accursed Marauder',
  faces: [{
    abilities: [
      etb(function* (c) {
        // ruling 1: escolhas em ordem APNAP, sacrifícios ao mesmo tempo; ruling 2: pode ser ela mesma
        yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken, 1, 'uma criatura que não é ficha');
      }, { text: 'Quando esta criatura entra, cada jogador sacrifica uma criatura que não é ficha à escolha dele.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada jogador sacrifica uma criatura que não é ficha',
    2: 'teste: sendo a única criatura que não é ficha, ela mesma é sacrificada',
  },
});
