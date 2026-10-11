// Darkwater Catacombs
// {1}, {T}: Add {U}{B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Darkwater Catacombs",
  faces: [{ abilities: [
    mana('UB', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
