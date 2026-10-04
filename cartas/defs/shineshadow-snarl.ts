// Shineshadow Snarl
// As this land enters, you may reveal a Plains or Swamp card from your hand. If you don't, this land enters tapped.
// {T}: Add {W} or {B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Shineshadow Snarl",
  faces: [{ abilities: [
    land.snarl('Plains', 'Swamp'),
    mana(['W', 'B']),
  ] }],
});
