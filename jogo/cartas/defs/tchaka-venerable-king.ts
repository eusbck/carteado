// T'Chaka, Venerable King
// When T'Chaka enters, mill three cards, then you may put an artifact or land card from among the milled cards into
// your hand.
// {3}, Exile this card from your graveyard: You become the monarch. Activate only if you control your commander.
import { activated, becomeMonarch, chooseItems, defineCard, etb, isLand, isType, mill, moveObjects, nameOf, objItem } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: "T'Chaka, Venerable King",
  faces: [{
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const moidas = (yield* mill(c.g, c.you, 3)).filter((id) => s.objects[id]?.zone === 'graveyard' && (isType(c.g, id, 'Artifact') || isLand(c.g, id)));
        if (!moidas.length) return;
        const esc = yield* chooseItems(c.g, c.you, "T'Chaka: você pode colocar na mão uma carta de artefato ou de terreno entre as moídas", moidas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* moveObjects(c.g, [{ id: Number(esc[0]), to: 'hand' }], 'effect');
      }, { text: "Quando T'Chaka entra, moa três cartas, depois você pode colocar na sua mão uma carta de artefato ou de terreno entre as cartas moídas." }),
      activated([{ k: 'mana', cost: '{3}' }, { k: 'exileSelf' }], function* (c) { becomeMonarch(c.g, c.you); }, {
        zones: ['graveyard'],
        condition: (c) => controlaComandante(c.g, c.you),
        text: '{3}, Exile esta carta do seu cemitério: Você se torna o monarca. Ative somente se você controla o seu comandante.',
      }),
    ],
  }],
  rulings: {},
});