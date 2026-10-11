// Anowon, the Ruin Sage
// At the beginning of your upkeep, each player sacrifices a non-Vampire creature of their choice.
import { defineCard, eachSacrifices, isCreature, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Anowon, the Ruin Sage',
  faces: [{
    abilities: [
      // ruling 1: escolhem em ordem de turno e sacrificam ao mesmo tempo; ruling 2: quem só tem Vampires não sacrifica nada
      triggered(on.upkeep('you'), function* (c) {
        yield* eachSacrifices(c, c.g.playersInGame(), (id) => isCreature(c.g, id) && !isSubtype(c.g, id, 'Vampire'), 1, 'uma criatura que não é Vampire');
      }, { text: 'No início da sua manutenção, cada jogador sacrifica uma criatura que não é Vampire à escolha dele.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 101.4 — os jogadores escolhem em ordem de turno e sacrificam ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
    2: 'teste: na sua manutenção, cada jogador sacrifica uma criatura que não é Vampire; quem só tem Vampires não sacrifica',
  },
});
