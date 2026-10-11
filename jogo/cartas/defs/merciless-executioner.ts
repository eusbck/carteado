// Merciless Executioner
// When this creature enters, each player sacrifices a creature of their choice.
// (mesmo texto de Fleshbag Marauder)
import { chooseItems, creaturesOf, defineCard, etb, nameOf, objItem, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Merciless Executioner',
  faces: [{
    abilities: [etb(function* (c) {
      // CR 101.4: cada jogador escolhe em ordem APNAP; depois todos sacrificam ao mesmo tempo
      const chosen: number[] = [];
      for (const p of c.g.apnap()) {
        const mine = creaturesOf(c.g, p);
        if (mine.length === 0) continue;
        const [id] = yield* chooseItems(c.g, p, 'Sacrifique uma criatura', mine.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        chosen.push(Number(id));
      }
      yield* sacrifice(c.g, chosen);
    }, { text: 'Quando entra, cada jogador sacrifica uma criatura à escolha dele.' })],
  }],
  rulings: {
    1: 'teste: sem outra criatura, você sacrifica o próprio Merciless Executioner',
  },
});
