// Selvala, Heart of the Wilds
// Whenever another creature enters, its controller may draw a card if its power is greater than each other creature's
// power.
// {G}, {T}: Add X mana in any combination of colors, where X is the greatest power among creatures you control.
import { allCreatures, controllerOf, creaturesOf, defineCard, draw, isCreature, lkiChars, mana, on, power, triggered, yesNo } from '../../motor/api.ts';
import type { ManaType, ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Selvala, Heart of the Wilds',
  faces: [{
    abilities: [
      triggered(on.enters((c, id) => id !== c.source && isCreature(c.g, id)), function* (c) {
        const g = c.g;
        const id = c.event.obj as ObjId;
        // ruling 2: compara na resolução; ruling 3: se saiu do campo, a força que tinha por último
        const noCampo = g.state.objects[id]?.zone === 'battlefield';
        const forca = noCampo ? power(g, id) : (lkiChars(g, id)?.power ?? 0);
        const dono: PlayerId = noCampo ? controllerOf(g, id) : (lkiChars(g, id)?.controller ?? c.you);
        if (!allCreatures(g).filter((x) => x !== id).every((x) => power(g, x) < forca)) return;
        if (g.state.players[dono].left) return;
        if (yield* yesNo(g, dono, `Selvala, Heart of the Wilds: comprar uma carta?`)) yield* draw(g, dono, 1);
      }, { text: 'Sempre que outra criatura entra, quem a controla pode comprar uma carta se a força dela for maior que a de cada outra criatura.' }),
      // ruling 1: habilidade de mana; com força máxima 0 ou menos, nada
      mana((c) => {
        const x = Math.max(0, ...creaturesOf(c.g, c.you).map((id) => power(c.g, id)));
        return x > 0 ? [Array<ManaType>(x).fill('*' as ManaType)] : [];
      }, { cost: '{G}, {T}', text: '{G}, {T}: Adicione X manas em qualquer combinação de cores, onde X é a maior força entre as criaturas que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: {G}, {T}: X manas, onde X é a maior força entre as suas criaturas',
    2: 'teste: compra só quem tem a criatura mais forte; com empate, ninguém',
    3: 'regra geral: CR 603.10 — se a criatura saiu do campo, vale a força que tinha por último (lkiChars)',
  },
});
