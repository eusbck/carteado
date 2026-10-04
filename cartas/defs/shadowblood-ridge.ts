// Shadowblood Ridge
// {1}, {T}: Add {B}{R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Shadowblood Ridge",
  faces: [{ abilities: [
    mana('BR', { cost: '{1}, {T}' }),
  ] }],
});
