// Thought Vessel
// You have no maximum hand size.
// {T}: Add {C}.
import { defineCard, mana, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Thought Vessel",
  faces: [{ abilities: [mana('C'), staticAbility({ rules: { noMaxHandSize: (c, player) => player === c.you }, text: 'Você não tem tamanho máximo de mão.' })] }],
  rulings: {},
});
