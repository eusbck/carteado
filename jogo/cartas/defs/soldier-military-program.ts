// SOLDIER Military Program
// At the beginning of combat on your turn, choose one. If you control a commander, you may choose both instead.
// • Create a 1/1 white Soldier creature token.
// • Put a +1/+1 counter on each of up to two Soldiers you control.
import { addCounters, chars, chooseItems, controlledBy, createTokens, defineCard, isCreature, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

const FICHA = 'Crie uma ficha de criatura Soldier 1/1 branca';
const MARCA = 'Coloque um marcador +1/+1 em cada um de até dois Soldiers que você controla';

export default defineCard({
  name: 'SOLDIER Military Program',
  faces: [{
    abilities: [
      triggered(on.beginCombat('you'), function* (c) {
        // ruling 2: qualquer comandante que você controle; ruling 1: dois ou mais não dão nada a mais
        const ambos = controlledBy(c.g, c.you, (id) => ehComandante(c.g, id)).length > 0;
        const modos = yield* chooseItems(c.g, c.you, ambos ? 'Escolha um modo (ou os dois)' : 'Escolha um modo',
          [{ id: 'ficha', label: FICHA }, { id: 'marca', label: MARCA }], 1, ambos ? 2 : 1);
        if (modos.includes('ficha')) yield* createTokens(c.g, c.you, 'Soldier', 1);
        if (modos.includes('marca')) {
          const soldiers = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && chars(c.g, id).subtypes.includes('Soldier'));
          const esc = yield* chooseItems(c.g, c.you, 'Até dois Soldiers recebem um marcador +1/+1', soldiers.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 2);
          for (const s of esc) addCounters(c.g, { kind: 'obj', id: Number(s) }, '+1/+1', 1, c.you);
        }
      }, { text: `No início do combate no seu turno, escolha um. Se você controlar um comandante, pode escolher os dois. • ${FICHA}. • ${MARCA}.` }),
    ],
  }],
  rulings: {
    1: 'teste: com um comandante, escolhe os dois modos',
    2: 'regra geral: CR 903.3 — "um comandante" é qualquer comandante, não só o seu (cartas/vingadores.ts ehComandante)',
  },
});
