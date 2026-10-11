// Highcliff Felidar
// Vigilance
// When this creature enters, for each opponent, choose a creature with the greatest power among creatures that player
// controls. Destroy those creatures.
import { chooseItems, creaturesOf, defineCard, destroy, etb, keyword, nameOf, objItem, power } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Highcliff Felidar',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // sem alvo: você escolhe na resolução, entre as empatadas na maior força de cada oponente
      etb(function* (c) {
        const escolhidas: ObjId[] = [];
        for (const p of c.g.opponents(c.you)) {
          const dele = creaturesOf(c.g, p);
          if (!dele.length) continue;
          const maior = Math.max(...dele.map((id) => power(c.g, id)));
          const empatadas = dele.filter((id) => power(c.g, id) === maior);
          if (empatadas.length === 1) { escolhidas.push(empatadas[0]); continue; }
          const [esc] = yield* chooseItems(c.g, c.you, `Highcliff Felidar: escolha uma criatura de ${c.g.state.players[p].name} com a maior força`, empatadas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          escolhidas.push(Number(esc));
        }
        if (escolhidas.length) yield* destroy(c.g, escolhidas);
      }, { text: 'Quando esta criatura entra, para cada oponente, escolha uma criatura com a maior força entre as criaturas que esse jogador controla. Destrua essas criaturas.' }),
    ],
  }],
  rulings: {},
});
