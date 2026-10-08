// Sungrass Prairie
// {1}, {T}: Add {G}{W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sungrass Prairie",
  faces: [{ abilities: [
    mana('GW', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
