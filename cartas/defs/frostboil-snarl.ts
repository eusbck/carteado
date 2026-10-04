// Frostboil Snarl
// As this land enters, you may reveal an Island or Mountain card from your hand. If you don't, this land enters tapped.
// {T}: Add {U} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Frostboil Snarl",
  faces: [{ abilities: [
    land.snarl('Island', 'Mountain'),
    mana(['U', 'R']),
  ] }],
});
