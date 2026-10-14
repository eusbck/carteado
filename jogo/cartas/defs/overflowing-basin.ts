// Overflowing Basin
// {1}, {T}: Add {G}{U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Overflowing Basin",
  faces: [{ abilities: [
    mana('GU', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
