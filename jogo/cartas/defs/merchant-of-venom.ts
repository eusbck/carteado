// Merchant of Venom
// Menace
// When this creature enters, each player sacrifices a creature of their choice.
// Whenever a player sacrifices a permanent, put a +1/+1 counter on this creature.
import { addCounters, defineCard, eachSacrifices, etb, isCreature, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Merchant of Venom',
  faces: [{
    abilities: [
      keyword('menace'),
      // ruling 1: escolhas em ordem APNAP, sacrifícios simultâneos (CR 101.4)
      etb(function* (c) { yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), 1, 'uma criatura'); }, { text: 'Quando esta criatura entra, cada jogador sacrifica uma criatura à escolha dele.' }),
      triggered(on.custom((e) => e.type === 'sacrifice'), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um jogador sacrifica um permanente, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: { 1: 'teste: cada jogador sacrifica; ela pode sacrificar a si mesma' },
});
