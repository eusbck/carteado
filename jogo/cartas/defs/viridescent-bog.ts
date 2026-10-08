// Viridescent Bog
// {1}, {T}: Add {B}{G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Viridescent Bog",
  faces: [{ abilities: [
    mana('BG', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
