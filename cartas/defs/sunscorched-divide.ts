// Sunscorched Divide
// {1}, {T}: Add {R}{W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sunscorched Divide",
  faces: [{ abilities: [
    mana('RW', { cost: '{1}, {T}' }),
  ] }],
  rulings: {},
});
