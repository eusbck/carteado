// Ferrous Lake
// {1}, {T}: Add {U}{R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Ferrous Lake",
  faces: [{ abilities: [
    mana('UR', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
