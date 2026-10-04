// Foreboding Ruins
// As this land enters, you may reveal a Swamp or Mountain card from your hand. If you don't, this land enters tapped.
// {T}: Add {B} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Foreboding Ruins",
  faces: [{ abilities: [
    land.snarl('Swamp', 'Mountain'),
    mana(['B', 'R']),
  ] }],
});
